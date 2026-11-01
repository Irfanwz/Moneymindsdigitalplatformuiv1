import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";

import { config } from "./config.js";
import { createAuthRouter } from "./routes/auth.js";
import { createAdminRouter } from "./routes/admin.js";
import { createAdminConsoleRouter } from './routes/adminConsole.js';
import { createProfilesRouter } from "./routes/profiles.js";
import { createGroupsRouter } from "./routes/groups.js";
import { createTrainingsRouter } from "./routes/trainings.js";
import { createConnectionsRouter } from "./routes/connections.js";
import { createNotificationsRouter } from "./routes/notifications.js";
import { createPaymentsRouter } from "./routes/payments.js";
import { createUploadRouter } from "./routes/upload.js";
import { createPublicRouter } from "./routes/public.js";
import { createTwoFARouter } from "./routes/twofa.js";
import { createExportRouter } from "./routes/export.js";
import { createMarketDataRouter } from "./routes/marketData.js";
import { createPredictionsRouter } from "./routes/predictions.js";
import { createVerificationRouter, createAdminVerificationRouter } from "./routes/verification.js";
import { createCredibilityRouter } from "./routes/credibility.js";
import { startPredictionCron } from "./cron/predictionCron.js";
import { startCredibilityCron } from "./cron/credibilityCron.js";
import { createAgentsRouter } from "./routes/agents.js";
import { startVerificationWorker } from "./services/agentService.js";
import { applyContentModeration } from './services/contentModeration.js';

export function createApp(store, { backgroundJobs = process.env.NODE_ENV !== "test" && !process.env.VERCEL } = {}) {
  const app = express();
  applyContentModeration(store);
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(cookieParser());
  app.use('/api/payments/webhook', express.raw({type:'application/json'}));
  app.use(express.json());

  app.get("/api/health", async (_req, res, next) => {
    try {
      const result = await store.health();
      res.json({ ok: true, ...result });
    } catch (error) { next(error); }
  });

  app.use("/api/auth", createAuthRouter(store));
  app.use("/api/admin", createAdminRouter(store));
  app.use('/api/admin/console', createAdminConsoleRouter(store));
  app.use("/api", createProfilesRouter(store));
  app.use("/api", createGroupsRouter(store));
  app.use("/api/trainings", createTrainingsRouter(store));
  app.use("/api/connections", createConnectionsRouter(store));
  app.use("/api/notifications", createNotificationsRouter(store));
  app.use("/api/payments", createPaymentsRouter(store));
  app.use("/api/upload", createUploadRouter(store));
  app.use("/api/public", createPublicRouter(store));
  app.use("/api/2fa", createTwoFARouter(store));
  app.use("/api/export", createExportRouter(store));
  app.use("/api/market", createMarketDataRouter());
  app.use("/api", createPredictionsRouter(store));
  app.use("/api/verify", createVerificationRouter(store));
  app.use("/api/admin/verifications", createAdminVerificationRouter(store));
  app.use("/api/credibility", createCredibilityRouter(store));
  app.use("/api/agents", createAgentsRouter(store));

  // Start daily prediction accuracy checker (9 AM every day)
  if (backgroundJobs) startPredictionCron(store);
  // Start daily credibility score recalculation (9:30 AM — after predictions)
  if (backgroundJobs) startCredibilityCron(store);
  if (backgroundJobs) startVerificationWorker(store);

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(import.meta.dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(error.status || 500).json({ message, code: error.code });
  });

  return app;
}
