import { Router } from "express";
import { normalizeGroupInput, normalizeSignalInput } from "../advisorGroups.js";
import { createAuthenticate, requireApprovedRole } from "../middleware/auth.js";
import { paginate, trimText } from "../utils.js";

export function createGroupsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);
  const requireAdvisorRole = requireApprovedRole("advisor");

  // --- Browse Groups ---
  router.get("/groups/browse", authenticate, async (req, res, next) => {
    try {
      const groups = await store.listPublicGroups();
      const memberships = await store.listUserMemberships(req.auth.userId);
      const joinedGroupIds = new Set(memberships.map((m) => m.groupId));
      const enriched = await Promise.all(groups.map(async (g) => {
        const advisor = await store.findUserById(g.advisorId);
        return { ...g, advisorName: advisor?.fullName || "Unknown", isJoined: joinedGroupIds.has(g.id) };
      }));
      const { data, pagination } = paginate(enriched, req.query);
      res.json({ groups: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  // --- Advisor Groups CRUD ---
  router.post("/advisor/groups", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const input = normalizeGroupInput(req.body);
      if (input.name.length < 2) return res.status(400).json({ message: "Group name is required." });
      const group = await store.createGroup(req.auth.userId, input);
      res.status(201).json({ message: "Group created successfully.", group });
    } catch (error) { next(error); }
  });

  router.get("/advisor/groups", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groups = await store.listGroupsByAdvisor(req.auth.userId);
      res.json({ groups });
    } catch (error) { next(error); }
  });

  router.get("/advisor/groups/:groupId", authenticate, async (req, res, next) => {
    try {
      const group = await store.findGroupById(trimText(req.params.groupId));
      if (!group) return res.status(404).json({ message: "Group not found." });
      res.json({ group });
    } catch (error) { next(error); }
  });

  router.put("/advisor/groups/:groupId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const existing = await store.findGroupById(groupId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Group not found." });
      const input = normalizeGroupInput(req.body);
      if (input.name.length < 2) return res.status(400).json({ message: "Group name is required." });
      const group = await store.updateGroup(groupId, input);
      res.json({ message: "Group updated successfully.", group });
    } catch (error) { next(error); }
  });

  router.delete("/advisor/groups/:groupId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const existing = await store.findGroupById(groupId);
      if (!existing || existing.advisorId !== req.auth.userId) return res.status(404).json({ message: "Group not found." });
      await store.deleteGroup(groupId);
      res.json({ message: "Group deleted successfully." });
    } catch (error) { next(error); }
  });

  // --- Join / Leave ---
  router.post("/advisor/groups/:groupId/join", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found." });
      const member = await store.joinGroup(groupId, req.auth.userId);
      try {
        await store.createNotification(group.advisorId, { title: "New Group Member", message: `Someone joined your group "${group.name}".`, type: "info" });
      } catch { /* non-critical */ }
      res.status(201).json({ message: "Joined group successfully.", member });
    } catch (error) { next(error); }
  });

  router.post("/advisor/groups/:groupId/leave", authenticate, async (req, res, next) => {
    try {
      await store.leaveGroup(trimText(req.params.groupId), req.auth.userId);
      res.json({ message: "Left group successfully." });
    } catch (error) { next(error); }
  });

  // --- Members ---
  router.get("/advisor/groups/:groupId/members", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found." });
      const members = await store.listGroupMembers(groupId);
      const enriched = await Promise.all(members.map(async (m) => {
        const user = await store.findUserById(m.userId);
        return { ...m, userName: user?.fullName || "Unknown", email: user?.email || "" };
      }));
      res.json({ members: enriched });
    } catch (error) { next(error); }
  });

  router.delete("/advisor/groups/:groupId/members/:userId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const userId = trimText(req.params.userId);
      const group = await store.findGroupById(groupId);
      if (!group || group.advisorId !== req.auth.userId) return res.status(404).json({ message: "Group not found." });
      await store.removeGroupMember(groupId, userId);
      try {
        await store.createNotification(userId, { title: "Removed from Group", message: `You have been removed from the group "${group.name}".`, type: "warning" });
      } catch { /* non-critical */ }
      res.json({ message: "Member removed successfully." });
    } catch (error) { next(error); }
  });

  // --- Signals ---
  router.post("/advisor/groups/:groupId/signals", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group || group.advisorId !== req.auth.userId) return res.status(404).json({ message: "Group not found." });
      const input = normalizeSignalInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Title is required." });
      const signal = await store.createSignal(groupId, req.auth.userId, input);
      res.status(201).json({ message: "Published successfully.", signal });
    } catch (error) { next(error); }
  });

  router.get("/advisor/groups/:groupId/signals", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found." });
      const signals = await store.listSignalsByGroup(groupId);
      const { data, pagination } = paginate(signals, req.query);
      res.json({ signals: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.put("/advisor/groups/:groupId/signals/:signalId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal || signal.advisorId !== req.auth.userId) return res.status(404).json({ message: "Signal not found." });
      const input = normalizeSignalInput(req.body);
      if (input.title.length < 2) return res.status(400).json({ message: "Title is required." });
      const updated = await store.updateSignal(signalId, input);
      res.json({ message: "Signal updated successfully.", signal: updated });
    } catch (error) { next(error); }
  });

  router.delete("/advisor/groups/:groupId/signals/:signalId", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal || signal.advisorId !== req.auth.userId) return res.status(404).json({ message: "Signal not found." });
      await store.deleteSignal(signalId);
      res.json({ message: "Signal deleted successfully." });
    } catch (error) { next(error); }
  });

  // --- Comments ---
  router.get("/signals/:signalId/comments", authenticate, async (req, res, next) => {
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

  router.post("/signals/:signalId/comments", authenticate, async (req, res, next) => {
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

  router.delete("/signals/:signalId/comments/:commentId", authenticate, async (req, res, next) => {
    try {
      const commentId = trimText(req.params.commentId);
      const comment = await store.findCommentById(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found." });
      if (comment.userId !== req.auth.userId) {
        const signal = await store.findSignalById(comment.signalId);
        if (!signal || signal.advisorId !== req.auth.userId) return res.status(403).json({ message: "Not authorized to delete this comment." });
      }
      await store.deleteComment(commentId);
      res.json({ message: "Comment deleted." });
    } catch (error) { next(error); }
  });

  // --- Reactions ---
  router.get("/signals/:signalId/reactions", authenticate, async (req, res, next) => {
    try {
      const reactions = await store.listReactionsBySignal(trimText(req.params.signalId));
      res.json({ reactions });
    } catch (error) { next(error); }
  });

  router.post("/signals/:signalId/reactions", authenticate, async (req, res, next) => {
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

  return router;
}
