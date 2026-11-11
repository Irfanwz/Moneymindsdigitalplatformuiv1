import Groq from "groq-sdk";
import { getGroqApiKeys } from "../config.js";
import { trackAIRequest } from "./aiUsage.js";

// Process-local routing. No credentials are included in results, usage or logs.
let pool = { entries: [], cursor: 0 };

export function retryAfterSeconds(error) {
  const value = error?.headers?.get?.("retry-after") ?? error?.headers?.["retry-after"];
  if (value !== undefined && value !== null && String(value).trim()) {
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.max(1, Math.ceil(seconds));
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(1, Math.ceil((date - Date.now()) / 1000));
  }
  return 30;
}

function currentPool(keys) {
  if (keys.length !== pool.entries.length || keys.some((key, i) => pool.entries[i].key !== key)) {
    pool = { entries: keys.map(key => ({ key, active: 0, rejected: false, cooldownUntil: 0 })), cursor: 0 };
  }
  return pool;
}

function cooldownError(entries) {
  const readyAt = Math.min(...entries.map(entry => entry.cooldownUntil));
  return Object.assign(new Error("Groq is cooling down after a rate limit. Please retry later."), {
    status: 429,
    headers: new Headers({ "retry-after": String(Math.max(1, Math.ceil((readyAt - Date.now()) / 1000))) }),
  });
}

function selectKey(state, attempted) {
  if (!state.entries.length) throw new Error("No Groq API key is configured.");
  const candidates = state.entries.filter(entry => !entry.rejected && !attempted.has(entry));
  if (!candidates.length) throw Object.assign(new Error("The configured Groq keys were rejected. Update the keys and restart the server."), { status: 401 });
  const available = candidates.filter(entry => entry.cooldownUntil <= Date.now());
  if (!available.length) throw cooldownError(candidates);
  const leastActive = Math.min(...available.map(entry => entry.active));
  for (let offset = 0; offset < state.entries.length; offset++) {
    const index = (state.cursor + offset) % state.entries.length;
    const entry = state.entries[index];
    if (available.includes(entry) && entry.active === leastActive) {
      state.cursor = (index + 1) % state.entries.length;
      entry.active++;
      return entry;
    }
  }
}

function isTransient(error) {
  return error?.status === 408 || (error?.status >= 500 && error?.status <= 599) ||
    (typeof Groq.APIConnectionError === "function" && error instanceof Groq.APIConnectionError);
}

function timeoutError() {
  return Object.assign(new Error("The Groq request timed out. Please retry."), {
    status: 408, code: "GROQ_REQUEST_TIMEOUT",
  });
}

/** Distribute independent requests across keys; never send a successful prompt to all keys. */
export async function requestGroqCompletion(payload, {
  timeout = 45000,
  purpose = "Generate an AI assessment",
  trigger = "initial",
  details = {},
  keys = getGroqApiKeys(),
} = {}) {
  const state = currentPool(keys);
  const attempted = new Set();
  const deadline = Date.now() + timeout;
  for (;;) {
    // Selection/reservation happens synchronously before the first await.
    const entry = selectKey(state, attempted);
    attempted.add(entry);
    try {
      return await trackAIRequest({ provider: "groq", model: payload.model, purpose, trigger, details },
        async () => {
          // Budget checks and usage persistence happen before this callback.
          const remaining = deadline - Date.now();
          if (remaining <= 0) throw timeoutError();
          const slots = 1 + state.entries.filter(candidate => !candidate.rejected && !attempted.has(candidate) && candidate.cooldownUntil <= Date.now()).length;
          const attemptTimeout = Math.max(1, Math.floor(remaining / slots));
          const client = new Groq({ apiKey: entry.key, timeout: attemptTimeout, maxRetries: 0 });
          const controller = new AbortController();
          // Keep the deadline active through response-body parsing, not just headers.
          const timer = setTimeout(() => controller.abort(), attemptTimeout);
          try {
            return await client.chat.completions.create(payload, { signal: controller.signal });
          } catch (error) {
            if (controller.signal.aborted) throw timeoutError();
            throw error;
          } finally {
            clearTimeout(timer);
          }
        });
    } catch (error) {
      if (error?.code?.startsWith("AI_")) throw error;
      if (error?.status === 401) {
        entry.rejected = true;
      }
      if (error?.status === 429) {
        // Respect this key's retry window while trying other ready saved keys.
        entry.cooldownUntil = Math.max(entry.cooldownUntil, Date.now() + retryAfterSeconds(error) * 1000);
      }
      const hasNextKey = state.entries.some(candidate => !candidate.rejected && !attempted.has(candidate) && candidate.cooldownUntil <= Date.now());
      const retryable = [401, 403, 413, 429].includes(error?.status) || isTransient(error);
      if (retryable && hasNextKey && Date.now() < deadline) {
        trigger = "retry";
        continue;
      }
      const usable = state.entries.filter(candidate => !candidate.rejected);
      if (retryable && usable.length && usable.every(candidate => candidate.cooldownUntil > Date.now())) {
        throw cooldownError(usable);
      }
      // Every eligible saved key has at most one attempt in this sequence.
      // The caller can now fall back to another configured provider or report
      // the last real rejection; rotating keys never guarantees more quota.
      throw error;
    } finally {
      entry.active--;
    }
  }
}
