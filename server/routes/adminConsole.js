import { Router } from "express";
import {
  createAuthenticate,
  requireAdmin,
  requirePermission,
} from "../middleware/auth.js";
import { sanitizeUser } from "../auth.js";
import { visibleApplication, sendApplicationDocument } from "../applicationDocuments.js";
import {
  adminCan,
  ADMIN_ACTION_PERMISSIONS,
} from "../../shared/adminPermissions.js";

export function createAdminConsoleRouter(store) {
  const router = Router();
  router.use(createAuthenticate(store), requireAdmin);
  router.get("/users/:id/application-documents/:documentId", requirePermission("reviews"), async (req, res, next) => {
    try { await sendApplicationDocument(store, req.params.id, req.params.documentId, res); }
    catch (error) { next(error); }
  });
  router.get(
    "/overview",
    requirePermission("overview"),
    async (req, res, next) => {
      try {
        const [users, runs, allReports] = await Promise.all([
          store.listUsers({}),
          store.listAgentRuns({ limit: 100 }),
          store.listVerificationStatuses(),
        ]);
        const userIds=new Set(users.map(u=>u.id));
        const reports=allReports.filter(report=>userIds.has(report.userId));
        const reviewed = users.filter(
          (u) =>
            u.approvedAt && new Date(u.approvedAt) >= new Date(u.createdAt),
        );
        res.json({
          users: {
            total: users.length,
            pending: users.filter((u) => u.status === "pending").length,
            approved: users.filter((u) => u.status === "approved").length,
            rejected: users.filter((u) => u.status === "rejected").length,
            suspended: users.filter((u) => u.isSuspended).length,
          },
          backgroundChecks: {
            complete: reports.filter((r) => r.status === "complete").length,
            review: reports.filter(
              (r) => r.status === "complete" && r.recommendation === "review",
            ).length,
            missing: users.filter(
              (u) =>
                !reports.some(
                  (r) => r.userId === u.id && r.status === "complete",
                ),
            ).length,
          },
          agents: {
            active: runs.filter((r) => ["queued", "running"].includes(r.status))
              .length,
            failed: runs.filter((r) => r.status === "failed").length,
            completed: runs.filter((r) => r.status === "completed").length,
            sampleSize: runs.length,
          },
          averageApprovalHours: reviewed.length
            ? reviewed.reduce(
                (sum, u) =>
                  sum +
                  (new Date(u.approvedAt) - new Date(u.createdAt)) / 3600000,
                0,
              ) / reviewed.length
            : null,
          generatedAt: new Date().toISOString(),
        });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/settings",
    requirePermission("settings"),
    async (_req, res, next) => {
      try {
        res.json({ settings: await store.getAdminSettings() });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/users",
    requirePermission("users.read"),
    async (_req, res, next) => {
      try {
        const users = await store.listUsers({ includeAdmins: true });
        res.json({ users: users.map(sanitizeUser) });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/users/:id",
    requirePermission("users.read"),
    async (req, res, next) => {
      try {
        const user = await store.findUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found." });
        const [startup, investor, advisor] = await Promise.all([
          store.findStartupProfileByUserId(user.id),
          store.findInvestorProfileByUserId(user.id),
          store.findAdvisorProfileByUserId(user.id),
        ]);
        const canReview = adminCan(req.currentUser, "reviews");
        const [verification, documents, reviews] = canReview
          ? await Promise.all([
              store.findVerification(user.id),
              store.listProfileVerifications({ userId: user.id }),
              store.listAdminReviews(),
            ])
          : [null, [], []];
        res.json({
          user: sanitizeUser(user),
          profiles: { startup, investor, advisor },
          application: canReview ? visibleApplication(await store.getProfileApplication(user.id)) : null,
          verification,
          documents,
          review: reviews.find((r) => r.userId === user.id) || null,
        });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/reviews",
    requirePermission("reviews"),
    async (_req, res, next) => {
      try {
        const [reviews, users, reports, documents] = await Promise.all([
          store.listAdminReviews(),
          store.listUsers({ includeAdmins: true }),
          store.listVerificationStatuses(),
          store.listProfileVerifications(),
        ]);
        res.json({
          reviews,
          users: users.map(sanitizeUser),
          reports,
          documents,
        });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/content",
    requirePermission("content"),
    async (_req, res, next) => {
      try {
        const [items, users] = await Promise.all([
          store.listAdminContent(),
          store.listUsers({ includeAdmins: true }),
        ]);
        res.json({
          items: items.map((item) => ({
            ...item,
            ownerName:
              users.find((u) => u.id === item.ownerId)?.fullName ||
              "Deleted user",
          })),
        });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get(
    "/payments",
    requirePermission("payments"),
    async (_req, res, next) => {
      try {
        const [payments, users] = await Promise.all([
          store.listAdminPayments(),
          store.listUsers({ includeAdmins: true }),
        ]);
        res.json({
          payments: payments.map((p) => ({
            ...p,
            userName:
              users.find((u) => u.id === p.userId)?.fullName || "Deleted user",
          })),
        });
      } catch (e) {
        next(e);
      }
    },
  );
  router.get("/audit", requirePermission("audit"), async (_req, res, next) => {
    try {
      res.json({ events: await store.listAdminAudit() });
    } catch (e) {
      next(e);
    }
  });
  router.post("/actions", async (req, res, next) => {
    try {
      const { action, targetId, payload } = req.body || {};
      const permission = ADMIN_ACTION_PERMISSIONS[action];
      if (
        !permission ||
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        typeof targetId !== "string"
      )
        return res.status(400).json({ message: "Invalid admin action." });
      if (!adminCan(req.currentUser, permission))
        return res.status(403).json({
          message: "Your administrator role does not allow this action.",
        });
      // Approval and document decisions use their existing notification routes.
      if (["user.approval", "document.decision"].includes(action))
        return res
          .status(400)
          .json({ message: "Use the review decision endpoint." });
      const keys = {
        "settings.update": [
          "registrationOpen",
          "maintenanceMode",
          "requireBackgroundCheck",
        ],
        "user.suspension": ["suspended", "reason"],
        "user.admin_role": ["role"],
        "review.update": ["assignedTo", "state", "notes"],
        "content.moderate": ["entityType", "hidden", "reason"],
      }[action];
      if (Object.keys(payload).some((k) => !keys.includes(k)))
        return res
          .status(400)
          .json({ message: "Unexpected fields in this action." });
      await store.adminMutate(req.auth.userId, action, targetId, payload);
      res.json({ message: "Changes saved and recorded in the audit history." });
    } catch (e) {
      next(e);
    }
  });
  return router;
}
