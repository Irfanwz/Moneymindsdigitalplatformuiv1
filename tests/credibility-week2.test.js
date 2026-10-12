/**
 * Credibility Score System — Week 2 Tests
 * Covers: API routes, fee cap enforcement on group create/update, advisor profile fields
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { hashPassword } from "../server/auth.js";

let app, store, advisorToken, advisorId;

beforeAll(async () => {
  store = createMemoryStore();

  // Create advisor user
  const advisorHash = await hashPassword("Advisor123!");
  const advisor = await store.createUserProfile({
    fullName: "Cred Advisor", email: "cred-advisor@test.com", passwordHash: advisorHash,
    phone: "", location: "", bio: "", requestedRoles: ["advisor"],
  });
  advisorId = advisor.id;
  await store.updateApproval(advisorId, { status: "approved", approvedRoles: ["advisor"], adminNotes: "", rejectionReason: "", approvedBy: "admin" });
  await store.upsertAdvisorProfile(advisorId, {
    title: "Cred Advisor", bio: "Test", website: "", linkedin: "", twitter: "",
    contactEmail: "cred-advisor@test.com", yearsExperience: null, clientsHelped: null,
    specialization: "", previousRoles: "", expertiseAreas: [],
    certifications: [], industries: [], preferredStage: "",
    engagementType: "", availability: "", typicalRate: "",
    servicesOffered: "", defaultGroupType: "free",
    defaultJoiningFee: "0", defaultMonthlyFee: "0",
    autoApproveMembers: true, allowGroupDiscovery: true,
    enablePaymentProcessing: false, paymentEmail: "", taxId: "",
    isPublic: true, showContactInfo: true, allowConnectionRequests: true,
    showTestimonials: true,
  });

  app = createApp(store);

  // Login
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "cred-advisor@test.com", password: "Advisor123!" });
  advisorToken = loginRes.body.token;
});

// ─── Credibility API Routes ─────────────────────────────────────────────────

describe("GET /api/credibility/me", () => {
  it("returns null score for advisor with no predictions", async () => {
    const res = await request(app)
      .get("/api/credibility/me")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.score).toBeNull();
    expect(res.body.tier).toBeNull();
  });

  it("returns score after credibility is updated", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 78,
      credibilityTier: "expert",
      credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .get("/api/credibility/me")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(78);
    expect(res.body.tier).toBe("expert");
    expect(res.body.label).toBe("Expert");
    expect(res.body.color).toBe("green");
    expect(res.body.maxJoinFee).toBe(500);
    expect(res.body.maxMonthlyFee).toBe(200);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/credibility/me");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/credibility/history", () => {
  it("returns history entries after adding them", async () => {
    await store.addCredibilityHistory(advisorId, {
      score: 78, tier: "expert", totalPredictions: 20,
      breakdown: { perfect: 10, late: 5, dateOnly: 3, incorrect: 2 },
    });
    const res = await request(app)
      .get("/api/credibility/history")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history.length).toBeGreaterThanOrEqual(1);
    expect(res.body.history[0].score).toBe(78);
  });

  it("respects limit parameter", async () => {
    const res = await request(app)
      .get("/api/credibility/history?limit=1")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/credibility/tiers", () => {
  it("returns all 6 tiers", async () => {
    const res = await request(app)
      .get("/api/credibility/tiers")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.tiers).toHaveLength(6);
    expect(res.body.tiers[0].tier).toBe("elite");
    expect(res.body.tiers[5].tier).toBe("poor");
  });
});

describe("POST /api/credibility/check-fee", () => {
  it("allows fees within cap", async () => {
    const res = await request(app)
      .post("/api/credibility/check-fee")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ joiningFee: 200, monthlyFee: 100 });
    expect(res.status).toBe(200);
    expect(res.body.allowed).toBe(true);
  });

  it("rejects fees above cap", async () => {
    const res = await request(app)
      .post("/api/credibility/check-fee")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ joiningFee: 600, monthlyFee: 100 });
    expect(res.status).toBe(200);
    expect(res.body.allowed).toBe(false);
    expect(res.body.reason).toContain("$500");
  });
});

describe("POST /api/credibility/recalculate", () => {
  it("recalculates and returns result", async () => {
    const res = await request(app)
      .post("/api/credibility/recalculate")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("recalculated");
    expect(res.body).toHaveProperty("breakdown");
    expect(res.body).toHaveProperty("totalPredictions");
  });
});

// ─── Fee Cap Enforcement on Group Create ───────────────────────────────────

describe("group create: fee cap enforcement", () => {
  it("allows creating free group regardless of score", async () => {
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Free Group", description: "Test", category: "crypto", isPaid: false, joiningFee: "0", monthlyFee: "0" });
    expect(res.status).toBe(201);
  });

  it("allows paid group within fee cap", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 78, credibilityTier: "expert", credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Expert Paid", description: "Test", category: "stocks", isPaid: true, joiningFee: "300", monthlyFee: "150" });
    expect(res.status).toBe(201);
  });

  it("rejects paid group exceeding fee cap", async () => {
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Overpriced", description: "Test", category: "crypto", isPaid: true, joiningFee: "600", monthlyFee: "100" });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("$500");
    expect(res.body.maxJoinFee).toBe(500);
  });

  it("rejects paid group when advisor has null score", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: null, credibilityTier: null, credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "No Score Paid", description: "Test", category: "crypto", isPaid: true, joiningFee: "50", monthlyFee: "0" });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("5 checked predictions");
  });

  it("elite advisor can set any fee", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 95, credibilityTier: "elite", credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Elite Premium", description: "Unlimited", category: "crypto", isPaid: true, joiningFee: "5000", monthlyFee: "2000" });
    expect(res.status).toBe(201);
  });

  it("poor tier advisor is blocked from any fees", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 10, credibilityTier: "poor", credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Poor Paid", description: "Blocked", category: "crypto", isPaid: true, joiningFee: "1", monthlyFee: "0" });
    expect(res.status).toBe(403);
  });

  it("developing tier caps at $50/$25", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 45, credibilityTier: "developing", credibilityUpdatedAt: new Date().toISOString(),
    });
    // Within cap
    const ok = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Dev OK", description: "Test", category: "crypto", isPaid: true, joiningFee: "50", monthlyFee: "25" });
    expect(ok.status).toBe(201);

    // Over cap
    const fail = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Dev Fail", description: "Test", category: "crypto", isPaid: true, joiningFee: "51", monthlyFee: "25" });
    expect(fail.status).toBe(403);
  });
});

// ─── Fee Cap Enforcement on Group Update ───────────────────────────────────

describe("group update: fee cap enforcement", () => {
  let groupId;

  beforeAll(async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 78, credibilityTier: "expert", credibilityUpdatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/advisor/groups")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Update Test", description: "Test", category: "stocks", isPaid: false, joiningFee: "0", monthlyFee: "0" });
    groupId = res.body.group.id;
  });

  it("allows update within fee cap", async () => {
    const res = await request(app)
      .put(`/api/advisor/groups/${groupId}`)
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Update Test", description: "Updated", category: "stocks", isPaid: true, joiningFee: "200", monthlyFee: "100" });
    expect(res.status).toBe(200);
  });

  it("rejects update exceeding fee cap", async () => {
    const res = await request(app)
      .put(`/api/advisor/groups/${groupId}`)
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ name: "Update Test", description: "Overcharge", category: "stocks", isPaid: true, joiningFee: "800", monthlyFee: "300" });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Expert");
  });
});

// ─── Advisor Profile includes credibility fields ───────────────────────────

describe("advisor profile: credibility fields", () => {
  it("GET /api/advisor/profile includes credibility score and tier", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 85, credibilityTier: "expert", credibilityUpdatedAt: "2026-10-12T00:00:00Z",
    });
    const res = await request(app)
      .get("/api/advisor/profile")
      .set("Authorization", `Bearer ${advisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.credibilityScore).toBe(85);
    expect(res.body.profile.credibilityTier).toBe("expert");
    expect(res.body.profile.credibilityUpdatedAt).toBe("2026-10-12T00:00:00Z");
  });
});
