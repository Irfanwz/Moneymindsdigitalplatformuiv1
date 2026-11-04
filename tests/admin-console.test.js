import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
  vi,
} from "vitest";
import request from "supertest";
import { generate } from "otplib";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createToken, hashPassword } from "../server/auth.js";
import { config } from "../server/config.js";
vi.mock("../server/email.js", () => ({
  sendWelcomeEmail: vi.fn(),
  sendApprovalEmail: vi.fn(),
  sendRejectionEmail: vi.fn(),
  sendPaymentReceiptEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));
let app, store, admin, user, passwordHash;
const auth = (u) => ({ Cookie: `mm_token=${createToken(u)}` });
const settings = {
  registrationOpen: true,
  maintenanceMode: false,
  requireBackgroundCheck: false,
};
const originalEnv = config.nodeEnv;
beforeAll(async () => {
  passwordHash = await hashPassword("Fixture123!");
});
beforeEach(async () => {
  store = createMemoryStore();
  admin = await store.ensureAdminAccount({
    fullName: "Admin",
    email: "admin@example.test",
    passwordHash,
  });
  user = await store.createUserProfile({
    fullName: "Test User",
    email: "user@example.test",
    passwordHash,
    requestedRoles: ["investor"],
    bio: "Fixture",
  });
  await store.updateApproval(user.id, {
    status: "approved",
    approvedRoles: ["investor"],
  });
  user = await store.findUserById(user.id);
  app = createApp(store, { backgroundJobs: false });
});
afterEach(() => {
  config.nodeEnv = originalEnv;
});
const action = (who, kind, target, payload) =>
  request(app)
    .post("/api/admin/console/actions")
    .set(auth(who))
    .send({ action: kind, targetId: target, payload });

describe("Admin console permissions and persistence", () => {
  it("denies ordinary users every admin read and mutation", async () => {
    for (const path of [
      "overview",
      "users",
      "reviews",
      "content",
      "payments",
      "audit",
      "settings",
    ])
      await request(app)
        .get(`/api/admin/console/${path}`)
        .set(auth(user))
        .expect(403);
    await action(user, "settings.update", "platform", settings).expect(403);
    expect(await store.listAdminAudit()).toHaveLength(0);
  });
  it("persists settings, blocks registration and permits admin access during maintenance", async () => {
    await action(admin, "settings.update", "platform", {
      ...settings,
      registrationOpen: false,
      maintenanceMode: true,
    }).expect(200);
    const restarted = createApp(store, { backgroundJobs: false });
    expect(
      (
        await request(restarted)
          .get("/api/admin/console/settings")
          .set(auth(admin))
      ).body.settings.maintenanceMode,
    ).toBe(true);
    await request(app).get("/api/auth/me").set(auth(user)).expect(503);
    await request(app).get("/api/auth/me").set(auth(admin)).expect(200);
    await request(app)
      .post("/api/auth/register-profile")
      .send({
        fullName: "Closed Account",
        email: "closed@example.test",
        password: "Fixture123!",
        phone: "+923001234567", city: "Lahore", country: "Pakistan",
        profiles: { investor: { investorType: "Individual", title: "Engineer", investmentThesis: "Early stage companies" } },
        requestedRoles: ["investor"],
      })
      .expect(503);
    await action(admin, "settings.update", "platform", settings).expect(200);
    await request(app).get("/api/auth/me").set(auth(user)).expect(200);
    expect(await store.listAdminAudit()).toHaveLength(2);
  });
  it("suspension blocks existing sessions and login, then reactivation restores access", async () => {
    await action(admin, "user.suspension", user.id, {
      suspended: true,
      reason: "Review requested",
    }).expect(200);
    await request(app).get("/api/auth/me").set(auth(user)).expect(403);
    await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Fixture123!" })
      .expect(403);
    await action(admin, "user.suspension", user.id, {
      suspended: false,
      reason: "Review complete",
    }).expect(200);
    await request(app).get("/api/auth/me").set(auth(user)).expect(200);
    expect((await store.findUserById(user.id)).status).toBe("approved");
  });
  it("enforces reviewer, finance and support permissions even with stale tokens", async () => {
    await action(admin, "user.admin_role", user.id, {
      role: "reviewer",
    }).expect(200);
    await request(app)
      .get("/api/admin/console/reviews")
      .set(auth(user))
      .expect(200);
    await action(user, "settings.update", "platform", settings).expect(403);
    await request(app)
      .get("/api/admin/console/payments")
      .set(auth(user))
      .expect(403);
    await action(admin, "user.admin_role", user.id, { role: "finance" }).expect(
      200,
    );
    await request(app)
      .get("/api/admin/console/payments")
      .set(auth(user))
      .expect(200);
    await request(app).get("/api/admin/users").set(auth(user)).expect(403);
    await request(app).get("/api/agents/runs").set(auth(user)).expect(403);
    await request(app)
      .post("/api/admin/predictions/check-now")
      .set(auth(user))
      .expect(403);
    await request(app)
      .get("/api/export/admin/users.csv")
      .set(auth(user))
      .expect(403);
    await action(admin, "user.admin_role", user.id, { role: "support" }).expect(
      200,
    );
    await request(app)
      .get("/api/admin/console/content")
      .set(auth(user))
      .expect(200);
    await action(user, "user.suspension", admin.id, {
      suspended: true,
      reason: "Attempt",
    }).expect(403);
    await action(admin, "user.admin_role", user.id, { role: null }).expect(200);
    await request(app)
      .get("/api/admin/console/content")
      .set(auth(user))
      .expect(403);
  });
  it("protects the active admin from self lockout and validates input", async () => {
    await action(admin, "user.admin_role", admin.id, {
      role: "finance",
    }).expect(400);
    await action(admin, "user.suspension", admin.id, {
      suspended: true,
      reason: "Self",
    }).expect(403);
    await action(admin, "settings.update", "platform", {
      maintenanceMode: "false",
    }).expect(400);
    await action(admin, "user.suspension", user.id, {
      suspended: true,
      reason: "",
    }).expect(400);
    await action(admin, "user.admin_role", user.id, {
      role: "anything",
    }).expect(400);
    expect(await store.listAdminAudit()).toHaveLength(0);
  });
  it("requires completed background evidence when configured but leaves the decision to admin", async () => {
    await action(admin, "settings.update", "platform", {
      ...settings,
      requireBackgroundCheck: true,
    }).expect(200);
    const approve = () =>
      request(app)
        .patch(`/api/admin/users/${user.id}/approval`)
        .set(auth(admin))
        .send({ status: "approved", approvedRoles: ["startup"] });
    await approve().expect(400);
    await store.createVerification(user.id);
    await store.updateVerification(user.id, {
      status: "complete",
      recommendation: "review",
    });
    await approve().expect(200);
    expect((await store.findUserById(user.id)).approvedRoles).toEqual([
      "startup",
    ]);
    expect((await store.listAdminAudit())[0].action).toBe("user.approval");
  });
  it("requires a rejection reason and blocks old sessions after rejection", async () => {
    await request(app)
      .patch(`/api/admin/users/${user.id}/approval`)
      .set(auth(admin))
      .send({ status: "rejected" })
      .expect(400);
    await request(app)
      .patch(`/api/admin/users/${user.id}/approval`)
      .set(auth(admin))
      .send({ status: "rejected", rejectionReason: "Incomplete evidence" })
      .expect(200);
    await request(app).get("/api/auth/me").set(auth(user)).expect(403);
  });
  it("saves reviewer assignment and notes, and does not expose password hashes", async () => {
    await action(admin, "review.update", user.id, {
      assignedTo: admin.id,
      state: "in_review",
      notes: "Check source identity",
    }).expect(200);
    const res = await request(app)
      .get(`/api/admin/console/users/${user.id}`)
      .set(auth(admin))
      .expect(200);
    expect(res.body.review.notes).toBe("Check source identity");
    expect(JSON.stringify(res.body)).not.toContain(passwordHash);
    expect((await store.listAdminAudit())[0].details.notes).toBe(
      "Check source identity",
    );
    await action(admin, "review.update", user.id, {
      assignedTo: user.id,
      state: "open",
      notes: "",
    }).expect(400);
  });
  it("computes actual approval durations rather than pending counts", async () => {
    const res = await request(app)
      .get("/api/admin/console/overview")
      .set(auth(admin))
      .expect(200);
    expect(res.body.users).toMatchObject({ total: 1, approved: 1, pending: 0 });
    expect(res.body.averageApprovalHours).toBeTypeOf("number");
    expect(res.body.averageApprovalHours).toBeLessThan(1);
    await store.createVerification(user.id);
    await store.updateVerification(user.id,{status:'complete'});
    await store.adminMutate(admin.id,'user.admin_role',user.id,{role:'finance'});
    const afterPromotion=await request(app).get('/api/admin/console/overview').set(auth(admin)).expect(200);
    expect(afterPromotion.body.users.total).toBe(0);
    expect(afterPromotion.body.backgroundChecks.complete).toBe(0);
  });
});

describe("Moderation and payment access", () => {
  it("hides groups and their signals from direct reads and browsing, and restores them", async () => {
    const group = await store.createGroup(admin.id, {
      name: "Moderation group",
      description: "Fixture",
      category: "general",
      isPaid: false,
      isPrivate: false,
    });
    const signal = await store.createSignal(group.id, admin.id, {
      title: "Fixture signal",
      content: "Evidence",
      tags: [],
    });
    await action(admin, "content.moderate", group.id, {
      entityType: "group",
      hidden: true,
      reason: "Needs review",
    }).expect(200);
    expect(await store.findGroupById(group.id)).toBeNull();
    expect(await store.listSignalsByGroup(group.id)).toEqual([]);
    expect(await store.findSignalById(signal.id)).toBeNull();
    await request(app)
      .get(`/api/advisor/groups/${group.id}`)
      .set(auth(user))
      .expect(404);
    expect(
      (
        await request(app).get("/api/admin/console/content").set(auth(admin))
      ).body.items.find((i) => i.id === group.id).hidden,
    ).toBe(true);
    await action(admin, "content.moderate", group.id, {
      entityType: "group",
      hidden: false,
      reason: "Reviewed",
    }).expect(200);
    expect((await store.findGroupById(group.id)).name).toBe("Moderation group");
  });
  it("blocks hidden trainings in browse, direct lookup, enrollment and checkout", async () => {
    const training = await store.createTraining(admin.id, {
      title: "Hidden training",
      type: "paid",
      price: 20,
      topics: [],
      targetAudience: [],
      capacity: 10,
      enrolled: 0,
    });
    await action(admin, "content.moderate", training.id, {
      entityType: "training",
      hidden: true,
      reason: "Incorrect details",
    }).expect(200);
    expect(await store.listTrainings()).toEqual([]);
    await request(app)
      .get(`/api/trainings/${training.id}`)
      .set(auth(user))
      .expect(404);
    await request(app)
      .post(`/api/trainings/${training.id}/enroll`)
      .set(auth(user))
      .expect(404);
    await request(app)
      .post("/api/payments/checkout")
      .set(auth(user))
      .send({ itemType: "training", itemId: training.id })
      .expect(404);
  });
  it("does not permit direct unpaid enrollment or production simulated checkout", async () => {
    const training = await store.createTraining(admin.id, {
      title: "Paid training",
      type: "paid",
      price: 20,
      topics: [],
      targetAudience: [],
      capacity: 10,
      enrolled: 0,
    });
    await request(app)
      .post(`/api/trainings/${training.id}/enroll`)
      .set(auth(user))
      .expect(402);
    config.nodeEnv = "production";
    for (const route of ["checkout", "create-intent"])
      await request(app)
        .post(`/api/payments/${route}`)
        .set(auth(user))
        .send({ itemType: "training", itemId: training.id })
        .expect(503);
    expect(await store.listAdminPayments()).toEqual([]);
  });
  it("revokes a document-backed verification badge when that document is rejected", async () => {
    await store.upsertStartupProfile(user.id, {
      companyName: "Fixture",
      categories: [],
      teamMembers: [],
    });
    const doc = await store.createProfileVerification({
      userId: user.id,
      docType: "certificate",
      docUrl: "https://example.test/doc",
      claimToVerify: "Fixture evidence",
      status: "manual_review",
    });
    await request(app)
      .post(`/api/admin/verifications/${doc.id}/approve`)
      .set(auth(admin))
      .send({ adminNote: "Reviewed" })
      .expect(200);
    expect((await store.findStartupProfileByUserId(user.id)).isVerified).toBe(
      true,
    );
    await request(app)
      .post(`/api/admin/verifications/${doc.id}/reject`)
      .set(auth(admin))
      .send({ adminNote: "Evidence withdrawn" })
      .expect(200);
    expect((await store.findStartupProfileByUserId(user.id)).isVerified).toBe(
      false,
    );
    expect((await store.listAdminAudit()).map((a) => a.action)).toEqual([
      "document.decision",
      "document.decision",
    ]);
  });
});

describe("Authenticator compatibility and login", () => {
  it("sets up, confirms, enforces and disables a real TOTP factor", async () => {
    const setup = await request(app)
      .post("/api/2fa/setup")
      .set(auth(admin))
      .expect(200);
    expect(setup.body.qrCode).toMatch(/^data:image/);
    const code = await generate({ secret: setup.body.secret });
    await request(app)
      .post("/api/2fa/verify")
      .set(auth(admin))
      .send({ code })
      .expect(200);
    await request(app).post("/api/2fa/setup").set(auth(admin)).expect(409);
    const blocked = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "Fixture123!" })
      .expect(401);
    expect(blocked.body.code).toBe("TWO_FACTOR_REQUIRED");
    expect(blocked.headers["set-cookie"]).toBeUndefined();
    await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "Fixture123!", otp: code })
      .expect(200);
    await request(app)
      .delete("/api/2fa/disable")
      .set(auth(admin))
      .send({ code: "invalid" })
      .expect(400);
    await request(app)
      .delete("/api/2fa/disable")
      .set(auth(admin))
      .send({ code })
      .expect(200);
    expect(
      (await request(app).get("/api/2fa/status").set(auth(admin))).body.enabled,
    ).toBe(false);
  });
});
