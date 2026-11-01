import { it, expect, vi, beforeEach, afterEach } from "vitest";
const mocks=vi.hoisted(()=>({groq:vi.fn(),anthropic:vi.fn()}));
vi.mock("groq-sdk",()=>({default:class {chat={completions:{create:mocks.groq}};}}));
vi.mock("@anthropic-ai/sdk",()=>({default:class {messages={create:mocks.anthropic};}}));
import { config } from "../server/config.js";
import { generateJSON } from "../server/services/aiProvider.js";
const original={...config};
beforeEach(()=>{vi.resetAllMocks();Object.assign(config,{groqApiKey:"fixture",anthropicApiKey:"fixture",aiProvider:"auto"});});
afterEach(()=>{Object.assign(config,original);vi.useRealTimers();});
it("uses the Groq model configuration and validates the returned JSON",async()=>{
  mocks.groq.mockResolvedValue({choices:[{message:{content:'{"ready":true}'}}]});
  const result=await generateJSON("JSON only","Check",{validate:data=>{expect(data.ready).toBe(true);return data;}});
  expect(result.provider).toBe("groq");expect(mocks.groq.mock.calls[0][0].model).toBe(config.groqModel);
});
it("uses Anthropic's own API parameters on fallback",async()=>{
  mocks.groq.mockRejectedValue(Object.assign(new Error("Provider unavailable"),{status:503}));
  mocks.anthropic.mockResolvedValue({content:[{type:"text",text:'{"ready":true}'}]});
  expect((await generateJSON("JSON only","Check",{maxTokens:900})).provider).toBe("anthropic");
  const payload=mocks.anthropic.mock.calls[0][0];
  expect(payload.max_tokens).toBe(900);expect(payload.max_completion_tokens).toBeUndefined();expect(payload.reasoning_effort).toBeUndefined();
});
it("waits for a rate limit before one retry and reports the waiting stage",async()=>{
  vi.useFakeTimers();
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Busy"),{status:429,headers:new Headers({"retry-after":"2"})})).mockResolvedValue({choices:[{message:{content:'{"ready":true}'}}]});
  const onRetry=vi.fn();const pending=generateJSON("JSON only","Check",{onRetry});
  await vi.advanceTimersByTimeAsync(1000);expect(mocks.groq).toHaveBeenCalledTimes(1);expect(onRetry).toHaveBeenCalledWith(2);
  await vi.advanceTimersByTimeAsync(1000);expect((await pending).data.ready).toBe(true);expect(mocks.groq).toHaveBeenCalledTimes(2);
});
it("fails explicitly when configured providers return invalid reports",async()=>{
  mocks.groq.mockResolvedValue({choices:[{message:{content:'invalid'}}]});
  mocks.anthropic.mockResolvedValue({content:[{type:"text",text:'[]'}]});
  await expect(generateJSON("JSON only","Check")).rejects.toThrow("invalid or incomplete");
});
