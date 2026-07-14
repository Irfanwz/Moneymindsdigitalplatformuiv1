import crypto from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  createToken,
  hashPassword,
  normalizeRoles,
  sanitizeUser,
  verifyPassword,
} from "../auth.js";
import { isEmail, trimText } from "../utils.js";
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas.js";
import { config } from "../config.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../email.js";
import { createAuthenticate } from "../middleware/auth.js";
import { runForUser } from "../services/verificationAgent.js";

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

function buildSessionResponse(user) {
  return { token: createToken(user), user: sanitizeUser(user) };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function createAuthRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  router.post("/register-profile", authLimiter, validate(registerSchema), async (req, res, next) => {
    try {
      const fullName = trimText(req.body?.fullName);
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);
      const phone = trimText(req.body?.phone);
      const location = trimText(req.body?.location);
      const bio = trimText(req.body?.bio);
      const requestedRoles = normalizeRoles(req.body?.requestedRoles);

      if (fullName.length < 2) return res.status(400).json({ message: "Full name is required." });
      if (!isEmail(email)) return res.status(400).json({ message: "A valid email address is required." });
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });
      if (requestedRoles.length === 0) return res.status(400).json({ message: "Select at least one role to request access." });

      const user = await store.createUserProfile({
        fullName, email, passwordHash: await hashPassword(password),
        phone, location, bio, requestedRoles,
      });

      try { await sendWelcomeEmail(email, fullName); } catch { /* non-critical */ }

      // Fire-and-forget — does NOT delay the registration response
      setImmediate(() => {
        runForUser(user.id, store).catch((err) =>
          console.error("[AI Verification] Unhandled error:", err.message)
        );
      });

      res.status(201).json({
        message: "Profile submitted. An admin must approve it before you can sign in.",
        user: sanitizeUser(user),
      });
    } catch (error) {
      if (error?.code === "DUPLICATE_EMAIL") return res.status(409).json({ message: error.message });
      next(error);
    }
  });

  router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);

      if (!isEmail(email) || !password) return res.status(400).json({ message: "Email and password are required." });

      const user = await store.findUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid email or password." });

      const passwordMatches = await verifyPassword(password, user.passwordHash);
      if (!passwordMatches) return res.status(401).json({ message: "Invalid email or password." });

      if (!user.isAdmin && user.status !== "approved") {
        return res.status(403).json({
          code: user.status === "pending" ? "PENDING_APPROVAL" : "PROFILE_REJECTED",
          message: user.status === "pending"
            ? "Your profile is waiting for admin approval."
            : "Your profile was rejected. Contact admin or update your details.",
          user: sanitizeUser(user),
        });
      }

      const session = buildSessionResponse(user);
      res.cookie("mm_token", session.token, COOKIE_OPTIONS);
      res.json(session);
    } catch (error) { next(error); }
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie("mm_token", { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "strict" });
    res.json({ message: "Logged out." });
  });

  router.get("/me", authenticate, async (req, res, next) => {
    try {
      const user = await store.findUserById(req.auth.userId);
      if (!user) return res.status(401).json({ message: "Your session is no longer valid." });
      res.json({ user: sanitizeUser(user) });
    } catch (error) { next(error); }
  });

  router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      if (!isEmail(email)) return res.status(400).json({ message: "A valid email address is required." });

      const user = await store.findUserByEmail(email);
      if (!user) return res.json({ message: "If that email exists, a reset link has been generated." });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await store.createPasswordResetToken(user.id, token, expiresAt);

      const resetUrl = `${config.clientOrigin}/reset-password?token=${token}`;
      console.log(`[Password Reset] ${email} → ${resetUrl}`);
      try { await sendPasswordResetEmail(email, resetUrl); } catch { /* non-critical */ }

      res.json({ message: "If that email exists, a reset link has been generated." });
    } catch (error) { next(error); }
  });

  router.post("/reset-password", authLimiter, validate(resetPasswordSchema), async (req, res, next) => {
    try {
      const token = trimText(req.body?.token);
      const newPassword = trimText(req.body?.newPassword);

      if (!token) return res.status(400).json({ message: "Reset token is required." });
      if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });

      const resetEntry = await store.findPasswordResetToken(token);
      if (!resetEntry) return res.status(400).json({ message: "Invalid or expired reset token." });
      if (resetEntry.used) return res.status(400).json({ message: "This reset link has already been used." });
      if (new Date(resetEntry.expiresAt) < new Date()) return res.status(400).json({ message: "This reset link has expired. Please request a new one." });

      await store.updateUserPassword(resetEntry.userId, await hashPassword(newPassword));
      await store.markPasswordResetTokenUsed(token);
      res.json({ message: "Password has been reset successfully. You can now sign in." });
    } catch (error) { next(error); }
  });

  return router;
}
