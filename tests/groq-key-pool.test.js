import { beforeEach, afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ groq: vi.fn(), anthropic: vi.fn(), clients: vi.fn() }));
vi.mock("groq-sdk", async () => {
  const actual = await vi.importActual("groq-sdk");
  class MockGroq {
    constructor(options) {
      mocks.clients(options);
      this.chat = {completions:{create:(payload,requestOptions) => mocks.groq(options.apiKey, payload,requestOptions)}};
    }
  }
  MockGroq.APIConnectionError = actual.APIConnectionError;
  MockGroq.APIConnectionTimeoutError = actual.APIConnectionTimeoutError;
  return {...actual, default:MockGroq};
});
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
import { safeAgentError } from "../server/services/agentRuntime.js";
import { APIConnectionError, APIConnectionTimeoutError, APIUserAbortError } from "groq-sdk";
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
  config.geminiApiKey = "";
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

it.each([23, { reason: "provider quota" }])("rotates after HTTP429 with non-string code %j", async (code) => {
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Provider quota reached"), { status: 429, code, headers: new Headers({ "retry-after": "2" }) }));
  const tracker = createUsageTracker(async () => {});
  await expect(tracker.run(() => requestGroqCompletion(payload()))).resolves.toEqual(reply());
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys.slice(0, 2));
  expect(tracker.snapshot().calls).toMatchObject([
    { provider: "groq", status: "failed", trigger: "initial", totalTokens: null },
    { provider: "groq", status: "response_received", trigger: "retry", totalTokens: 15 },
  ]);
});

it("preserves an unclassified native timeout instead of masking it with a string-method error", async () => {
  const error = new DOMException("Timed out", "TimeoutError");
  expect(error.code).toBe(23);
  mocks.groq.mockRejectedValueOnce(error);
  await expect(requestGroqCompletion(payload())).rejects.toBe(error);
  expect(mocks.groq).toHaveBeenCalledTimes(1);
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

it("does not cycle credentials for malformed or unprocessable requests", async () => {
  for (const status of [400,422]) {
    mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Request rejected"),{status}));
    await expect(generateJSON("JSON only","Check")).rejects.toMatchObject({status});
  }
  expect(mocks.groq).toHaveBeenCalledTimes(2);
  expect(mocks.anthropic).not.toHaveBeenCalled();
});

it("tries the next key immediately after 429 and cools down only the key that was limited", async () => {
  vi.useFakeTimers();
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}));
  const onRetry = vi.fn();
  const tracker = createUsageTracker(async () => {});
  expect((await tracker.run(() => generateJSON("JSON only","Check",{onRetry}))).data.ready).toBe(true);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys.slice(0,2));
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry"]);
  expect(onRetry).not.toHaveBeenCalled();
  await requestGroqCompletion(payload());
  await requestGroqCompletion(payload());
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([
    config.groqApiKeys[0],config.groqApiKeys[1],config.groqApiKeys[2],config.groqApiKeys[1],
  ]);
  await vi.advanceTimersByTimeAsync(2000);
  await requestGroqCompletion(payload());
  await requestGroqCompletion(payload());
  expect(mocks.groq.mock.calls.at(-1)[0]).toBe(config.groqApiKeys[0]);
});

it("waits only when every usable key is cooling and resumes at the earliest Retry-After", async () => {
  vi.useFakeTimers();
  const delays = [5,2,9];
  const attempted = new Set();
  mocks.groq.mockImplementation(async key => {
    if (!attempted.has(key)) {
      attempted.add(key);
      throw Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":String(delays[config.groqApiKeys.indexOf(key)])})});
    }
    return reply();
  });
  const onRetry = vi.fn();
  const work = generateJSON("JSON only","Check",{onRetry});
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(onRetry).toHaveBeenCalledWith(2);
  const cooling = await requestGroqCompletion(payload()).catch(error => error);
  expect(cooling.status).toBe(429);
  expect(retryAfterSeconds(cooling)).toBe(2);
  await vi.advanceTimersByTimeAsync(1000);
  expect(mocks.groq).toHaveBeenCalledTimes(3);
  await vi.advanceTimersByTimeAsync(1000);
  expect((await work).data.ready).toBe(true);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([...config.groqApiKeys,config.groqApiKeys[1]]);
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("bounds an all-key 429 retry to one extra sequence before provider fallback", async () => {
  vi.useFakeTimers();
  config.aiProvider = "auto";
  mocks.groq.mockRejectedValue(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}));
  const onRetry = vi.fn();
  const work = generateJSON("JSON only","Check",{onRetry});
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.groq).toHaveBeenCalledTimes(3);
  await vi.advanceTimersByTimeAsync(2000);
  expect((await work).provider).toBe("anthropic");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([...config.groqApiKeys,...config.groqApiKeys]);
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(mocks.anthropic).toHaveBeenCalledTimes(1);
});

it("excludes permanently rejected keys when choosing the earliest usable cooldown", async () => {
  vi.useFakeTimers();
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Invalid credentials"),{status:401}))
    .mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"3"})}))
    .mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"1"})}));
  const cooling = await requestGroqCompletion(payload()).catch(error => error);
  expect(cooling.status).toBe(429);
  expect(retryAfterSeconds(cooling)).toBe(1);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  await vi.advanceTimersByTimeAsync(1000);
  expect(await requestGroqCompletion(payload())).toEqual(reply());
  expect(mocks.groq.mock.calls.at(-1)[0]).toBe(config.groqApiKeys[2]);
});

it("waits for a surviving rate-limited key when the later keys reject authentication", async () => {
  vi.useFakeTimers();
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}))
    .mockRejectedValueOnce(Object.assign(new Error("Invalid credentials"),{status:401}))
    .mockRejectedValueOnce(Object.assign(new Error("Invalid credentials"),{status:401}));
  const onRetry = vi.fn();
  const work = generateJSON("JSON only","Check",{onRetry});
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(onRetry).toHaveBeenCalledWith(2);
  await vi.advanceTimersByTimeAsync(2000);
  expect((await work).provider).toBe("groq");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([...config.groqApiKeys,config.groqApiKeys[0]]);
  expect(mocks.anthropic).not.toHaveBeenCalled();
});

it.each([
  ["HTTP 400", () => Object.assign(new Error("Bad request"),{status:400})],
  ["HTTP 422", () => Object.assign(new Error("Unprocessable request"),{status:422})],
  ["programmer error", () => new TypeError("Unexpected application state")],
  ["user abort", () => new APIUserAbortError()],
])("preserves a concurrent %s even if another call puts the shared key into cooldown", async (_label,makeError) => {
  config.groqApiKeys = [config.groqApiKeys[0]];
  const pending = [];
  mocks.groq.mockImplementation(() => new Promise((resolve,reject) => pending.push({resolve,reject})));
  const first = requestGroqCompletion(payload()).then(value => ({value}),error => ({error}));
  const second = requestGroqCompletion(payload()).then(value => ({value}),error => ({error}));
  await vi.waitFor(() => expect(pending).toHaveLength(2));
  pending[1].reject(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}));
  expect((await second).error.status).toBe(429);
  const error = makeError();
  pending[0].reject(error);
  expect((await first).error).toBe(error);
  expect(mocks.groq).toHaveBeenCalledTimes(2);
});

it("divides the network timeout between ready keys without allocating a share to cooling keys", async () => {
  vi.useFakeTimers({toFake:["Date"]});
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Rate limited"),{status:429,headers:new Headers({"retry-after":"2"})}));
  await requestGroqCompletion(payload(),{timeout:900});
  mocks.clients.mockClear();
  await requestGroqCompletion(payload(),{timeout:900});
  expect(mocks.clients.mock.calls[0][0].apiKey).toBe(config.groqApiKeys[2]);
  expect(mocks.clients.mock.calls[0][0].timeout).toBe(450);
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
  mocks.groq.mockRejectedValue(Object.assign(new Error("Unavailable"),{status:503}));
  mocks.anthropic.mockResolvedValue({content:[{type:"text",text:"Fallback image text"}],usage:{input_tokens:20,output_tokens:5}});
  const tracker = createUsageTracker(async () => {});
  expect(await tracker.run(() => readDocument(Buffer.from("fixture"),"image/png"))).toMatchObject({method:"claude-vision",text:"Fallback image text"});
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry","retry","fallback"]);
  config.aiProvider = "anthropic";
  await readDocument(Buffer.from("fixture"),"image/png");
  expect(mocks.groq).toHaveBeenCalledTimes(3);
});

it.each([403,408,413,500,501,502,503,504,599])("tries a different key after HTTP %s and stops on success", async status => {
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Transient provider failure"),{status}));
  expect((await generateJSON("JSON only","Check")).data.ready).toBe(true);
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys.slice(0,2));
  expect(mocks.anthropic).not.toHaveBeenCalled();
  // Only invalid authentication permanently rejects a key.
  await generateJSON("JSON only","Second check");
  await generateJSON("JSON only","Third check");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual([...config.groqApiKeys,config.groqApiKeys[0]]);
});

it.each([
  ["connection", () => new APIConnectionError({message:"Connection failed"})],
  ["timeout", () => new APIConnectionTimeoutError()],
])("tries another key for an SDK %s error while timeout budget remains", async (_kind,makeError) => {
  mocks.groq.mockRejectedValueOnce(makeError());
  expect(await requestGroqCompletion(payload())).toEqual(reply());
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys.slice(0,2));
});

it("tracks two failed attempts and third-key success without leaking keys or duplicate generation", async () => {
  mocks.groq.mockRejectedValueOnce(Object.assign(new Error("Unavailable"),{status:503}))
    .mockRejectedValueOnce(new APIConnectionError({message:"Connection failed"}));
  const tracker = createUsageTracker(async () => {});
  expect((await tracker.run(() => generateJSON("JSON only","Check"))).data.ready).toBe(true);
  await tracker.settle();
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(mocks.anthropic).not.toHaveBeenCalled();
  expect(tracker.snapshot()).toMatchObject({requestCount:3,totalTokens:15,status:"partial"});
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry","retry"]);
  expect(tracker.snapshot().calls.map(call => call.status)).toEqual(["failed","failed","response_received"]);
  for (const key of config.groqApiKeys) expect(JSON.stringify(tracker.snapshot())).not.toContain(key);
});

it("tries each key once before provider fallback and keeps transient keys eligible next time", async () => {
  config.aiProvider = "auto";
  mocks.groq.mockRejectedValue(Object.assign(new Error("Unavailable"),{status:503}));
  const tracker = createUsageTracker(async () => {});
  expect((await tracker.run(() => generateJSON("JSON only","Check"))).provider).toBe("anthropic");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(mocks.anthropic).toHaveBeenCalledTimes(1);
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry","retry","fallback"]);
  mocks.groq.mockResolvedValue(reply());
  expect((await generateJSON("JSON only","Recovered")).provider).toBe("groq");
  expect(mocks.groq).toHaveBeenCalledTimes(4);
  expect(mocks.anthropic).toHaveBeenCalledTimes(1);
});

it("releases reservations after transient failure while other requests remain active", async () => {
  const pending = [];
  mocks.groq.mockImplementation(key => new Promise((resolve,reject) => pending.push({key,resolve,reject})));
  const work = [1,2,3].map(() => requestGroqCompletion(payload()).then(value => ({value}),error => ({error})));
  await vi.waitFor(() => expect(pending).toHaveLength(3));
  pending[0].reject(Object.assign(new Error("Unavailable"),{status:503}));
  await vi.waitFor(() => expect(pending).toHaveLength(4));
  expect(pending[3].key).toBe(config.groqApiKeys[1]);
  pending[3].resolve(reply());
  expect(await work[0]).toEqual({value:reply()});
  work.push(requestGroqCompletion(payload()).then(value => ({value}),error => ({error})));
  await vi.waitFor(() => expect(pending).toHaveLength(5));
  expect(pending[4].key).toBe(config.groqApiKeys[0]);
  pending.forEach(call => call.resolve(reply()));
  expect((await Promise.all(work)).every(result => !result.error)).toBe(true);
});

it("shares one timeout budget across attempts rather than granting each key a fresh timeout", async () => {
  vi.useFakeTimers({toFake:["Date"]});
  vi.setSystemTime(new Date("2026-11-11T00:00:00Z"));
  mocks.groq.mockImplementationOnce(async () => {
    vi.setSystemTime(Date.now()+300);
    throw Object.assign(new Error("Unavailable"),{status:503});
  });
  expect(await requestGroqCompletion(payload(),{timeout:1000})).toEqual(reply());
  const timeouts = mocks.clients.mock.calls.map(([options]) => options.timeout);
  expect(timeouts[0]).toBeGreaterThanOrEqual(333);
  expect(timeouts[0]).toBeLessThanOrEqual(334);
  expect(timeouts[1]).toBe(350);
  expect(mocks.clients.mock.calls.every(([options]) => options.maxRetries === 0)).toBe(true);
});

it("does not send another attempt once the shared timeout budget is spent", async () => {
  vi.useFakeTimers({toFake:["Date"]});
  vi.setSystemTime(new Date("2026-11-11T00:00:00Z"));
  mocks.groq.mockImplementationOnce(async () => {
    vi.setSystemTime(Date.now()+1000);
    throw new APIConnectionTimeoutError();
  });
  await expect(requestGroqCompletion(payload(),{timeout:1000})).rejects.toThrow();
  expect(mocks.groq).toHaveBeenCalledTimes(1);
  expect(mocks.clients).toHaveBeenCalledTimes(1);
});

it("does not turn programmer errors or AI budget/storage errors into key retries", async () => {
  for (const error of [new TypeError("Unexpected application state"),new APIUserAbortError(),Object.assign(new Error("Budget reached"),{code:"AI_TOKEN_LIMIT",status:503}),Object.assign(new Error("Storage failed"),{code:"AI_USAGE_SAVE_FAILED",status:503})]) {
    mocks.groq.mockRejectedValueOnce(error);
    await expect(requestGroqCompletion(payload())).rejects.toBe(error);
  }
  expect(mocks.groq).toHaveBeenCalledTimes(4);
});

it("aborts an expired network attempt before trying the next key and leaves no background request", async () => {
  vi.useFakeTimers();
  const active = new Set();
  mocks.groq.mockImplementationOnce((_key,_payload,options) => new Promise((_resolve,reject) => {
    active.add(options.signal);
    options.signal.addEventListener("abort",() => {
      active.delete(options.signal);
      reject(new APIUserAbortError());
    },{once:true});
  }));
  const work = requestGroqCompletion(payload(),{timeout:900}).then(value => ({value}),error => ({error}));
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.groq).toHaveBeenCalledTimes(1);
  expect(active.size).toBe(1);
  await vi.advanceTimersByTimeAsync(300);
  expect(await work).toEqual({value:reply()});
  expect(mocks.groq).toHaveBeenCalledTimes(2);
  expect(mocks.groq.mock.calls[0][2].signal.aborted).toBe(true);
  expect(active.size).toBe(0);
  await vi.advanceTimersByTimeAsync(1000);
  expect(mocks.groq).toHaveBeenCalledTimes(2);
});

it("deducts time spent saving usage before allocating a network attempt timeout", async () => {
  vi.useFakeTimers({toFake:["Date"]});
  vi.setSystemTime(new Date("2026-11-11T00:00:00Z"));
  let writes = 0;
  const tracker = createUsageTracker(async () => {
    if (++writes === 1) vi.setSystemTime(Date.now()+300);
  });
  expect(await tracker.run(() => requestGroqCompletion(payload(),{timeout:900}))).toEqual(reply());
  expect(mocks.clients.mock.calls[0][0].timeout).toBe(200);
});

it("tries each key once on 413 before provider fallback without starting a cooldown", async () => {
  config.aiProvider = "auto";
  const onRetry = vi.fn();
  mocks.groq.mockRejectedValue(Object.assign(new Error("Request exceeds token allowance"),{status:413}));
  const tracker = createUsageTracker(async () => {});
  expect((await tracker.run(() => generateJSON("JSON only","Oversized fixture",{onRetry}))).provider).toBe("anthropic");
  expect(mocks.groq.mock.calls.map(([key]) => key)).toEqual(config.groqApiKeys);
  expect(tracker.snapshot().calls.map(call => call.trigger)).toEqual(["initial","retry","retry","fallback"]);
  expect(onRetry).not.toHaveBeenCalled();
  mocks.groq.mockResolvedValue(reply());
  expect((await generateJSON("JSON only","Small fixture")).provider).toBe("groq");
  expect(mocks.groq).toHaveBeenCalledTimes(4);
});

it("turns an oversized provider response into an actionable error without leaking its raw details", () => {
  const message = safeAgentError(Object.assign(new Error("Request too large org_private_fixture gsk_fixture_secret Requested 16476"),{status:413}));
  expect(message).toMatch(/too large|too big|request size/i);
  expect(message).not.toMatch(/org_private_fixture|gsk_fixture_secret|16476/);
  expect(message).toMatch(/shorten|reduce|provider|model/i);
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
