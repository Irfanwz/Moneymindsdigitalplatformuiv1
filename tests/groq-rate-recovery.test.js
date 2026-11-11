import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ anthropic: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create: mocks.anthropic }; },
}));

// Keep the real Groq SDK: response headers and .withResponse() must work through
// its HTTP adapter without creating a second API request to obtain the headers.
import { config } from "../server/config.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { setAiConfigClient } from "../server/services/aiConfigStore.js";
import { createUsageTracker } from "../server/services/aiUsage.js";

const original = { ...config };
const recovery = { maxRetries: 3, maxWaitMs: 180_000 };
let serial = 0;
let fetchMock;

function quotaHeaders(headers) {
  return {
    ...(headers["x-ratelimit-remaining-tokens"] !== undefined ? { "x-ratelimit-limit-tokens": "8000" } : {}),
    ...(headers["x-ratelimit-remaining-requests"] !== undefined ? { "x-ratelimit-limit-requests": "1000" } : {}),
    ...headers,
  };
}

function response(headers = {}, content = '{"ok":true}') {
  return new Response(JSON.stringify({
    id: "fixture-completion",
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
    usage: { prompt_tokens: 24, completion_tokens: 11, total_tokens: 35 },
  }), { status: 200, headers: { "content-type": "application/json", ...quotaHeaders(headers) } });
}

function limited(seconds, headers = {}) {
  return new Response(JSON.stringify({
    error: { message: "Fixture rate limit reached", type: "tokens", code: "rate_limit_exceeded" },
  }), { status: 429, headers: {
    "content-type": "application/json", "retry-after": String(seconds), ...quotaHeaders(headers),
  } });
}

function wireCalls() {
  return fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url),
    key: new Headers(init.headers).get("authorization")?.replace(/^Bearer /, ""),
    body: JSON.parse(init.body),
  }));
}

function assess(prompt, options = {}) {
  return generateJSON("Return the fixture as JSON.", prompt, {
    maxCompletionTokens: 2500, rateLimitRetry: recovery, ...options,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-11T12:00:00Z"));
  vi.resetAllMocks();
  setAiConfigClient(null);
  Object.assign(config, {
    aiProvider: "groq",
    groqApiKey: "",
    groqApiKeys: [1, 2, 3].map(slot => `fixture-rate-recovery-${++serial}-${slot}`),
    groqModel: "openai/gpt-oss-20b",
    geminiApiKey: "",
    anthropicApiKey: "fixture-anthropic",
  });
  mocks.anthropic.mockResolvedValue({
    content: [{ type: "text", text: '{"ok":true}' }],
    usage: { input_tokens: 8, output_tokens: 4 },
  });
  fetchMock = vi.fn(async () => response());
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GROQ_BASE_URL", "https://api.groq.com");
});

afterEach(() => {
  Object.assign(config, original);
  setAiConfigClient(null);
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("reads real SDK response headers with exactly one HTTP request and complete usage", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "6000",
    "x-ratelimit-reset-tokens": "2s",
  }));
  const tracker = createUsageTracker(async () => {});
  expect(await tracker.run(() => assess("First evidence batch"))).toEqual({ data: { ok: true }, provider: "groq" });
  await tracker.settle();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(wireCalls()[0]).toMatchObject({
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: config.groqApiKeys[0],
    body: { model: config.groqModel, max_completion_tokens: 2500 },
  });
  expect(tracker.snapshot()).toMatchObject({ requestCount: 1, status: "complete", totalTokens: 35 });
});

it("waits for a shared token reset before another key sends the next batch, without counting the wait as usage", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "100",
    "x-ratelimit-reset-tokens": "2s",
  }));
  const tracker = createUsageTracker(async () => {});
  await tracker.run(() => assess("Completed batch A"));
  const onRetry = vi.fn();
  const work = tracker.run(() => assess("Pending batch B", { onRetry }));
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(onRetry).toHaveBeenCalledTimes(1);
  const delay = onRetry.mock.calls[0][0];
  expect(delay).toBeGreaterThanOrEqual(2);
  expect(delay).toBeLessThanOrEqual(3);
  expect(tracker.snapshot()).toMatchObject({ requestCount: 1, pendingRequests: 0, totalTokens: 35 });
  await vi.advanceTimersByTimeAsync(delay * 1000 - 1);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(await work).toEqual({ data: { ok: true }, provider: "groq" });
  await tracker.settle();
  expect(wireCalls().map(call => call.key)).toEqual(config.groqApiKeys.slice(0, 2));
  expect(tracker.snapshot()).toMatchObject({ requestCount: 2, status: "complete", totalTokens: 70 });
});

it("recovers after two all-key 429 rounds by retrying only the current batch", async () => {
  let pendingAttempts = 0;
  fetchMock.mockImplementation(async (_url, init) => {
    const prompt = JSON.parse(init.body).messages[1].content;
    if (prompt === "Pending batch B" && ++pendingAttempts <= 6) return limited(2);
    return response();
  });
  const tracker = createUsageTracker(async () => {});
  await tracker.run(() => assess("Completed batch A"));
  const onRetry = vi.fn();
  const work = tracker.run(() => assess("Pending batch B", { onRetry }))
    .then(value => ({ value }), error => ({ error }));
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(4);
  expect(onRetry.mock.calls).toEqual([[2]]);
  await vi.advanceTimersByTimeAsync(2000);
  expect(fetchMock).toHaveBeenCalledTimes(7);
  expect(onRetry.mock.calls).toEqual([[2], [2]]);
  await vi.advanceTimersByTimeAsync(2000);
  expect(await work).toEqual({ value: { data: { ok: true }, provider: "groq" } });
  await tracker.settle();
  const calls = wireCalls();
  expect(calls.filter(call => call.body.messages[1].content === "Completed batch A")).toHaveLength(1);
  expect(calls.filter(call => call.body.messages[1].content === "Pending batch B")).toHaveLength(7);
  expect(calls.slice(1, 4).map(call => call.key)).toEqual([
    config.groqApiKeys[1], config.groqApiKeys[2], config.groqApiKeys[0],
  ]);
  expect(calls.slice(4, 7).map(call => call.key)).toEqual(calls.slice(1, 4).map(call => call.key));
  expect(tracker.snapshot()).toMatchObject({
    requestCount: 8, reportedRequests: 2, unreportedRequests: 6, totalTokens: 70, status: "partial",
  });
});

it("still tries each saved key once on 429 even when the first key reports exhausted shared quota", async () => {
  fetchMock.mockResolvedValueOnce(limited(5, {
    "x-ratelimit-remaining-tokens": "0", "x-ratelimit-reset-tokens": "5s",
  }));
  fetchMock.mockResolvedValueOnce(limited(5, {
    "x-ratelimit-remaining-tokens": "0", "x-ratelimit-reset-tokens": "5s",
  }));
  const onRetry = vi.fn();
  expect(await assess("Try ready saved keys", { onRetry })).toMatchObject({ provider: "groq" });
  expect(wireCalls().map(call => call.key)).toEqual(config.groqApiKeys);
  expect(onRetry).not.toHaveBeenCalled();
});

it("does not wait hours for a daily quota reset and falls back in Auto mode", async () => {
  config.aiProvider = "auto";
  fetchMock.mockImplementation(async () => limited(86400, {
    "x-ratelimit-remaining-requests": "0", "x-ratelimit-reset-requests": "24h",
  }));
  const onRetry = vi.fn();
  const started = Date.now();
  expect(await assess("Daily quota fixture", { onRetry })).toMatchObject({ provider: "anthropic" });
  expect(wireCalls().map(call => call.key)).toEqual(config.groqApiKeys);
  expect(mocks.anthropic).toHaveBeenCalledTimes(1);
  expect(onRetry).not.toHaveBeenCalled();
  expect(Date.now()).toBe(started);
});

it("returns a daily quota error promptly when the selected provider has no fallback", async () => {
  fetchMock.mockImplementation(async () => limited(86400, {
    "x-ratelimit-remaining-requests": "0", "x-ratelimit-reset-requests": "24h",
  }));
  const onRetry = vi.fn();
  await expect(assess("Daily quota fixture", { onRetry })).rejects.toMatchObject({ status: 429 });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(mocks.anthropic).not.toHaveBeenCalled();
  expect(onRetry).not.toHaveBeenCalled();
});

it("keeps token pacing separate for different models in the same saved key pool", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "0", "x-ratelimit-reset-tokens": "10s",
  }));
  await assess("Model A first batch");
  config.groqModel = "openai/gpt-oss-120b";
  const onRetry = vi.fn();
  const otherModel = assess("Model B first batch", { onRetry });
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(await otherModel).toMatchObject({ provider: "groq" });
  expect(onRetry).not.toHaveBeenCalled();
  config.groqModel = "openai/gpt-oss-20b";
  const originalModel = assess("Model A next batch", { onRetry });
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(onRetry).toHaveBeenCalledTimes(1);
  const delay = onRetry.mock.calls[0][0];
  expect(delay).toBeGreaterThanOrEqual(10);
  expect(delay).toBeLessThanOrEqual(11);
  await vi.advanceTimersByTimeAsync(delay * 1000);
  expect(await originalModel).toMatchObject({ provider: "groq" });
  expect(wireCalls().map(call => call.body.model)).toEqual([
    "openai/gpt-oss-20b", "openai/gpt-oss-120b", "openai/gpt-oss-20b",
  ]);
});

it("preserves even sequential rotation across all three saved keys through the real SDK", async () => {
  for (let index = 0; index < 6; index++) await assess(`Independent batch ${index}`);
  expect(wireCalls().map(call => call.key)).toEqual([...config.groqApiKeys, ...config.groqApiKeys]);
  expect(fetchMock).toHaveBeenCalledTimes(6);
});

it("reserves learned tokens before concurrent callers can spend the same remaining allowance", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "3000", "x-ratelimit-reset-tokens": "2s",
  }));
  const tracker = createUsageTracker(async () => {});
  await tracker.run(() => assess("Learn the available quota"));
  let completeInFlight;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { completeInFlight = resolve; }));
  const first = tracker.run(() => assess("First concurrent batch"));
  const onRetry = vi.fn();
  const second = tracker.run(() => assess("Second concurrent batch", { onRetry }));
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(tracker.snapshot()).toMatchObject({ requestCount: 2, pendingRequests: 1 });
  expect(onRetry).toHaveBeenCalledTimes(1);
  completeInFlight(response({
    "x-ratelimit-remaining-tokens": "100", "x-ratelimit-reset-tokens": "2s",
  }));
  await first;
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(onRetry.mock.calls[0][0] * 1000);
  expect(await second).toMatchObject({ provider: "groq" });
  await tracker.settle();
  expect(wireCalls().map(call => call.key)).toEqual(config.groqApiKeys);
  expect(tracker.snapshot()).toMatchObject({ requestCount: 3, status: "complete", totalTokens: 105 });
});

it("releases quota when usage persistence stops a request before any HTTP call", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "3000", "x-ratelimit-reset-tokens": "2s",
  }));
  await assess("Learn the available quota");
  const tracker = createUsageTracker(async () => { throw new Error("Fixture storage unavailable"); });
  await expect(tracker.run(() => assess("Unsent batch"))).rejects.toMatchObject({ code: "AI_USAGE_SAVE_FAILED" });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(tracker.snapshot()).toMatchObject({ requestCount: 0, status: "not_used" });
  const onRetry = vi.fn();
  const next = assess("Allowed batch after storage recovers", { onRetry });
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(onRetry).not.toHaveBeenCalled();
  expect(await next).toMatchObject({ provider: "groq" });
  expect(wireCalls().map(call => call.body.messages[1].content)).toEqual([
    "Learn the available quota", "Allowed batch after storage recovers",
  ]);
});

it("retains consumed quota when the HTTP response arrives before its usage write fails", async () => {
  fetchMock.mockResolvedValueOnce(response({
    "x-ratelimit-remaining-tokens": "3000", "x-ratelimit-reset-tokens": "2s",
  }));
  await assess("Learn the available quota");
  let writes = 0;
  const tracker = createUsageTracker(async () => {
    if (++writes === 2) throw new Error("Fixture response usage could not be stored");
  });
  await expect(tracker.run(() => assess("Sent batch"))).rejects.toMatchObject({ code: "AI_USAGE_SAVE_FAILED" });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(tracker.snapshot()).toMatchObject({ requestCount: 1, reportedRequests: 1, totalTokens: 35 });
  const onRetry = vi.fn();
  const next = assess("Wait after the sent batch", { onRetry });
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(onRetry).toHaveBeenCalledTimes(1);
  const delay = onRetry.mock.calls[0][0];
  expect(delay).toBeGreaterThanOrEqual(2);
  expect(delay).toBeLessThanOrEqual(3);
  await vi.advanceTimersByTimeAsync(delay * 1000);
  expect(await next).toMatchObject({ provider: "groq" });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
