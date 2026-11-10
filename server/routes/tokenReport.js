/**
 * Token Burn Report API
 *
 * GET /api/admin/token-report/summary   — all-time, monthly, daily totals
 * GET /api/admin/token-report/by-agent  — grouped by agent type
 * GET /api/admin/token-report/by-user   — grouped by user
 * GET /api/admin/token-report/timeline  — tokens per day (last N days)
 *
 * All aggregation happens in Node from the agent_runs.usage JSONB column.
 * Cost estimates use the MODEL_RATES map below — update when provider pricing changes.
 */

import { Router } from "express";
import { createAuthenticate } from "../middleware/auth.js";

// Cost per token in USD. Update when provider pricing changes.
// Source: provider pricing pages as of November 2026.
const MODEL_RATES = {
  // Groq-hosted models
  "openai/gpt-oss-20b":        { input: 0.00000010, output: 0.00000030 },
  "llama-3.3-70b-versatile":   { input: 0.00000059, output: 0.00000079 },
  "llama-3.1-8b-instant":      { input: 0.00000005, output: 0.00000008 },
  "mixtral-8x7b-32768":        { input: 0.00000024, output: 0.00000024 },
  "gemma2-9b-it":              { input: 0.00000020, output: 0.00000020 },
  "qwen/qwen3.8-27b":          { input: 0.00000029, output: 0.00000039 },
  // Anthropic
  "claude-haiku-4-5-20251001": { input: 0.00000025, output: 0.00000125 },
  "claude-sonnet-4-6":         { input: 0.00000300, output: 0.00001500 },
  "claude-opus-4-6":           { input: 0.00001500, output: 0.00007500 },
  // OpenAI
  "gpt-4o-mini":               { input: 0.00000015, output: 0.00000060 },
  "gpt-4o":                    { input: 0.00000250, output: 0.00001000 },
};

const DEFAULT_RATE = { input: 0.00000010, output: 0.00000030 };

function rateFor(model) {
  if (!model) return DEFAULT_RATE;
  // Exact match first, then prefix match
  if (MODEL_RATES[model]) return MODEL_RATES[model];
  const key = Object.keys(MODEL_RATES).find(k => model.startsWith(k) || k.startsWith(model.split("/")[0]));
  return key ? MODEL_RATES[key] : DEFAULT_RATE;
}

/**
 * Compute cost estimate from a usage object.
 * usage.calls = [{ model, inputTokens, outputTokens }, ...]
 */
function estimateCost(usage) {
  if (!usage) return 0;
  if (usage.calls?.length) {
    return usage.calls.reduce((sum, call) => {
      const r = rateFor(call.model || call.provider);
      return sum + (call.inputTokens || 0) * r.input + (call.outputTokens || 0) * r.output;
    }, 0);
  }
  // Fallback: use aggregate tokens with default rate
  const r = DEFAULT_RATE;
  return ((usage.inputTokens || 0) * r.input) + ((usage.outputTokens || 0) * r.output);
}

function extractTokens(usage) {
  if (!usage) return { input: 0, output: 0, total: 0 };
  return {
    input:  usage.inputTokens  || 0,
    output: usage.outputTokens || 0,
    total:  usage.totalTokens  || (usage.inputTokens || 0) + (usage.outputTokens || 0),
  };
}

/** Fetch ALL completed agent runs in a date range, paginating through Supabase. */
async function fetchAllRuns(store, { from, to } = {}) {
  const PAGE = 200; // agentStore caps listAgentRuns at 200 rows per call
  let offset = 0;
  const all = [];
  for (;;) {
    const batch = await store.listAgentRuns({ status: "completed", limit: PAGE, offset, oldestFirst: true });
    if (!batch?.length) break;
    for (const run of batch) {
      if (from && run.createdAt < from) continue;
      if (to   && run.createdAt > to)   continue;
      all.push(run);
    }
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export function createTokenReportRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  function requireAdmin(req, res, next) {
    if (!req.auth?.isAdmin) return res.status(401).json({ message: "Authentication required." });
    next();
  }

  /** GET /api/admin/token-report/summary */
  router.get("/summary", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const now = new Date();
      const todayStart  = new Date(now); todayStart.setHours(0,0,0,0);
      const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);

      const allRuns = await fetchAllRuns(store);

      let allTime  = { input: 0, output: 0, total: 0, cost: 0, runs: 0 };
      let monthly  = { input: 0, output: 0, total: 0, cost: 0, runs: 0 };
      let today    = { input: 0, output: 0, total: 0, cost: 0, runs: 0 };

      for (const run of allRuns) {
        const t = extractTokens(run.usage);
        const c = estimateCost(run.usage);
        const d = new Date(run.createdAt);

        allTime.input  += t.input;
        allTime.output += t.output;
        allTime.total  += t.total;
        allTime.cost   += c;
        allTime.runs++;

        if (d >= monthStart) { monthly.input += t.input; monthly.output += t.output; monthly.total += t.total; monthly.cost += c; monthly.runs++; }
        if (d >= todayStart) { today.input   += t.input; today.output   += t.output; today.total   += t.total; today.cost   += c; today.runs++;   }
      }

      res.json({ summary: { allTime, monthly, today }, modelRates: MODEL_RATES });
    } catch (err) { next(err); }
  });

  /** GET /api/admin/token-report/by-agent */
  router.get("/by-agent", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const allRuns = await fetchAllRuns(store);
      const map = {};

      for (const run of allRuns) {
        const key = run.agentKey || "unknown";
        if (!map[key]) map[key] = { agentKey: key, runs: 0, input: 0, output: 0, total: 0, cost: 0 };
        const t = extractTokens(run.usage);
        map[key].runs++;
        map[key].input  += t.input;
        map[key].output += t.output;
        map[key].total  += t.total;
        map[key].cost   += estimateCost(run.usage);
      }

      const rows = Object.values(map).sort((a, b) => b.total - a.total);
      res.json({ byAgent: rows });
    } catch (err) { next(err); }
  });

  /** GET /api/admin/token-report/by-user */
  router.get("/by-user", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const [allRuns, usersResult] = await Promise.all([
        fetchAllRuns(store),
        store.listUsers({ limit: 1000 }).catch(() => []),
      ]);

      // Build userId → name/email lookup
      const userMap = {};
      for (const u of (usersResult.users || usersResult || [])) {
        userMap[u.id] = { name: u.fullName || u.full_name || "Unknown", email: u.email || "" };
      }

      const map = {};
      for (const run of allRuns) {
        const uid = run.userId || "system";
        if (!map[uid]) map[uid] = { userId: uid, name: userMap[uid]?.name || "Unknown", email: userMap[uid]?.email || "", runs: 0, input: 0, output: 0, total: 0, cost: 0 };
        const t = extractTokens(run.usage);
        map[uid].runs++;
        map[uid].input  += t.input;
        map[uid].output += t.output;
        map[uid].total  += t.total;
        map[uid].cost   += estimateCost(run.usage);
      }

      const rows = Object.values(map).sort((a, b) => b.total - a.total);
      res.json({ byUser: rows });
    } catch (err) { next(err); }
  });

  /** GET /api/admin/token-report/timeline?days=30 */
  router.get("/timeline", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 90);
      const from = new Date();
      from.setDate(from.getDate() - days + 1);
      from.setHours(0, 0, 0, 0);

      const allRuns = await fetchAllRuns(store, { from: from.toISOString() });

      // Build a map keyed by YYYY-MM-DD
      const dayMap = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(from); d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { date: key, input: 0, output: 0, total: 0, cost: 0, runs: 0 };
      }

      for (const run of allRuns) {
        const key = run.createdAt?.slice(0, 10);
        if (!key || !dayMap[key]) continue;
        const t = extractTokens(run.usage);
        dayMap[key].input  += t.input;
        dayMap[key].output += t.output;
        dayMap[key].total  += t.total;
        dayMap[key].cost   += estimateCost(run.usage);
        dayMap[key].runs++;
      }

      res.json({ timeline: Object.values(dayMap) });
    } catch (err) { next(err); }
  });

  return router;
}
