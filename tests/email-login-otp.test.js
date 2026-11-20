import { beforeEach, afterEach, it, expect, vi } from "vitest";
import request from "supertest";
vi.mock("../server/email.js", () => ({ sendLoginOtpEmail: vi.fn(), sendWelcomeEmail: vi.fn(), sendPasswordResetEmail: vi.fn(), sendApprovalEmail: vi.fn(), sendRejectionEmail: vi.fn() }));
import { sendLoginOtpEmail } from "../server/email.js";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { hashPassword } from "../server/auth.js";
import { config } from "../server/config.js";
const original = config.emailOtpEnabled;
beforeEach(() => { config.emailOtpEnabled = true; vi.clearAllMocks(); });
afterEach(() => { config.emailOtpEnabled = original; });

it("requires the emailed code before issuing a session and prevents reuse", async () => {
  const store = createMemoryStore();
  await store.ensureAdminAccount({ fullName: "Fixture", email: "otp@example.test", passwordHash: await hashPassword("Fixture123!") });
  const app = createApp(store, { backgroundJobs: false });
  const login = await request(app).post("/api/auth/login").send({ email: "otp@example.test", password: "Fixture123!" }).expect(200);
  expect(login.body.code).toBe("EMAIL_OTP_REQUIRED");
  expect(login.headers["set-cookie"]).toBeUndefined();
  const code = sendLoginOtpEmail.mock.calls[0][2];
  const verified = await request(app).post("/api/auth/verify-login-otp").send({ email: "otp@example.test", otp: code }).expect(200);
  expect(verified.headers["set-cookie"][0]).toContain("mm_token=");
  await request(app).post("/api/auth/verify-login-otp").send({ email: "otp@example.test", otp: code }).expect(401);
});

it("expires codes, replaces previous codes, and limits incorrect attempts", async () => {
  const store = createMemoryStore();
  await store.createEmailLoginOtp("fixture", "1234", new Date(0).toISOString());
  expect(await store.verifyEmailLoginOtp("fixture", "1234")).toMatchObject({ reason: "expired" });
  const expiry = new Date(Date.now() + 60000).toISOString();
  await store.createEmailLoginOtp("fixture", "1234", expiry);
  await store.createEmailLoginOtp("fixture", "5678", expiry);
  for (let n = 2; n >= 0; n--) expect(await store.verifyEmailLoginOtp("fixture", "1234")).toMatchObject({ valid: false, attemptsLeft: n });
  expect(await store.verifyEmailLoginOtp("fixture", "5678")).toMatchObject({ valid: false, reason: "max_attempts" });
});

it("returns JSON 404 for an unknown API route", async () => {
  const app = createApp(createMemoryStore(), { backgroundJobs: false });
  const response = await request(app).get("/api/unknown-route").expect(404);
  expect(response.body.code).toBe("API_NOT_FOUND");
  expect(response.headers["content-type"]).toContain("application/json");
});
