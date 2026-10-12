import { Router } from "express";
import { createAuthenticate, requireApprovedRole } from "../middleware/auth.js";
import { getTierForScore, recalculateForAdvisor, validateFeeCap } from "../services/credibilityService.js";

export function createCredibilityRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);
  const requireAdvisorRole = requireApprovedRole("advisor");

  // GET /api/credibility/me — advisor's own score + tier
  router.get("/me", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profile = await store.findAdvisorProfileByUserId(req.auth.userId);
      if (!profile) return res.status(404).json({ message: "Advisor profile not found." });

      const score = profile.credibilityScore;
      const tier = score !== null && score !== undefined ? getTierForScore(score) : null;

      res.json({
        score,
        tier: tier?.tier ?? null,
        label: tier?.label ?? null,
        color: tier?.color ?? null,
        maxJoinFee: tier?.maxJoinFee ?? 0,
        maxMonthlyFee: tier?.maxMonthlyFee ?? 0,
        updatedAt: profile.credibilityUpdatedAt ?? null,
      });
    } catch (error) { next(error); }
  });

  // GET /api/credibility/history — score history for chart
  router.get("/history", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 90, 365);
      const history = await store.getCredibilityHistory(req.auth.userId, limit);
      res.json({ history });
    } catch (error) { next(error); }
  });

  // GET /api/credibility/tiers — list all tiers (public info)
  router.get("/tiers", authenticate, async (_req, res) => {
    res.json({
      tiers: [
        { tier: "elite", label: "Elite Advisor", color: "purple", minScore: 90, maxJoinFee: "Unlimited", maxMonthlyFee: "Unlimited" },
        { tier: "expert", label: "Expert", color: "green", minScore: 75, maxJoinFee: "$500", maxMonthlyFee: "$200" },
        { tier: "reliable", label: "Reliable", color: "blue", minScore: 60, maxJoinFee: "$200", maxMonthlyFee: "$100" },
        { tier: "developing", label: "Developing", color: "yellow", minScore: 40, maxJoinFee: "$50", maxMonthlyFee: "$25" },
        { tier: "inconsistent", label: "Inconsistent", color: "orange", minScore: 20, maxJoinFee: "Free only", maxMonthlyFee: "Free only" },
        { tier: "poor", label: "Poor Track Record", color: "red", minScore: 0, maxJoinFee: "Free only", maxMonthlyFee: "Free only" },
      ],
    });
  });

  // POST /api/credibility/recalculate — force recalculation for the logged-in advisor
  router.post("/recalculate", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const result = await recalculateForAdvisor(req.auth.userId, store);
      res.json({
        message: "Credibility score recalculated.",
        score: result.score,
        tier: result.tier?.tier ?? null,
        label: result.tier?.label ?? null,
        breakdown: result.breakdown,
        totalPredictions: result.totalPredictions,
      });
    } catch (error) { next(error); }
  });

  // POST /api/credibility/check-fee — validate if proposed fees are within cap
  router.post("/check-fee", authenticate, requireAdvisorRole, async (req, res, next) => {
    try {
      const profile = await store.findAdvisorProfileByUserId(req.auth.userId);
      if (!profile) return res.status(404).json({ message: "Advisor profile not found." });

      const joiningFee = parseFloat(req.body.joiningFee) || 0;
      const monthlyFee = parseFloat(req.body.monthlyFee) || 0;

      const result = validateFeeCap(profile.credibilityScore, joiningFee, monthlyFee);
      res.json(result);
    } catch (error) { next(error); }
  });

  return router;
}
