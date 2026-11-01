import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import PDFDocument from "pdfkit";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { executeTrackedRun, AgentSkipped } from "../server/services/agentRuntime.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { queueSignalAgents, performAgentWork } from "../server/services/agentService.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { searchService } from "../server/services/searchService.js";
import { marketDataService } from "../server/services/marketDataService.js";
import { scheduleSignalPrediction, checkOnePrediction } from "../server/services/predictionCheckerService.js";
import { getStockPrice, getCryptoPrice } from "../server/services/marketPriceFetcher.js";
import { recalculateForAdvisor } from "../server/services/credibilityService.js";
import { runVerification } from "../server/services/profileVerificationService.js";

vi.mock("../server/services/aiProvider.js",()=>({configuredProviders:()=>["test"],generateJSON:vi.fn()}));
vi.mock("../server/services/marketPriceFetcher.js",()=>({getStockPrice:vi.fn(),getCryptoPrice:vi.fn()}));
let store,app,owner,other,admin,signal;
const auth=u=>({Cookie:`mm_token=${createToken(u)}`});
beforeEach(async()=>{
  vi.restoreAllMocks(); vi.clearAllMocks();
  generateJSON.mockRejectedValue(new Error("Provider unavailable"));
  getStockPrice.mockResolvedValue(null); getCryptoPrice.mockResolvedValue(100);
  store=createMemoryStore();
  async function user(name){
    const u=await store.createUserProfile({fullName:name,email:`${name}@example.test`,passwordHash:"unused",requestedRoles:["advisor","investor"]});
    await store.updateApproval(u.id,{status:"approved",approvedRoles:["advisor","investor"]});
    return store.findUserById(u.id);
  }
  owner=await user("Owner"); other=await user("Other");
  admin=await store.ensureAdminAccount({fullName:"Admin",email:"admin@example.test",passwordHash:"unused"});
  const group=await store.createGroup(owner.id,{name:"Fixture",description:"Test",category:"crypto",isPaid:false,isPrivate:false});
  signal=await store.createSignal(group.id,owner.id,{title:"BTC outlook",content:"Bitcoin could rise over the next week",signalType:"buy",postType:"signal",tags:[],attachments:[]});
  app=createApp(store,{backgroundJobs:false});
});

describe("Tracked agent execution",()=>{
  it("persists real steps, results and times; duplicate dispatch executes once",async()=>{
    const run=await store.createAgentRun({userId:owner.id,agentKey:"profile-quality"});
    expect((await store.createAgentRun({userId:owner.id,agentKey:"profile-quality"})).id).toBe(run.id);
    const work=vi.fn(async progress=>{await progress("Reading saved profile",30);return {summary:"A real saved result"};});
    await Promise.all([executeTrackedRun(store,run,work),executeTrackedRun(store,run,work)]);
    const saved=await store.getAgentRun(run.id);
    expect(work).toHaveBeenCalledTimes(1);
    expect(saved).toMatchObject({status:"completed",progress:100,result:{summary:"A real saved result"}});
    expect(saved.events.map(e=>e.stage)).toEqual(["Queued","Starting","Reading saved profile","Result saved"]);
    expect(saved.startedAt).toBeTruthy(); expect(saved.completedAt).toBeTruthy();
  });
  it("saves provider failure without fabricated result or exposed key",async()=>{
    const run=await store.createAgentRun({userId:owner.id,agentKey:"profile-quality"});
    const saved=await executeTrackedRun(store,run,async()=>{throw new Error("Invalid gsk_secret123");});
    expect(saved.status).toBe("failed"); expect(saved.result).toBeNull(); expect(saved.error).not.toContain("gsk_secret");
  });
  it("distinguishes no eligible work from success",async()=>{
    const run=await store.createAgentRun({userId:owner.id,agentKey:"prediction-check"});
    const saved=await executeTrackedRun(store,run,async()=>{throw new AgentSkipped("Nothing is due");});
    expect(saved.status).toBe("skipped"); expect(saved.error).toBe("Nothing is due");
  });
  it("allows cookie sessions, scopes users' runs, and lets admin inspect all",async()=>{
    const run=await store.createAgentRun({userId:owner.id,agentKey:"investor-1"});
    expect((await request(app).get("/api/agents/runs").set(auth(owner))).body.runs).toHaveLength(1);
    expect((await request(app).get("/api/agents/runs").set(auth(other))).body.runs).toHaveLength(0);
    expect((await request(app).get("/api/agents/runs").set(auth(admin))).body.runs).toHaveLength(1);
    expect((await request(app).post(`/api/agents/runs/${run.id}/execute`).set(auth(other))).status).toBe(404);
    expect((await request(app).get("/api/agents/readiness").set(auth(other))).status).toBe(403);
    expect((await request(app).post("/api/agents/runs").set(auth(other)).send({agentKey:"signal-sentiment",targetId:signal.id})).status).toBe(404);
  });
  it("persists follows per user instead of presenting fake subscriptions",async()=>{
    await request(app).put("/api/agents/follows/1").set(auth(owner)).send({enabled:true}).expect(200);
    expect((await request(app).get("/api/agents/catalog").set(auth(owner))).body.follows).toEqual(["1"]);
    expect((await request(app).get("/api/agents/catalog").set(auth(other))).body.follows).toEqual([]);
  });
  it("returns setup failures instead of accepting unsaved work",async()=>{
    vi.spyOn(store,"createAgentRun").mockRejectedValue(Object.assign(new Error("Run the repair SQL"),{status:503}));
    const res=await request(app).post("/api/agents/runs").set(auth(owner)).send({agentKey:"investor-1"});
    expect(res.status).toBe(503); expect(res.body.run).toBeUndefined();
  });
});

describe("Signal and research pipelines",()=>{
  it("publishing through the API starts both agents for the correct advisor",async()=>{
    const res=await request(app).post(`/api/advisor/groups/${signal.groupId}/signals`).set(auth(owner)).send({title:"A newly published signal",content:"BTC outlook",postType:"signal",signalType:"buy"});
    expect(res.status).toBe(201);
    const runs=await store.listAgentRuns({targetId:res.body.signal.id});
    expect(runs.map(r=>r.agentKey).sort()).toEqual(["signal-prediction","signal-sentiment"]);
    expect(runs.every(r=>r.userId===owner.id)).toBe(true);
  });
  it("preserves the original signal after a prediction is scheduled",async()=>{
    await store.updateSignalPrediction(signal.id,{predictionCheckDate:"2099-01-01T00:00:00Z",baselinePrice:100});
    const res=await request(app).put(`/api/advisor/groups/${signal.groupId}/signals/${signal.id}`).set(auth(owner)).send({title:"Changed prediction",content:"Change the direction"});
    expect(res.status).toBe(409);expect((await store.findSignalById(signal.id)).title).toBe("BTC outlook");
  });
  it("dispatches both signal agents and persists sentiment and baseline",async()=>{
    generateJSON.mockImplementation(async(_system,prompt)=>({provider:"test",data:prompt.includes('"sentimentConfidence"') ? {sentiment:"bullish",sentimentConfidence:70,sentimentReasoning:"Positive outlook",riskLevel:"high",riskReasoning:"Volatile",actionability:"medium",actionabilityReasoning:"No price target",entities:[],sectors:["crypto"],keyPoints:["Direction is up"]} : {ticker:"BTC",direction:"up",targetPrice:110,timeframe:"1 week",timeframeDays:7}}));
    await queueSignalAgents(store,signal);
    await vi.waitFor(async()=>expect((await store.listAgentRuns()).every(r=>r.status==="completed")).toBe(true));
    const saved=await store.findSignalById(signal.id);
    expect(saved.sentiment).toBe("bullish");expect(saved.analyzedAt).toBeTruthy();
    expect(saved.predictionTicker).toBe("BTC");expect(saved.baselinePrice).toBe(100);
  });
  it("does not invent an original baseline for historical signals",async()=>{
    generateJSON.mockResolvedValue({provider:"test",data:{ticker:"BTC",direction:"up",targetPrice:110,timeframe:"1 week",timeframeDays:7}});
    const result=await scheduleSignalPrediction(signal.id,{...signal,createdAt:"2020-01-01T00:00:00Z"},store,{strict:true});
    expect(result.eligible).toBe(false);expect(result.checkDate).toBeNull();expect(getCryptoPrice).not.toHaveBeenCalled();
    expect((await store.findSignalById(signal.id)).baselinePrice).toBeNull();
  });
  it("does not score predictions before due or without a saved baseline",async()=>{
    await checkOnePrediction({...signal,predictionTicker:"BTC",predictionDirection:"up",baselinePrice:100,predictionCheckDate:"2099-01-01"},store);
    await checkOnePrediction({...signal,predictionTicker:"BTC",predictionDirection:"up",baselinePrice:null,predictionCheckDate:"2020-01-01"},store);
    expect(getCryptoPrice).not.toHaveBeenCalled();
  });
  it.each([1,2,3,4,5,6])("research agent %s uses retrieved evidence and saves source links",async id=>{
    vi.spyOn(searchService,"batchSearch").mockResolvedValue([{title:"Evidence",url:"https://example.test/evidence",content:"A supplied factual source."}]);
    vi.spyOn(marketDataService,"getMarketSnapshot").mockResolvedValue({crypto:[],timestamp:new Date().toISOString()});
    generateJSON.mockResolvedValue({provider:"test",data:{summary:"Source-based review",sentiment:"neutral",opportunities:[],risks:[],signals:[]}});
    const run=await store.createAgentRun({userId:owner.id,agentKey:`investor-${id}`});
    const saved=await executeTrackedRun(store,run,p=>performAgentWork(store,run,p));
    expect(saved.status).toBe("completed");expect(saved.result.sources).toEqual([{title:"Evidence",url:"https://example.test/evidence"}]);
    expect(generateJSON.mock.calls[0][1]).toContain("A supplied factual source.");
  });
  it("fails research when no sources can be retrieved",async()=>{
    vi.spyOn(searchService,"batchSearch").mockResolvedValue([]);
    vi.spyOn(marketDataService,"getMarketSnapshot").mockResolvedValue({crypto:[],timestamp:new Date().toISOString()});
    await expect(performAgentWork(store,{userId:owner.id,agentKey:"investor-2"},async()=>{})).rejects.toThrow("No current source");
    expect(generateJSON).not.toHaveBeenCalled();
  });
  it("keeps an existing credibility score if signal reads fail",async()=>{
    vi.spyOn(store,"listSignalsByAdvisor").mockRejectedValue(new Error("Database unavailable"));
    const update=vi.spyOn(store,"updateAdvisorCredibility");
    await expect(recalculateForAdvisor(owner.id,store)).rejects.toThrow("Database unavailable");
    expect(update).not.toHaveBeenCalled();
  });
  it("checks due predictions then saves a credibility score and history",async()=>{
    await store.upsertAdvisorProfile(owner.id,{title:"Fixture advisor",expertiseAreas:[],industries:[],certifications:[]});
    for(let i=0;i<5;i++) {
      const created=await store.createSignal(signal.groupId,owner.id,{title:`Prediction ${i}`,content:"BTC up",tags:[]});
      const due=await store.updateSignalPrediction(created.id,{predictionTicker:"BTC",predictionDirection:"up",baselinePrice:90,predictionTargetPrice:100,predictionCheckDate:"2020-01-01T00:00:00Z"});
      expect((await checkOnePrediction(due,store)).predictionAccuracy).toBe(100);
    }
    const result=await recalculateForAdvisor(owner.id,store);
    expect(result.score).not.toBeNull();expect((await store.getCredibilityHistory(owner.id))).toHaveLength(1);
    expect((await store.findAdvisorProfileByUserId(owner.id)).credibilityScore).toBe(result.score);
  });
  it("does not verify a mismatching credential even if the model is confident",async()=>{
    const pdf=new PDFDocument();const chunks=[];
    const buffer=new Promise(resolve=>{pdf.on("data",chunk=>chunks.push(chunk));pdf.on("end",()=>resolve(Buffer.concat(chunks)));});
    pdf.text("Fixture certificate for a different person");pdf.end();
    generateJSON.mockResolvedValue({provider:"test",data:{verified:true,confidence:99,reasoning:"Different person",extracted:{matches_claim:false}}});
    const record=await store.createProfileVerification({userId:owner.id,docType:"other",docUrl:"local://fixture",claimToVerify:"My certificate",status:"pending"});
    await runVerification({verificationId:record.id,fileBuffer:await buffer,mimeType:"application/pdf",docType:"other",claimToVerify:"My certificate",userProfile:{name:owner.fullName},userId:owner.id,store});
    expect((await store.getProfileVerification(record.id)).status).toBe("rejected");
  });
  it("extracts text from a real PDF with the installed pdf-parse version",async()=>{
    const pdf=new PDFDocument(); const chunks=[];
    const buffer=new Promise(resolve=>{pdf.on("data",chunk=>chunks.push(chunk));pdf.on("end",()=>resolve(Buffer.concat(chunks)));});
    pdf.text("Fixture University - Certificate of Completion");pdf.end();
    const result=await readDocument(await buffer,"application/pdf");
    expect(result.text).toContain("Fixture University");expect(result.method).toBe("pdf-parse");
  });
});
