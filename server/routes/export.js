import { createRequire } from "node:module";
import { Router } from "express";
import { createAuthenticate } from "../middleware/auth.js";
import { trimText } from "../utils.js";

const require = createRequire(import.meta.url);

function toCSV(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col] ?? "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
    }).join(",")
  );
  return [header, ...lines].join("\n");
}

export function createExportRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  // Export user's payments as CSV
  router.get("/payments.csv", authenticate, async (req, res, next) => {
    try {
      const payments = await store.listPaymentsByUser(req.auth.userId);
      const csv = toCSV(payments, ["id", "itemType", "itemId", "amount", "currency", "status", "paymentMethod", "transactionRef", "createdAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=\"payments.csv\"");
      res.send(csv);
    } catch (error) { next(error); }
  });

  // Export user's payments as JSON
  router.get("/payments.json", authenticate, async (req, res, next) => {
    try {
      const payments = await store.listPaymentsByUser(req.auth.userId);
      res.setHeader("Content-Disposition", "attachment; filename=\"payments.json\"");
      res.json({ payments, exportedAt: new Date().toISOString() });
    } catch (error) { next(error); }
  });

  // Export user's enrollments as CSV
  router.get("/enrollments.csv", authenticate, async (req, res, next) => {
    try {
      const enrollments = await store.listEnrollmentsByUser(req.auth.userId);
      const csv = toCSV(enrollments, ["id", "trainingId", "userId", "progress", "status", "enrolledAt", "completedAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=\"enrollments.csv\"");
      res.send(csv);
    } catch (error) { next(error); }
  });

  // Export user's connections as CSV
  router.get("/connections.csv", authenticate, async (req, res, next) => {
    try {
      const connections = await store.listConnectionsByUser(req.auth.userId);
      const enriched = await Promise.all(connections.map(async (c) => {
        const otherUserId = c.fromUserId === req.auth.userId ? c.toUserId : c.fromUserId;
        const otherUser = await store.findUserById(otherUserId);
        return { ...c, otherUserName: otherUser?.fullName || "", otherUserEmail: otherUser?.email || "", direction: c.fromUserId === req.auth.userId ? "sent" : "received" };
      }));
      const csv = toCSV(enriched, ["id", "direction", "otherUserName", "otherUserEmail", "status", "message", "createdAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=\"connections.csv\"");
      res.send(csv);
    } catch (error) { next(error); }
  });

  // Export payments as PDF (admin or own)
  router.get("/payments.pdf", authenticate, async (req, res, next) => {
    try {
      const PDFDocument = require("pdfkit");
      const payments = await store.listPaymentsByUser(req.auth.userId);
      const user = await store.findUserById(req.auth.userId);

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=\"payments.pdf\"");
      doc.pipe(res);

      // Header
      doc.fontSize(20).text("MoneyMinds — Payment History", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(11).text(`Account: ${user?.fullName || ""} (${user?.email || ""})`, { align: "center" });
      doc.fontSize(10).text(`Exported: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(1);

      if (payments.length === 0) {
        doc.fontSize(12).text("No payments found.", { align: "center" });
      } else {
        payments.forEach((p, i) => {
          doc.fontSize(11).text(`${i + 1}. ${p.itemType.replace(/_/g, " ")} — $${Number(p.amount).toFixed(2)} ${p.currency}`);
          doc.fontSize(9).fillColor("#555").text(`  Status: ${p.status}  |  Ref: ${p.transactionRef || "—"}  |  Date: ${new Date(p.createdAt).toLocaleDateString()}`);
          doc.fillColor("#000").moveDown(0.4);
        });
      }

      doc.end();
    } catch (error) { next(error); }
  });

  // Admin: export all users as CSV
  router.get("/admin/users.csv", authenticate, async (req, res, next) => {
    try {
      if (!req.auth.isAdmin) return res.status(403).json({ message: "Admin access required." });
      const users = await store.listUsers({});
      const csv = toCSV(users.map((u) => ({
        id: u.id, fullName: u.fullName, email: u.email, status: u.status,
        approvedRoles: (u.approvedRoles || []).join(";"), createdAt: u.createdAt,
      })), ["id", "fullName", "email", "status", "approvedRoles", "createdAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=\"users.csv\"");
      res.send(csv);
    } catch (error) { next(error); }
  });

  return router;
}
