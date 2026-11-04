import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
const mocks = vi.hoisted(() => ({ groq: vi.fn(), anthropic: vi.fn() }));
vi.mock("groq-sdk", () => ({
  default: class {
    chat = { completions: { create: mocks.groq } };
  },
}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mocks.anthropic };
  },
}));
import { config } from "../server/config.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { normalizeTokenUsage } from "../server/services/aiUsage.js";
import {
  executeTrackedRun,
  expireStaleRuns,
} from "../server/services/agentRuntime.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";

const original = { ...config };
let store, user;
const groqReply = (input = 100, output = 25, content = '{"ready":true}') => ({
  model: "groq-response-model",
  choices: [{ message: { content } }],
  usage: {
    prompt_tokens: input,
    completion_tokens: output,
    total_tokens: input + output,
    prompt_tokens_details: { cached_tokens: 20 },
    completion_tokens_details: { reasoning_tokens: 5 },
  },
});
const claudeReply = () => ({
  model: "claude-response-model",
  content: [{ type: "text", text: '{"ready":true}' }],
  usage: {
    input_tokens: 10,
    output_tokens: 5,
    cache_read_input_tokens: 40,
    cache_creation_input_tokens: 15,
    output_tokens_details: { reasoning_tokens: 2 },
  },
});
async function run(work, owner = user) {
  const saved = await store.createAgentRun({
    userId: owner.id,
    agentKey: "profile-quality",
    targetId: owner.id,
  });
  return executeTrackedRun(store, saved, work);
}
beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  Object.assign(config, {
    groqApiKey: "fixture-key",
    anthropicApiKey: "fixture-key",
    aiProvider: "auto",
  });
  mocks.groq.mockResolvedValue(groqReply());
  mocks.anthropic.mockResolvedValue(claudeReply());
  store = createMemoryStore();
  user = await store.createUserProfile({
    fullName: "Usage Fixture",
    email: "usage@example.test",
    passwordHash: "unused",
    requestedRoles: ["investor"],
  });
  await store.updateApproval(user.id, {
    status: "approved",
    approvedRoles: ["investor"],
  });
  user = await store.findUserById(user.id);
});
afterEach(() => {
  Object.assign(config, original);
  vi.useRealTimers();
});

describe("Actual provider token accounting", () => {
  it("keeps Groq cache and reasoning counts as subsets, not extra tokens", () => {
    expect(normalizeTokenUsage("groq", groqReply().usage)).toEqual({
      inputTokens: 100,
      outputTokens: 25,
      totalTokens: 125,
      cachedInputTokens: 20,
      cacheWriteTokens: null,
      reasoningTokens: 5,
    });
  });
  it("includes Anthropic cache reads and writes once in total input", () => {
    expect(normalizeTokenUsage("anthropic", claudeReply().usage)).toEqual({
      inputTokens: 65,
      outputTokens: 5,
      totalTokens: 70,
      cachedInputTokens: 40,
      cacheWriteTokens: 15,
      reasoningTokens: 2,
    });
  });
  it("never estimates usage or turns missing/invalid values into zero", () => {
    expect(normalizeTokenUsage("groq", null).totalTokens).toBeNull();
    expect(
      normalizeTokenUsage("groq", {
        prompt_tokens: -1,
        completion_tokens: "20",
        total_tokens: NaN,
      }).totalTokens,
    ).toBeNull();
    expect(
      normalizeTokenUsage("groq", { prompt_tokens: 12, completion_tokens: 3 }),
    ).toMatchObject({ inputTokens: 12, outputTokens: 3, totalTokens: 15 });
  });
  it("persists counts and purpose for each call without saving prompts or documents", async () => {
    const result = await run(async () => {
      await generateJSON("PRIVATE SYSTEM PROMPT", "PRIVATE PROFILE TEXT", {
        purpose: "Check 12 profile fields",
        usageDetails: {
          fieldCount: 12,
          sourceCount: 8,
          documentCount: 2,
          password: "PRIVATE-PASSWORD",
        },
      });
      await generateJSON("PRIVATE DOCUMENT", "PRIVATE SOURCE TEXT", {
        purpose: "Review another batch",
        usageDetails: { fieldCount: 5 },
      });
      return { summary: "Done" };
    });
    expect(result).toMatchObject({
      status: "completed",
      usage: {
        status: "complete",
        requestCount: 2,
        reportedRequests: 2,
        inputTokens: 200,
        outputTokens: 50,
        totalTokens: 250,
      },
    });
    expect(result.usage.calls[0]).toMatchObject({
      purpose: "Check 12 profile fields",
      model: "groq-response-model",
      details: { fieldCount: 12, sourceCount: 8, documentCount: 2 },
    });
    expect(JSON.stringify(result.usage)).not.toMatch(/PRIVATE|fixture-key/);
    expect((await store.getAgentRun(result.id)).usage.totalTokens).toBe(250);
  });
  it("counts invalid responses as well as the successful fallback", async () => {
    mocks.groq.mockResolvedValue(groqReply(100, 25, "invalid JSON"));
    const result = await run(() =>
      generateJSON("JSON only", "Check", { purpose: "Review a profile" }),
    );
    expect(result.usage).toMatchObject({
      status: "complete",
      requestCount: 2,
      totalTokens: 195,
      inputTokens: 165,
      outputTokens: 30,
    });
    expect(result.usage.calls.map((c) => c.trigger)).toEqual([
      "initial",
      "fallback",
    ]);
    expect(result.usage.calls.map((c) => c.provider)).toEqual([
      "groq",
      "anthropic",
    ]);
  });
  it("keeps failure usage when every response is invalid", async () => {
    config.aiProvider = "groq";
    mocks.groq.mockResolvedValue(groqReply(70, 8, "not-json"));
    const result = await run(() => generateJSON("JSON only", "Check"));
    expect(result).toMatchObject({
      status: "failed",
      result: null,
      usage: { totalTokens: 78, status: "complete" },
    });
  });
  it("records an unreported rate-limit attempt and the reported retry separately", async () => {
    vi.useFakeTimers();
    mocks.groq
      .mockRejectedValueOnce(
        Object.assign(new Error("Rate limited"), {
          status: 429,
          headers: new Headers({ "retry-after": "2" }),
        }),
      )
      .mockResolvedValue(groqReply());
    const pending = run(() => generateJSON("JSON only", "Check"));
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.groq).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await pending;
    expect(result.usage).toMatchObject({
      status: "partial",
      requestCount: 2,
      unreportedRequests: 1,
      totalTokens: 125,
    });
    expect(result.usage.calls.map((c) => c.trigger)).toEqual([
      "initial",
      "retry",
    ]);
    expect(result.usage.calls[0].totalTokens).toBeNull();
  });
  it("marks timeout/error usage unavailable instead of claiming zero", async () => {
    config.aiProvider = "groq";
    mocks.groq.mockRejectedValue(new Error("Provider timeout"));
    const result = await run(() => generateJSON("JSON only", "Check"));
    expect(result.usage).toMatchObject({
      status: "unavailable",
      requestCount: 1,
      totalTokens: null,
      pendingRequests: 0,
    });
  });
  it("marks a successful response without usage as unavailable", async () => {
    mocks.groq.mockResolvedValue({
      choices: [{ message: { content: '{"ready":true}' } }],
    });
    const result = await run(() => generateJSON("JSON only", "Check"));
    expect(result).toMatchObject({
      status: "completed",
      usage: { status: "unavailable", totalTokens: null },
    });
  });
  it("measures image document reading separately from the comparison call", async () => {
    mocks.groq.mockResolvedValueOnce(
      groqReply(400, 50, "Extracted sample credential text"),
    );
    const result = await run(async () => {
      const doc = await readDocument(
        Buffer.from("synthetic image"),
        "image/png",
      );
      return generateJSON("Compare", doc.text, {
        purpose: "Compare credential with profile",
        usageDetails: { documentCount: 1 },
      });
    });
    expect(result.usage).toMatchObject({ totalTokens: 575, requestCount: 2 });
    expect(result.usage.calls[0].purpose).toBe(
      "Read text from an uploaded document image",
    );
    expect(result.usage.calls[1].purpose).toBe(
      "Compare credential with profile",
    );
  });
  it("distinguishes new non-AI work from historical unrecorded runs", async () => {
    const queued = await store.createAgentRun({
      userId: user.id,
      agentKey: "credibility",
    });
    expect(queued.usage).toBeNull();
    const result = await executeTrackedRun(store, queued, async () => ({
      summary: "Calculated score",
    }));
    expect(result.usage).toMatchObject({
      status: "not_used",
      requestCount: 0,
      totalTokens: 0,
    });
    expect(mocks.groq).not.toHaveBeenCalled();
  });
});

describe("Concurrent and interrupted agent usage", () => {
  it("isolates simultaneous runs and retains all parallel call counts", async () => {
    const other = await store.createUserProfile({
      fullName: "Other",
      email: "other@example.test",
      passwordHash: "unused",
      requestedRoles: ["investor"],
    });
    mocks.groq.mockImplementation(async (body) => {
      const first = body.messages[1].content === "first";
      await new Promise((resolve) => setTimeout(resolve, first ? 15 : 1));
      return groqReply(first ? 10 : 30, 5);
    });
    const [a, b] = await Promise.all([
      run(() =>
        Promise.all([
          generateJSON("JSON", "first"),
          generateJSON("JSON", "first"),
        ]),
      ),
      run(() => generateJSON("JSON", "other"), other),
    ]);
    expect(a.usage).toMatchObject({ requestCount: 2, totalTokens: 30 });
    expect(b.usage).toMatchObject({ requestCount: 1, totalTokens: 35 });
    expect((await store.getAgentRun(a.id)).usage.calls).toHaveLength(2);
  });
  it("waits for a sibling request after a parallel call fails, preserving its usage", async () => {
    config.aiProvider = "groq";
    mocks.groq.mockImplementation(async (body) => {
      if (body.messages[1].content === "fail")
        throw new Error("Provider failed");
      await new Promise((resolve) => setTimeout(resolve, 20));
      return groqReply(55, 10);
    });
    const result = await run(() =>
      Promise.all([
        generateJSON("JSON", "fail"),
        generateJSON("JSON", "finish"),
      ]),
    );
    expect(result).toMatchObject({
      status: "failed",
      usage: {
        requestCount: 2,
        totalTokens: 65,
        status: "partial",
        pendingRequests: 0,
      },
    });
  });
  it("persists in-flight markers and preserves usage when stale work is interrupted", async () => {
    let finish;
    mocks.groq.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const queued = await store.createAgentRun({
      userId: user.id,
      agentKey: "profile-quality",
    });
    const execution = executeTrackedRun(store, queued, () =>
      generateJSON("JSON", "Check"),
    );
    await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
    expect((await store.getAgentRun(queued.id)).usage.pendingRequests).toBe(1);
    const list = store.listAgentRuns.bind(store);
    vi.spyOn(store, "listAgentRuns").mockImplementation(async (filters) =>
      (await list(filters)).map((r) => ({
        ...r,
        updatedAt: "2000-01-01T00:00:00Z",
      })),
    );
    await expireStaleRuns(store);
    expect(await store.getAgentRun(queued.id)).toMatchObject({
      status: "failed",
      usage: { status: "unavailable", pendingRequests: 1 },
    });
    finish(groqReply());
    await execution;
    expect((await store.getAgentRun(queued.id)).status).toBe("failed");
  });
  it("does not send provider requests if recording usage fails before dispatch", async () => {
    const update = store.updateAgentRun.bind(store);
    vi.spyOn(store, "updateAgentRun").mockImplementation((id, patch, status) =>
      patch.usage && !patch.status
        ? Promise.reject(new Error("Storage unavailable"))
        : update(id, patch, status),
    );
    const result = await run(() => generateJSON("JSON", "Check"));
    expect(result.status).toBe("failed");
    expect(result.usage).toMatchObject({ status: "not_used", totalTokens: 0 });
    expect(mocks.groq).not.toHaveBeenCalled();
    expect(mocks.anthropic).not.toHaveBeenCalled();
  });
  it("returns saved usage to the owner and authorized admin, not another user", async () => {
    const saved = await run(() =>
      generateJSON("JSON", "Private profile", { purpose: "Profile review" }),
    );
    const other = await store.createUserProfile({
      fullName: "Other",
      email: "other@example.test",
      passwordHash: "unused",
      requestedRoles: ["investor"],
    });
    await store.updateApproval(other.id, {
      status: "approved",
      approvedRoles: ["investor"],
    });
    const admin = await store.ensureAdminAccount({
      fullName: "Admin",
      email: "admin@example.test",
      passwordHash: "unused",
    });
    const app = createApp(store, { backgroundJobs: false });
    const auth = (u) => ({ Cookie: `mm_token=${createToken(u)}` });
    const own = await request(app)
      .get("/api/agents/runs")
      .set(auth(user))
      .expect(200);
    expect(own.body.runs[0].id).toBe(saved.id);
    expect(own.body.runs[0].usage.totalTokens).toBe(125);
    expect(
      (await request(app).get("/api/agents/runs").set(auth(other))).body.runs,
    ).toHaveLength(0);
    expect(
      (await request(app).get("/api/agents/runs").set(auth(admin))).body.runs[0]
        .usage.totalTokens,
    ).toBe(125);
  });
});
