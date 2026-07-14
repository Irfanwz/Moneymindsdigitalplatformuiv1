/**
 * Week 1 Tests — AI Due Diligence Agent Foundation
 * Covers: config, queryBuilder, memoryStore CRUD, admin API endpoints, live Tavily search
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { hashPassword } from "../server/auth.js";
import { buildQueriesForUser } from "../server/services/queryBuilder.js";
import { searchService } from "../server/services/searchService.js";
import { config } from "../server/config.js";

let app;
let store;
let adminToken;
let pendingUserId;

beforeAll(async () => {
  store = createMemoryStore();

  // Admin
  await store.ensureAdminAccount({
    fullName: "Admin",
    email: "admin@test.local",
    passwordHash: await hashPassword("Admin123!"),
  });

  // Pending user (will be verified)
  const pending = await store.createUserProfile({
    fullName: "Jane Smith",
    email: "jane@test.local",
    passwordHash: await hashPassword("Password123!"),
    phone: "+1 555 000 0001",
    location: "London, UK",
    bio: "Fintech startup founder with 5 years experience",
    requestedRoles: ["startup"],
  });
  pendingUserId = pending.id;

  app = createApp(store);

  // Get admin token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.local", password: "Admin123!" });
  adminToken = loginRes.body.token;
});

// ─────────────────────────────────────────────────
// 1. Config
// ─────────────────────────────────────────────────
describe("Config — tavilyApiKey", () => {
  it("tavilyApiKey field exists in config", () => {
    expect(config).toHaveProperty("tavilyApiKey");
  });

  it("tavilyApiKey is a string", () => {
    expect(typeof config.tavilyApiKey).toBe("string");
  });

  it("TAVILY_API_KEY env var is loaded when set", () => {
    // The key is set in .env — if it starts with tvly- the env is loaded
    if (process.env.TAVILY_API_KEY) {
      expect(config.tavilyApiKey).toBe(process.env.TAVILY_API_KEY);
    } else {
      expect(config.tavilyApiKey).toBe("");
    }
  });
});

// ─────────────────────────────────────────────────
// 2. Query Builder
// ─────────────────────────────────────────────────
describe("queryBuilder — buildQueriesForUser", () => {
  it("returns null when fullName is missing", () => {
    expect(buildQueriesForUser({ fullName: "", requestedRoles: ["startup"] })).toBeNull();
    expect(buildQueriesForUser({ fullName: "A", requestedRoles: ["startup"] })).toBeNull();
  });

  it("always includes base queries for every user", () => {
    const queries = buildQueriesForUser({ fullName: "John Doe", requestedRoles: [] });
    expect(queries).toContain('"John Doe" LinkedIn profile');
    expect(queries).toContain('"John Doe" professional background');
    expect(queries).toContain('"John Doe" fraud OR scam OR lawsuit OR criminal');
  });

  it("adds startup-specific queries for startup role", () => {
    const queries = buildQueriesForUser({ fullName: "John Doe", requestedRoles: ["startup"] });
    expect(queries.some((q) => q.includes("startup founder"))).toBe(true);
    expect(queries.some((q) => q.includes("crunchbase"))).toBe(true);
  });

  it("adds investor-specific queries for investor role", () => {
    const queries = buildQueriesForUser({ fullName: "John Doe", requestedRoles: ["investor"] });
    expect(queries.some((q) => q.includes("angel investor"))).toBe(true);
    expect(queries.some((q) => q.includes("angel.co"))).toBe(true);
  });

  it("adds advisor-specific queries for advisor role", () => {
    const queries = buildQueriesForUser({ fullName: "John Doe", requestedRoles: ["advisor"] });
    expect(queries.some((q) => q.includes("financial advisor"))).toBe(true);
    expect(queries.some((q) => q.includes("CFA CFP"))).toBe(true);
  });

  it("combines queries for multiple roles", () => {
    const queries = buildQueriesForUser({
      fullName: "Jane Doe",
      requestedRoles: ["startup", "investor"],
    });
    expect(queries.some((q) => q.includes("startup founder"))).toBe(true);
    expect(queries.some((q) => q.includes("angel investor"))).toBe(true);
  });

  it("returns at least 3 queries for any valid user", () => {
    const queries = buildQueriesForUser({ fullName: "Alice", requestedRoles: [] });
    expect(queries.length).toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────
// 3. MemoryStore — Verification CRUD
// ─────────────────────────────────────────────────
describe("memoryStore — AI verification CRUD", () => {
  it("createVerification returns a running record", async () => {
    const v = await store.createVerification(pendingUserId);
    expect(v.userId).toBe(pendingUserId);
    expect(v.status).toBe("running");
    expect(v.recommendation).toBeNull();
    expect(v.sources).toEqual([]);
  });

  it("findVerification retrieves the record", async () => {
    const v = await store.findVerification(pendingUserId);
    expect(v).not.toBeNull();
    expect(v.userId).toBe(pendingUserId);
  });

  it("updateVerification updates status and report fields", async () => {
    await store.updateVerification(pendingUserId, {
      status: "complete",
      recommendation: "accept",
      confidence: 88,
      credibilityScore: 75,
      summary: "Strong LinkedIn presence found.",
      findings: { linkedin_found: true, red_flags: [] },
      reportMarkdown: "## Due Diligence\n\nAll clear.",
      sources: [{ url: "https://linkedin.com/in/janesmith", title: "Jane Smith", relevance: 0.95 }],
      redFlags: [],
      searchQueriesRun: 6,
    });

    const v = await store.findVerification(pendingUserId);
    expect(v.status).toBe("complete");
    expect(v.recommendation).toBe("accept");
    expect(v.confidence).toBe(88);
    expect(v.credibilityScore).toBe(75);
    expect(v.sources).toHaveLength(1);
    expect(v.completedAt).not.toBeNull();
  });

  it("createVerification again resets the record (retry behavior)", async () => {
    const v = await store.createVerification(pendingUserId);
    expect(v.status).toBe("running");
    expect(v.recommendation).toBeNull();
  });

  it("listVerifications returns all records", async () => {
    const list = await store.listVerifications();
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("listVerifications filters by status", async () => {
    await store.updateVerification(pendingUserId, { status: "failed" });
    const failed = await store.listVerifications({ status: "failed" });
    expect(failed.every((v) => v.status === "failed")).toBe(true);
  });

  it("getVerificationSummary returns correct counts", async () => {
    const summary = await store.getVerificationSummary();
    expect(summary).toHaveProperty("total");
    expect(summary).toHaveProperty("running");
    expect(summary).toHaveProperty("complete");
    expect(summary).toHaveProperty("failed");
    expect(summary).toHaveProperty("accept");
    expect(summary).toHaveProperty("review");
    expect(summary).toHaveProperty("reject");
    expect(summary.total).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────
// 4. Admin API — Verification Endpoints
// ─────────────────────────────────────────────────
describe("Admin API — verification endpoints", () => {
  beforeAll(async () => {
    // Put a known verification in store for the pending user
    await store.createVerification(pendingUserId);
    await store.updateVerification(pendingUserId, {
      status: "complete",
      recommendation: "review",
      confidence: 55,
      credibilityScore: 50,
      summary: "Limited online presence.",
      findings: { linkedin_found: false, red_flags: [] },
      reportMarkdown: "## Report\n\nLimited data.",
      sources: [],
      redFlags: [],
      searchQueriesRun: 3,
    });
  });

  it("GET /api/admin/users/:id/verification returns the report", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${pendingUserId}/verification`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.verification.userId).toBe(pendingUserId);
    expect(res.body.verification.recommendation).toBe("review");
  });

  it("GET /api/admin/users/:id/verification returns 404 for unknown user", async () => {
    const res = await request(app)
      .get("/api/admin/users/00000000-0000-0000-0000-000000000000/verification")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("GET /api/admin/verifications/summary returns counts", async () => {
    const res = await request(app)
      .get("/api/admin/verifications/summary")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.summary).toHaveProperty("total");
    expect(res.body.summary.total).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/admin/users/:id/verification/retry responds immediately", async () => {
    const res = await request(app)
      .post(`/api/admin/users/${pendingUserId}/verification/retry`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/re-queued/i);
  });

  it("Verification endpoints require admin auth", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${pendingUserId}/verification`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────
// 5. Live Tavily Search (skipped if no key)
// ─────────────────────────────────────────────────
describe("searchService — Tavily live call", () => {
  it("returns empty array gracefully when API key is missing", async () => {
    // searchService never throws
    const results = await searchService.search("");
    expect(Array.isArray(results)).toBe(true);
  });

  it("batchSearch with empty queries returns []", async () => {
    const results = await searchService.batchSearch([]);
    expect(results).toEqual([]);
  });

  it.skipIf(!config.tavilyApiKey)("live search returns results for a real query", async () => {
    const results = await searchService.search('"Elon Musk" LinkedIn profile');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("url");
    expect(results[0]).toHaveProperty("content");
  });

  it.skipIf(!config.tavilyApiKey)("batchSearch deduplicates results by URL", async () => {
    // Same query twice — should deduplicate
    const results = await searchService.batchSearch([
      '"Elon Musk" investor',
      '"Elon Musk" investor',
    ]);
    const urls = results.map((r) => r.url);
    const uniqueUrls = new Set(urls);
    expect(urls.length).toBe(uniqueUrls.size);
  });
});
