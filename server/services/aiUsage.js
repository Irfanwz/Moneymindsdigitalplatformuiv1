import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const context = new AsyncLocalStorage();
const count = (value) =>
  Number.isSafeInteger(value) && value >= 0 ? value : null;
const tokenKeys = [
  "inputTokens",
  "outputTokens",
  "totalTokens",
  "cachedInputTokens",
  "cacheWriteTokens",
  "reasoningTokens",
];

export function normalizeTokenUsage(provider, usage) {
  let inputTokens = null,
    outputTokens = null,
    totalTokens = null;
  let cachedInputTokens = null,
    cacheWriteTokens = null,
    reasoningTokens = null;
  if (usage && provider === "groq") {
    inputTokens = count(usage.prompt_tokens);
    outputTokens = count(usage.completion_tokens);
    totalTokens = count(usage.total_tokens);
    cachedInputTokens = count(usage.prompt_tokens_details?.cached_tokens);
    reasoningTokens = count(usage.completion_tokens_details?.reasoning_tokens);
  } else if (usage && provider === "anthropic") {
    inputTokens = count(usage.input_tokens);
    outputTokens = count(usage.output_tokens);
    cachedInputTokens = count(usage.cache_read_input_tokens);
    cacheWriteTokens = count(usage.cache_creation_input_tokens);
    // Anthropic reports cache reads/writes separately from uncached input.
    if (inputTokens !== null)
      inputTokens += (cachedInputTokens ?? 0) + (cacheWriteTokens ?? 0);
    reasoningTokens = count(usage.output_tokens_details?.reasoning_tokens);
  }
  if (totalTokens === null && inputTokens !== null && outputTokens !== null)
    totalTokens = inputTokens + outputTokens;
  return {
    inputTokens,
    outputTokens,
    totalTokens,
    cachedInputTokens,
    cacheWriteTokens,
    reasoningTokens,
  };
}

export function summarizeTokenUsage(calls) {
  const reportedRequests = calls.filter(
    (c) =>
      c.inputTokens !== null &&
      c.outputTokens !== null &&
      c.totalTokens !== null,
  ).length;
  const anyReported = calls.some((c) =>
    tokenKeys.some((key) => c[key] !== null),
  );
  const totals = Object.fromEntries(
    tokenKeys.map((key) => {
      const known = calls.map((c) => c[key]).filter((value) => value !== null);
      return [
        key,
        !calls.length
          ? 0
          : known.length
            ? known.reduce((sum, value) => sum + value, 0)
            : null,
      ];
    }),
  );
  return {
    version: 1,
    status: !calls.length
      ? "not_used"
      : reportedRequests === calls.length
        ? "complete"
        : anyReported
          ? "partial"
          : "unavailable",
    requestCount: calls.length,
    reportedRequests,
    unreportedRequests: calls.length - reportedRequests,
    pendingRequests: calls.filter((c) => c.status === "running").length,
    ...totals,
    calls: structuredClone(calls),
  };
}

export function createUsageTracker(persist) {
  const state = {
    calls: [],
    inFlight: new Set(),
    pending: Promise.resolve(),
    failure: null,
  };
  const snapshot = () => summarizeTokenUsage(state.calls);
  state.publish = () => {
    if (state.failure) return Promise.reject(state.failure);
    const value = snapshot();
    // Concurrent requests must never overwrite a newer snapshot with an older one.
    const write = state.pending
      .then(() => persist(value))
      .catch(() => {
        state.failure ||= Object.assign(
          new Error(
            "AI token usage could not be saved. Please check agent storage before retrying.",
          ),
          { code: "AI_USAGE_SAVE_FAILED" },
        );
        throw state.failure;
      });
    state.pending = write.catch(() => {});
    return write;
  };
  return {
    snapshot,
    run: (work) => context.run(state, work),
    async settle() {
      // A parallel batch can reject while another request is still consuming tokens.
      while (state.inFlight.size) await Promise.allSettled([...state.inFlight]);
      await state.pending;
      if (state.failure) throw state.failure;
    },
  };
}

export async function trackAIRequest(
  {
    provider,
    model,
    purpose = "Generate an AI assessment",
    trigger = "initial",
    details = {},
  },
  request,
) {
  const state = context.getStore();
  if (!state) return request();
  const numericDetails = Object.fromEntries(
    ["fieldCount", "sourceCount", "documentCount"]
      .filter((key) => count(details[key]) !== null)
      .map((key) => [key, details[key]]),
  );
  const call = {
    id: randomUUID(),
    provider,
    model,
    purpose: purpose.slice(0, 240),
    trigger,
    details: numericDetails,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    ...normalizeTokenUsage(provider, null),
  };
  state.calls.push(call);
  const work = (async () => {
    try {
      await state.publish();
    } catch (error) {
      // The request has not been sent if its initial durable record failed.
      state.calls.splice(state.calls.indexOf(call), 1);
      throw error;
    }
    let response;
    try {
      response = await request();
    } catch (error) {
      call.status = "failed";
      call.completedAt = new Date().toISOString();
      // No response usage is not proof of zero billing (timeouts can occur after generation).
      await state.publish();
      throw error;
    }
    Object.assign(call, normalizeTokenUsage(provider, response?.usage), {
      status: "response_received",
      completedAt: new Date().toISOString(),
      model:
        typeof response?.model === "string"
          ? response.model.slice(0, 120)
          : model,
    });
    // Save before parsing/validating: even an unusable response may consume tokens.
    await state.publish();
    return response;
  })();
  state.inFlight.add(work);
  try {
    return await work;
  } finally {
    state.inFlight.delete(work);
  }
}
