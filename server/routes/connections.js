import { Router } from "express";
import { createAuthenticate } from "../middleware/auth.js";
import { validate, connectionRequestSchema, connectionStatusSchema } from "../schemas.js";
import { paginate, trimText } from "../utils.js";

export function createConnectionsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  router.post("/", authenticate, validate(connectionRequestSchema), async (req, res, next) => {
    try {
      const toUserId = trimText(req.body?.toUserId);
      const message = trimText(req.body?.message);
      if (!toUserId) return res.status(400).json({ message: "Target user is required." });
      if (toUserId === req.auth.userId) return res.status(400).json({ message: "Cannot connect with yourself." });

      const targetUser = await store.findUserById(toUserId);
      if (!targetUser) return res.status(404).json({ message: "User not found." });

      const connection = await store.createConnection(req.auth.userId, toUserId, message);
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

  router.get("/", authenticate, async (req, res, next) => {
    try {
      const connections = await store.listConnectionsByUser(req.auth.userId);
      const enriched = await Promise.all(connections.map(async (c) => {
        const otherUserId = c.fromUserId === req.auth.userId ? c.toUserId : c.fromUserId;
        const otherUser = await store.findUserById(otherUserId);
        return { ...c, otherUserId, otherUserName: otherUser?.fullName || "Unknown", direction: c.fromUserId === req.auth.userId ? "sent" : "received" };
      }));
      const { data, pagination } = paginate(enriched, req.query);
      res.json({ connections: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.patch("/:id", authenticate, validate(connectionStatusSchema), async (req, res, next) => {
    try {
      const connectionId = trimText(req.params.id);
      const status = trimText(req.body?.status);
      if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be accepted or rejected." });

      const connection = await store.findConnectionById(connectionId);
      if (!connection || connection.toUserId !== req.auth.userId) return res.status(404).json({ message: "Connection not found." });

      const updated = await store.updateConnectionStatus(connectionId, status);
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

  return router;
}
