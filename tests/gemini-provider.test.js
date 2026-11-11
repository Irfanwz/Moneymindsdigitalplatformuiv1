import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ groq: vi.fn(), anthropic: vi.fn() }));
vi.mock("groq-sdk", () => ({
  default: class { chat = { completions: { create: mocks.groq } }; },
}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create: mocks.anthropic }; },
}));

import { config } from "../server/config.js";
import { setAiConfigClient } from "../server/services/aiConfigStore.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { requestGemini } from "../server/services/geminiProvider.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { createUsageTracker } from "../server/services/aiUsage.js";
import { executeTrackedRun, safeAgentError } from "../server/services/agentRuntime.js";
import { createMemoryStore } from "../server/store/memoryStore.js";

const original = { ...config };
const fixtureKey = "AIza-fixture-gemini-secret-never-log";
const privateText = "PRIVATE PROFILE AND DOCUMENT CONTENT";
const settings = () => ({ geminiApiKey: fixtureKey, geminiModel: "gemini-fixture" });
const input = { system: "JSON only", parts: [{ text: privateText }], json: true };
const errorInfo = (reason) => ({
  "@type": "type.googleapis.com/google.rpc.ErrorInfo",
  reason,
  domain: "googleapis.com",
  metadata: { key: fixtureKey, resource: privateText },
});
const retryInfo = (retryDelay) => ({
  "@type": "type.googleapis.com/google.rpc.RetryInfo",
  retryDelay,
});
const providerError = (status, message = privateText, details = []) => ({
  error: { status, message, details },
});
const reply = () => ({
  candidates: [{ finishReason: "STOP", content: { parts: [{ text: '{"ok":true}' }] } }],
  usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 4, totalTokenCount: 14 },
});
function rejectRequest(status, body, headers = {}) {
  fetch.mockResolvedValueOnce(new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    { status, headers },
  ));
}
async function captureError(work) {
  try { await work(); }
  catch (error) { expect(error).toBeInstanceOf(Error); return error; }
  throw new Error("Expected the provider request to reject.");
}

beforeEach(() => {
  vi.resetAllMocks();
  setAiConfigClient(null);
  Object.assign(config, {
    aiProvider: "gemini",
    geminiApiKey: fixtureKey,
    geminiModel: "gemini-fixture",
    groqApiKey: "",
    groqApiKeys: [],
    anthropicApiKey: "",
  });
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected mocked request")));
});
afterEach(() => {
  Object.assign(config, original);
  setAiConfigClient(null);
  vi.unstubAllGlobals();
});

describe("Gemini request compatibility", () => {
  it.each(["gemini-fixture", "models/gemini-fixture", "  models/gemini-fixture  "])(
    "normalizes model %j and sends credentials only in headers",
    async (geminiModel) => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify(reply())));
      await expect(requestGemini({ ...settings(), geminiModel }, input)).resolves.toBe('{"ok":true}');
      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-fixture:generateContent");
      expect(url).not.toContain(fixtureKey);
      expect(options.headers["x-goog-api-key"]).toBe(fixtureKey);
      expect(JSON.parse(options.body)).toMatchObject({
        systemInstruction: { parts: [{ text: "JSON only" }] },
        contents: [{ role: "user", parts: input.parts }],
        generationConfig: { responseMimeType: "application/json" },
      });
    },
  );
});

describe("Safe Gemini diagnostics", () => {
  it.each([
    [400, "API_KEY_INVALID", "API_KEY_INVALID"],
    [403, "API_KEY_SERVICE_BLOCKED", "API_KEY_RESTRICTED"],
    [403, "API_KEY_LEAKED", "API_KEY_LEAKED"],
    [403, "SERVICE_DISABLED", "SERVICE_DISABLED"],
  ])("classifies HTTP %i ErrorInfo %s without copying its metadata", async (status, reason, code) => {
    rejectRequest(status, providerError("INVALID_ARGUMENT", `${fixtureKey}: ${privateText}`, [errorInfo(reason)]));
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error).toMatchObject({ status, code: `GEMINI_${code}` });
    expect(error.message).toMatch(/Gemini/);
    expect(safeAgentError(error)).toBe(error.message);
    const exposed = JSON.stringify({ message: error.message, error });
    expect(exposed).not.toContain(fixtureKey);
    expect(exposed).not.toContain(privateText);
  });

  it.each([
    [400, "FAILED_PRECONDITION", "Gemini API free tier is not available in your country. Please enable billing on your project in Google AI Studio.", "BILLING_REQUIRED"],
    [400, "FAILED_PRECONDITION", "User location is not supported for the API use.", "LOCATION_UNSUPPORTED"],
    [404, "NOT_FOUND", "models/gemini-fixture is not found for API version v1beta, or is not supported for generateContent.", "MODEL_NOT_FOUND"],
    [400, "INVALID_ARGUMENT", "JSON mode is not enabled for this model.", "JSON_UNSUPPORTED"],
    [400, "INVALID_ARGUMENT", "Requested maxOutputTokens exceeds the model output token limit.", "OUTPUT_LIMIT"],
    [400, "INVALID_ARGUMENT", privateText, "INVALID_ARGUMENT"],
    [400, "FAILED_PRECONDITION", privateText, "FAILED_PRECONDITION"],
    [401, "UNAUTHENTICATED", privateText, "API_KEY_INVALID"],
    [403, "PERMISSION_DENIED", privateText, "PERMISSION_DENIED"],
    [429, "RESOURCE_EXHAUSTED", privateText, "RATE_LIMIT"],
    [503, "UNAVAILABLE", privateText, "UNAVAILABLE"],
  ])("gives a safe %s/%s diagnostic (%s)", async (status, canonicalStatus, message, reason) => {
    rejectRequest(status, providerError(canonicalStatus, `${message} ${fixtureKey}`, []));
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error).toMatchObject({ status, code: `GEMINI_${reason}` });
    expect(safeAgentError(error)).toBe(error.message);
    expect(error.message).not.toContain(fixtureKey);
    expect(error.message).not.toContain(privateText);
  });

  it.each([
    `<html>${fixtureKey}: ${privateText}</html>`,
    `{ "error": "${fixtureKey} ${privateText}"`,
    { error: { status: `${fixtureKey} ${privateText}`, message: privateText, details: [errorInfo(`UNRECOGNIZED_${fixtureKey}`)] } },
    { unexpected: { message: privateText, key: fixtureKey } },
  ])("handles malformed or unknown errors without revealing their contents %#", async (body) => {
    rejectRequest(400, body);
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error.status).toBe(400);
    expect(error.message).toMatch(/Gemini/);
    const exposed = JSON.stringify({ message: error.message, persisted: safeAgentError(error), error });
    expect(exposed).not.toContain(fixtureKey);
    expect(exposed).not.toContain(privateText);
    expect(exposed).not.toContain("UNRECOGNIZED");
  });

  it("does not treat an arbitrary details object as Google ErrorInfo", async () => {
    rejectRequest(400, providerError("INVALID_ARGUMENT", privateText, [
      { "@type": "type.example.test/untrusted", reason: "API_KEY_INVALID" },
    ]));
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error.code).toBe("GEMINI_INVALID_ARGUMENT");
  });
});

describe("Gemini retry timing", () => {
  it("uses Retry-After headers before a structured retry delay", async () => {
    rejectRequest(429, providerError("RESOURCE_EXHAUSTED", privateText, [retryInfo("2.5s")]), { "retry-after": "12" });
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error.headers.get("retry-after")).toBe("12");
  });

  it("uses structured retry timing when a Retry-After header is invalid", async () => {
    rejectRequest(429, providerError("RESOURCE_EXHAUSTED", privateText, [retryInfo("2.5s")]), { "retry-after": "invalid" });
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error.headers.get("retry-after")).toBe("3");
  });

  it("ignores retry delays from unknown detail types", async () => {
    rejectRequest(429, providerError("RESOURCE_EXHAUSTED", privateText, [
      { "@type": "type.example.test/untrusted", retryDelay: "2s" },
    ]));
    const error = await captureError(() => requestGemini(settings(), input));
    expect(error.headers.get("retry-after")).toBe("30");
  });

  it.each([["0s", "1"], ["2.5s", "3"], ["0.1s", "1"], ["86400s", "86400"]])(
    "preserves structured retry delay %s as %s seconds", async (delay, expected) => {
      rejectRequest(429, providerError("RESOURCE_EXHAUSTED", privateText, [retryInfo(delay)]));
      const error = await captureError(() => requestGemini(settings(), input));
      expect(error.headers.get("retry-after")).toBe(expected);
    },
  );

  it.each([undefined, "", "-2s", "tomorrow", "Infinitys", {}, null])(
    "uses a safe default for missing or invalid retry delay %j", async (delay) => {
      rejectRequest(429, providerError("RESOURCE_EXHAUSTED", privateText, [retryInfo(delay)]));
      const error = await captureError(() => requestGemini(settings(), input));
      expect(error.headers.get("retry-after")).toBe("30");
    },
  );
});

describe("Gemini error integration and usage", () => {
  it("does not retry a rejected Gemini-only request and leaves unreported usage unknown", async () => {
    rejectRequest(400, providerError("INVALID_ARGUMENT", "Request contains an invalid argument."));
    const tracker = createUsageTracker(async () => {});
    const onRetry = vi.fn();
    const error = await captureError(() => tracker.run(() => generateJSON("JSON only", privateText, { onRetry })));
    expect(error.code).toBe("GEMINI_INVALID_ARGUMENT");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(mocks.groq).not.toHaveBeenCalled();
    expect(mocks.anthropic).not.toHaveBeenCalled();
    expect(tracker.snapshot()).toMatchObject({
      requestCount: 1, reportedRequests: 0, unreportedRequests: 1,
      inputTokens: null, outputTokens: null, totalTokens: null,
      calls: [{ provider: "gemini", status: "failed", trigger: "initial", totalTokens: null }],
    });
  });

  it("continues Auto fallback after Gemini rejection and retains both usage records", async () => {
    Object.assign(config, { aiProvider: "auto", anthropicApiKey: "fixture-anthropic" });
    rejectRequest(400, providerError("INVALID_ARGUMENT", privateText, [errorInfo("API_KEY_INVALID")]));
    mocks.anthropic.mockResolvedValue({ content: [{ type: "text", text: '{"ok":true}' }], usage: { input_tokens: 6, output_tokens: 4 } });
    const tracker = createUsageTracker(async () => {});
    await expect(tracker.run(() => generateJSON("JSON only", privateText))).resolves.toEqual({ data: { ok: true }, provider: "anthropic" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.anthropic).toHaveBeenCalledTimes(1);
    expect(tracker.snapshot()).toMatchObject({
      requestCount: 2, reportedRequests: 1, unreportedRequests: 1, totalTokens: 10,
      calls: [
        { provider: "gemini", status: "failed", trigger: "initial", totalTokens: null },
        { provider: "anthropic", status: "response_received", trigger: "fallback", totalTokens: 10 },
      ],
    });
    expect(JSON.stringify(tracker.snapshot())).not.toContain(privateText);
    expect(JSON.stringify(tracker.snapshot())).not.toContain(fixtureKey);
  });

  it("persists the safe Gemini diagnostic without retaining raw provider content", async () => {
    const store = createMemoryStore();
    const user = await store.createUserProfile({ fullName: "Gemini Fixture", email: "gemini@example.test", passwordHash: "unused", requestedRoles: ["investor"] });
    const entry = await store.createAgentRun({ userId: user.id, agentKey: "profile-quality", targetId: user.id });
    rejectRequest(403, providerError("PERMISSION_DENIED", `${fixtureKey} ${privateText}`, [errorInfo("SERVICE_DISABLED")]));
    const result = await executeTrackedRun(store, entry, () => generateJSON("JSON only", privateText));
    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/Gemini/);
    expect(result.error).toMatch(/enabled|disabled|enable/i);
    expect(result.usage).toMatchObject({ requestCount: 1, unreportedRequests: 1, totalTokens: null });
    const persisted = await store.getAgentRun(entry.id);
    expect(persisted.error).toBe(result.error);
    expect(JSON.stringify(persisted)).not.toContain(fixtureKey);
    expect(JSON.stringify(persisted)).not.toContain(privateText);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("Native timeout errors with numeric codes", () => {
  const timeoutMessage = "The AI provider did not respond before the request timed out. Please retry shortly.";
  function failWithTimeout(phase) {
    const error = new DOMException(`${privateText} ${fixtureKey}`, "TimeoutError");
    expect(error.code).toBe(23);
    if (phase === "fetch") fetch.mockRejectedValueOnce(error);
    else {
      const body = new ReadableStream({ start(controller) { controller.error(error); } });
      fetch.mockResolvedValueOnce(new Response(body, { status: 200 }));
    }
    return error;
  }

  it.each(["fetch", "body"])("preserves a Gemini-only %s timeout and renders a safe explanation", async (phase) => {
    const timeout = failWithTimeout(phase);
    const tracker = createUsageTracker(async () => {});
    const onRetry = vi.fn();
    const error = await captureError(() => tracker.run(() => generateJSON("JSON only", privateText, { onRetry })));
    expect(error).toBe(timeout);
    expect(safeAgentError(error)).toBe(timeoutMessage);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(mocks.anthropic).not.toHaveBeenCalled();
    expect(tracker.snapshot()).toMatchObject({
      requestCount: 1, reportedRequests: 0, unreportedRequests: 1, totalTokens: null,
      calls: [{ provider: "gemini", status: "failed", trigger: "initial", inputTokens: null, outputTokens: null, totalTokens: null }],
    });
    expect(JSON.stringify(tracker.snapshot())).not.toContain(privateText);
    expect(JSON.stringify(tracker.snapshot())).not.toContain(fixtureKey);
  });

  it.each(["fetch", "body"])("falls back exactly once after a Gemini %s timeout with accurate usage", async (phase) => {
    Object.assign(config, { aiProvider: "auto", anthropicApiKey: "fixture-anthropic" });
    failWithTimeout(phase);
    mocks.anthropic.mockResolvedValue({ content: [{ type: "text", text: '{"ok":true}' }], usage: { input_tokens: 6, output_tokens: 4 } });
    const tracker = createUsageTracker(async () => {});
    const onRetry = vi.fn();
    await expect(tracker.run(() => generateJSON("JSON only", privateText, { onRetry }))).resolves.toEqual({ data: { ok: true }, provider: "anthropic" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.anthropic).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(tracker.snapshot()).toMatchObject({
      requestCount: 2, reportedRequests: 1, unreportedRequests: 1, totalTokens: 10,
      calls: [
        { provider: "gemini", status: "failed", trigger: "initial", totalTokens: null },
        { provider: "anthropic", status: "response_received", trigger: "fallback", totalTokens: 10 },
      ],
    });
  });

  it.each(["fetch", "body"])("keeps image-provider fallback working after a Gemini %s timeout", async (phase) => {
    Object.assign(config, { aiProvider: "auto", anthropicApiKey: "fixture-anthropic" });
    failWithTimeout(phase);
    mocks.anthropic.mockResolvedValue({ content: [{ type: "text", text: "Fallback document text" }], usage: { input_tokens: 6, output_tokens: 4 } });
    const tracker = createUsageTracker(async () => {});
    await expect(tracker.run(() => readDocument(Buffer.from("fixture image"), "image/png"))).resolves.toEqual({ text: "Fallback document text", method: "claude-vision" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.anthropic).toHaveBeenCalledTimes(1);
    expect(tracker.snapshot().calls).toMatchObject([
      { provider: "gemini", status: "failed", trigger: "initial", totalTokens: null },
      { provider: "anthropic", status: "response_received", trigger: "fallback", totalTokens: 10 },
    ]);
  });

  it("stores a safe timeout diagnostic in the failed agent run", async () => {
    const store = createMemoryStore();
    const user = await store.createUserProfile({ fullName: "Timeout Fixture", email: "timeout@example.test", passwordHash: "unused", requestedRoles: ["investor"] });
    const entry = await store.createAgentRun({ userId: user.id, agentKey: "profile-quality", targetId: user.id });
    failWithTimeout("fetch");
    const result = await executeTrackedRun(store, entry, () => generateJSON("JSON only", privateText));
    expect(result).toMatchObject({ status: "failed", error: timeoutMessage });
    expect(result.usage).toMatchObject({ requestCount: 1, unreportedRequests: 1, totalTokens: null });
    expect(JSON.stringify(await store.getAgentRun(entry.id))).not.toContain(privateText);
    expect(JSON.stringify(await store.getAgentRun(entry.id))).not.toContain(fixtureKey);
  });

  it.each(["AI_TOKEN_LIMIT", "AI_USAGE_SAVE_FAILED"])("preserves fail-closed %s errors for JSON and document calls", async (code) => {
    Object.assign(config, { aiProvider: "auto", anthropicApiKey: "fixture-anthropic" });
    const error = Object.assign(new Error("Application guard blocked the request"), { code, status: 429 });
    const onRetry = vi.fn();
    fetch.mockRejectedValueOnce(error);
    await expect(generateJSON("JSON only", privateText, { onRetry })).rejects.toBe(error);
    fetch.mockRejectedValueOnce(error);
    await expect(readDocument(Buffer.from("fixture image"), "image/png")).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(onRetry).not.toHaveBeenCalled();
    expect(mocks.anthropic).not.toHaveBeenCalled();
  });
});
