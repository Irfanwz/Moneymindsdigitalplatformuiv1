import { Router } from "express";
import { approvalStatuses, normalizeRoles, sanitizeUser } from "../auth.js";
import { validate, approvalSchema } from "../schemas.js";
import { sendApprovalEmail, sendRejectionEmail } from "../email.js";
import { createAuthenticate, requireAdmin } from "../middleware/auth.js";
import { paginate, trimText } from "../utils.js";
import { runForUser } from "../services/verificationAgent.js";

export function createAdminRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  router.get("/users", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const requestedStatus = trimText(req.query.status);
      const status = approvalStatuses.includes(requestedStatus) ? requestedStatus : undefined;
      const users = await store.listUsers({ status });
      const { data, pagination } = paginate(users.map(sanitizeUser), req.query);
      res.json({ users: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.patch("/users/:userId/approval", authenticate, requireAdmin, validate(approvalSchema), async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const status = trimText(req.body?.status);
      const adminNotes = trimText(req.body?.adminNotes) || null;
      const rejectionReason = trimText(req.body?.rejectionReason) || null;
      const approvedRoles = normalizeRoles(req.body?.approvedRoles);

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Approval status must be approved or rejected." });
      }
      if (status === "approved" && approvedRoles.length === 0) {
        return res.status(400).json({ message: "Choose at least one role before approving." });
      }

      const targetUser = await store.findUserById(userId);
      if (!targetUser || targetUser.isAdmin) {
        return res.status(404).json({ message: "User profile not found." });
      }

      const updatedUser = await store.updateApproval(userId, {
        status, approvedRoles, adminNotes, rejectionReason, approvedBy: req.auth.userId,
      });

      try {
        await store.createNotification(userId, {
          title: status === "approved" ? "Profile Approved!" : "Profile Update",
          message: status === "approved"
            ? `Your profile has been approved with roles: ${approvedRoles.join(", ")}. Welcome to MoneyMinds!`
            : `Your profile application was not approved. ${rejectionReason || "Please contact support for more details."}`,
          type: status === "approved" ? "success" : "warning",
        });
      } catch { /* non-critical */ }

      try {
        if (status === "approved") {
          await sendApprovalEmail(targetUser.email, targetUser.fullName, approvedRoles);
        } else {
          await sendRejectionEmail(targetUser.email, targetUser.fullName, rejectionReason);
        }
      } catch { /* non-critical */ }

      res.json({
        message: status === "approved" ? "User profile approved successfully." : "User profile rejected successfully.",
        user: sanitizeUser(updatedUser),
      });
    } catch (error) { next(error); }
  });

  // GET /api/admin/users/:userId/verification — full AI report for one user
  router.get("/users/:userId/verification", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const verification = await store.findVerification(userId);
      if (!verification) {
        return res.status(404).json({ message: "No verification report found for this user." });
      }
      res.json({ verification });
    } catch (error) { next(error); }
  });

  // GET /api/admin/verifications/summary — counts by status/recommendation
  router.get("/verifications/summary", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const summary = await store.getVerificationSummary();
      res.json({ summary });
    } catch (error) { next(error); }
  });

  // POST /api/admin/users/:userId/verification/retry — re-run agent for a user
  router.post("/users/:userId/verification/retry", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const user = await store.findUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found." });

      // Respond immediately, run in background
      res.json({ message: "Verification re-queued. Refresh in 30-60 seconds." });

      setImmediate(() => {
        runForUser(userId, store).catch((err) =>
          console.error("[AI Verification] Retry error:", err.message)
        );
      });
    } catch (error) { next(error); }
  });

  return router;
}
