import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import request from "supertest";
import { generate, generateSecret } from "otplib";
import { createApp } from "../server/app.js";
import { config } from "../server/config.js";
import { createToken, hashPassword } from "../server/auth.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createSupabaseStore } from "../server/store/supabaseStore.js";

const originalEnabled = config.twoFactorEnabled;
const password = "Fixture123!";
const cookie = (user) => ({ Cookie: `mm_token=${createToken(user)}` });
let passwordHash, store, admin, user, app;
let caseNumber = 0;
const login = (target = app) => request(target).post("/api/auth/login").set("X-Forwarded-For", `192.0.2.${caseNumber}`);
beforeAll(async () => { passwordHash = await hashPassword(password); });
beforeEach(async () => {
  caseNumber++;
  config.twoFactorEnabled = true;
  store = createMemoryStore();
  admin = await store.ensureAdminAccount({ fullName: "Admin", email: "admin@example.test", passwordHash });
  user = await store.createUserProfile({ fullName: "User", email: "user@example.test", passwordHash, requestedRoles: ["investor"] });
  await store.updateApproval(user.id, { status: "approved", approvedRoles: ["investor"] });
  user = await store.findUserById(user.id);
  app = createApp(store, { backgroundJobs: false });
});
afterEach(() => {
  config.twoFactorEnabled = originalEnabled;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Two-factor server switch", () => {
  it.each([[undefined, true], ["true", true], ["false", false], [" FALSE ", false], ["invalid", true]])(
    "loads TWO_FACTOR_ENABLED=%s as %s", (value, expected) => {
      const env = { ...process.env, NODE_ENV: "test" };
      if (value === undefined) delete env.TWO_FACTOR_ENABLED;
      else env.TWO_FACTOR_ENABLED = value;
      const output = execFileSync(process.execPath, ["--input-type=module", "-e",
        "import { config } from './server/config.js'; process.stdout.write(String(config.twoFactorEnabled));"],
      { env, encoding: "utf8" });
      expect(output).toBe(String(expected));
    },
  );

  it.each(["admin", "user"])("pauses OTP for %s without reading or deleting the saved factor", async (role) => {
    const account = role === "admin" ? admin : user;
    const secret = generateSecret();
    await store.setTwoFASecret(account.id, secret, true);
    config.twoFactorEnabled = false;
    const lookup = vi.spyOn(store, "getTwoFASecret").mockRejectedValue(new Error("Must not read a paused factor"));
    const signedIn = await login().send({ email: account.email, password }).expect(200);
    expect(signedIn.headers["set-cookie"][0]).toContain("mm_token=");
    const wrongPassword = await login().send({ email: account.email, password: "wrong-password" }).expect(401);
    expect(wrongPassword.headers["set-cookie"]).toBeUndefined();
    expect(lookup).not.toHaveBeenCalled();
    lookup.mockRestore();
    expect(await store.getTwoFASecret(account.id)).toMatchObject({ secret, enabled: true });

    config.twoFactorEnabled = true;
    const blocked = await login().send({ email: account.email, password }).expect(401);
    expect(blocked.body.code).toBe("TWO_FACTOR_REQUIRED");
    expect(blocked.headers["set-cookie"]).toBeUndefined();
    await login().send({ email: account.email, password, otp: await generate({ secret }) }).expect(200);
  });

  it("reports the pause and blocks enrollment/changes while preserving existing secrets", async () => {
    const secret = generateSecret();
    await store.setTwoFASecret(admin.id, secret, true);
    config.twoFactorEnabled = false;
    const lookup = vi.spyOn(store, "getTwoFASecret");
    await request(app).get("/api/2fa/status").expect(401);
    const status = await request(app).get("/api/2fa/status").set(cookie(admin)).expect(200);
    expect(status.body).toEqual({ available: false, enabled: false });
    for (const action of ["setup", "verify", "validate", "disable"]) {
      const response = await request(app)[action === "disable" ? "delete" : "post"](`/api/2fa/${action}`)
        .set(cookie(admin)).send({ code: "123456" }).expect(503);
      expect(response.body.code).toBe("TWO_FACTOR_DISABLED");
    }
    expect(lookup).not.toHaveBeenCalled();
    expect(await store.getTwoFASecret(admin.id)).toMatchObject({ secret, enabled: true });
  });

  it("still blocks suspended and unapproved accounts while OTP is off", async () => {
    config.twoFactorEnabled = false;
    await store.adminMutate(admin.id, "user.suspension", user.id, { suspended: true, reason: "Fixture" });
    await login().send({ email: user.email, password }).expect(403);
    const pending = await store.createUserProfile({ fullName: "Pending", email: "pending@example.test", passwordHash, requestedRoles: ["investor"] });
    const blocked = await login().send({ email: pending.email, password }).expect(403);
    expect(blocked.body.code).toBe("PENDING_APPROVAL");
    expect(blocked.headers["set-cookie"]).toBeUndefined();
  });

  it("does not sign in when an enabled factor cannot be read", async () => {
    vi.spyOn(store, "getTwoFASecret").mockRejectedValue(new Error("Factor storage unavailable"));
    const result = await login().send({ email: admin.email, password }).expect(500);
    expect(result.headers["set-cookie"]).toBeUndefined();
    expect(result.body.token).toBeUndefined();
  });
});

describe("Supabase authenticator storage and login", () => {
  function supabaseFixture() {
    const rows = new Map();
    // Exercise the actual Supabase client/query serialization without production
    // credentials. Only the PostgREST HTTP boundary is replaced.
    const fetch = vi.fn(async (input, init) => {
      const req = new Request(input, init);
      const url = new URL(req.url);
      expect(url.origin).toBe("https://fixture.supabase.test");
      expect(url.pathname).toBe("/rest/v1/two_fa_secrets");
      const userId = url.searchParams.get("user_id")?.replace(/^eq\./, "");
      if (req.method === "POST") {
        const row = await req.json();
        expect(url.searchParams.get("on_conflict")).toBe("user_id");
        expect(req.headers.get("prefer")).toContain("resolution=merge-duplicates");
        rows.set(row.user_id, row);
        return Response.json(row);
      }
      expect(userId).toBeTruthy();
      if (req.method === "DELETE") {
        rows.delete(userId);
        return new Response(null, { status: 204 });
      }
      expect(req.method).toBe("GET");
      return Response.json(rows.has(userId) ? [rows.get(userId)] : []);
    });
    vi.stubGlobal("fetch", fetch);
    const persisted = createSupabaseStore({ supabaseUrl: "https://fixture.supabase.test", supabaseServiceRoleKey: "fixture-only-key" });
    return { persisted, rows, fetch };
  }

  it("saves pending factors, activates them, scopes reads/deletes to their user and preserves other users", async () => {
    const { persisted, rows } = supabaseFixture();
    expect(await persisted.getTwoFASecret(admin.id)).toBeNull();
    const secret = generateSecret();
    expect(await persisted.setTwoFASecret(admin.id, secret, false)).toEqual({ userId: admin.id, secret, enabled: false });
    await persisted.setTwoFASecret(user.id, generateSecret(), true);
    await persisted.setTwoFASecret(admin.id, secret, true);
    expect(rows.size).toBe(2);
    expect(await persisted.getTwoFASecret(admin.id)).toEqual({ userId: admin.id, secret, enabled: true });
    await persisted.removeTwoFASecret(admin.id);
    expect(await persisted.getTwoFASecret(admin.id)).toBeNull();
    expect((await persisted.getTwoFASecret(user.id)).enabled).toBe(true);
  });

  it("logs in with Supabase storage and enforces an enrolled factor", async () => {
    const { persisted, fetch } = supabaseFixture();
    vi.spyOn(persisted, "findUserByEmail").mockResolvedValue(admin);
    const persistedApp = createApp(persisted, { backgroundJobs: false });
    await login(persistedApp).send({ email: admin.email, password }).expect(200);
    const secret = generateSecret();
    await persisted.setTwoFASecret(admin.id, secret, true);
    const blocked = await login(persistedApp).send({ email: admin.email, password }).expect(401);
    expect(blocked.body.code).toBe("TWO_FACTOR_REQUIRED");
    await login(persistedApp).send({ email: admin.email, password, otp: await generate({ secret }) }).expect(200);
    fetch.mockResolvedValue(Response.json({ code: "42501", message: "Permission denied" }, { status: 403 }));
    const denied = await login(persistedApp).send({ email: admin.email, password }).expect(500);
    expect(denied.headers["set-cookie"]).toBeUndefined();
  });
});
