import { CHAT_TOKEN_RESERVE, countTextTokens } from "./aiTokenEstimate.js";

// The provider reports a relative reset duration. A small margin avoids sending
// on the exact boundary while the provider's clock/window is still resetting.
const RESET_MARGIN_MS = 250;
const DURATION_UNITS = { d: 86400000, h: 3600000, m: 60000, s: 1000, ms: 1 };

function headerValue(headers, name) {
  try {
    const value = typeof headers?.get === "function"
      ? headers.get(name)
      : Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name)?.[1];
    return typeof value === "string" || typeof value === "number" ? String(value).trim() : null;
  } catch {
    return null;
  }
}

function integerHeader(headers, name) {
  const value = headerValue(headers, name);
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function resetDuration(value) {
  if (!value) return null;
  let offset = 0;
  let total = 0;
  let previousUnit = Infinity;
  for (const match of value.matchAll(/(\d+(?:\.\d+)?|\.\d+)(ms|d|h|m|s)/g)) {
    const unit = DURATION_UNITS[match[2]];
    if (match.index !== offset || unit >= previousUnit) return null;
    total += Number(match[1]) * unit;
    offset += match[0].length;
    previousUnit = unit;
  }
  return offset === value.length && Number.isFinite(total) && total >= 0 && total <= Number.MAX_SAFE_INTEGER
    ? Math.ceil(total)
    : null;
}

function readBucket(headers, kind, now) {
  const limit = integerHeader(headers, `x-ratelimit-limit-${kind}`);
  const remaining = integerHeader(headers, `x-ratelimit-remaining-${kind}`);
  const duration = resetDuration(headerValue(headers, `x-ratelimit-reset-${kind}`));
  const resetAt = duration === null ? NaN : now + duration + RESET_MARGIN_MS;
  if (limit === null || limit <= 0 || remaining === null || remaining > limit || !Number.isSafeInteger(resetAt)) return null;
  return { limit, remaining, resetAt };
}

function tokenEstimate(payload) {
  const output = payload.max_completion_tokens ?? payload.max_tokens;
  if (!Number.isSafeInteger(output) || output <= 0 || !Array.isArray(payload.messages) || !payload.messages.length) return null;
  // Image/audio/tool payloads have additional provider-specific token costs.
  // Do not pretend that counting their text measures the whole request.
  if (payload.tools || payload.functions || (payload.n !== undefined && payload.n !== 1)) return null;
  let estimate = CHAT_TOKEN_RESERVE + output;
  for (const message of payload.messages) {
    if (message.tool_calls || message.function_call) return null;
    const parts = typeof message.content === "string" ? [message.content]
      : Array.isArray(message.content) && message.content.every(part => part?.type === "text" && typeof part.text === "string")
        ? message.content.map(part => part.text)
        : null;
    if (!parts) return null;
    for (const text of parts) estimate += countTextTokens(text, payload.model);
  }
  return Number.isSafeInteger(estimate) ? estimate : null;
}

function pendingCost(model, kind, limit) {
  if (kind === "requests") return model.pending.size;
  let total = 0;
  for (const reservation of model.pending) {
    // An estimate larger than a full bucket cannot be fixed by waiting. Leave
    // such requests to the provider's real size validation/fallback handling.
    if (reservation.tokens !== null && reservation.tokens <= limit) total += reservation.tokens;
    else if (reservation.tokens !== null) reservation.tokenRefundable = false;
  }
  return total;
}

function refreshBucket(model, kind, now) {
  const bucket = model[kind];
  if (bucket && bucket.resetAt !== null && now >= bucket.resetAt) {
    bucket.remaining = bucket.limit - pendingCost(model, kind, bucket.limit);
    // A learned window has now reset. A new response will establish its next
    // reset; until then do not repeatedly refill it for concurrent callers.
    bucket.resetAt = null;
  }
}

function quotaWait(seconds) {
  return Object.assign(new Error("Groq quota is temporarily unavailable. Waiting for the provider reset."), {
    status: 429,
    code: "GROQ_QUOTA_WAIT",
    headers: new Headers({ "retry-after": String(seconds) }),
  });
}

export function createGroqQuotaState() {
  return { models: new Map() };
}

/** Reserve synchronously before usage tracking/network work starts. */
export function reserveGroqQuota(state, payload, { bypassWait = false } = {}) {
  const key = String(payload.model ?? "");
  let model = state.models.get(key);
  if (!model) {
    model = { pending: new Set(), tokens: null, requests: null };
    state.models.set(key, model);
  }
  const now = Date.now();
  const tokens = tokenEstimate(payload);
  let waitUntil = 0;
  for (const kind of ["tokens", "requests"]) {
    refreshBucket(model, kind, now);
    const bucket = model[kind];
    const cost = kind === "tokens" ? tokens : 1;
    if (bucket && cost !== null && cost <= bucket.limit && cost > bucket.remaining) {
      // After a full reset, in-flight requests may reserve all capacity before
      // any new response provides the next reset. Poll briefly without sending
      // another request; if no requests remain, let the provider refresh us.
      const resetAt = bucket.resetAt ?? (model.pending.size ? now + 5000 : 0);
      waitUntil = Math.max(waitUntil, resetAt);
    }
  }
  if (!bypassWait && waitUntil > now) throw quotaWait(Math.max(1, Math.ceil((waitUntil - now) / 1000)));
  const reservation = {
    model, tokens, active: true,
    // If any retained snapshot excluded an oversized estimate, adding it back
    // after a limit change could inflate a smaller, uncharged snapshot.
    tokenRefundable: tokens !== null && (!model.tokens || tokens <= model.tokens.limit),
  };
  model.pending.add(reservation);
  for (const kind of ["tokens", "requests"]) {
    const bucket = model[kind];
    const cost = kind === "tokens" ? tokens : 1;
    // Keep reservation debt below zero: clamping it would invent capacity when
    // an unsent request is later cancelled while other reservations remain.
    if (bucket && cost !== null && cost <= bucket.limit) bucket.remaining -= cost;
  }
  return reservation;
}

/** Finish once, learning only complete, valid provider quota headers. */
export function finishGroqQuota(reservation, headers, { sent = true } = {}) {
  if (!reservation?.active) return;
  reservation.active = false;
  const { model } = reservation;
  if (!sent) {
    for (const kind of ["tokens", "requests"]) {
      const bucket = model[kind];
      const cost = kind === "tokens" ? reservation.tokens : 1;
      // Refund against the current snapshot, which already accounts for every
      // pending reservation even if it was learned/replaced after this one
      // began. Refreshing after removal handles a reset in the meantime.
      if (bucket && cost !== null && cost <= bucket.limit && (kind !== "tokens" || reservation.tokenRefundable)) {
        bucket.remaining = Math.min(bucket.limit, bucket.remaining + cost);
      }
    }
  }
  model.pending.delete(reservation);
  const now = Date.now();
  for (const kind of ["tokens", "requests"]) {
    refreshBucket(model, kind, now);
    const incoming = readBucket(headers, kind, now);
    if (!incoming) continue;
    incoming.remaining -= pendingCost(model, kind, incoming.limit);
    const existing = model[kind];
    if (existing) {
      // Responses can finish out of order. Never refund estimated consumption
      // from a possibly stale, higher remaining count before a full reset.
      incoming.remaining = Math.min(existing.remaining, incoming.remaining);
      incoming.resetAt = Math.max(existing.resetAt ?? 0, incoming.resetAt);
    }
    model[kind] = incoming;
  }
}
