import { Tiktoken } from "js-tiktoken/lite";
import o200kBase from "js-tiktoken/ranks/o200k_base";

// GPT-OSS uses o200k_harmony, with the same ordinary-text ranks as o200k_base.
// The provider adds message framing; its reported usage remains authoritative.
export const CHAT_TOKEN_RESERVE = 150;
let gptOssTokenizer;

function needsByteEstimate(content) {
  if (content.length > 200_000) return true;
  // The pure-JS BPE merge loop is expensive on very long unbroken strings,
  // such as embedded base64. Use a safe overestimate instead of blocking the API.
  for (const match of content.matchAll(/\S+/gu)) {
    if (match[0].length > 2048) return true;
  }
  return false;
}

/** Estimate text tokens without allocating the tokenizer until it is needed. */
export function countTextTokens(text, model) {
  const content = String(text ?? "");
  if (!content) return 0;
  if (/^(?:openai\/)?gpt-oss(?:-|$)/i.test(String(model ?? "")) && !needsByteEstimate(content)) {
    gptOssTokenizer ??= new Tiktoken(o200kBase);
    // Profile/document text can contain literal special-token spellings. Count
    // those as ordinary text, rather than accepting control tokens or throwing.
    return gptOssTokenizer.encode(content, [], []).length;
  }
  // Unknown model tokenizers cannot be assumed to average four characters per
  // token. UTF-8 bytes give a conservative estimate, including multilingual text.
  return Buffer.byteLength(content, "utf8");
}

/** Two-message text request estimate, excluding any requested output tokens. */
export function estimateAIInput(system, prompt, model) {
  return countTextTokens(system, model) + countTextTokens(prompt, model) + CHAT_TOKEN_RESERVE;
}
