import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimitRetry } from "../server/services/aiRateLimitRetry.js";

const limited = (seconds = 2, extra = {}) => Object.assign(new Error("Provider rate limited"), {
  status: 429,
  headers: new Headers({ "retry-after": String(seconds) }),
  ...extra,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-11T00:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe("bounded AI rate-limit recovery", () => {
  it.each([23, { reason: "provider quota" }, []].map(code => [code]))("keeps 429 recovery bounded when code is non-string %j", async (code) => {
    const onRetry = vi.fn();
    const retry = createRateLimitRetry({ maxRetries: 1, maxWaitMs: 5000, onRetry });
    // Attach the rejection handler immediately so a regression is a normal
    // assertion failure rather than an unhandled rejection while time advances.
    const pending = retry(limited(2, { code })).then(value => ({ value }), error => ({ error }));
    await vi.advanceTimersByTimeAsync(2000);
    expect(await pending).toEqual({ value: true });
    expect(onRetry).toHaveBeenCalledExactlyOnceWith(2);
    await expect(retry(limited(2, { code }))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("declines native numeric-code timeouts without starting a quota wait", async () => {
    const error = new DOMException("Timed out", "TimeoutError");
    expect(error.code).toBe(23);
    const onRetry = vi.fn();
    await expect(createRateLimitRetry({ onRetry })(error)).resolves.toBe(false);
    expect(onRetry).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["AI_TOKEN_LIMIT", "AI_USAGE_SAVE_FAILED"])("never retries fail-closed %s errors even with HTTP429", async (code) => {
    const onRetry = vi.fn();
    await expect(createRateLimitRetry({ onRetry })(limited(2, { code }))).resolves.toBe(false);
    expect(onRetry).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the default to one retry and honors the complete provider delay", async () => {
    const onRetry = vi.fn();
    const retry = createRateLimitRetry({ onRetry });
    const pending = retry(limited(2));
    await vi.advanceTimersByTimeAsync(1999);
    expect(onRetry).toHaveBeenCalledExactlyOnceWith(2);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toBe(true);
    await expect(retry(limited(2))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("lets the same pending operation recover after repeated rejections without replaying completed work", async () => {
    const retry = createRateLimitRetry({ maxRetries: 3, maxWaitMs: 120000 });
    const completedBatch = vi.fn(async () => "saved first batch");
    const currentBatch = vi.fn()
      .mockRejectedValueOnce(limited(20))
      .mockRejectedValueOnce(limited(30))
      .mockResolvedValue("saved second batch");
    const result = (async () => {
      const saved = await completedBatch();
      for (;;) {
        try { return [saved, await currentBatch()]; }
        catch (error) { if (!await retry(error)) throw error; }
      }
    })();
    await vi.advanceTimersByTimeAsync(20000);
    expect(currentBatch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(30000);
    await expect(result).resolves.toEqual(["saved first batch", "saved second batch"]);
    expect(completedBatch).toHaveBeenCalledTimes(1);
    expect(currentBatch).toHaveBeenCalledTimes(3);
  });

  it("updates progress at least every 30 seconds during an allowed longer wait", async () => {
    const onRetry = vi.fn();
    const retry = createRateLimitRetry({ maxRetries: 2, maxWaitMs: 180000, onRetry });
    const pending = retry(limited(95));
    expect(onRetry).toHaveBeenCalledWith(95);
    await vi.advanceTimersByTimeAsync(30000);
    expect(onRetry).toHaveBeenLastCalledWith(65);
    await vi.advanceTimersByTimeAsync(30000);
    expect(onRetry).toHaveBeenLastCalledWith(35);
    await vi.advanceTimersByTimeAsync(30000);
    expect(onRetry).toHaveBeenLastCalledWith(5);
    await vi.advanceTimersByTimeAsync(5000);
    await expect(pending).resolves.toBe(true);
    expect(onRetry.mock.calls.map(([seconds]) => seconds)).toEqual([95, 65, 35, 5]);
  });

  it("stops when accumulated waits would exceed the configured budget", async () => {
    const retry = createRateLimitRetry({ maxRetries: 16, maxWaitMs: 90000 });
    const first = retry(limited(60));
    await vi.advanceTimersByTimeAsync(60000);
    await expect(first).resolves.toBe(true);
    await expect(retry(limited(31))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    const second = retry(limited(30));
    await vi.advanceTimersByTimeAsync(30000);
    await expect(second).resolves.toBe(true);
    await expect(retry(limited(1))).resolves.toBe(false);
  });

  it("allows repeated preflight pacing without consuming the actual 429 retry allowance", async () => {
    const retry = createRateLimitRetry({ maxRetries: 1, maxWaitMs: 10000 });
    for (let index = 0; index < 5; index++) {
      const pending = retry(limited(1, { code: "GROQ_QUOTA_WAIT" }));
      await vi.advanceTimersByTimeAsync(1000);
      await expect(pending).resolves.toBe(true);
    }
    const actualRejection = retry(limited(2));
    await vi.advanceTimersByTimeAsync(2000);
    await expect(actualRejection).resolves.toBe(true);
    await expect(retry(limited(1))).resolves.toBe(false);
    // A later request can still wait for its reservation within the time budget.
    const pending = retry(limited(1, { code: "GROQ_QUOTA_WAIT" }));
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toBe(true);
  });

  it("bounds preflight pacing by the shared deadline even when HTTP retries are disabled", async () => {
    const retry = createRateLimitRetry({ maxRetries: 0, maxWaitMs: 3000 });
    const pacing = limited(1, { code: "GROQ_QUOTA_WAIT" });
    for (let index = 0; index < 3; index++) {
      const pending = retry(pacing);
      await vi.advanceTimersByTimeAsync(1000);
      await expect(pending).resolves.toBe(true);
    }
    await expect(retry(pacing)).resolves.toBe(false);
    await expect(retry(limited(1))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    await expect(createRateLimitRetry({ maxWaitMs: 0 })(pacing)).resolves.toBe(false);
  });

  it("includes intervening provider time in the preflight pacing deadline", async () => {
    const retry = createRateLimitRetry({ maxRetries: 3, maxWaitMs: 5000 });
    const pacing = limited(1, { code: "GROQ_QUOTA_WAIT" });
    const pending = retry(pacing);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(4000);
    await expect(retry(pacing)).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("starts its wall-clock window at the first rejection and includes later request time", async () => {
    const retry = createRateLimitRetry({ maxRetries: 3, maxWaitMs: 60000 });
    await vi.advanceTimersByTimeAsync(600000);
    const first = retry(limited(10));
    await vi.advanceTimersByTimeAsync(10000);
    await expect(first).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(45000);
    await expect(retry(limited(6))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([61, 3600, 86400])("does not shorten a %s-second delay to fit the default window", async seconds => {
    const onRetry = vi.fn();
    await expect(createRateLimitRetry({ onRetry })(limited(seconds))).resolves.toBe(false);
    expect(onRetry).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects a daily quota delay even with the maximum recovery window", async () => {
    await expect(createRateLimitRetry({ maxRetries: 16, maxWaitMs: 180000 })(limited(86400))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    new Error("Malformed response"),
    Object.assign(new Error("Rejected"), { status: 401 }),
    Object.assign(new Error("Oversized"), { status: 413 }),
    limited(2, { code: "AI_TOKEN_LIMIT" }),
    limited(2, { code: "AI_USAGE_STORAGE_FAILED" }),
  ])("never retries a non-quota or internal AI error: $message", async error => {
    const onRetry = vi.fn();
    await expect(createRateLimitRetry({ onRetry })(error)).resolves.toBe(false);
    expect(onRetry).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates progress persistence failures instead of issuing another request", async () => {
    const error = Object.assign(new Error("Could not save progress"), { code: "AI_USAGE_STORAGE_FAILED" });
    const onRetry = vi.fn().mockRejectedValue(error);
    await expect(createRateLimitRetry({ onRetry })(limited())).rejects.toBe(error);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not exceed the recovery deadline when progress persistence is slow", async () => {
    const onRetry = vi.fn(async () => { vi.setSystemTime(Date.now() + 61000); });
    await expect(createRateLimitRetry({ onRetry })(limited(10))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("honors an approved final wait when its timer wakes just after the deadline", async () => {
    const retry = createRateLimitRetry({ maxRetries: 3, maxWaitMs: 1000 });
    const pending = retry(limited(1));
    await vi.advanceTimersByTimeAsync(0);
    // Advancing wall time independently simulates timer/event-loop overshoot.
    vi.setSystemTime(Date.now() + 20);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toBe(true);
    await expect(retry(limited(1))).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ["2.5", 3000],
    ["Wed, 11 Nov 2026 00:00:05 GMT", 5000],
    ["invalid", 30000],
  ])("uses the shared Retry-After parser for %s", async (header, milliseconds) => {
    const pending = createRateLimitRetry()(limited(header));
    await vi.advanceTimersByTimeAsync(milliseconds);
    await expect(pending).resolves.toBe(true);
  });

  it.each([{ maxRetries: 0 }, { maxWaitMs: 0 }])("can explicitly disable recovery: %j", async options => {
    await expect(createRateLimitRetry(options)(limited())).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([-1, 1.5, 17, Infinity, NaN, "2"])("rejects invalid retry count %s", maxRetries => {
    expect(() => createRateLimitRetry({ maxRetries })).toThrow(RangeError);
  });
  it.each([-1, 1.5, 180001, Infinity, NaN, "1000"])("rejects invalid wait budget %s", maxWaitMs => {
    expect(() => createRateLimitRetry({ maxWaitMs })).toThrow(RangeError);
  });
  it("validates the optional progress callback", () => {
    expect(() => createRateLimitRetry({ onRetry: "update" })).toThrow(TypeError);
  });
});
