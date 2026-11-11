import { beforeEach, afterEach, it, expect, vi } from "vitest";
import request from "supertest";
const mocks=vi.hoisted(()=>({groq:vi.fn(),anthropic:vi.fn()}));
vi.mock("groq-sdk",()=>({default:class {constructor({apiKey}) {this.chat={completions:{create:payload=>mocks.groq(apiKey,payload)}};}}}));
vi.mock("@anthropic-ai/sdk",()=>({default:class {messages={create:mocks.anthropic};}}));
vi.mock("../server/services/marketPriceFetcher.js",()=>({getStockPrice:vi.fn(),getCryptoPrice:vi.fn(),getHistoricalPrice:vi.fn(async()=>({price:110,description:"Fixture price"}))}));
import { config } from "../server/config.js";
import { getAiConfig, getAiConfigForAdmin, saveAiConfig, setAiConfigClient, invalidateAiConfig } from "../server/services/aiConfigStore.js";
import { encryptKey, decryptKey } from "../server/services/aiEncryption.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { checkOnePrediction } from "../server/services/predictionCheckerService.js";
import { createUsageTracker, normalizeTokenUsage } from "../server/services/aiUsage.js";
import { executeTrackedRun } from "../server/services/agentRuntime.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";

const original={...config};
let serial=0,row,db,store,admin,app;
const groqReply={choices:[{message:{content:'{"ok":true}'}}],usage:{prompt_tokens:7,completion_tokens:3,total_tokens:10}};
const geminiReply=(text='{"ok":true}',finishReason="STOP")=>({candidates:[{finishReason,content:{parts:[{text:"private reasoning",thought:true},{text}]}}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:4,thoughtsTokenCount:6,totalTokenCount:20,cachedContentTokenCount:2}});
const headers=()=>({Cookie:`mm_token=${createToken(admin)}`});
beforeEach(async()=>{
  vi.resetAllMocks();
  Object.assign(config,{aiProvider:"auto",groqApiKeys:[1,2,3].map(n=>`fixture-groq-${++serial}-${n}`),groqApiKey:"",geminiApiKey:"fixture-gemini",anthropicApiKey:""});
  row=null;
  db={from:vi.fn(()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:row,error:null})})}),upsert:vi.fn(async patch=>{row={...row,...patch};return {error:null};})}))};
  setAiConfigClient(db);
  mocks.groq.mockResolvedValue(groqReply);
  vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify(geminiReply()),{status:200})));
  store=createMemoryStore();
  admin=await store.ensureAdminAccount({fullName:"Fixture Admin",email:"admin@fixture.test",passwordHash:"unused"});
  app=createApp(store,{backgroundJobs:false});
});
afterEach(()=>{Object.assign(config,original);setAiConfigClient(null);vi.unstubAllGlobals();});
async function run(work,agentKey="verification") {
  const entry=await store.createAgentRun({userId:admin.id,agentKey,targetId:`fixture-${++serial}`});
  return executeTrackedRun(store,entry,work);
}

it("shows all four masked environment keys only to a permitted admin",async()=>{
  expect((await request(app).get("/api/admin/ai-config")).status).toBe(401);
  const result=await request(app).get("/api/admin/ai-config").set(headers());
  expect(result.status).toBe(200);expect(result.headers["cache-control"]).toBe("no-store");
  expect(result.body.config.groqKeys).toHaveLength(3);expect(result.body.config.geminiKeys).toHaveLength(1);
  for(const key of [...config.groqApiKeys,config.geminiApiKey]) expect(result.text).not.toContain(key);
  const restricted={...admin,adminRole:"support"};
  const restrictedApp=createApp({...store,findUserById:async()=>restricted},{backgroundJobs:false});
  expect((await request(restrictedApp).get("/api/admin/ai-config").set(headers())).status).toBe(403);
  expect((await request(restrictedApp).put("/api/admin/ai-config").set(headers()).send({dailyTokenLimit:0})).status).toBe(403);
});

it("encrypts a deduplicated pool, and saved keys/models reach the runtime immediately",async()=>{
  await saveAiConfig({activeProvider:"groq",groqKeys:[" saved-key-one ","saved-key-two","saved-key-one"],groqModel:"saved-model"},admin.id);
  expect(row.groq_key_enc).not.toContain("saved-key-one");
  expect(JSON.parse(decryptKey(row.groq_key_enc))).toEqual(["saved-key-one","saved-key-two"]);
  await generateJSON("JSON only","Fixture");await generateJSON("JSON only","Fixture");
  expect(mocks.groq.mock.calls.map(call=>call[0])).toEqual(["saved-key-one","saved-key-two"]);
  expect(mocks.groq.mock.calls[0][1].model).toBe("saved-model");
  expect((await getAiConfigForAdmin()).keySources.groq).toBe("saved settings");
});

it("retains legacy encrypted keys and restores env keys only on explicit reset",async()=>{
  row={groq_key_enc:encryptKey("legacy-saved-key"),active_provider:"groq"};invalidateAiConfig();
  expect((await getAiConfig()).groqApiKeys).toEqual(["legacy-saved-key"]);
  await saveAiConfig({groqKeys:"__CLEAR__"},admin.id);
  expect((await getAiConfig()).groqApiKeys).toEqual(config.groqApiKeys);
});

it("preserves zero, supports no limit, and preserves fields omitted from a partial save",async()=>{
  await saveAiConfig({dailyTokenLimit:0,monthlyTokenLimit:200,agentTokenLimits:{verification:5}},admin.id);
  await saveAiConfig({geminiModel:"gemini-test"},admin.id);
  expect(await getAiConfigForAdmin()).toMatchObject({dailyTokenLimit:0,monthlyTokenLimit:200,agentTokenLimits:{verification:5}});
  const response=await request(app).put("/api/admin/ai-config").set(headers()).send({dailyTokenLimit:null,agentTokenLimits:{}});
  expect(response.status).toBe(200);expect(response.body.config.dailyTokenLimit).toBeNull();expect(response.body.config.agentTokenLimits).toEqual({});
});

it.each([{dailyTokenLimit:-1},{monthlyTokenLimit:1.2},{dailyTokenLimit:"100"},{groqKeys:[]},{groqKeys:[{}]},{activeProvider:"openai"}])("rejects malformed settings %j",async(body)=>{
  expect((await request(app).put("/api/admin/ai-config").set(headers()).send(body)).status).toBe(400);
  expect(row).toBeNull();
});

it("does not silently fall back to environment policy after storage or decryption failures",async()=>{
  row={groq_key_enc:"corrupted"};invalidateAiConfig();
  await expect(generateJSON("JSON","fixture")).rejects.toMatchObject({code:"AI_CONFIG_UNAVAILABLE"});
  expect(mocks.groq).not.toHaveBeenCalled();
  setAiConfigClient({from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({error:{message:"unavailable"}})})})})});
  await expect(getAiConfig()).rejects.toMatchObject({code:"AI_CONFIG_UNAVAILABLE"});
});

it("reports memory-only settings read-only",async()=>{
  setAiConfigClient(null);
  expect((await getAiConfigForAdmin()).memoryMode).toBe(true);
  await expect(saveAiConfig({dailyTokenLimit:0},admin.id)).rejects.toMatchObject({status:501});
});

it("falls back to Gemini and accounts for thinking tokens without exposing keys",async()=>{
  mocks.groq.mockRejectedValue(Object.assign(new Error("Down"),{status:503}));
  const tracker=createUsageTracker(async()=>{});
  expect((await tracker.run(()=>generateJSON("JSON only","fixture"))).provider).toBe("gemini");
  expect(tracker.snapshot().calls.map(call=>call.trigger)).toEqual(["initial","retry","retry","fallback"]);
  expect(tracker.snapshot().calls.at(-1)).toMatchObject({inputTokens:10,outputTokens:10,totalTokens:20,reasoningTokens:6});
  const [url,options]=fetch.mock.calls[0];
  expect(url).not.toContain(config.geminiApiKey);expect(options.headers["x-goog-api-key"]).toBe(config.geminiApiKey);
  expect(JSON.parse(options.body).generationConfig.responseMimeType).toBe("application/json");
  expect(JSON.stringify(tracker.snapshot())).not.toContain(config.geminiApiKey);
});

it("honors Gemini-only selection for JSON and uploaded images",async()=>{
  await saveAiConfig({activeProvider:"gemini",geminiKey:"saved-gemini",geminiModel:"gemini-fixture"},admin.id);
  await generateJSON("JSON only","fixture");
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(geminiReply("Document text"))));
  expect(await readDocument(Buffer.from("fixture"),"image/png")).toEqual({text:"Document text",method:"gemini-vision"});
  expect(mocks.groq).not.toHaveBeenCalled();
  expect(fetch.mock.calls[0][1].headers["x-goog-api-key"]).toBe("saved-gemini");
  expect(JSON.parse(fetch.mock.calls[1][1].body).contents[0].parts[1].inlineData.mimeType).toBe("image/png");
});

it("rejects truncated Gemini responses while preserving their consumed tokens",async()=>{
  await saveAiConfig({activeProvider:"gemini"},admin.id);
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(geminiReply('{"ok":true}',"MAX_TOKENS"))));
  const tracker=createUsageTracker(async()=>{});
  await expect(tracker.run(()=>generateJSON("JSON","fixture"))).rejects.toThrow("invalid or incomplete");
  expect(tracker.snapshot().totalTokens).toBe(20);
});

it("keeps unreported Gemini token counters unknown",()=>{
  expect(normalizeTokenUsage("gemini",{})).toMatchObject({inputTokens:null,outputTokens:null,totalTokens:null});
});

it("blocks a zero daily limit before any provider call, then allows no limit",async()=>{
  await saveAiConfig({dailyTokenLimit:0},admin.id);
  const blocked=await run(()=>generateJSON("JSON","fixture"));
  expect(blocked.status).toBe("failed");expect(blocked.error).toContain("Daily token limit reached");
  expect(blocked.usage.requestCount).toBe(0);expect(mocks.groq).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
  await saveAiConfig({dailyTokenLimit:null},admin.id);
  expect((await run(()=>generateJSON("JSON","fixture"))).status).toBe("completed");
});

it("stops the next per-run call and includes consumption from failed runs in the daily threshold",async()=>{
  await saveAiConfig({agentTokenLimits:{verification:10}},admin.id);
  const result=await run(async()=>{await generateJSON("JSON","one");return generateJSON("JSON","two");});
  expect(result.status).toBe("failed");expect(result.error).toContain("per-run token limit");
  expect(mocks.groq).toHaveBeenCalledTimes(1);expect(result.usage.totalTokens).toBe(10);
  await saveAiConfig({agentTokenLimits:{},dailyTokenLimit:10},admin.id);
  expect((await run(()=>generateJSON("JSON","blocked"))).error).toContain("Daily token limit");
  await saveAiConfig({dailyTokenLimit:20},admin.id);
  expect((await run(()=>generateJSON("JSON","allowed"))).status).toBe("completed");
});

it("uses call timestamps for UTC month limits and does not count last month's usage",async()=>{
  const now=new Date(),month=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)).toISOString();
  const old=new Date(Date.parse(month)-1000).toISOString();
  const entry=await store.createAgentRun({userId:admin.id,agentKey:"verification",targetId:"old"});
  await store.updateAgentRun(entry.id,{status:"failed",usage:{totalTokens:1000,calls:[{startedAt:old,totalTokens:1000}]}});
  await saveAiConfig({monthlyTokenLimit:10},admin.id);
  expect((await run(()=>generateJSON("JSON","first"))).status).toBe("completed");
  expect((await run(()=>generateJSON("JSON","second"))).error).toContain("Monthly token limit");
});

it("requires durable tracking while any token limit is enabled",async()=>{
  await saveAiConfig({monthlyTokenLimit:100},admin.id);
  await expect(generateJSON("JSON","fixture")).rejects.toMatchObject({code:"AI_TOKEN_LIMIT"});
  expect(mocks.groq).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});

it("preserves an actionable limit error when a prediction explanation is blocked",async()=>{
  await saveAiConfig({dailyTokenLimit:0},admin.id);
  const signal={id:"fixture",predictionTicker:"BTC",predictionAssetType:"crypto",predictionDirection:"up",predictionTargetPrice:110,baselinePrice:100,baselineFetchedAt:"2026-01-01T00:00:00Z",predictionCheckDate:"2026-01-02T00:00:00Z"};
  const result=await run(()=>checkOnePrediction(signal,store),"prediction-check");
  expect(result.status).toBe("failed");expect(result.error).toContain("Daily token limit");
  expect(mocks.groq).not.toHaveBeenCalled();
});

it("includes usage beyond the first 200 runs and fails closed when totals cannot be loaded",async()=>{
  for(let index=0;index<201;index++) {
    const entry=await store.createAgentRun({userId:admin.id,agentKey:"verification",targetId:`history-${index}`});
    await store.updateAgentRun(entry.id,{status:"failed",usage:{totalTokens:1,calls:[{startedAt:new Date().toISOString(),totalTokens:1}]}});
  }
  await saveAiConfig({monthlyTokenLimit:201},admin.id);
  expect((await run(()=>generateJSON("JSON","blocked"))).error).toContain("Monthly token limit");
  expect(mocks.groq).not.toHaveBeenCalled();
  store.listAgentRuns=async()=>{throw new Error("Storage unavailable");};
  expect((await run(()=>generateJSON("JSON","blocked"))).error).toContain("usage could not be checked");
  expect(mocks.groq).not.toHaveBeenCalled();
});
