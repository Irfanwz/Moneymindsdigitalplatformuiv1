import { afterEach, beforeEach, expect, it, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { createToken } from "../server/auth.js";
import { createTokenReportRouter } from "../server/routes/tokenReport.js";

const paths = ["summary", "by-agent", "by-user", "timeline?days=2"];
const now = "2026-11-01T03:04:00.000Z";
const model = "openai/gpt-oss-20b";
let app, store, users, runs;

function call(total = 10, overrides = {}) {
  return { model, provider: "groq", startedAt: now, inputTokens: total - 3, outputTokens: 3, totalTokens: total, ...overrides };
}

function addRun(overrides = {}) {
  const run = {
    id: `run-${runs.length}`, userId: "ordinary", agentKey: "verification",
    status: "completed", createdAt: now, updatedAt: now,
    usage: { inputTokens: 7, outputTokens: 3, totalTokens: 10, calls: [call()] },
    ...overrides,
  };
  runs.push(run);
  return run;
}

function get(path, who = "finance", transport = "bearer") {
  const token = createToken(users.get(who));
  return request(app).get(`/reports/${path}`).set(transport === "cookie"
    ? { Cookie: `mm_token=${token}` }
    : { Authorization: `Bearer ${token}` });
}

beforeEach(() => {
  // Keep real HTTP timers while making the report periods and JWT dates stable.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(now));
  users = new Map(["super_admin", "finance", "reviewer", "support", "unknown", "ordinary", "suspended"].map(role => [role, {
    id: role, fullName: `${role} fixture`, email: `${role}@fixture.test`, status: "approved",
    isAdmin: role !== "ordinary", adminRole: role === "suspended" ? "finance" : role,
    isSuspended: role === "suspended",
  }]));
  runs = [];
  store = {
    findUserById: vi.fn(async id => users.get(id) || null),
    getAdminSettings: async () => ({ maintenanceMode: false }),
    listUsers: vi.fn(async () => [...users.values()]),
    listAgentRuns: vi.fn(async ({ status, offset = 0, limit = 50 } = {}) =>
      runs.filter(run => !status || run.status === status).slice(offset, offset + Math.min(limit, 200))),
  };
  app = express();
  app.use(cookieParser());
  app.use("/reports", createTokenReportRouter(store));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message }));
});

afterEach(() => vi.useRealTimers());

it("requires authentication on every token-report endpoint", async () => {
  for (const path of paths) await request(app).get(`/reports/${path}`).expect(401);
  expect(store.listAgentRuns).not.toHaveBeenCalled();
});

it("denies restricted, ordinary, unknown-role and suspended users on every endpoint", async () => {
  for (const who of ["reviewer", "support", "ordinary", "unknown", "suspended"])
    for (const path of paths) await get(path, who).expect(403);
  expect(store.listAgentRuns).not.toHaveBeenCalled();
  expect(store.listUsers).not.toHaveBeenCalled();
});

it("allows finance and super admins using both cookie and Bearer sessions", async () => {
  for (const who of ["finance", "super_admin"])
    for (const transport of ["cookie", "bearer"])
      for (const path of paths) await get(path, who, transport).expect(200);
});

it("honors the stored role after a token was issued", async () => {
  const token = createToken(users.get("finance"));
  users.set("finance", { ...users.get("finance"), adminRole: "reviewer" });
  for (const path of paths)
    await request(app).get(`/reports/${path}`).set("Authorization", `Bearer ${token}`).expect(403);
  expect(store.listAgentRuns).not.toHaveBeenCalled();
});

it("preserves legacy administrator access when no role has been assigned", async () => {
  users.set("super_admin", { ...users.get("super_admin"), adminRole: null });
  addRun();
  for (const path of paths) await get(path, "super_admin").expect(200);
});

it("counts billable usage from completed, failed, skipped and running work in all reports", async () => {
  for (const status of ["completed", "failed", "skipped", "running"]) addRun({ status });
  const summary = (await get("summary").expect(200)).body.summary;
  for (const period of ["allTime", "monthly", "today"])
    expect(summary[period]).toMatchObject({ input: 28, output: 12, total: 40, runs: 4 });
  const byAgent = (await get("by-agent").expect(200)).body.byAgent;
  expect(byAgent).toEqual([expect.objectContaining({ agentKey: "verification", total: 40, runs: 4 })]);
  const byUser = (await get("by-user").expect(200)).body.byUser;
  expect(byUser).toEqual([expect.objectContaining({ userId: "ordinary", name: "ordinary fixture", total: 40, runs: 4 })]);
  const timeline = (await get("timeline?days=2").expect(200)).body.timeline;
  expect(timeline.find(day => day.date === "2026-11-01")).toMatchObject({ total: 40, runs: 4 });
});

it("paginates past the 200-run store cap without losing failed usage", async () => {
  for (let index = 0; index < 205; index++) addRun({ status: index === 204 ? "failed" : "completed" });
  const summary = (await get("summary").expect(200)).body.summary;
  expect(summary.allTime).toMatchObject({ total: 2050, runs: 205 });
  expect(store.listAgentRuns.mock.calls.some(([options]) => options.offset === 200)).toBe(true);
});

it("uses individual call counters instead of a stale aggregate and counts each run once", async () => {
  addRun({ usage: { inputTokens: 999, outputTokens: 999, totalTokens: 1998, calls: [call(5), call(7)] } });
  const summary = (await get("summary").expect(200)).body.summary;
  expect(summary.allTime).toMatchObject({ input: 6, output: 6, total: 12, runs: 1 });
  expect(summary.today.runs).toBe(1);
  expect(summary.allTime.cost).toBeCloseTo(6 * 0.00000010 + 6 * 0.00000030, 12);
  expect((await get("by-agent").expect(200)).body.byAgent[0]).toMatchObject({ total: 12, runs: 1 });
});

it("assigns cross-month calls to their UTC day, including timestamps with offsets", async () => {
  addRun({
    createdAt: "2026-10-31T23:50:00.000Z",
    usage: { inputTokens: 88, outputTokens: 12, totalTokens: 100, calls: [
      call(10, { startedAt: "2026-10-31T23:59:59.999Z" }),
      call(20, { startedAt: "2026-11-01T00:00:00.000Z" }),
      call(30, { startedAt: "2026-11-01T04:59:59.999+05:00" }),
      call(40, { startedAt: "2026-11-01T05:00:00.000+05:00" }),
    ] },
  });
  const summary = (await get("summary").expect(200)).body.summary;
  expect(summary.allTime).toMatchObject({ total: 100, runs: 1 });
  expect(summary.monthly).toMatchObject({ total: 60, runs: 1 });
  expect(summary.today).toMatchObject({ total: 60, runs: 1 });
  const timeline = (await get("timeline?days=2").expect(200)).body.timeline;
  expect(timeline).toEqual([
    expect.objectContaining({ date: "2026-10-31", total: 40, runs: 1 }),
    expect.objectContaining({ date: "2026-11-01", total: 60, runs: 1 }),
  ]);
});

it("falls back to run creation time for calls without a timestamp and preserves legacy totals", async () => {
  addRun({ createdAt: "2026-10-31T23:59:59.999Z", usage: { calls: [call(10, { startedAt: undefined })] } });
  addRun({ usage: { inputTokens: 8, outputTokens: 2, totalTokens: 10 } });
  const summary = (await get("summary").expect(200)).body.summary;
  expect(summary.allTime).toMatchObject({ input: 15, output: 5, total: 20, runs: 2 });
  expect(summary.today).toMatchObject({ input: 8, output: 2, total: 10, runs: 1 });
  expect(summary.today.cost).toBeNull(); // Legacy aggregate has no known model rate.
  const timeline = (await get("timeline?days=2").expect(200)).body.timeline;
  expect(timeline.map(day => ({ date: day.date, total: day.total, runs: day.runs }))).toEqual([
    { date: "2026-10-31", total: 10, runs: 1 },
    { date: "2026-11-01", total: 10, runs: 1 },
  ]);
});

it("does not invent a cost for Gemini or an unknown model sharing a known provider prefix", async () => {
  addRun({ usage: { calls: [call(10, { provider: "gemini", model: "gemini-unpriced" })] } });
  addRun({ usage: { calls: [call(10, { model: "openai/unpriced-model" })] } });
  const summary = (await get("summary").expect(200)).body.summary;
  expect(summary.allTime).toMatchObject({ total: 20, cost: null });
  expect((await get("by-agent").expect(200)).body.byAgent[0].cost).toBeNull();
  expect((await get("by-user").expect(200)).body.byUser[0].cost).toBeNull();
  expect((await get("timeline?days=1").expect(200)).body.timeline[0].cost).toBeNull();
});

it("keeps mixed known/unknown pricing unknown without discarding known token consumption", async () => {
  addRun({ usage: { calls: [call(10), call(10, { model: "unknown" })] } });
  expect((await get("summary").expect(200)).body.summary.today).toMatchObject({ total: 20, cost: null });
});

it.each(["inputTokens", "outputTokens"])("returns unknown cost when %s is unreported", async missing => {
  addRun({ usage: { calls: [call(10, { [missing]: null })] } });
  expect((await get("summary").expect(200)).body.summary.allTime).toMatchObject({ total: 10, cost: null });
});

it("reports zero cost for an agent run that made no AI request", async () => {
  addRun({ agentKey: "credibility", usage: { status: "not_used", requestCount: 0, calls: [], inputTokens: 0, outputTokens: 0, totalTokens: 0 } });
  expect((await get("summary").expect(200)).body.summary.allTime).toMatchObject({ input: 0, output: 0, total: 0, cost: 0 });
});
