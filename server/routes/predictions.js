/**
 * predictions.js — Prediction Accuracy API endpoints
 *
 * GET  /api/signals/:signalId/prediction     — prediction result for one signal
 * GET  /api/advisors/:advisorId/accuracy     — advisor's overall accuracy stats
 * GET  /api/groups/:groupId/predictions      — all predictions in a group
 * POST /api/admin/predictions/check-now      — manual trigger (admin only)
 */

import { Router } from "express";
import { createAuthenticate, requireApprovedRole } from "../middleware/auth.js";
import { trimText } from "../utils.js";
import { checkDuePredictions, checkOnePrediction } from "../services/predictionCheckerService.js";

// ─── In-memory accuracy stats cache (5 min TTL) ─────────────────────────────
const accuracyCache = new Map();
const ACCURACY_CACHE_TTL = 5 * 60 * 1000;

export function createPredictionsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);
  const requireAdmin = requireApprovedRole("admin");

  // ─── GET /api/signals/:signalId/prediction ──────────────────────────────────
  // Returns prediction fields for a single signal (pending or result)

  router.get("/signals/:signalId/prediction", authenticate, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal) return res.status(404).json({ message: "Signal not found." });

      res.json({
        signalId: signal.id,
        ticker: null, // derived from parser at schedule time, not stored separately
        direction: signal.predictionDirection,
        targetPrice: signal.predictionTargetPrice,
        timeframe: signal.predictionTimeframe,
        timeframeDays: signal.predictionTimeframeDays,
        checkDate: signal.predictionCheckDate,
        baselinePrice: signal.baselinePrice,
        baselineFetchedAt: signal.baselineFetchedAt,
        // Result fields (null until check_date passes)
        actualPrice: signal.actualPrice,
        accuracy: signal.predictionAccuracy,
        result: signal.predictionResult,
        checkedAt: signal.predictionCheckedAt,
        explanation: signal.predictionExplanation,
        // Status
        status: deriveStatus(signal),
      });
    } catch (error) { next(error); }
  });

  // ─── GET /api/advisors/:advisorId/accuracy ──────────────────────────────────
  // Advisor accuracy stats: overall score, by timeframe, streak

  router.get("/advisors/:advisorId/accuracy", authenticate, async (req, res, next) => {
    try {
      const advisorId = trimText(req.params.advisorId);

      // Check cache first
      const cached = accuracyCache.get(advisorId);
      if (cached && Date.now() - cached.ts < ACCURACY_CACHE_TTL) {
        return res.json(cached.stats);
      }

      // Get all signals by this advisor that have been checked
      const allSignals = await store.listSignalsByAdvisor(advisorId).catch(() => null);

      if (!allSignals) {
        return res.json(buildEmptyStats(advisorId));
      }

      const checked = allSignals.filter((s) => s.predictionCheckedAt !== null && s.predictionResult !== null);
      const stats = buildAccuracyStats(advisorId, checked);

      // Cache result
      accuracyCache.set(advisorId, { stats, ts: Date.now() });

      res.json(stats);
    } catch (error) { next(error); }
  });

  // ─── GET /api/groups/:groupId/predictions ───────────────────────────────────
  // All signals in a group with their prediction fields

  router.get("/groups/:groupId/predictions", authenticate, async (req, res, next) => {
    try {
      const groupId = trimText(req.params.groupId);
      const group = await store.findGroupById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found." });

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

      const signals = await store.listSignalsByGroup(groupId);

      // Filter to only signals that have prediction data
      const allPredictions = signals.filter((s) => s.predictionDirection !== null);
      const total = allPredictions.length;

      // Paginate
      const start = (page - 1) * limit;
      const predictions = allPredictions.slice(start, start + limit).map((s) => ({
        signalId: s.id,
        title: s.title,
        direction: s.predictionDirection,
        targetPrice: s.predictionTargetPrice,
        timeframe: s.predictionTimeframe,
        checkDate: s.predictionCheckDate,
        baselinePrice: s.baselinePrice,
        actualPrice: s.actualPrice,
        accuracy: s.predictionAccuracy,
        result: s.predictionResult,
        explanation: s.predictionExplanation,
        status: deriveStatus(s),
        createdAt: s.createdAt,
      }));

      res.json({ groupId, predictions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
  });

  // ─── POST /api/admin/predictions/check-now ──────────────────────────────────
  // Admin-only: manually trigger a check of all due predictions

  router.post("/admin/predictions/check-now", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const count = await checkDuePredictions(store);
      accuracyCache.clear(); // invalidate after bulk check
      res.json({ message: `Checked ${count} prediction(s).`, checked: count });
    } catch (error) { next(error); }
  });

  // ─── POST /api/admin/predictions/:signalId/check ────────────────────────────
  // Admin-only: manually check a single signal now (regardless of check_date)

  router.post("/admin/predictions/:signalId/check", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const signalId = trimText(req.params.signalId);
      const signal = await store.findSignalById(signalId);
      if (!signal) return res.status(404).json({ message: "Signal not found." });
      if (signal.predictionDirection === null) {
        return res.status(400).json({ message: "Signal has no prediction data to check." });
      }
      const result = await checkOnePrediction(signal, store);
      accuracyCache.delete(signal.advisorId); // invalidate this advisor's cache
      res.json({ message: "Prediction checked.", signal: result });
    } catch (error) { next(error); }
  });

  return router;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(signal) {
  if (signal.predictionDirection === null) return "no_prediction";
  if (signal.predictionCheckedAt !== null) return "checked";
  if (signal.predictionCheckDate && new Date(signal.predictionCheckDate) <= new Date()) return "overdue";
  return "pending";
}

function buildEmptyStats(advisorId) {
  return {
    advisorId,
    totalPredictions: 0,
    correct: 0,
    partial: 0,
    incorrect: 0,
    overallAccuracy: null,
    byTimeframe: {},
    currentStreak: 0,
  };
}

function buildAccuracyStats(advisorId, checked) {
  const correct = checked.filter((s) => s.predictionResult === "correct").length;
  const partial = checked.filter((s) => s.predictionResult === "partial").length;
  const incorrect = checked.filter((s) => s.predictionResult === "incorrect").length;
  const total = checked.length;

  // Weighted average: correct=100, partial=60, incorrect=0
  const overallAccuracy = total > 0
    ? Math.round((correct * 100 + partial * 60) / total)
    : null;

  // Accuracy by timeframe
  const byTimeframe = {};
  for (const s of checked) {
    const tf = s.predictionTimeframe ?? "unknown";
    if (!byTimeframe[tf]) byTimeframe[tf] = { correct: 0, partial: 0, incorrect: 0, total: 0 };
    byTimeframe[tf][s.predictionResult]++;
    byTimeframe[tf].total++;
  }
  for (const tf of Object.keys(byTimeframe)) {
    const b = byTimeframe[tf];
    b.accuracy = Math.round((b.correct * 100 + b.partial * 60) / b.total);
  }

  // Current streak (consecutive correct/partial from most recent)
  const sorted = [...checked].sort((a, b) => b.predictionCheckedAt.localeCompare(a.predictionCheckedAt));
  let currentStreak = 0;
  for (const s of sorted) {
    if (s.predictionResult === "correct" || s.predictionResult === "partial") currentStreak++;
    else break;
  }

  return {
    advisorId,
    totalPredictions: total,
    correct,
    partial,
    incorrect,
    overallAccuracy,
    byTimeframe,
    currentStreak,
  };
}
