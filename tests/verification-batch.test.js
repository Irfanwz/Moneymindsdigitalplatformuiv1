import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { config } from "../server/config.js";
import { configuredProviders } from "../server/services/aiProvider.js";
import { runForUser } from "../server/services/verificationAgent.js";
import { processVerificationQueue, queueAgent } from "../server/services/agentService.js";

vi.mock("../server/services/aiProvider.js",()=>({configuredProviders:vi.fn(()=>["fixture"]),generateJSON:vi.fn()}));
vi.mock("../server/services/verificationAgent.js",()=>({runForUser:vi.fn()}));
let store,app,admin,users;
const originalSearch=config.tavilyApiKey;
const originalVercel=process.env.VERCEL;
const auth=u=>({Cookie:`mm_token=${createToken(u)}`});
async function finish(userId,currentStore,progress) {
  await currentStore.createVerification(userId);
  await progress("Reviewing fixture evidence",55);
  return currentStore.updateVerification(userId,{status:"complete",recommendation:"review",summary:"Fixture report"});
}
beforeEach(async()=>{
  vi.restoreAllMocks();vi.clearAllMocks();
  delete process.env.VERCEL;
  config.tavilyApiKey="fixture";
  configuredProviders.mockReturnValue(["fixture"]);
  runForUser.mockImplementation(finish);
  store=createMemoryStore();users=[];
  admin=await store.ensureAdminAccount({fullName:"Admin",email:"batch-admin@example.test",passwordHash:"unused"});
  for(const status of ["pending","approved","rejected"]) {
    const user=await store.createUserProfile({fullName:`Batch ${status}`,email:`batch-${status}@example.test`,passwordHash:"unused",requestedRoles:["investor"]});
    if(status!=="pending") await store.updateApproval(user.id,{status,approvedRoles:status==="approved" ? ["investor"] : [],rejectionReason:"Fixture"});
    users.push(await store.findUserById(user.id));
  }
  app=createApp(store,{backgroundJobs:false});
});
afterEach(async()=>{
  await processVerificationQueue(store);
  config.tavilyApiKey=originalSearch;
  if(originalVercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=originalVercel;
});

describe("Bulk background checks",()=>{
  it("previews all non-admin account statuses without exposing credentials",async()=>{
    await store.createVerification(users[0].id);
    await store.updateVerification(users[0].id,{status:"complete",recommendation:"review"});
    const res=await request(app).get("/api/agents/verification-batch").set(auth(admin)).expect(200);
    expect(res.body.counts).toMatchObject({total:3,eligible:2,complete:1});
    expect(res.body.users.map(u=>u.accountStatus).sort()).toEqual(["approved","pending","rejected"]);
    expect(res.body.users.some(u=>u.userId===admin.id)).toBe(false);
    expect(JSON.stringify(res.body)).not.toContain("password");
  });
  it("requires admin access and rejects invalid modes or unconfigured providers without writes",async()=>{
    for(const method of ["get","post"]) await request(app)[method]("/api/agents/verification-batch").set(auth(users[1])).expect(403);
    await request(app).post("/api/agents/verification-batch/process").set(auth(users[1])).expect(403);
    await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"everything"}).expect(400);
    configuredProviders.mockReturnValue([]);
    await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"}).expect(503);
    expect(await store.listAgentRuns()).toEqual([]);
  });
  it("checks all three account statuses and preserves approval decisions",async()=>{
    const res=await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"}).expect(202);
    expect(res.body.queued).toBe(3);
    await processVerificationQueue(store);
    expect((await store.listAgentRuns()).map(r=>r.status)).toEqual(["completed","completed","completed"]);
    for(const user of users) {
      expect((await store.findVerification(user.id)).status).toBe("complete");
      expect((await store.findUserById(user.id)).status).toBe(user.status);
    }
  });
  it("skips completed reports by default and includes them only for a fresh-check batch",async()=>{
    await store.createVerification(users[0].id);
    await store.updateVerification(users[0].id,{status:"complete",summary:"Keep existing report"});
    expect((await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"})).body.queued).toBe(2);
    await processVerificationQueue(store);
    expect((await store.findVerification(users[0].id)).summary).toBe("Keep existing report");
    expect((await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"all"})).body.queued).toBe(3);
    await processVerificationQueue(store);
    expect(runForUser).toHaveBeenCalledTimes(5);
  });
  it("serializes work and does not enqueue duplicates on repeated starts",async()=>{
    let release;
    const gate=new Promise(r=>{release=r;});
    let active=0,maxActive=0;
    runForUser.mockImplementation(async(...args)=>{
      active++;maxActive=Math.max(maxActive,active);
      try {await gate;return await finish(...args);} finally {active--;}
    });
    try {
      await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"}).expect(202);
      await vi.waitFor(()=>expect(runForUser).toHaveBeenCalledTimes(1));
      const duplicate=await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"all"});
      expect(duplicate.body.queued).toBe(0);
      expect(await store.listAgentRuns()).toHaveLength(3);
      release();
      await Promise.all([processVerificationQueue(store),processVerificationQueue(store)]);
      expect(runForUser).toHaveBeenCalledTimes(3);expect(maxActive).toBe(1);
    } finally {release();await processVerificationQueue(store);}
  });
  it("keeps unconfigured signup work queued and processes it after setup",async()=>{
    config.tavilyApiKey="";
    await queueAgent(store,{userId:users[0].id,agentKey:"verification",targetId:users[0].id});
    await processVerificationQueue(store);
    expect(runForUser).not.toHaveBeenCalled();
    expect((await store.listAgentRuns())[0].status).toBe("queued");
    config.tavilyApiKey="fixture";
    await processVerificationQueue(store);
    expect((await store.listAgentRuns())[0].status).toBe("completed");
  });
  it("resumes persisted queued jobs and continues after one profile fails",async()=>{
    for(const user of users) await queueAgent(store,{userId:user.id,agentKey:"verification",targetId:user.id},{dispatch:false});
    runForUser.mockImplementation(async(userId,currentStore,progress)=>{
      if(userId===users[1].id) return {status:"failed",summary:"No evidence for this fixture"};
      return finish(userId,currentStore,progress);
    });
    await processVerificationQueue(store);
    const runs=await store.listAgentRuns();
    expect(runs.filter(r=>r.status==="completed")).toHaveLength(2);
    expect(runs.filter(r=>r.status==="failed")).toHaveLength(1);
  });
  it("processes one saved check per serverless invocation",async()=>{
    process.env.VERCEL="1";
    for(const user of users) await queueAgent(store,{userId:user.id,agentKey:"verification",targetId:user.id},{dispatch:false});
    await processVerificationQueue(store);
    expect((await store.listAgentRuns({status:"queued"}))).toHaveLength(2);
    await processVerificationQueue(store);
    expect((await store.listAgentRuns({status:"queued"}))).toHaveLength(1);
    await processVerificationQueue(store);
  });
  it("reports a partial save and preserves already queued work for retry",async()=>{
    const create=store.createAgentRun.bind(store);let calls=0;
    vi.spyOn(store,"createAgentRun").mockImplementation(async(...args)=>{
      if(++calls===2) throw new Error("Storage unavailable");
      return create(...args);
    });
    const res=await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"}).expect(503);
    expect(res.body).toMatchObject({partial:true,queued:1});
    await processVerificationQueue(store);
    expect((await store.listAgentRuns())[0].status).toBe("completed");
    const retry=await request(app).post("/api/agents/verification-batch").set(auth(admin)).send({mode:"missing"}).expect(202);
    expect(retry.body.queued).toBe(2);
    await processVerificationQueue(store);
    expect(runForUser).toHaveBeenCalledTimes(3);
  });
});
