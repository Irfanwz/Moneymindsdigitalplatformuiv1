import { Router } from "express";
import { createRequire } from "node:module";
import QRCode from "qrcode";

const require = createRequire(import.meta.url);
const { authenticator } = require("otplib");
import { createAuthenticate } from "../middleware/auth.js";
import { trimText } from "../utils.js";

const APP_NAME = "MoneyMinds";

export function createTwoFARouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  // Generate a new 2FA secret and return QR code + backup codes
  router.post("/setup", authenticate, async (req, res, next) => {
    try {
      const user = await store.findUserById(req.auth.userId);
      if (!user) return res.status(401).json({ message: "User not found." });

      const secret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(user.email, APP_NAME, secret);
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

      // Store secret temporarily (not yet confirmed)
      await store.setTwoFASecret(user.id, secret, false);

      res.json({
        secret,
        qrCode: qrCodeDataUrl,
        otpAuthUrl,
        message: "Scan the QR code in your authenticator app, then confirm with /api/2fa/verify.",
      });
    } catch (error) { next(error); }
  });

  // Verify TOTP code and activate 2FA for the account
  router.post("/verify", authenticate, async (req, res, next) => {
    try {
      const code = trimText(req.body?.code);
      if (!code) return res.status(400).json({ message: "TOTP code is required." });

      const user = await store.findUserById(req.auth.userId);
      if (!user) return res.status(401).json({ message: "User not found." });

      const twofa = await store.getTwoFASecret(user.id);
      if (!twofa?.secret) return res.status(400).json({ message: "Run /api/2fa/setup first." });

      const isValid = authenticator.verify({ token: code, secret: twofa.secret });
      if (!isValid) return res.status(400).json({ message: "Invalid TOTP code. Please try again." });

      await store.setTwoFASecret(user.id, twofa.secret, true); // mark as confirmed/enabled
      res.json({ message: "Two-factor authentication has been enabled successfully." });
    } catch (error) { next(error); }
  });

  // Validate TOTP at login time (called after password check)
  router.post("/validate", authenticate, async (req, res, next) => {
    try {
      const code = trimText(req.body?.code);
      if (!code) return res.status(400).json({ message: "TOTP code is required." });

      const user = await store.findUserById(req.auth.userId);
      if (!user) return res.status(401).json({ message: "User not found." });

      const twofa = await store.getTwoFASecret(user.id);
      if (!twofa?.enabled) return res.status(400).json({ message: "2FA is not enabled on this account." });

      const isValid = authenticator.verify({ token: code, secret: twofa.secret });
      if (!isValid) return res.status(400).json({ message: "Invalid TOTP code." });

      res.json({ message: "TOTP validated successfully." });
    } catch (error) { next(error); }
  });

  // Disable 2FA (requires current TOTP code as confirmation)
  router.delete("/disable", authenticate, async (req, res, next) => {
    try {
      const code = trimText(req.body?.code);
      if (!code) return res.status(400).json({ message: "TOTP code is required to disable 2FA." });

      const user = await store.findUserById(req.auth.userId);
      if (!user) return res.status(401).json({ message: "User not found." });

      const twofa = await store.getTwoFASecret(user.id);
      if (!twofa?.enabled) return res.status(400).json({ message: "2FA is not enabled on this account." });

      const isValid = authenticator.verify({ token: code, secret: twofa.secret });
      if (!isValid) return res.status(400).json({ message: "Invalid TOTP code." });

      await store.removeTwoFASecret(user.id);
      res.json({ message: "Two-factor authentication has been disabled." });
    } catch (error) { next(error); }
  });

  // Check 2FA status for current user
  router.get("/status", authenticate, async (req, res, next) => {
    try {
      const twofa = await store.getTwoFASecret(req.auth.userId);
      res.json({ enabled: Boolean(twofa?.enabled) });
    } catch (error) { next(error); }
  });

  return router;
}
