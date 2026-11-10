import Groq from "groq-sdk";
import { getGroqApiKeys } from "../config.js";
import { trackAIRequest } from "./aiUsage.js";

// Process-local routing. No credentials are included in results, usage or logs.
let pool = { entries: [], cursor: 0, cooldownUntil: 0 };

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
    pool = { entries: keys.map(key => ({ key, active: 0, rejected: false })), cursor: 0, cooldownUntil: 0 };
  }
  return pool;
}

function selectKey(state) {
  if (!state.entries.length) throw new Error("No Groq API key is configured.");
  if (state.cooldownUntil > Date.now()) {
    throw Object.assign(new Error("Groq is cooling down after a rate limit. Please retry later."), {
      status: 429,
      headers: new Headers({ "retry-after": String(Math.ceil((state.cooldownUntil - Date.now()) / 1000)) }),
    });
  }
  const available = state.entries.filter(entry => !entry.rejected);
  if (!available.length) throw Object.assign(new Error("The configured Groq keys were rejected. Update the keys and restart the server."), { status: 401 });
  const leastActive = Math.min(...available.map(entry => entry.active));
  for (let offset = 0; offset < state.entries.length; offset++) {
    const index = (state.cursor + offset) % state.entries.length;
    const entry = state.entries[index];
    if (!entry.rejected && entry.active === leastActive) {
      state.cursor = (index + 1) % state.entries.length;
      entry.active++;
      return entry;
    }
  }
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
  for (;;) {
    // Selection/reservation happens synchronously before the first await.
    const entry = selectKey(state);
    try {
      const client = new Groq({ apiKey: entry.key, timeout, maxRetries: 0 });
      return await trackAIRequest({ provider: "groq", model: payload.model, purpose, trigger, details },
        () => client.chat.completions.create(payload));
    } catch (error) {
      if (error?.code?.startsWith("AI_")) throw error;
      if (error?.status === 401) {
        entry.rejected = true;
        if (state.entries.some(candidate => !candidate.rejected)) {
          trigger = "retry";
          continue;
        }
      }
      if (error?.status === 429) {
        // Groq quotas can be shared across the organization. Do not immediately
        // retry the same rate-limited request with another key in this pool.
        state.cooldownUntil = Math.max(state.cooldownUntil, Date.now() + retryAfterSeconds(error) * 1000);
      }
      throw error;
    } finally {
      entry.active--;
    }
  }
}
