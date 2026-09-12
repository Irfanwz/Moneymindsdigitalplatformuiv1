/**
 * verification.js — AI-Verified Profiles routes
 *
 * POST   /api/verify/upload          — user uploads a credential document
 * GET    /api/verify/my              — user gets their own verification records
 * GET    /api/admin/verifications    — admin lists all pending/manual_review records
 * POST   /api/admin/verifications/:id/approve  — admin approves a record
 * POST   /api/admin/verifications/:id/reject   — admin rejects a record
 */

import path from "path";
import multer from "multer";
import { Router } from "express";
import { config, isSupabaseConfigured } from "../config.js";
import { createAuthenticate, requireAdmin } from "../middleware/auth.js";
import { runVerification } from "../services/profileVerificationService.js";
import { trimText } from "../utils.js";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const VALID_DOC_TYPES = ["certificate", "degree", "business_reg", "linkedin", "other"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG, or WebP files are allowed."));
    }
  },
});

export function createVerificationRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  // ─────────────────────────────────────────────────────────────
  // POST /api/verify/upload
  // User submits a credential document for AI verification
  // ─────────────────────────────────────────────────────────────
  router.post("/upload", authenticate, upload.single("document"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document uploaded." });
      }

      const docType = trimText(req.body?.docType);
      const claimToVerify = trimText(req.body?.claimToVerify);

      if (!docType || !VALID_DOC_TYPES.includes(docType)) {
        return res.status(400).json({
          message: `docType must be one of: ${VALID_DOC_TYPES.join(", ")}`,
        });
      }
      if (!claimToVerify || claimToVerify.length < 5) {
        return res.status(400).json({ message: "claimToVerify is required (describe what this document proves)." });
      }

      // Upload document to Supabase storage
      let docUrl = "";
      if (isSupabaseConfigured) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const ext = path.extname(req.file.originalname) || ".bin";
        const filename = `verifications/${req.auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

        if (uploadError) {
          return res.status(500).json({ message: "Document upload failed.", error: uploadError.message });
        }

        const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(filename);
        docUrl = publicUrl;
      } else {
        // Dev/memory mode — store a placeholder URL
        docUrl = `local://verifications/${req.auth.userId}/${Date.now()}`;
      }

      // Fetch user profile claims for AI context
      const userId = req.auth.userId;
      const userObj = req.currentUser;
      let profileClaims = { name: userObj.fullName };

      try {
        const [advisor, startup, investor] = await Promise.allSettled([
          store.getAdvisorProfile(userId),
          store.getStartupProfile(userId),
          store.getInvestorProfile(userId),
        ]);
        const advisorP = advisor.status === "fulfilled" ? advisor.value : null;
        const startupP = startup.status === "fulfilled" ? startup.value : null;
        const investorP = investor.status === "fulfilled" ? investor.value : null;

        profileClaims = {
          name: userObj.fullName,
          title: advisorP?.title || startupP?.companyName || "",
          company: startupP?.companyName || advisorP?.previousRoles || "",
          certifications: (advisorP?.certifications || []).map((c) => c.name).join(", "),
          yearsExperience: advisorP?.yearsExperience || "",
        };
      } catch { /* use minimal claims */ }

      // Create verification record in DB
      const verification = await store.createProfileVerification({
        userId,
        docType,
        docUrl,
        claimToVerify,
        status: "pending",
      });

      // Fire-and-forget AI analysis
      runVerification({
        verificationId: verification.id,
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        docType,
        claimToVerify,
        userProfile: profileClaims,
        userId,
        store,
      }).catch((err) => {
        console.error("[Verification] Background pipeline error:", err.message);
      });

      res.status(202).json({
        message: "Document received. AI verification is in progress.",
        verificationId: verification.id,
        status: "pending",
      });
    } catch (err) { next(err); }
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/verify/my
  // User gets their own verification history
  // ─────────────────────────────────────────────────────────────
  router.get("/my", authenticate, async (req, res, next) => {
    try {
      const records = await store.listProfileVerifications({ userId: req.auth.userId });
      res.json({ verifications: records });
    } catch (err) { next(err); }
  });

  return router;
}

// ─────────────────────────────────────────────────────────────
// Admin sub-router — mounted separately at /api/admin
// ─────────────────────────────────────────────────────────────
export function createAdminVerificationRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  // GET /api/admin/verifications?status=manual_review
  router.get("/", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const status = trimText(req.query.status) || undefined;
      const records = await store.listProfileVerifications({ status });
      res.json({ verifications: records });
    } catch (err) { next(err); }
  });

  // POST /api/admin/verifications/:id/approve
  router.post("/:id/approve", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const id = trimText(req.params.id);
      const adminNote = trimText(req.body?.adminNote) || null;

      const record = await store.getProfileVerification(id);
      if (!record) return res.status(404).json({ message: "Verification record not found." });

      await store.updateProfileVerification(id, {
        status: "verified",
        reviewedBy: req.auth.userId,
        reviewedAt: new Date().toISOString(),
        adminNote,
      });

      // Mark the user's profile as verified
      await store.setProfileVerified(record.userId, id);

      // Notify user
      try {
        await store.createNotification(record.userId, {
          title: "Profile Verified!",
          message: "Your credential has been verified. A verified badge is now visible on your profile.",
          type: "success",
        });
      } catch { /* non-critical */ }

      res.json({ message: "Verification approved." });
    } catch (err) { next(err); }
  });

  // POST /api/admin/verifications/:id/reject
  router.post("/:id/reject", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const id = trimText(req.params.id);
      const adminNote = trimText(req.body?.adminNote) || null;

      const record = await store.getProfileVerification(id);
      if (!record) return res.status(404).json({ message: "Verification record not found." });

      await store.updateProfileVerification(id, {
        status: "rejected",
        reviewedBy: req.auth.userId,
        reviewedAt: new Date().toISOString(),
        adminNote,
      });

      // Notify user
      try {
        await store.createNotification(record.userId, {
          title: "Verification Update",
          message: `Your credential could not be verified. ${adminNote || "Please try uploading a clearer document."}`,
          type: "warning",
        });
      } catch { /* non-critical */ }

      res.json({ message: "Verification rejected." });
    } catch (err) { next(err); }
  });

  return router;
}
