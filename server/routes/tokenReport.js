/** Token reports aggregate recorded usage across every agent run status. */
import { Router } from "express";
import { createAuthenticate, requirePermission } from "../middleware/auth.js";

// Estimates only. Exact model matches are required; unknown pricing stays unknown.
const MODEL_RATES = {
  "openai/gpt-oss-20b":        { input: 0.00000010, output: 0.00000030 },
  "llama-3.3-70b-versatile":   { input: 0.00000059, output: 0.00000079 },
  "llama-3.1-8b-instant":      { input: 0.00000005, output: 0.00000008 },
  "mixtral-8x7b-32768":        { input: 0.00000024, output: 0.00000024 },
  "gemma2-9b-it":              { input: 0.00000020, output: 0.00000020 },
  "qwen/qwen3.8-27b":          { input: 0.00000029, output: 0.00000039 },
  "claude-haiku-4-5-20251001": { input: 0.00000025, output: 0.00000125 },
  "claude-sonnet-4-6":         { input: 0.00000300, output: 0.00001500 },
  "claude-opus-4-6":           { input: 0.00001500, output: 0.00007500 },
  "gpt-4o-mini":               { input: 0.00000015, output: 0.00000060 },
  "gpt-4o":                    { input: 0.00000250, output: 0.00001000 },
};

const isCount = value => Number.isSafeInteger(value) && value >= 0;
const count = value => isCount(value) ? value : 0;
const emptyTotals = () => ({ input: 0, output: 0, total: 0, cost: 0, runs: 0 });

function estimateCost(usage) {
  if (!usage || usage.status === "not_used") return 0;
  if (!isCount(usage.inputTokens) || !isCount(usage.outputTokens)) return null;
  if (usage.inputTokens === 0 && usage.outputTokens === 0 && count(usage.totalTokens) === 0) return 0;
  const rate = Object.hasOwn(MODEL_RATES, usage.model) ? MODEL_RATES[usage.model] : null;
  return rate ? usage.inputTokens * rate.input + usage.outputTokens * rate.output : null;
}

function usageEntries(run) {
  // Calls hold the usage time for resumed/long-running work. Old aggregate-only
  // records use their run timestamp, matching the token-limit fallback.
  const calls = run.usage?.calls?.length ? run.usage.calls : [run.usage];
  return calls.map(call => {
    const input = count(call?.inputTokens), output = count(call?.outputTokens);
    return {
      input, output,
      total: isCount(call?.totalTokens) ? call.totalTokens : input + output,
      cost: estimateCost(call),
      time: Date.parse(call?.startedAt || run.createdAt),
    };
  });
}

function addRun(totals, entries) {
  if (!entries.length) return;
  totals.runs++;
  for (const entry of entries) {
    totals.input += entry.input;
    totals.output += entry.output;
    totals.total += entry.total;
    totals.cost = totals.cost === null || entry.cost === null ? null : totals.cost + entry.cost;
  }
}

async function fetchAllRuns(store) {
  const pageSize = 200;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    // Failed, skipped and running work can consume tokens too.
    const batch = await store.listAgentRuns({ limit: pageSize, offset, oldestFirst: true });
    all.push(...batch);
    if (batch.length < pageSize) return all;
  }
}

export function createTokenReportRouter(store) {
  const router = Router();
  router.use(createAuthenticate(store), requirePermission("reports"));

  router.get("/summary", async (_req, res, next) => {
    try {
      const now = new Date();
      const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const month = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
      const allTime = emptyTotals(), monthly = emptyTotals(), today = emptyTotals();
      for (const run of await fetchAllRuns(store)) {
        const entries = usageEntries(run);
        addRun(allTime, entries);
        addRun(monthly, entries.filter(entry => entry.time >= month));
        addRun(today, entries.filter(entry => entry.time >= day));
      }
      res.json({ summary: { allTime, monthly, today }, modelRates: MODEL_RATES });
    } catch (error) { next(error); }
  });

  router.get("/by-agent", async (_req, res, next) => {
    try {
      const groups = new Map();
      for (const run of await fetchAllRuns(store)) {
        const key = run.agentKey || "unknown";
        if (!groups.has(key)) groups.set(key, { agentKey: key, ...emptyTotals() });
        addRun(groups.get(key), usageEntries(run));
      }
      res.json({ byAgent: [...groups.values()].sort((a, b) => b.total - a.total) });
    } catch (error) { next(error); }
  });

  router.get("/by-user", async (_req, res, next) => {
    try {
      const [runs, usersResult] = await Promise.all([
        fetchAllRuns(store), store.listUsers({ limit: 1000 }).catch(() => []),
      ]);
      const users = new Map((usersResult.users || usersResult || []).map(user => [user.id, user]));
      const groups = new Map();
      for (const run of runs) {
        const key = run.userId || "system";
        if (!groups.has(key)) {
          const user = users.get(key);
          groups.set(key, { userId: key, name: user?.fullName || user?.full_name || "Unknown", email: user?.email || "", ...emptyTotals() });
        }
        addRun(groups.get(key), usageEntries(run));
      }
      res.json({ byUser: [...groups.values()].sort((a, b) => b.total - a.total) });
    } catch (error) { next(error); }
  });

  router.get("/timeline", async (req, res, next) => {
    try {
      const days = Math.min(Math.max(Math.floor(Number(req.query.days)) || 30, 1), 90);
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      const from = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (days - 1) * dayMs;
      const timeline = new Map();
      for (let i = 0; i < days; i++) {
        const date = new Date(from + i * dayMs).toISOString().slice(0, 10);
        timeline.set(date, { date, ...emptyTotals() });
      }
      for (const run of await fetchAllRuns(store)) {
        const perDay = new Map();
        for (const entry of usageEntries(run)) {
          if (!Number.isFinite(entry.time)) continue;
          const date = new Date(entry.time).toISOString().slice(0, 10);
          if (!timeline.has(date)) continue;
          if (!perDay.has(date)) perDay.set(date, []);
          perDay.get(date).push(entry);
        }
        // A run with multiple calls on one day is still one run that day.
        for (const [date, entries] of perDay) addRun(timeline.get(date), entries);
      }
      res.json({ timeline: [...timeline.values()] });
    } catch (error) { next(error); }
  });

  return router;
}
