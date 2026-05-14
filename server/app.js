import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import multer from "multer";
import path from "path";

import {
  approvalStatuses,
  createToken,
  hashPassword,
  normalizeRoles,
  sanitizeUser,
  verifyPassword,
} from "./auth.js";
import { config } from "./config.js";
import { createAuthenticate, requireAdmin, requireApprovedRole } from "./middleware/auth.js";
import { buildStartupProfile, normalizeStartupProfileInput } from "./startupProfiles.js";
import { buildInvestorProfile, normalizeInvestorProfileInput } from "./investorProfiles.js";
import { buildAdvisorProfile, normalizeAdvisorProfileInput } from "./advisorProfiles.js";
import { normalizeGroupInput, normalizeSignalInput } from "./advisorGroups.js";
import { normalizeTrainingInput } from "./trainings.js";

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isDuplicateEmailError(error) {
  return error?.code === "DUPLICATE_EMAIL";
}

function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSessionResponse(user) {
  return {
    token: createToken(user),
    user: sanitizeUser(user),
  };
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

export function createApp(store) {
  const app = express();
  const authenticate = createAuthenticate(store);
  const requireStartupRole = requireApprovedRole("startup");
  const requireInvestorRole = requireApprovedRole("investor");
  const requireAdvisorRole = requireApprovedRole("advisor");

  app.use(cors({
    origin: config.clientOrigin,
  }));
  app.use(express.json());

  app.get("/api/health", async (_req, res, next) => {
    try {
      const result = await store.health();
      res.json({
        ok: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/register-profile", async (req, res, next) => {
    try {
      const fullName = trimText(req.body?.fullName);
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);
      const phone = trimText(req.body?.phone);
      const location = trimText(req.body?.location);
      const bio = trimText(req.body?.bio);
      const requestedRoles = normalizeRoles(req.body?.requestedRoles);

      if (fullName.length < 2) {
        return res.status(400).json({ message: "Full name is required." });
      }

      if (!isEmail(email)) {
        return res.status(400).json({ message: "A valid email address is required." });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
      }

      if (requestedRoles.length === 0) {
        return res.status(400).json({ message: "Select at least one role to request access." });
      }

      const user = await store.createUserProfile({
        fullName,
        email,
        passwordHash: await hashPassword(password),
        phone,
        location,
        bio,
        requestedRoles,
      });

      res.status(201).json({
        message: "Profile submitted. An admin must approve it before you can sign in.",
        user: sanitizeUser(user),
      });
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        return res.status(409).json({ message: error.message });
      }

      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      const password = trimText(req.body?.password);

      if (!isEmail(email) || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await store.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const passwordMatches = await verifyPassword(password, user.passwordHash);

      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      if (!user.isAdmin && user.status !== "approved") {
        return res.status(403).json({
          code: user.status === "pending" ? "PENDING_APPROVAL" : "PROFILE_REJECTED",
          message:
            user.status === "pending"
              ? "Your profile is waiting for admin approval."
              : "Your profile was rejected. Contact admin or update your details.",
          user: sanitizeUser(user),
        });
      }

      res.json(buildSessionResponse(user));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/auth/me", authenticate, async (req, res, next) => {
    try {
      const user = await store.findUserById(req.auth.userId);

      if (!user) {
        return res.status(401).json({ message: "Your session is no longer valid." });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      const email = trimText(req.body?.email).toLowerCase();
      if (!isEmail(email)) {
        return res.status(400).json({ message: "A valid email address is required." });
      }
      const user = await store.findUserByEmail(email);
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If that email exists, a reset link has been generated." });
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await store.createPasswordResetToken(user.id, token, expiresAt);
      // In production, send email. For dev, log the token.
      const resetUrl = `${config.clientOrigin}/reset-password?token=${token}`;
      console.log(`[Password Reset] ${email} → ${resetUrl}`);
      res.json({ message: "If that email exists, a reset link has been generated.", resetToken: token });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const token = trimText(req.body?.token);
      const newPassword = trimText(req.body?.newPassword);
      if (!token) {
        return res.status(400).json({ message: "Reset token is required." });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
      }
      const resetEntry = await store.findPasswordResetToken(token);
      if (!resetEntry) {
        return res.status(400).json({ message: "Invalid or expired reset token." });
      }
      if (resetEntry.used) {
        return res.status(400).json({ message: "This reset link has already been used." });
      }
      if (new Date(resetEntry.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
      }
      const passwordHash = await hashPassword(newPassword);
      await store.updateUserPassword(resetEntry.userId, passwordHash);
      await store.markPasswordResetTokenUsed(token);
      res.json({ message: "Password has been reset successfully. You can now sign in." });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const requestedStatus = trimText(req.query.status);
      const status = approvalStatuses.includes(requestedStatus) ? requestedStatus : undefined;
      const users = await store.listUsers({ status });
      res.json({
        users: users.map(sanitizeUser),
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:userId/approval", authenticate, requireAdmin, async (req, res, next) => {
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
        status,
        approvedRoles,
        adminNotes,
        rejectionReason,
        approvedBy: req.auth.userId,
      });

      // Create notification for the user
      try {
        await store.createNotification(userId, {
          title: status === "approved" ? "Profile Approved!" : "Profile Update",
          message: status === "approved"
            ? `Your profile has been approved with roles: ${approvedRoles.join(", ")}. Welcome to MoneyMinds!`
            : `Your profile application was not approved. ${rejectionReason || "Please contact support for more details."}`,
          type: status === "approved" ? "success" : "warning",
        });
      } catch {
        // non-critical
      }

      res.json({
        message:
          status === "approved"
            ? "User profile approved successfully."
            : "User profile rejected successfully.",
        user: sanitizeUser(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/startup/profile", authenticate, requireStartupRole, async (req, res, next) => {
    try {
      const profile = await store.findStartupProfileByUserId(req.auth.userId);
      res.json({
        profile: buildStartupProfile(req.currentUser, profile),
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/startup/profile", authenticate, requireStartupRole, async (req, res, next) => {
    try {
      const profileInput = normalizeStartupProfileInput(req.body, req.currentUser);

      if (profileInput.companyName.length < 2) {
        return res.status(400).json({ message: "Company name is required." });
      }

      if (profileInput.industry.length < 2) {
        return res.status(400).json({ message: "Industry is required." });
      }

      if (profileInput.description.length < 20) {
        return res.status(400).json({ message: "Company description must be at least 20 characters." });
      }

      if (profileInput.stage.length < 2) {
        return res.status(400).json({ message: "Funding stage is required." });
      }

      const savedProfile = await store.upsertStartupProfile(req.auth.userId, profileInput);

      res.json({
        message: "Startup profile saved successfully.",
        profile: buildStartupProfile(req.currentUser, savedProfile),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/investor/profile", authenticate, requireInvestorRole, async (req, res, next) => {
    try {
      const profile = await store.findInvestorProfileByUserId(req.auth.userId);
      res.json({
        profile: buildInvestorProfile(req.currentUser, profile),
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/investor/profile", authenticate, requireInvestorRole, async (req, res, next) => {
    try {
      const profileInput = normalizeInvestorProfileInput(req.body, req.currentUser);

      if (profileInput.investorType.length < 2) {
        return res.status(400).json({ message: "Investor type is required." });
      }

      if (profileInput.industries.length === 0) {
        return res.status(400).json({ message: "Select at least one industry of interest." });
      }

      const savedProfile = await store.upsertInvestorProfile(req.auth.userId, profileInput);

      res.json({
        message: "Investor profile saved successfully.",
        profile: buildInvestorProfile(req.currentUser, savedProfile),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisor/profile", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profile = await store.findAdvisorProfileByUserId(req.auth.userId);
      res.json({
        profile: buildAdvisorProfile(req.currentUser, profile),
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/advisor/profile", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profileInput = normalizeAdvisorProfileInput(req.body, req.currentUser);

      if (profileInput.title.length < 2) {
        return res.status(400).json({ message: "Professional title is required." });
      }

      if (profileInput.specialization.length < 2) {
        return res.status(400).json({ message: "Primary specialization is required." });
      }

      if (profileInput.industries.length === 0) {
        return res.status(400).json({ message: "Select at least one industry." });
      }

      const savedProfile = await store.upsertAdvisorProfile(req.auth.userId, profileInput);

      res.json({
        message: "Advisor profile saved successfully.",
        profile: buildAdvisorProfile(req.currentUser, savedProfile),
      });
    } catch (error) {
      next(error);
    }
  });

  // --- Public Profile Viewing ---

  app.get("/api/advisors/:userId/public-profile", authenticate, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const user = await store.findUserById(userId);
      if (!user) return res.status(404).json({ message: "Advisor not found." });
      const profile = await store.findAdvisorProfileByUserId(userId);
      res.json({
        profile: buildAdvisorProfile(user, profile),
        name: user.fullName,
        location: user.location,
        bio: user.bio,
      });
    } catch (error) { next(error); }
  });

  app.get("/api/startups/:userId/public-profile", authenticate, async (req, res, next) => {
    try {
      const userId = trimText(req.params.userId);
      const user = await store.findUserById(userId);
      if (!user) return res.status(404).json({ message: "Startup not found." });
      const profile = await store.findStartupProfileByUserId(userId);
      res.json({
        profile: buildStartupProfile(user, profile),
        name: user.fullName,
        location: user.location,
        bio: user.bio,
      });
    } catch (error) { next(error); }
  });

  // --- Search & Discovery ---

  app.get("/api/startups/search", authenticate, async (req, res, next) => {
    try {
      const industry = trimText(req.query.industry) || undefined;
      const stage = trimText(req.query.stage) || undefined;
      const query = trimText(req.query.q) || undefined;
      const startups = await store.searchStartups({ industry, stage, query });
      res.json({ startups });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisors/search", authenticate, async (req, res, next) => {
    try {
      const industry = trimText(req.query.industry) || undefined;
      const specialization = trimText(req.query.specialization) || undefined;
      const query = trimText(req.query.q) || undefined;
      const advisors = await store.searchAdvisors({ industry, specialization, query });
      res.json({ advisors });
    } catch (error) {
      next(error);
    }
  });

  // --- Advisor Groups ---

  app.get("/api/groups/browse", authenticate, async (req, res, next) => {
    try {
      const groups = await store.listPublicGroups();
      const memberships = await store.listUserMemberships(req.auth.userId);
      const joinedGroupIds = new Set(memberships.map((m) => m.groupId));
      // Enrich with advisor name and joined status
      const enriched = await Promise.all(groups.map(async (g) => {
        const advisor = await store.findUserById(g.advisorId);
        return {
          ...g,
          advisorName: advisor?.fullName || "Unknown",
          isJoined: joinedGroupIds.has(g.id),
        };
      }));
      res.json({ groups: enriched });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/advisor/groups", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const input = normalizeGroupInput(req.body);
      if (input.name.length < 2) {
        return res.status(400).json({ message: "Group name is required." });
      }
      const group = await store.createGroup(req.auth.userId, input);
      res.status(201).json({ message: "Group created successfully.", group });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisor/groups", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groups = await store.listGroupsByAdvisor(req.auth.userId);
      res.json({ groups });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisor/groups/:groupId", authenticate, async (req, res, next) => {
    try {
      const group = await store.findGroupById(trimText(req.params.groupId));
      if (!group) {
        return res.status(404).json({ message: "Group not found." });
      }
      res.json({ group });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/advisor/groups/:groupId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const existing = await store.findGroupById(groupId);
      if (!existing || existing.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Group not found." });
      }
      const input = normalizeGroupInput(req.body);
      if (input.name.length < 2) {
        return res.status(400).json({ message: "Group name is required." });
      }
      const group = await store.updateGroup(groupId, input);
      res.json({ message: "Group updated successfully.", group });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/advisor/groups/:groupId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const existing = await store.findGroupById(groupId);
      if (!existing || existing.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Group not found." });
      }
      await store.deleteGroup(groupId);
      res.json({ message: "Group deleted successfully." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/advisor/groups/:groupId/join", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found." });
      }
      const member = await store.joinGroup(groupId, req.auth.userId);
      // Notify group owner
      try {
        await store.createNotification(group.advisorId, {
          title: "New Group Member",
          message: `Someone joined your group "${group.name}".`,
          type: "info",
        });
      } catch { /* non-critical */ }
      res.status(201).json({ message: "Joined group successfully.", member });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/advisor/groups/:groupId/leave", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      await store.leaveGroup(groupId, req.auth.userId);
      res.json({ message: "Left group successfully." });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisor/groups/:groupId/members", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found." });
      }
      const members = await store.listGroupMembers(groupId);
      // Enrich with user names
      const enriched = await Promise.all(members.map(async (m) => {
        const user = await store.findUserById(m.userId);
        return {
          ...m,
          userName: user?.fullName || "Unknown",
          email: user?.email || "",
        };
      }));
      res.json({ members: enriched });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/advisor/groups/:groupId/members/:userId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const userId = trimText(req.params.userId);
      const group = await store.findGroupById(groupId);
      if (!group || group.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Group not found." });
      }
      await store.removeGroupMember(groupId, userId);
      // Notify removed member
      try {
        await store.createNotification(userId, {
          title: "Removed from Group",
          message: `You have been removed from the group "${group.name}".`,
          type: "warning",
        });
      } catch { /* non-critical */ }
      res.json({ message: "Member removed successfully." });
    } catch (error) {
      next(error);
    }
  });

  // --- Advisor Signals ---

  app.post("/api/advisor/groups/:groupId/signals", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group || group.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Group not found." });
      }
      const input = normalizeSignalInput(req.body);
      if (input.title.length < 2) {
        return res.status(400).json({ message: "Title is required." });
      }
      const signal = await store.createSignal(groupId, req.auth.userId, input);
      res.status(201).json({ message: "Published successfully.", signal });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/advisor/groups/:groupId/signals", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found." });
      }
      const signals = await store.listSignalsByGroup(groupId);
      res.json({ signals });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/advisor/groups/:groupId/signals/:signalId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal || signal.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Signal not found." });
      }
      const input = normalizeSignalInput(req.body);
      if (input.title.length < 2) {
        return res.status(400).json({ message: "Title is required." });
      }
      const updated = await store.updateSignal(signalId, input);
      res.json({ message: "Signal updated successfully.", signal: updated });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/advisor/groups/:groupId/signals/:signalId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal || signal.advisorId !== req.auth.userId) {
        return res.status(404).json({ message: "Signal not found." });
      }
      await store.deleteSignal(signalId);
      res.json({ message: "Signal deleted successfully." });
    } catch (error) {
      next(error);
    }
  });

  // --- Signal Comments ---

  app.get("/api/signals/:signalId/comments", authenticate, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const comments = await store.listCommentsBySignal(signalId);
      const enriched = await Promise.all(comments.map(async (c) => {
        const user = await store.findUserById(c.userId);
        return { ...c, userName: user?.fullName || "Unknown" };
      }));
      res.json({ comments: enriched });
    } catch (error) { next(error); }
  });

  app.post("/api/signals/:signalId/comments", authenticate, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const content = trimText(req.body?.content);
      if (!content) return res.status(400).json({ message: "Comment content is required." });
      const signal = await store.findSignalById(signalId);
      if (!signal) return res.status(404).json({ message: "Signal not found." });
      const comment = await store.createComment(signalId, req.auth.userId, content);
      const user = await store.findUserById(req.auth.userId);
      res.status(201).json({ message: "Comment added.", comment: { ...comment, userName: user?.fullName || "Unknown" } });
    } catch (error) { next(error); }
  });

  app.delete("/api/signals/:signalId/comments/:commentId", authenticate, async (req, res, next) => {
    try {
      const commentId = trimText(req.params.commentId);
      const comment = await store.findCommentById(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found." });
      // Only comment author or signal owner can delete
      if (comment.userId !== req.auth.userId) {
        const signal = await store.findSignalById(comment.signalId);
        if (!signal || signal.advisorId !== req.auth.userId) {
          return res.status(403).json({ message: "Not authorized to delete this comment." });
        }
      }
      await store.deleteComment(commentId);
      res.json({ message: "Comment deleted." });
    } catch (error) { next(error); }
  });

  // --- Signal Reactions ---

  app.get("/api/signals/:signalId/reactions", authenticate, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const reactions = await store.listReactionsBySignal(signalId);
      res.json({ reactions });
    } catch (error) { next(error); }
  });

  app.post("/api/signals/:signalId/reactions", authenticate, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const reaction = trimText(req.body?.reaction);
      if (!["like", "insightful", "bearish", "bullish"].includes(reaction)) {
        return res.status(400).json({ message: "Invalid reaction type." });
      }
      const signal = await store.findSignalById(signalId);
      if (!signal) return res.status(404).json({ message: "Signal not found." });
      const result = await store.toggleReaction(signalId, req.auth.userId, reaction);
      res.json({ message: result.added ? "Reaction added." : "Reaction removed.", ...result });
    } catch (error) { next(error); }
  });

  // --- Trainings ---

  app.post("/api/trainings", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const input = normalizeTrainingInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Training title is required." });
      const training = await store.createTraining(req.auth.userId, input);
      res.status(201).json({ message: "Training created successfully.", training });
    } catch (error) { next(error); }
  });

  app.get("/api/trainings", authenticate, async (req, res, next) => {
    try {
      const trainings = await store.listTrainings();
      res.json({ trainings });
    } catch (error) { next(error); }
  });

  app.get("/api/trainings/:id/enrollments", authenticate, async (req, res, next) => {
    try {
      const enrollments = await store.listEnrollmentsByTraining(trimText(req.params.id));
      res.json({ enrollments });
    } catch (error) { next(error); }
  });

  app.get("/api/trainings/my-enrollments", authenticate, async (req, res, next) => {
    try {
      const enrollments = await store.listEnrollmentsByUser(req.auth.userId);
      res.json({ enrollments });
    } catch (error) { next(error); }
  });

  app.get("/api/trainings/:id", authenticate, async (req, res, next) => {
    try {
      const training = await store.findTrainingById(trimText(req.params.id));
      if (!training) return res.status(404).json({ message: "Training not found." });
      res.json({ training });
    } catch (error) { next(error); }
  });

  app.put("/api/trainings/:id", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const existing = await store.findTrainingById(trainingId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Training not found." });
      const input = normalizeTrainingInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Training title is required." });
      const training = await store.updateTraining(trainingId, input);
      res.json({ message: "Training updated successfully.", training });
    } catch (error) { next(error); }
  });

  app.delete("/api/trainings/:id", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const existing = await store.findTrainingById(trainingId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Training not found." });
      await store.deleteTraining(trainingId);
      res.json({ message: "Training deleted successfully." });
    } catch (error) { next(error); }
  });

  app.post("/api/trainings/:id/enroll", authenticate, async (req, res, next) => {
    try {
      const trainingId = trimText(req.params.id);
      const training = await store.findTrainingById(trainingId);
      if (!training) return res.status(404).json({ message: "Training not found." });
      if (training.enrolled >= training.capacity) return res.status(400).json({ message: "Training is full." });
      const enrollment = await store.enrollInTraining(trainingId, req.auth.userId);
      res.status(201).json({ message: "Enrolled successfully.", enrollment });
    } catch (error) { next(error); }
  });

  app.post("/api/trainings/:id/unenroll", authenticate, async (req, res, next) => {
    try {
      await store.unenrollFromTraining(trimText(req.params.id), req.auth.userId);
      res.json({ message: "Unenrolled successfully." });
    } catch (error) { next(error); }
  });

  app.patch("/api/trainings/:id/progress", authenticate, async (req, res, next) => {
    try {
      const progress = Math.max(0, Math.min(100, Number.parseInt(String(req.body?.progress ?? 0), 10) || 0));
      const enrollment = await store.updateEnrollmentProgress(trimText(req.params.id), req.auth.userId, progress);
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found." });
      res.json({ message: "Progress updated.", enrollment });
    } catch (error) { next(error); }
  });

  // --- Connections ---

  app.post("/api/connections", authenticate, async (req, res, next) => {
    try {
      const toUserId = trimText(req.body?.toUserId);
      const message = trimText(req.body?.message);
      if (!toUserId) return res.status(400).json({ message: "Target user is required." });
      if (toUserId === req.auth.userId) return res.status(400).json({ message: "Cannot connect with yourself." });

      const targetUser = await store.findUserById(toUserId);
      if (!targetUser) return res.status(404).json({ message: "User not found." });

      const connection = await store.createConnection(req.auth.userId, toUserId, message);

      // Notify the target user
      try {
        const fromUser = await store.findUserById(req.auth.userId);
        await store.createNotification(toUserId, {
          title: "New Connection Request",
          message: `${fromUser?.fullName || "Someone"} wants to connect with you.`,
          type: "info",
        });
      } catch { /* non-critical */ }

      res.status(201).json({ message: "Connection request sent.", connection });
    } catch (error) { next(error); }
  });

  app.get("/api/connections", authenticate, async (req, res, next) => {
    try {
      const connections = await store.listConnectionsByUser(req.auth.userId);

      // Enrich with user names
      const enriched = await Promise.all(connections.map(async (c) => {
        const otherUserId = c.fromUserId === req.auth.userId ? c.toUserId : c.fromUserId;
        const otherUser = await store.findUserById(otherUserId);
        return {
          ...c,
          otherUserId,
          otherUserName: otherUser?.fullName || "Unknown",
          direction: c.fromUserId === req.auth.userId ? "sent" : "received",
        };
      }));

      res.json({ connections: enriched });
    } catch (error) { next(error); }
  });

  app.patch("/api/connections/:id", authenticate, async (req, res, next) => {
    try {
      const connectionId = trimText(req.params.id);
      const status = trimText(req.body?.status);
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be accepted or rejected." });
      }
      const connection = await store.findConnectionById(connectionId);
      if (!connection || connection.toUserId !== req.auth.userId) {
        return res.status(404).json({ message: "Connection not found." });
      }
      const updated = await store.updateConnectionStatus(connectionId, status);

      // Notify sender
      try {
        const toUser = await store.findUserById(req.auth.userId);
        await store.createNotification(connection.fromUserId, {
          title: status === "accepted" ? "Connection Accepted" : "Connection Declined",
          message: `${toUser?.fullName || "Someone"} ${status === "accepted" ? "accepted" : "declined"} your connection request.`,
          type: status === "accepted" ? "success" : "info",
        });
      } catch { /* non-critical */ }

      res.json({ message: `Connection ${status}.`, connection: updated });
    } catch (error) { next(error); }
  });

  // --- Notifications ---

  app.get("/api/notifications", authenticate, async (req, res, next) => {
    try {
      const notifications = await store.listNotificationsByUser(req.auth.userId);
      res.json({ notifications });
    } catch (error) { next(error); }
  });

  app.patch("/api/notifications/:id/read", authenticate, async (req, res, next) => {
    try {
      const notification = await store.markNotificationRead(trimText(req.params.id));
      if (!notification) return res.status(404).json({ message: "Notification not found." });
      res.json({ message: "Marked as read.", notification });
    } catch (error) { next(error); }
  });

  app.post("/api/notifications/mark-all-read", authenticate, async (req, res, next) => {
    try {
      await store.markAllNotificationsRead(req.auth.userId);
      res.json({ message: "All notifications marked as read." });
    } catch (error) { next(error); }
  });

  // --- File Uploads ---

  app.post("/api/upload", authenticate, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.storage
        .from("uploads")
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
      if (error) {
        return res.status(500).json({ message: "Upload failed.", error: error.message });
      }
      const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(filename);
      res.json({ message: "File uploaded successfully.", url: publicUrl, filename });
    } catch (err) {
      next(err);
    }
  });

  // In production, serve the built frontend
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(import.meta.dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(500).json({
      message,
    });
  });

  return app;
}
