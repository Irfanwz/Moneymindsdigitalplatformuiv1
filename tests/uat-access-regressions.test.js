import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createToken } from "../server/auth.js";
import { normalizeAdvisorProfileInput } from "../server/advisorProfiles.js";
import { profileQualityEvidence } from "../server/profileVisibility.js";

vi.mock("../server/services/agentService.js", async original => ({
  ...await original(), queueSignalAgents: vi.fn(),
}));
const auth = user => ({ Cookie: `mm_token=${createToken(user)}` });
let app, store, owner, member, outsider, admin, finance, group, signal;
beforeEach(async () => {
  store = createMemoryStore();
  const user = async (name, roles) => {
    const result = await store.createUserProfile({ fullName: name, email: `${name}@example.test`, passwordHash: "unused", requestedRoles: roles });
    await store.updateApproval(result.id, { status: "approved", approvedRoles: roles });
    return store.findUserById(result.id);
  };
  owner = await user("owner", ["advisor"]);
  member = await user("member", ["investor"]);
  outsider = await user("outsider", ["investor"]);
  admin = await store.ensureAdminAccount({ fullName: "admin", email: "admin@example.test", passwordHash: "unused" });
  finance = await store.ensureAdminAccount({ fullName: "finance", email: "finance@example.test", passwordHash: "unused" });
  await store.adminMutate(admin.id, "user.admin_role", finance.id, { role: "finance" });
  finance = await store.findUserById(finance.id);
  group = await store.createGroup(owner.id, { name: "Private", description: "Fixture", category: "crypto", isPrivate: true, isPaid: true, joiningFee: "10", monthlyFee: "0" });
  await store.recordCheckout({ userId: member.id, itemType: "group_join", itemId: group.id, amount: 10, currency: "USD", transactionRef: "fixture-paid" });
  signal = await store.createSignal(group.id, owner.id, { title: "Members only", content: "Protected content", postType: "signal", signalType: "buy", tags: [] });
  app = createApp(store, { backgroundJobs: false });
});

describe("UAT group authorization", () => {
  it.each(["outsider", "finance"])("denies %s every protected read and interaction", async role => {
    const who = role === "outsider" ? outsider : finance;
    for (const path of [
      `/advisor/groups/${group.id}`, `/advisor/groups/${group.id}/signals`, `/advisor/groups/${group.id}/members`,
      `/groups/${group.id}/predictions`, `/signals/${signal.id}/prediction`,
      `/signals/${signal.id}/comments`, `/signals/${signal.id}/reactions`,
    ]) expect((await request(app).get(`/api${path}`).set(auth(who))).status, path).toBe(404);
    for (const [path, body] of [["comments", { content: "Intrusion" }], ["reactions", { reaction: "like" }]]) {
      expect((await request(app).post(`/api/signals/${signal.id}/${path}`).set(auth(who)).send(body)).status).toBe(404);
    }
  });
  it("preserves paid member, owner and authorized administrator access", async () => {
    for (const who of [member, owner, admin]) {
      expect((await request(app).get(`/api/advisor/groups/${group.id}/signals`).set(auth(who))).status).toBe(200);
      expect((await request(app).get(`/api/signals/${signal.id}/prediction`).set(auth(who))).status).toBe(200);
      expect((await request(app).post(`/api/signals/${signal.id}/comments`).set(auth(who)).send({ content: "Allowed" })).status).toBe(201);
    }
    expect((await request(app).get(`/api/advisor/groups/${group.id}/members`).set(auth(member))).status).toBe(404);
    expect((await request(app).get(`/api/advisor/groups/${group.id}/members`).set(auth(owner))).status).toBe(200);
  });
  it("revokes reads after leaving/removal even with a completed payment", async () => {
    await store.leaveGroup(group.id, member.id);
    expect((await request(app).get(`/api/signals/${signal.id}/comments`).set(auth(member))).status).toBe(404);
    await store.joinGroup(group.id, member.id);
    await store.removeGroupMember(group.id, member.id);
    expect((await request(app).get(`/api/groups/${group.id}/predictions`).set(auth(member))).status).toBe(404);
  });
  it("rejects an unpaid membership in a paid group", async () => {
    await store.joinGroup(group.id, outsider.id);
    expect((await request(app).get(`/api/advisor/groups/${group.id}/signals`).set(auth(outsider))).status).toBe(404);
  });
  it("blocks private self-join and payment enrollment bypass; free public joining still works", async () => {
    expect((await request(app).post(`/api/advisor/groups/${group.id}/join`).set(auth(outsider))).status).toBe(403);
    expect((await request(app).post("/api/payments/checkout").set(auth(outsider)).send({ itemType: "group_join", itemId: group.id })).status).toBe(403);
    const publicGroup = await store.createGroup(owner.id, { name: "Public", isPrivate: false, isPaid: false });
    expect((await request(app).post(`/api/advisor/groups/${publicGroup.id}/join`).set(auth(outsider))).status).toBe(201);
    expect((await request(app).get(`/api/advisor/groups/${publicGroup.id}/signals`).set(auth(outsider))).status).toBe(200);
  });
  it("checks signal/comment parent IDs on mutations", async () => {
    const other = await store.createSignal(group.id, owner.id, { title: "Other", content: "Other", tags: [] });
    const comment = await store.createComment(other.id, member.id, "Other signal");
    expect((await request(app).delete(`/api/signals/${signal.id}/comments/${comment.id}`).set(auth(member))).status).toBe(404);
    expect((await request(app).delete(`/api/advisor/groups/wrong/signals/${signal.id}`).set(auth(owner))).status).toBe(404);
  });
});

describe("UAT privacy and ownership", () => {
  it("enforces notification ownership without changing another user's notification", async () => {
    const notice = await store.createNotification(owner.id, { title: "Private", message: "Private", type: "info" });
    expect((await request(app).patch(`/api/notifications/${notice.id}/read`).set(auth(outsider))).status).toBe(404);
    expect((await store.listNotificationsByUser(owner.id))[0].read).toBe(false);
    expect((await request(app).patch(`/api/notifications/${notice.id}/read`).set(auth(owner))).status).toBe(200);
  });
  it("limits training rosters to their owner and content administrators", async () => {
    const training = await store.createTraining(owner.id, { title: "Training", type: "free", capacity: 10, topics: [], targetAudience: [] });
    await store.enrollInTraining(training.id, member.id);
    for (const who of [outsider, member, finance]) expect((await request(app).get(`/api/trainings/${training.id}/enrollments`).set(auth(who))).status).toBe(404);
    for (const who of [owner, admin]) expect((await request(app).get(`/api/trainings/${training.id}/enrollments`).set(auth(who))).status).toBe(200);
  });
  it("hides financial/contact data on public profiles while retaining the owner's editable data and verified badge", async () => {
    const input = normalizeAdvisorProfileInput({ title: "Advisor", specialization: "Crypto", taxId: "PRIVATE-TAX", paymentEmail: "payment@example.test", contactEmail: "contact@example.test", showContactInfo: false }, owner);
    await store.upsertAdvisorProfile(owner.id, input);
    const document = await store.createProfileVerification({ userId: owner.id, docType: "degree", docUrl: "fixture", claimToVerify: "Fixture", status: "manual_review" });
    expect((await request(app).post(`/api/admin/verifications/${document.id}/approve`).set(auth(admin))).status).toBe(200);
    const publicResult = await request(app).get(`/api/advisors/${owner.id}/public-profile`).set(auth(outsider));
    expect(publicResult.status).toBe(200);
    for (const key of ["taxId", "paymentEmail", "contactEmail", "enablePaymentProcessing"]) expect(publicResult.body.profile).not.toHaveProperty(key);
    expect(publicResult.body.profile.isVerified).toBe(true);
    const own = await request(app).get("/api/advisor/profile").set(auth(owner));
    expect(own.body.profile.taxId).toBe("PRIVATE-TAX");
    await store.upsertAdvisorProfile(owner.id, { ...input, showContactInfo: true });
    expect((await request(app).get(`/api/advisors/${owner.id}/public-profile`).set(auth(outsider))).body.profile.contactEmail).toBe(input.contactEmail);
  });
  it("respects startup contact privacy and excludes private/nested data from profile-quality prompts", async () => {
    await store.updateApproval(owner.id, { status: "approved", approvedRoles: ["advisor", "startup"] });
    await store.upsertStartupProfile(owner.id, { companyName: "Fixture", categories: [], teamMembers: [], isPublic: true, showContactInfo: false, contactEmail: "hidden@example.test" });
    const result = await request(app).get(`/api/startups/${owner.id}/public-profile`).set(auth(member));
    expect(result.status).toBe(200);
    expect(result.body.profile).not.toHaveProperty("contactEmail");
    const evidence = profileQualityEvidence({ bio: "Bio", advisor: { title: "Advisor", taxId: "SECRET", contactEmail: "SECRET", paymentEmail: "SECRET", certifications: [{ name: "Degree", privateDocument: "SECRET" }] }, startup: { companyName: "Company", teamMembers: [{ name: "Name", contactEmail: "SECRET" }] }, investor: { investmentThesis: "Thesis", contactEmail: "SECRET" } });
    expect(JSON.stringify(evidence)).not.toContain("SECRET");
    expect(evidence.advisor.certifications).toEqual([{ name: "Degree" }]);
  });
});
