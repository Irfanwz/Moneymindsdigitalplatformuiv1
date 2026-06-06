import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { hashPassword } from "../server/auth.js";

let app;
let store;
let adminToken;
let userToken;
let userId;

beforeAll(async () => {
  store = createMemoryStore();

  // Seed admin
  const adminHash = await hashPassword("Admin123!");
  await store.ensureAdminAccount({ fullName: "Admin", email: "admin@test.local", passwordHash: adminHash });

  // Seed approved user
  const userHash = await hashPassword("Password123!");
  const user = await store.createUserProfile({
    fullName: "Test User",
    email: "user@test.local",
    passwordHash: userHash,
    phone: "",
    location: "",
    bio: "",
    requestedRoles: ["startup"],
  });
  userId = user.id;
  await store.updateApproval(user.id, { status: "approved", approvedRoles: ["startup"], adminNotes: "", rejectionReason: "", approvedBy: "admin" });

  app = createApp(store);
});

describe("Health", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("Auth", () => {
  it("POST /api/auth/login fails with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login succeeds for admin", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: "Admin123!" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.isAdmin).toBe(true);
    adminToken = res.body.token;
  });

  it("POST /api/auth/login succeeds for approved user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.local", password: "Password123!" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    userToken = res.body.token;
  });

  it("GET /api/auth/me returns current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("user@test.local");
  });

  it("GET /api/auth/me fails without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/register-profile rejects short password", async () => {
    const res = await request(app)
      .post("/api/auth/register-profile")
      .send({ fullName: "New User", email: "new@test.local", password: "short", requestedRoles: ["startup"] });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/forgot-password does not leak token in response", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "user@test.local" });
    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBeUndefined();
  });
});

describe("Role routing", () => {
  it("Startup profile requires startup role", async () => {
    const res = await request(app)
      .get("/api/startup/profile")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it("Investor profile is denied for startup user", async () => {
    const res = await request(app)
      .get("/api/investor/profile")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("Admin routes require admin role", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("Admin can list users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

describe("Trainings", () => {
  it("GET /api/trainings returns list", async () => {
    const res = await request(app)
      .get("/api/trainings")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trainings)).toBe(true);
  });

  it("POST /api/trainings denied for non-advisor", async () => {
    const res = await request(app)
      .post("/api/trainings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Test Training", type: "free" });
    expect(res.status).toBe(403);
  });
});

describe("Payments", () => {
  it("GET /api/payments returns empty list for new user", async () => {
    const res = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
  });
});
