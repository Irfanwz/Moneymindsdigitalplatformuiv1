import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createSupabaseStore } from "../server/store/supabaseStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { productionConfigurationErrors, shouldSeedDemoProfiles } from "../server/bootstrapPolicy.js";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("UAT bootstrap safeguards", () => {
  it("actually exits production startup before allowing an in-memory database", () => {
    const cwd = mkdtempSync(join(tmpdir(), "moneyminds-config-test-"));
    try {
      const result = spawnSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(new URL("../server/config.js", import.meta.url).href)})`], {
        cwd, encoding: "utf8", env: { SystemRoot: process.env.SystemRoot || "", PATH: process.env.PATH || "", NODE_ENV: "production", CLIENT_ORIGIN: "https://fixture.example", JWT_SECRET: "fixture-".repeat(6), ADMIN_EMAIL: "admin@example.test", ADMIN_PASSWORD: "FixtureStrong123!" },
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Production requires persistent storage");
    } finally { rmdirSync(cwd); }
  });
  it("requires an explicit demo seed flag and never auto-seeds production", () => {
    expect(shouldSeedDemoProfiles("production", "true")).toBe(false);
    expect(shouldSeedDemoProfiles("development", undefined)).toBe(false);
    expect(shouldSeedDemoProfiles("development", "true")).toBe(true);
    const valid = { nodeEnv: "production", supabaseUrl: "https://fixture.example", supabaseServiceRoleKey: "fixture", jwtSecret: "a".repeat(40), adminPassword: "StrongPassword123!" };
    expect(productionConfigurationErrors(valid)).toEqual([]);
    expect(productionConfigurationErrors({ ...valid, supabaseUrl: "", jwtSecret: "short", adminPassword: "short" })).toHaveLength(3);
    expect(productionConfigurationErrors({ nodeEnv: "development" })).toEqual([]);
  });
  it("preserves existing administrator credentials and refuses to elevate an ordinary account", async () => {
    const store = createMemoryStore();
    const input = { fullName: "Admin", email: "admin@example.test", passwordHash: "original" };
    const user = await store.ensureAdminAccount(input);
    await store.updateUserPassword(user.id, "user-changed-password");
    expect((await store.ensureAdminAccount({ ...input, passwordHash: "env-password" })).passwordHash).toBe("user-changed-password");
    await store.createUserProfile({ ...input, email: "ordinary@example.test", requestedRoles: ["investor"] });
    await expect(store.ensureAdminAccount({ ...input, email: "ordinary@example.test" })).rejects.toThrow("non-administrator");
    expect((await store.findUserByEmail("ordinary@example.test")).isAdmin).toBe(false);
  });
  it("uses Supabase conflict-ignore semantics and preserves the stored password on restart", async () => {
    const calls = [];
    vi.stubGlobal("fetch", async (url, init) => {
      calls.push({ url: String(url), init });
      const data = init.method === "POST" ? [] : { id: "admin", email: "admin@example.test", password_hash: "saved-password", is_admin: true, status: "approved" };
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const store = createSupabaseStore({ supabaseUrl: "https://fixture.example", supabaseServiceRoleKey: "fixture-key" });
    const user = await store.ensureAdminAccount({ fullName: "Admin", email: "admin@example.test", passwordHash: "env-password" });
    expect(user.passwordHash).toBe("saved-password");
    expect(new Headers(calls[0].init.headers).get("Prefer")).toContain("resolution=ignore-duplicates");
    expect(calls).toHaveLength(2);
    expect(calls[1].init.method).toBe("GET");
  });
  it("sends notification ownership in the database UPDATE itself", async () => {
    const calls = [];
    vi.stubGlobal("fetch", async (url, init) => {
      calls.push({ url: new URL(url), init });
      return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const store = createSupabaseStore({ supabaseUrl: "https://fixture.example", supabaseServiceRoleKey: "fixture-key" });
    expect(await store.markNotificationRead("notification-id", "caller-id")).toBeNull();
    expect(calls[0].init.method).toBe("PATCH");
    expect(calls[0].url.searchParams.get("id")).toBe("eq.notification-id");
    expect(calls[0].url.searchParams.get("user_id")).toBe("eq.caller-id");
  });
  it("preserves database verification fields in all three profile mappings", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ id: "profile", user_id: "user", is_verified: true, verified_at: "2026-11-21T00:00:00Z" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const store = createSupabaseStore({ supabaseUrl: "https://fixture.example", supabaseServiceRoleKey: "fixture-key" });
    for (const read of ["findStartupProfileByUserId", "findAdvisorProfileByUserId", "findInvestorProfileByUserId"]) {
      expect(await store[read]("user")).toMatchObject({ isVerified: true, verifiedAt: "2026-11-21T00:00:00Z" });
    }
  });
});

describe("UAT public error responses", () => {
  it("health confirms availability without disclosing storage or user counts", async () => {
    const app = createApp(createMemoryStore(), { backgroundJobs: false });
    expect((await request(app).get("/api/health")).body).toEqual({ ok: true });
  });
  it("hides raw database errors while preserving expected client error messages", async () => {
    const store = createMemoryStore();
    const user = await store.ensureAdminAccount({ fullName: "Admin", email: "admin@example.test", passwordHash: "unused" });
    const app = createApp(store, { backgroundJobs: false });
    const spy = vi.spyOn(store, "listNotificationsByUser").mockRejectedValue(Object.assign(new Error("database-secret/path/schema"), { code: "SQL_INTERNAL" }));
    const first = await request(app).get("/api/notifications").set({ Cookie: `mm_token=${createToken(user)}` });
    expect(first.status).toBe(500);
    expect(first.body.referenceId).toMatch(/^[a-f0-9-]{36}$/);
    expect(JSON.stringify(first.body)).not.toMatch(/database-secret|SQL_INTERNAL/);
    spy.mockRejectedValue(Object.assign(new Error("Invalid page."), { status: 400 }));
    expect((await request(app).get("/api/notifications").set({ Cookie: `mm_token=${createToken(user)}` })).body.message).toBe("Invalid page.");
    const malformed = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send('{"secret":');
    expect(malformed.status).toBe(400);
    expect(malformed.body.message).toBe("Invalid JSON request body.");
    expect(malformed.body.referenceId).toBeTruthy();
  });
});
