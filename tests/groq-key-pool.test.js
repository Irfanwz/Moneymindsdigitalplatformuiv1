import { beforeEach, afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ groq: vi.fn(), anthropic: vi.fn() }));
vi.mock("groq-sdk", () => ({ default: class {
  constructor({apiKey}) { this.chat = {completions:{create:payload => mocks.groq(apiKey, payload)}}; }
} }));
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = {create:mocks.anthropic}; } }));
vi.mock("../server/services/marketPriceFetcher.js", () => ({getStockPrice:vi.fn(),getCryptoPrice:vi.fn(),getHistoricalPrice:vi.fn(async () => ({price:110,description:"Fixture price"}))}));

import { config, getGroqApiKeys } from "../server/config.js";
import { configuredProviders, generateJSON } from "../server/services/aiProvider.js";
import { requestGroqCompletion, retryAfterSeconds } from "../server/services/groqKeyPool.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { checkOnePrediction } from "../server/services/predictionCheckerService.js";
import { createUsageTracker } from "../server/services/aiUsage.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import request from "supertest";

const original = {...config};
let serial = 0;
const reply = (content = '{"ready":true}') => ({choices:[{message:{content}}],usage:{prompt_tokens:10,completion_tokens:5,total_tokens:15}});
const payload = () => ({model:config.groqModel,messages:[{role:"user",content:"Fixture"}]});
beforeEach(() => {
  vi.resetAllMocks();
  config.groqApiKey = "";
  config.groqApiKeys = [1,2,3].map(slot => `fixture-${++serial}-${slot}`);
  config.aiProvider = "groq";
  config.anthropicApiKey = "fixture-anthropic";
  mocks.groq.mockResolvedValue(reply());
  mocks.anthropic.mockResolvedValue({content:[{type:"text",text:'{"ready":true}'}]});
});
afterEach(() => {Object.assign(config, original);vi.useRealTimers();});

it("uses a trimmed, deduplicated list, with single-key compatibility and explicit list precedence", () => {
  config.groqApiKey = "legacy";
  config.groqApiKeys = [" first ","second","first",""];
  expect(getGroqApiKeys()).toEqual(["first","second"]);
  config.groqApiKeys = [];
  expect(getGroqApiKeys()).toEqual(["legacy"]);
  config.groqApiKey = "";
  expect(configuredProviders()).toEqual([]);
});

it("runs three JSON requests concurrently on three different keys without duplicating work", async () => {
  const pending = [];
  mocks.groq.mockImplementation((key, body) => new Promise(resolve => pending.push({key,body,resolve})));
  const work = ["one","two","three"].map(prompt => generateJSON("JSON only",prompt));
  await vi.waitFor(() => expect(pending).toHaveLength(3));
  expect(pending.map(call => call.key)).toEqual(config.groqApiKeys);
  expect(mocks.groq).toHaveBeenCalledTimes(3);
  pending.forEach(call => call.resolve(reply(JSON.stringify({prompt:call.body.messages[1].content}))));
  expect((await Promise.all(work)).map(result => result.data.prompt)).toEqual(["one","two","three"]);
});

it("rotates sequential requests evenly", async () => {
  for (let index=0;index<6;index++) await generateJSON("JSON only","Check");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([...config.groqApiKeys,...config.groqApiKeys]);
});

it("reuses the free key while other keys still have requests in flight", async () => {
  const pending = [];
  mocks.groq.mockImplementation(key => new Promise(resolve => pending.push({key,resolve})));
  const work = [1,2,3].map(() => requestGroqCompletion(payload()));
  await vi.waitFor(() => expect(pending).toHaveLength(3));
  pending[1].resolve(reply());
  await work[1];
  work.push(requestGroqCompletion(payload()));
  await vi.waitFor(() => expect(pending).toHaveLength(4));
  expect(pending[3].key).toBe(config.groqApiKeys[1]);
  pending.forEach(call => call.resolve(reply()));
  await Promise.all(work);
});

it("skips an invalid key, records each actual attempt and never records credentials", async () => {
  const rejected = config.groqApiKeys[0];
  mocks.groq.mockImplementation(async key => {
    if (key === rejected) throw Object.assign(new Error("Invalid credentials"),{status:401});
    return reply();
  });
  const tracker = createUsageTracker(async () => {});
  await tracker.run(() => generateJSON("JSON only","Check"));
  await tracker.settle();
  expect(tracker.snapshot()).toMatchObject({requestCount:2,totalTokens:15,status:"partial"});
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry"]);
  for (const key of config.groqApiKeys) expect(JSON.stringify(tracker.snapshot())).not.toContain(key);
  await generateJSON("JSON only","Another check");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
});

it("exhausts rejected keys once then falls back to Anthropic in auto mode", async () => {
  config.aiProvider = "auto";
  mocks.groq.mockRejectedValue(Object.assign(new Error("Invalid credentials"),{status:401}));
  expect((await generateJSON("JSON only","Check")).provider).toBe("anthropic");
  expect(mocks.groq).toHaveBeenCalledTimes(3);
  expect((await generateJSON("JSON only","Check again")).provider).toBe("anthropic");
  expect(mocks.groq).toHaveBeenCalledTimes(3);
});

it("does not cycle credentials for permission errors or malformed requests", async () => {
  for (const status of [403,400]) {
    mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Request rejected"),{status}));
    await expect(generateJSON("JSON only","Check")).rejects.toMatchObject({status});
  }
  expect(mocks.groq).toHaveBeenCalledTimes(2);
  expect(mocks.anthropic).not.toHaveBeenCalled();
});

it("honors a shared cooldown before retrying a 429 instead of immediately cycling keys", async () => {
  vi.useFakeTimers();
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}));
  const onRetry = vi.fn();
  const work = generateJSON("JSON only","Check",{onRetry});
  await vi.advanceTimersByTimeAsync(0);
  expect(onRetry).toHaveBeenCalledWith(2);
  await expect(requestGroqCompletion(payload())).rejects.toMatchObject({status:429});
  await vi.advanceTimersByTimeAsync(1000);
  expect(mocks.groq).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1000);
  expect((await work).data.ready).toBe(true);
  expect(mocks.groq).toHaveBeenCalledTimes(2);
});

it("parses numeric and HTTP-date Retry-After headers with a safe default", () => {
  vi.useFakeTimers();vi.setSystemTime(new Date("2026-11-10T00:00:00Z"));
  expect(retryAfterSeconds({headers:new Headers({"retry-after":"Tue, 10 Nov 2026 00:00:05 GMT"})})).toBe(5);
  expect(retryAfterSeconds({headers:{"retry-after":"2.5"}})).toBe(3);
  expect(retryAfterSeconds({headers:{"retry-after":"invalid"}})).toBe(30);
});

it("sends no requests or retries if usage persistence fails", async () => {
  const tracker = createUsageTracker(async () => {throw new Error("Storage unavailable");});
  await expect(tracker.run(() => generateJSON("JSON only","Check"))).rejects.toMatchObject({code:"AI_USAGE_SAVE_FAILED"});
  expect(mocks.groq).not.toHaveBeenCalled();expect(mocks.anthropic).not.toHaveBeenCalled();
});

it("shares key selection between JSON, image reading and prediction explanations", async () => {
  await generateJSON("JSON only","Check");
  mocks.groq.mockResolvedValueOnce(reply("Readable image text"));
  expect(await readDocument(Buffer.from("fixture"),"image/png")).toMatchObject({method:"groq-vision",text:"Readable image text"});
  const store = {updateSignalPrediction:vi.fn(async (_id, result) => result)};
  mocks.groq.mockResolvedValueOnce(reply("The fixture prediction was correct."));
  const result = await checkOnePrediction({id:"fixture-signal",predictionTicker:"BTC",predictionAssetType:"crypto",predictionDirection:"up",predictionTargetPrice:110,baselinePrice:100,baselineFetchedAt:"2026-01-01T00:00:00Z",predictionCheckDate:"2026-01-02T00:00:00Z"},store);
  expect(result.predictionResult).toBe("correct");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(mocks.anthropic).not.toHaveBeenCalled();
});

it("uses the selected image provider and records a real fallback", async () => {
  config.aiProvider = "auto";
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Unavailable"),{status:503}));
  mocks.anthropic.mockResolvedValue({content:[{type:"text",text:"Fallback image text"}],usage:{input_tokens:20,output_tokens:5}});
  const tracker = createUsageTracker(async () => {});
  expect(await tracker.run(() => readDocument(Buffer.from("fixture"),"image/png"))).toMatchObject({method:"claude-vision",text:"Fallback image text"});
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","fallback"]);
  config.aiProvider = "anthropic";
  await readDocument(Buffer.from("fixture"),"image/png");
  expect(mocks.groq).toHaveBeenCalledTimes(1);
});

it("reports list-only configuration and key count to the admin without exposing key values", async () => {
  const store = createMemoryStore();
  const admin = await store.ensureAdminAccount({fullName:"Admin",email:"admin@fixture.test",passwordHash:"unused"});
  const app = createApp(store,{backgroundJobs:false});
  const response = await request(app).get("/api/agents/readiness").set({Cookie:`mm_token=${createToken(admin)}`});
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({providers:["groq"],groqKeyCount:3,documentImagesConfigured:true});
  for (const key of config.groqApiKeys) expect(response.text).not.toContain(key);
});
