import crypto from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { verify as verifyTotp } from 'otplib';

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
import { sendPasswordResetEmail, sendWelcomeEmail, sendLoginOtpEmail } from "../email.js";
import { createAuthenticate } from "../middleware/auth.js";
import { buildRegistrationProfiles } from "../registration.js";
import { parseRegistration, validateApplicationFiles, saveApplicationFiles } from "../applicationDocuments.js";

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait 15 minutes." },
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

  router.post("/register-profile", authLimiter, parseRegistration, validate(registerSchema), async (req, res, next) => {
    try {
      const settings = await store.getAdminSettings();
      if (!settings.registrationOpen || settings.maintenanceMode) return res.status(503).json({message:'New registrations are temporarily closed. Please try again later.'});
      const fullName = trimText(req.body?.fullName);
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);
      const phone = trimText(req.body?.phone);
      const location = `${req.body.city}, ${req.body.country}`;
      const bio = req.body.profiles.advisor?.bio || req.body.profiles.investor?.investmentThesis || req.body.profiles.startup?.joiningPurpose || "";
      const requestedRoles = normalizeRoles(req.body?.requestedRoles);

      if (fullName.length < 2) return res.status(400).json({ message: "Full name is required." });
      if (!isEmail(email)) return res.status(400).json({ message: "A valid email address is required." });
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });
      if (requestedRoles.length === 0) return res.status(400).json({ message: "Select at least one role to request access." });

      validateApplicationFiles(req.body, req.files);
      if (await store.findUserByEmail(email)) return res.status(409).json({ message: "An account with this email already exists." });
      const id = crypto.randomUUID();
      const profiles = buildRegistrationProfiles(req.body);
      const passwordHash = await hashPassword(password);
      const documents = await saveApplicationFiles(store, id, req.body, req.files);
      let user;
      try {
        user = await store.createProfileApplication({ id, fullName, email, passwordHash, phone, location, bio, requestedRoles }, profiles, {
          version: 1, city: req.body.city, country: req.body.country, profiles: req.body.profiles, documents,
        });
      } catch (error) {
        await store.deleteApplicationDocuments(documents.map(doc => doc.path)).catch(() => console.error("Could not clean up failed application documents."));
        throw error;
      }

      try { await sendWelcomeEmail(email, fullName); } catch { /* non-critical */ }

      // Verification agent is NOT queued automatically — admin triggers it manually
      // after the user has completed their profile. This avoids wasting tokens on
      // empty or incomplete profiles.

      res.status(201).json({
        message: "Profile submitted. An admin must approve it before you can sign in.",
        user: sanitizeUser(user),
      });
    } catch (error) {
      if (error?.code === "DUPLICATE_EMAIL") return res.status(409).json({ message: error.message });
      next(error);
    }
  });

  router.post("/login", authLimiter, otpLimiter, validate(loginSchema), async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);

      if (!isEmail(email) || !password) return res.status(400).json({ message: "Email and password are required." });

      const user = await store.findUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid email or password." });

      const passwordMatches = await verifyPassword(password, user.passwordHash);
      if (!passwordMatches) return res.status(401).json({ message: "Invalid email or password." });

      if (user.isSuspended) return res.status(403).json({ message: "Your account is suspended. Please contact the administrator." });
      if (!user.isAdmin && (await store.getAdminSettings()).maintenanceMode) return res.status(503).json({ message: "MoneyMinds is undergoing maintenance. Please try again later." });

      if (!user.isAdmin && user.status !== "approved") {
        return res.status(403).json({
          code: user.status === "pending" ? "PENDING_APPROVAL" : "PROFILE_REJECTED",
          message: user.status === "pending"
            ? "Your profile is waiting for admin approval."
            : "Your profile was rejected. Contact admin or update your details.",
          user: sanitizeUser(user),
        });
      }

      // Check TOTP 2FA (optional, for users who have it enabled)
      if (config.twoFactorEnabled) {
        const twofa = await store.getTwoFASecret(user.id);
        if (twofa?.enabled) {
          const code = trimText(req.body?.otp);
          if (!/^\d{6}$/.test(code) || !(await verifyTotp({ token: code, secret: twofa.secret })).valid) {
            return res.status(401).json({ code: "TWO_FACTOR_REQUIRED", message: "Enter the current six-digit code from your authenticator app." });
          }
        }
      }

      // Skip email OTP if disabled via EMAIL_OTP_ENABLED=false in .env
      if (!config.emailOtpEnabled) {
        const session = buildSessionResponse(user);
        res.cookie("mm_token", session.token, COOKIE_OPTIONS);
        return res.json(session);
      }

      // Generate 4-digit email OTP
      const otpCode = String(Math.floor(1000 + Math.random() * 9000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      await store.createEmailLoginOtp(user.id, otpCode, expiresAt);
      try {
        await sendLoginOtpEmail(user.email, user.fullName, otpCode);
      } catch (err) {
        // Always log so dev environments can get the code even without email configured
        console.log(`[Login OTP] ${user.email} → code: ${otpCode} (email send failed: ${err?.message})`);
      }

      return res.status(200).json({ code: "EMAIL_OTP_REQUIRED", message: "A 4-digit verification code has been sent to your email." });
    } catch (error) { next(error); }
  });

  // Step 2 of login: verify the email OTP and issue the session
  router.post("/verify-login-otp", authLimiter, async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      const otp = trimText(req.body?.otp);

      if (!isEmail(email) || !otp) return res.status(400).json({ message: "Email and OTP code are required." });
      if (!/^\d{4}$/.test(otp)) return res.status(400).json({ message: "OTP must be a 4-digit number." });

      const user = await store.findUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid request." });

      const result = await store.verifyEmailLoginOtp(user.id, otp);
      if (!result.valid) {
        const messages = {
          no_otp: "No verification code found. Please sign in again.",
          expired: "Your verification code has expired. Please sign in again.",
          used: "This code has already been used. Please sign in again.",
          max_attempts: "Too many wrong attempts. Please sign in again to get a new code.",
          wrong_code: `Incorrect code.${result.attemptsLeft > 0 ? ` ${result.attemptsLeft} attempt(s) remaining.` : ""}`,
        };
        return res.status(401).json({ code: "INVALID_OTP", message: messages[result.reason] ?? "Invalid code." });
      }

      // Re-check status — user may have been suspended between OTP send and verify
      if (user.isSuspended) return res.status(403).json({ message: "Your account has been suspended. Please contact the administrator." });
      if (!user.isAdmin && user.status !== "approved") return res.status(403).json({ message: "Your account is no longer approved." });

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
