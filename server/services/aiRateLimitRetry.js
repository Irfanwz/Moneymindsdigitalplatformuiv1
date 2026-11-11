import { retryAfterSeconds } from "./groqKeyPool.js";

/** Keep quota recovery bounded while the caller retains its current work. */
export function createRateLimitRetry({ maxRetries = 1, maxWaitMs = 60000, onRetry } = {}) {
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0 || maxRetries > 16) {
    throw new RangeError("maxRetries must be an integer between 0 and 16.");
  }
  if (!Number.isSafeInteger(maxWaitMs) || maxWaitMs < 0 || maxWaitMs > 180000) {
    throw new RangeError("maxWaitMs must be an integer between 0 and 180000.");
  }
  if (onRetry !== undefined && typeof onRetry !== "function") {
    throw new TypeError("onRetry must be a function.");
  }
  let retries = 0;
  let scheduledWaitMs = 0;
  let deadline;

  return async function retry(error) {
    if (error?.status !== 429 || (typeof error?.code === "string" && error.code.startsWith("AI_"))) return false;
    // Waiting before a request is sent consumes time, not an HTTP retry. A
    // concurrent request may keep its quota reservation longer than one poll.
    const quotaPacing = error?.code === "GROQ_QUOTA_WAIT";
    if (!quotaPacing && retries >= maxRetries) return false;

    const now = Date.now();
    // Context collection or successful calls before the first quota wait
    // do not consume the recovery window. Later provider calls do.
    deadline ??= now + maxWaitMs;
    const waitMs = retryAfterSeconds(error) * 1000;
    if (!Number.isFinite(waitMs) || waitMs <= 0 ||
        waitMs > maxWaitMs - scheduledWaitMs || now + waitMs > deadline) return false;

    if (!quotaPacing) retries++;
    scheduledWaitMs += waitMs;
    const readyAt = now + waitMs;
    for (;;) {
      const currentTime = Date.now();
      const remainingMs = readyAt - currentTime;
      // A scheduled timer can wake a little late. Honor a wait already accepted
      // within the budget; any later retry must pass the deadline check anew.
      if (remainingMs <= 0) return true;
      if (currentTime > deadline) return false;
      // Persist progress during longer waits so running jobs remain observable.
      // Callback/storage failures deliberately stop recovery.
      await onRetry?.(Math.ceil(remainingMs / 1000));
      const afterProgress = Date.now();
      if (afterProgress > deadline) return false;
      const sleepMs = Math.min(30000, readyAt - afterProgress, deadline - afterProgress);
      if (sleepMs > 0) await new Promise(resolve => setTimeout(resolve, sleepMs));
    }
  };
}
