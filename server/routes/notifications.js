import { Router } from "express";
import { createAuthenticate } from "../middleware/auth.js";
import { paginate, trimText } from "../utils.js";

export function createNotificationsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  router.get("/", authenticate, async (req, res, next) => {
    try {
      const notifications = await store.listNotificationsByUser(req.auth.userId);
      const { data, pagination } = paginate(notifications, req.query);
      res.json({ notifications: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.patch("/:id/read", authenticate, async (req, res, next) => {
    try {
      const notification = await store.markNotificationRead(trimText(req.params.id));
      if (!notification) return res.status(404).json({ message: "Notification not found." });
      res.json({ message: "Marked as read.", notification });
    } catch (error) { next(error); }
  });

  router.post("/mark-all-read", authenticate, async (req, res, next) => {
    try {
      await store.markAllNotificationsRead(req.auth.userId);
      res.json({ message: "All notifications marked as read." });
    } catch (error) { next(error); }
  });

  return router;
}
