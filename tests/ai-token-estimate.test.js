import { describe, expect, it } from "vitest";
import { CHAT_TOKEN_RESERVE, countTextTokens, estimateAIInput } from "../server/services/aiTokenEstimate.js";

describe("AI input token estimates", () => {
  it.each(["openai/gpt-oss-20b", "openai/gpt-oss-120b", "gpt-oss-20b"])("uses ordinary GPT-OSS text tokens for %s", (model) => {
    expect(countTextTokens("Hello world", model)).toBe(2);
    const profile = "The applicant founded a software company and earned a degree in computer science. ".repeat(40);
    expect(countTextTokens(profile, model)).toBeLessThan(Buffer.byteLength(profile, "utf8") / 3);
  });

  it("handles Unicode evidence without confusing UTF-16 length with token count", () => {
    const text = "こんにちは世界 🌍 مرحبا";
    const count = countTextTokens(text, "openai/gpt-oss-20b");
    expect(count).toBeGreaterThan(0);
    expect(Number.isInteger(count)).toBe(true);
    expect(count).toBeLessThan(Buffer.byteLength(text, "utf8"));
  });

  it("counts literal special-token spellings as ordinary user text", () => {
    for (const text of ["<|endoftext|>", "<|endofprompt|>", "<|start|>", "<|message|>"]) {
      expect(() => countTextTokens(text, "openai/gpt-oss-20b")).not.toThrow();
      expect(countTextTokens(text, "openai/gpt-oss-20b")).toBeGreaterThan(1);
    }
  });

  it("uses a byte estimate for large unbroken evidence without running BPE merges", () => {
    const text = `Evidence: ${"\u00e9".repeat(2049)} end.`;
    expect(countTextTokens(text, "openai/gpt-oss-20b")).toBe(Buffer.byteLength(text, "utf8"));
  });

  it("uses a byte estimate for inputs above the whole-text processing ceiling", () => {
    const text = "word ".repeat(40_001);
    expect(countTextTokens(text, "openai/gpt-oss-120b")).toBe(Buffer.byteLength(text, "utf8"));
  });

  it("still tokenizes ordinary JSON prompts containing IDs and sentences", () => {
    const text = JSON.stringify({
      userId: "b05486ba-ae76-4d4e-bf70-e80ff6e3b73f",
      fields: [{ id: "professional_experience", claim: "The advisor has worked in financial planning for ten years. ".repeat(70) }],
    });
    expect(text.length).toBeGreaterThan(2048);
    expect(countTextTokens(text, "openai/gpt-oss-20b")).toBeLessThan(Buffer.byteLength(text, "utf8") / 3);
  });

  it.each(["llama-3.3-70b-versatile", "gemini-2.5-flash", "claude-sonnet", undefined])("uses UTF-8 bytes for unsupported model %s", (model) => {
    const text = "A 🌍 ہے";
    expect(countTextTokens(text, model)).toBe(Buffer.byteLength(text, "utf8"));
    expect(countTextTokens(text, model)).toBeGreaterThan(text.length);
  });

  it("keeps the chat framing reserve separate from text and output tokens", () => {
    expect(countTextTokens("", "openai/gpt-oss-20b")).toBe(0);
    expect(countTextTokens(null, "other-model")).toBe(0);
    expect(estimateAIInput("Hello world", "Hello world", "openai/gpt-oss-20b")).toBe(4 + CHAT_TOKEN_RESERVE);
    expect(estimateAIInput("", "", "other-model")).toBe(CHAT_TOKEN_RESERVE);
  });
});
