import express from "express";
import request from "supertest";
import { expect, it, vi } from "vitest";

async function fixture(emailOtpEnabled) {
  vi.resetModules();
  const {config}=await import("../server/config.js");
  config.emailOtpEnabled=emailOtpEnabled;
  const {createAuthRouter}=await import("../server/routes/auth.js");
  const app=express();
  app.use(express.json());
  app.use("/auth",createAuthRouter({}));
  // Invalid inputs exercise the guards without account access or sending mail.
  return app;
}

it("does not apply the five-request OTP limit when email OTP is disabled",async()=>{
  const app=await fixture(false);
  for(let attempt=0;attempt<6;attempt++) {
    const response=await request(app).post("/auth/login").send({});
    expect(response.status).toBe(400);
    expect(response.headers["ratelimit-limit"]).toBe("10");
  }
});

it("keeps the OTP request limit when email OTP is enabled",async()=>{
  const app=await fixture(true);
  for(let attempt=0;attempt<5;attempt++) expect((await request(app).post("/auth/login").send({})).status).toBe(400);
  const blocked=await request(app).post("/auth/login").send({});
  expect(blocked.status).toBe(429);
  expect(blocked.body.message).toContain("Too many OTP requests");
  expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
});

it("preserves the normal login rate limit when email OTP is disabled",async()=>{
  const app=await fixture(false);
  for(let attempt=0;attempt<10;attempt++) expect((await request(app).post("/auth/login").send({})).status).toBe(400);
  const blocked=await request(app).post("/auth/login").send({});
  expect(blocked.status).toBe(429);
  expect(blocked.body.message).toBe("Too many requests, please try again later.");
});
