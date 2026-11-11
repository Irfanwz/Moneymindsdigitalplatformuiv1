import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createGroqQuotaState, finishGroqQuota, reserveGroqQuota } from "../server/services/groqQuota.js";
import { CHAT_TOKEN_RESERVE, countTextTokens } from "../server/services/aiTokenEstimate.js";

const fixture = (overrides = {}) => ({
  model: "fixture-text-model",
  messages: [{ role: "user", content: "1234567890" }],
  max_completion_tokens: 40,
  ...overrides,
});
const headers = (kind, { limit = 1000, remaining = 450, reset = "10s" } = {}) => ({
  [`x-ratelimit-limit-${kind}`]: String(limit),
  [`x-ratelimit-remaining-${kind}`]: String(remaining),
  [`x-ratelimit-reset-${kind}`]: reset,
});
const learn = (state, values, payload = fixture()) => finishGroqQuota(reserveGroqQuota(state, payload), values);
const rejection = (work) => {
  try { work(); } catch (error) { return error; }
  throw new Error("Expected quota reservation to wait.");
};
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T00:00:00Z")); });
afterEach(() => { vi.useRealTimers(); });

it("does not throttle an unknown quota or retain prompt text in state", () => {
  const state = createGroqQuotaState();
  const secretText = "private-fixture-input";
  const reservations = Array.from({ length: 6 }, () => reserveGroqQuota(state, fixture({ messages: [{ role: "user", content: secretText }] })));
  reservations.forEach(value => finishGroqQuota(value));
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(JSON.stringify([...state.models.values()])).not.toContain(secretText);
});

it("reserves input plus completion allowance synchronously before another request", () => {
  const state = createGroqQuotaState();
  learn(state, new Headers(headers("tokens")));
  reserveGroqQuota(state, fixture()); // 150 chat reserve + 10 input + 40 output.
  reserveGroqQuota(state, fixture());
  const error = rejection(() => reserveGroqQuota(state, fixture()));
  expect(error).toMatchObject({ status: 429, code: "GROQ_QUOTA_WAIT" });
  expect(error.headers.get("retry-after")).toBe("11");
  expect(state.models.get("fixture-text-model").pending.size).toBe(2);
});

it("learns quota while subtracting other calls already in flight", () => {
  const state = createGroqQuotaState();
  const first = reserveGroqQuota(state, fixture());
  const second = reserveGroqQuota(state, fixture());
  finishGroqQuota(first, headers("tokens", { remaining: 300 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  // A later, higher header cannot refund the prior conservative reservation.
  finishGroqQuota(second, headers("tokens", { remaining: 900 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("does not let an out-of-order response raise available quota", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 900 }));
  const first = reserveGroqQuota(state, fixture());
  const second = reserveGroqQuota(state, fixture());
  finishGroqQuota(second, headers("tokens", { remaining: 300 }));
  finishGroqQuota(first, headers("tokens", { remaining: 800 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("refills once after the provider reset and retains pending reservations", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { limit: 500, remaining: 200, reset: "1s" }));
  const pending = reserveGroqQuota(state, fixture());
  vi.advanceTimersByTime(1000);
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  vi.advanceTimersByTime(250);
  const next = reserveGroqQuota(state, fixture()); // 500 - 200 pending - 200 new.
  const waiting = rejection(() => reserveGroqQuota(state, fixture()));
  expect(waiting.headers.get("retry-after")).toBe("5");
  expect(state.models.get("fixture-text-model").pending.size).toBe(2);
  finishGroqQuota(pending, headers("tokens", { limit: 500, remaining: 100, reset: "2s" }));
  finishGroqQuota(next);
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("uses the real GPT-OSS token estimate rather than text byte size", () => {
  const state = createGroqQuotaState();
  const payload = fixture({ model: "openai/gpt-oss-20b", messages: [{ role: "user", content: "Hello world" }] });
  const tokens = CHAT_TOKEN_RESERVE + countTextTokens("Hello world", payload.model) + 40;
  learn(state, headers("tokens", { remaining: tokens }), payload);
  expect(() => reserveGroqQuota(state, payload)).not.toThrow();
  expect(() => reserveGroqQuota(state, payload)).toThrow();
});

it("supports text parts and the max_tokens alias", () => {
  const state = createGroqQuotaState();
  const payload = fixture({ max_completion_tokens: undefined, max_tokens: 40, messages: [{ role: "user", content: [{ type: "text", text: "12345" }, { type: "text", text: "67890" }] }] });
  learn(state, headers("tokens", { remaining: 200 }), payload);
  expect(() => reserveGroqQuota(state, payload)).not.toThrow();
  expect(() => reserveGroqQuota(state, payload)).toThrow();
});

it("isolates learned quotas by model and state instance", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 0 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  expect(() => reserveGroqQuota(state, fixture({ model: "another-model" }))).not.toThrow();
  expect(() => reserveGroqQuota(createGroqQuotaState(), fixture())).not.toThrow();
});

it("keeps remaining-key failover eligible while still reserving the attempted request", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 0 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  const bypass = reserveGroqQuota(state, fixture(), { bypassWait: true });
  expect(state.models.get("fixture-text-model").pending.has(bypass)).toBe(true);
  finishGroqQuota(bypass, headers("tokens", { remaining: 900 }));
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("lets the provider handle an estimate exceeding full capacity without poisoning small requests", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { limit: 500, remaining: 200 }));
  expect(() => reserveGroqQuota(state, fixture({ max_completion_tokens: 1000 }))).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it.each([
  { messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: "data:fixture" } }] }] },
  { messages: [{ role: "assistant", content: null, tool_calls: [] }] },
  { tools: [{ type: "function" }] },
  { n: 2 },
  { max_completion_tokens: undefined },
])("skips unknown token costs but still respects daily request allowance: %j", (override) => {
  const state = createGroqQuotaState();
  learn(state, { ...headers("tokens", { remaining: 0 }), ...headers("requests", { remaining: 1 }) });
  const payload = fixture(override);
  expect(() => reserveGroqQuota(state, payload)).not.toThrow();
  expect(() => reserveGroqQuota(state, payload)).toThrow();
});

it("reports long daily resets accurately without truncating them to a minute", () => {
  const state = createGroqQuotaState();
  learn(state, headers("requests", { remaining: 0, reset: "2h" }));
  expect(rejection(() => reserveGroqQuota(state, fixture())).headers.get("retry-after")).toBe("7201");
});

it.each([
  ["7.66s", 8], ["2m59.56s", 180], ["250ms", 1], ["1h2m3s", 3724], ["1d1h", 90001], [".5s", 1], ["0s", 1],
])("parses a complete reset duration %s", (reset, seconds) => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 0, reset }));
  expect(rejection(() => reserveGroqQuota(state, fixture())).headers.get("retry-after")).toBe(String(seconds));
});

it.each(["1", "-1s", "Infinitys", "NaNs", "2m junk", "1s2m", "1s1s", "1e9s", "", "99999999999999999999999d"])("ignores a malformed reset duration %j", (reset) => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 0, reset }));
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
});

it.each([
  { "x-ratelimit-limit-tokens": undefined },
  { "x-ratelimit-limit-tokens": "-1" },
  { "x-ratelimit-limit-tokens": "0" },
  { "x-ratelimit-remaining-tokens": "-1" },
  { "x-ratelimit-remaining-tokens": "1001" },
  { "x-ratelimit-remaining-tokens": "1.5" },
  { "x-ratelimit-reset-tokens": undefined },
])("ignores incomplete or invalid quota headers: %j", (override) => {
  const state = createGroqQuotaState();
  learn(state, { ...headers("tokens", { remaining: 0 }), ...override });
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
});

it("accepts case-insensitive plain response headers and selects the longer blocked reset", () => {
  const state = createGroqQuotaState();
  const values = { ...headers("tokens", { remaining: 0, reset: "1s" }), ...headers("requests", { remaining: 0, reset: "3s" }) };
  learn(state, Object.fromEntries(Object.entries(values).map(([key, value]) => [key.toUpperCase(), value])));
  expect(rejection(() => reserveGroqQuota(state, fixture())).headers.get("retry-after")).toBe("4");
});

it("finishes idempotently and does not replace original errors with malformed-header errors", () => {
  const state = createGroqQuotaState();
  const reservation = reserveGroqQuota(state, fixture());
  expect(() => finishGroqQuota(reservation, { get() { throw new Error("bad headers"); } })).not.toThrow();
  finishGroqQuota(reservation, headers("tokens", { remaining: 0 }));
  finishGroqQuota(null);
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
});

it("refunds an unsent request's token and daily-request reservations exactly once", () => {
  const state = createGroqQuotaState();
  learn(state, { ...headers("tokens", { remaining: 200 }), ...headers("requests", { remaining: 1 }) });
  const cancelled = reserveGroqQuota(state, fixture());
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(cancelled, undefined, { sent: false });
  const actual = reserveGroqQuota(state, fixture());
  finishGroqQuota(cancelled, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(actual);
});

it("refunds against a newer header without undoing another pending reservation", () => {
  const state = createGroqQuotaState();
  learn(state, { ...headers("tokens", { remaining: 1000 }), ...headers("requests", { remaining: 5 }) });
  const first = reserveGroqQuota(state, fixture());
  const actual = reserveGroqQuota(state, fixture());
  const third = reserveGroqQuota(state, fixture());
  finishGroqQuota(actual, { ...headers("tokens", { remaining: 300 }), ...headers("requests", { remaining: 2 }) });
  finishGroqQuota(first, undefined, { sent: false });
  // 300 reported tokens minus the third request's 200-token reservation.
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(third, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("retains negative debt so cancelling one failover does not refund another", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 250 }));
  const first = reserveGroqQuota(state, fixture());
  const second = reserveGroqQuota(state, fixture(), { bypassWait: true });
  finishGroqQuota(first, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(second, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("refunds a reservation created before the first quota headers arrived", () => {
  const state = createGroqQuotaState();
  const cancelled = reserveGroqQuota(state, fixture());
  const actual = reserveGroqQuota(state, fixture());
  finishGroqQuota(actual, headers("tokens", { remaining: 1000 }));
  finishGroqQuota(cancelled, undefined, { sent: false });
  // The entire reported allowance is available once the only pending call is cancelled.
  expect(() => reserveGroqQuota(state, fixture({ max_completion_tokens: 840 }))).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("retains negative pending debt across a reset until each unsent call is cancelled", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { limit: 300, remaining: 300, reset: "1s" }));
  const first = reserveGroqQuota(state, fixture());
  const second = reserveGroqQuota(state, fixture(), { bypassWait: true });
  vi.advanceTimersByTime(1250);
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(first, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
  finishGroqQuota(second, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("refunds before an expired bucket refresh without exceeding its full capacity", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { limit: 500, remaining: 200, reset: "1s" }));
  const cancelled = reserveGroqQuota(state, fixture());
  vi.advanceTimersByTime(1250);
  finishGroqQuota(cancelled, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture({ max_completion_tokens: 340 }))).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("keeps sent requests conservative even when their errors supply no quota headers", () => {
  const state = createGroqQuotaState();
  learn(state, headers("tokens", { remaining: 200 }));
  const actual = reserveGroqQuota(state, fixture());
  finishGroqQuota(actual, undefined, { sent: true });
  finishGroqQuota(actual, undefined, { sent: false });
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});

it("does not refund an estimate excluded by an earlier smaller limit", () => {
  const state = createGroqQuotaState();
  learn(state, { ...headers("tokens", { limit: 1000, remaining: 500 }), ...headers("requests", { remaining: 2 }) });
  const oversized = reserveGroqQuota(state, fixture({ max_completion_tokens: 1840 })); // 2000 tokens; excluded.
  const actual = reserveGroqQuota(state, fixture()); // Retained availability: 300 tokens.
  finishGroqQuota(actual, { ...headers("tokens", { limit: 3000, remaining: 3000 }), ...headers("requests", { remaining: 5 }) });
  finishGroqQuota(oversized, undefined, { sent: false });
  // A newly increased limit must not refund 2000 against the retained 300-token
  // snapshot, which never included that charge. Its daily request is refunded.
  expect(() => reserveGroqQuota(state, fixture({ max_completion_tokens: 340 }))).toThrow();
  expect(() => reserveGroqQuota(state, fixture())).not.toThrow();
  expect(() => reserveGroqQuota(state, fixture())).toThrow();
});
