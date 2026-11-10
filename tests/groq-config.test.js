import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {vi.unstubAllEnvs();vi.resetModules();});
it("loads three keys from GROQ_API_KEYS even when GROQ_API_KEY is unset", async () => {
  vi.stubEnv("GROQ_API_KEYS"," first, second, third, first ");
  vi.stubEnv("GROQ_API_KEY","");
  vi.resetModules();
  const {config,getGroqApiKeys,isGroqConfigured} = await import("../server/config.js");
  expect(config.groqApiKey).toBe("");
  expect(getGroqApiKeys()).toEqual(["first","second","third"]);
  expect(isGroqConfigured).toBe(true);
});
it("keeps the legacy single key when the optional list is empty", async () => {
  vi.stubEnv("GROQ_API_KEYS","");
  vi.stubEnv("GROQ_API_KEY"," legacy ");
  vi.resetModules();
  const {getGroqApiKeys,isGroqConfigured} = await import("../server/config.js");
  expect(getGroqApiKeys()).toEqual(["legacy"]);
  expect(isGroqConfigured).toBe(true);
});
