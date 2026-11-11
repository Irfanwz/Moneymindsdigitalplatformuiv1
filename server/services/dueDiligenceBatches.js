import { countTextTokens, CHAT_TOKEN_RESERVE } from "./aiTokenEstimate.js";

// Bound the complete serialized input, including instructions, metadata and
// chat framing. GPT-OSS uses its text tokenizer; unknown models use UTF-8 bytes
// conservatively. Input + completion allowance stays below 8,000 tokens.
export const DUE_DILIGENCE_INPUT_TOKENS = 5000;
export const DUE_DILIGENCE_COMPLETION_TOKENS = 2500;
export const DUE_DILIGENCE_FIELDS_PER_REQUEST = 8;

/**
 * Pack all available evidence into bounded requests. Large sources overlap,
 * retain their original IDs, and contain exact substrings for quote checking.
 * null means the indivisible claim/context/metadata needs manual review.
 */
export function planEvidenceRequests(system, sources, makeInput, { model } = {}) {
  const requests = [];
  let packed = [];
  const fixedTokens = countTextTokens(system, model) + CHAT_TOKEN_RESERVE;
  const promptFor = (items) => JSON.stringify(makeInput(items));
  const fits = (items) => fixedTokens + countTextTokens(promptFor(items), model) <= DUE_DILIGENCE_INPUT_TOKENS;
  const flush = () => {
    requests.push({ sources: packed, prompt: promptFor(packed) });
    packed = [];
  };
  if (!fits([])) return null;

  for (const source of sources) {
    if (fits([...packed, source])) {
      packed.push(source);
      continue;
    }
    if (packed.length) flush();
    if (fits([source])) {
      packed.push(source);
      continue;
    }
    const text = source.text;
    if (typeof text !== "string" || !text.length) return null;
    let start = 0;
    while (start < text.length) {
      const excerpt = (end) => ({ ...source, text: text.slice(start, end), excerptStart: start, excerptEnd: end });
      let low = start, high = text.length;
      while (low < high) {
        const end = Math.ceil((low + high) / 2);
        if (fits([excerpt(end)])) low = end;
        else high = end - 1;
      }
      let end = low;
      // Do not split a Unicode surrogate pair.
      if (end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1] || "")) end--;
      // Removing a character can change BPE merges. Recheck the exact excerpt
      // after the Unicode adjustment rather than assuming token monotonicity.
      while (end > start && !fits([excerpt(end)])) {
        end--;
        if (/[\uD800-\uDBFF]/.test(text[end - 1] || "")) end--;
      }
      if (end <= start || (end < text.length && end - start < 256)) return null;
      packed = [excerpt(end)];
      if (end === text.length) break;
      flush();
      start = end - Math.min(600, Math.floor((end - start) / 2));
      if (/[\uDC00-\uDFFF]/.test(text[start] || "")) start--;
    }
  }
  if (packed.length || !requests.length) flush();
  return requests;
}

// Absence of support in one excerpt cannot cancel support in another. An
// actual contradiction, explicit ambiguity or missed assessment remains visible.
export function mergeEvidenceChecks(checks) {
  const status = ["inconsistent", "manual_review", "supported", "insufficient_evidence"]
    .find(value => checks.some(check => check.status === value)) || "insufficient_evidence";
  const selected = checks.filter(check => check.status === status);
  const evidence = [...new Map(selected.flatMap(check => check.evidence)
    .map(ref => [JSON.stringify([ref.sourceId, ref.quote]), ref])).values()];
  const reasoning = [...new Set(selected.map(check => check.reasoning))].join("\n");
  return { status, reasoning, evidence };
}
