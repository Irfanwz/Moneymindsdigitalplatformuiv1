import express from "express";
import request from "supertest";
import { expect, it, vi } from "vitest";

vi.mock("../server/services/verificationBatch.js",()=>({
  requireVerificationSetup:vi.fn(async()=>{throw Object.assign(new Error("Fixture setup unavailable"),{status:503});}),
  verificationOverview:vi.fn(),
  queueVerificationBatch:vi.fn(),
}));

async function fixture({enabled=false,mode="test",otp=true}={}) {
  vi.resetModules();
  const {config}=await import("../server/config.js");
  Object.assign(config,{rateLimitsEnabled:enabled,nodeEnv:mode,emailOtpEnabled:otp});
  const [{createAuthRouter},{createAgentsRouter},{createToken}]=await Promise.all([
    import("../server/routes/auth.js"),import("../server/routes/agents.js"),import("../server/auth.js"),
  ]);
  const admin={id:"fixture-admin",email:"admin@fixture.test",isAdmin:true,adminRole:"super_admin",status:"approved"};
  const store={findUserById:async()=>admin,findUserByEmail:async()=>null};
  const app=express();
  app.use(express.json());
  app.use("/auth",createAuthRouter(store));
  app.use("/agents",createAgentsRouter(store));
  app.use((error,_req,res,_next)=>res.status(error.status || 500).json({message:error.message}));
  return {app,auth:{Authorization:`Bearer ${createToken(admin)}`}};
}

it.each(["development","test"])("bypasses auth and OTP request limits in %s without bypassing validation",async(mode)=>{
  const {app}=await fixture({mode});
  for(let attempt=0;attempt<16;attempt++) {
    const response=await request(app).post("/auth/login").send({});
    expect(response.status).toBe(400);
    expect(response.headers["ratelimit-limit"]).toBeUndefined();
  }
  const invalidCredentials=await request(app).post("/auth/login").send({email:"missing@fixture.test",password:"NotARealPassword123!"});
  expect(invalidCredentials.status).toBe(401);
});

it.each(["production","staging"])("keeps the auth limit in %s even with the testing flag off",async(mode)=>{
  const {app}=await fixture({mode,otp:false});
  for(let attempt=0;attempt<10;attempt++) expect((await request(app).post("/auth/login").send({})).status).toBe(400);
  expect((await request(app).post("/auth/login").send({})).status).toBe(429);
});

it("keeps production OTP request limits when email OTP is enabled",async()=>{
  const {app}=await fixture({mode:"production"});
  for(let attempt=0;attempt<5;attempt++) expect((await request(app).post("/auth/login").send({})).status).toBe(400);
  const response=await request(app).post("/auth/login").send({});
  expect(response.status).toBe(429);
  expect(response.body.message).toContain("OTP");
});

it("bypasses both agent request limits during testing while still requiring authentication",async()=>{
  const {app,auth}=await fixture();
  expect((await request(app).post("/agents/runs").send({})).status).toBe(401);
  for(let attempt=0;attempt<14;attempt++) expect((await request(app).post("/agents/runs").set(auth).send({})).status).toBe(400);
  for(let attempt=0;attempt<22;attempt++) {
    const response=await request(app).post("/agents/verification-batch/process").set(auth).send({});
    expect(response.status).toBe(503);
    expect(response.body.message).toBe("Fixture setup unavailable");
    expect(response.headers["ratelimit-limit"]).toBeUndefined();
  }
});

it.each([{enabled:true,mode:"test"},{enabled:false,mode:"production"}])("enforces both agent limits with %j",async(options)=>{
  const {app,auth}=await fixture(options);
  for(let attempt=0;attempt<12;attempt++) expect((await request(app).post("/agents/runs").set(auth).send({})).status).toBe(400);
  expect((await request(app).post("/agents/runs").set(auth).send({})).status).toBe(429);
  for(let attempt=0;attempt<20;attempt++) expect((await request(app).post("/agents/verification-batch/process").set(auth).send({})).status).toBe(503);
  expect((await request(app).post("/agents/verification-batch/process").set(auth).send({})).status).toBe(429);
});
