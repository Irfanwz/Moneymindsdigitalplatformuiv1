import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createApp } from "../server/app.js";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createSupabaseStore } from "../server/store/supabaseStore.js";
import { createToken } from "../server/auth.js";
import { isProfileComplete } from "../src/app/lib/profile-complete.ts";
import {
  registrationSchema,
  buildRegistrationProfiles,
} from "../server/registration.js";
import { registrationDocumentSlots } from "../shared/registrationFields.js";
import {
  loadMigrations,
  applyMigrations,
} from "../server/migrations/runner.js";

vi.mock("../server/email.js", () => ({
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendLoginOtpEmail: vi.fn(),
}));
const investor = () => ({
  investorType: "Individual",
  title: "Engineer",
  investmentThesis: "Support technology businesses",
});
const startup = () => ({
  companyName: "Sample Company",
  applicantPosition: "Founder",
  industry: "Technology",
  stage: "Seed",
  description: "We develop useful business software.",
  joiningPurpose: "Find advisors",
  businessRegistrationStatus: "Not registered",
  teamSize: "3",
  teamMembers: [{ id: "team1", name: "Sample Founder", role: "CEO" }],
});
const advisor = () => ({
  title: "Financial advisor",
  bio: "Independent professional advisor",
  specialization: "Retirement planning",
  yearsExperience: "0",
  linkedin: "https://www.linkedin.com/in/sample",
  employmentStatus: "No previous employment",
  educationStatus: "No formal qualification",
  certificationStatus: "None",
  licenseStatus: "Not applicable",
  regulatoryStatus: "Not applicable",
});
function payload(profiles = { investor: investor() }) {
  return {
    fullName: "Sample Applicant",
    email: "applicant@example.test",
    password: "Password123!",
    phone: "+923001234567",
    city: "Lahore",
    country: "Pakistan",
    requestedRoles: Object.keys(profiles),
    profiles,
    attachments: [],
  };
}
function qualifiedAdvisor() {
  return {
    ...advisor(),
    employmentStatus: "Previous / current employment",
    workHistory: [
      {
        id: "job1",
        firm: "Sample Firm",
        position: "Analyst",
        duration: "2020–2025",
      },
    ],
    educationStatus: "Qualified",
    education: [
      {
        id: "edu1",
        institution: "Sample University",
        qualification: "Finance degree",
        year: "2020",
      },
    ],
    certificationStatus: "Certifications held",
    certifications: [
      {
        id: "cert1",
        name: "Sample certificate",
        issuer: "Sample issuer",
        credentialNumber: "C123",
        year: "2021",
      },
    ],
    licenseStatus: "Licensed",
    licenses: [
      {
        id: "lic1",
        type: "Advisory license",
        issuer: "Sample authority",
        number: "L123",
        expiryDate: "2027-01-01",
      },
    ],
    regulatoryStatus: "Registered",
    registrations: [
      {
        id: "reg1",
        regulator: "Sample regulator",
        jurisdiction: "Sample jurisdiction",
        number: "R123",
      },
    ],
    clientReviews: [
      {
        id: "review1",
        clientName: "Client A",
        text: "Clear explanations",
        sourceUrl: "https://example.test/review",
      },
    ],
    references: [
      {
        id: "ref1",
        name: "Reference A",
        relationship: "Former colleague",
        contact: "reference@example.test",
      },
    ],
  };
}
const pdf = Buffer.from("%PDF-1.4\nA synthetic document fixture\n%%EOF");
let app,
  store,
  sequence = 0,
  testIp;
beforeEach(() => {
  testIp = `192.0.2.${++sequence}`;
  store = createMemoryStore();
  app = createApp(store, { backgroundJobs: false });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Role-specific registration", () => {
  it("keeps pending and unapproved role profiles out of discovery and public views", async () => {
    const data = payload({ startup: startup(), advisor: advisor() });
    const result = await request(app).post("/api/auth/register-profile").set("X-Forwarded-For", testIp).send(data).expect(201);
    const id = result.body.user.id;
    const admin = await store.ensureAdminAccount({ fullName: "Reviewer", email: "reviewer@example.test", passwordHash: "unused" });
    expect(await store.searchStartups()).toHaveLength(0);
    expect(await store.searchAdvisors()).toHaveLength(0);
    await request(app).get(`/api/advisors/${id}/public-profile`).set("Authorization", `Bearer ${createToken(admin)}`).expect(404);
    await store.updateApproval(id, { status: "approved", approvedRoles: ["startup"] });
    expect(await store.searchStartups()).toHaveLength(1);
    expect(await store.searchAdvisors()).toHaveLength(0);
    await request(app).get(`/api/advisors/${id}/public-profile`).set("Authorization", `Bearer ${createToken(admin)}`).expect(404);
    await store.updateApproval(id, { status: "approved", approvedRoles: ["startup", "advisor"] });
    expect(await store.searchAdvisors()).toHaveLength(1);
  });
  it.each(["phone", "city", "country"])(
    "rejects missing and whitespace-only %s before creating an account",
    async (field) => {
      for (const value of [undefined, "   "]) {
        const data = payload();
        data[field] = value;
        const result = await request(app)
          .post("/api/auth/register-profile")
          .set("X-Forwarded-For", testIp)
          .send(data);
        expect(result.status).toBe(400);
        expect(await store.listUsers()).toHaveLength(0);
      }
    },
  );
  it.each(["startup", "investor", "advisor"])(
    "saves a complete %s application before approval",
    async (role) => {
      const data = payload({ [role]: { startup, investor, advisor }[role]() });
      const result = await request(app)
        .post("/api/auth/register-profile")
        .set("X-Forwarded-For", testIp)
        .send(data)
        .expect(201);
      expect(result.body.user).toMatchObject({
        phone: data.phone,
        location: "Lahore, Pakistan",
        status: "pending",
        approvedRoles: [],
      });
      const application = await store.getProfileApplication(
        result.body.user.id,
      );
      expect(application).toMatchObject({
        city: "Lahore",
        country: "Pakistan",
        profiles: data.profiles,
      });
      expect(JSON.stringify(application)).not.toContain(data.password);
      const user = await store.findUserById(result.body.user.id);
      await request(app)
        .get(`/api/${role}/profile`)
        .set("Authorization", `Bearer ${createToken(user)}`)
        .expect(403);
      await store.updateApproval(user.id, {
        status: "approved",
        approvedRoles: [role],
      });
      const own = await request(app)
        .get(`/api/${role}/profile`)
        .set("Authorization", `Bearer ${createToken(user)}`)
        .expect(200);
      expect(own.body.profile.userId).toBe(user.id);
      expect(isProfileComplete(role, own.body.profile)).toBe(true);
    },
  );
  it("requires every selected role and rejects details for an unselected role", async () => {
    const data = payload();
    data.requestedRoles.push("advisor");
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(data)
      .expect(400);
    data.requestedRoles = ["investor"];
    data.profiles.startup = startup();
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(data)
      .expect(400);
  });
  it("rejects missing collection fields, unsafe URLs, invalid phone and reversed budgets", () => {
    const data = payload({ advisor: qualifiedAdvisor() });
    data.attachments = registrationDocumentSlots(data.profiles).map(
      ({ key }) => ({ key }),
    );
    delete data.profiles.advisor.education[0].institution;
    expect(registrationSchema.safeParse(data).success).toBe(false);
    for (const edits of [
      { phone: "abc123" },
      {
        profiles: {
          investor: { ...investor(), website: "javascript:alert(1)" },
        },
      },
      {
        profiles: {
          investor: {
            ...investor(),
            minInvestment: "200",
            maxInvestment: "100",
          },
        },
      },
    ])
      expect(
        registrationSchema.safeParse({ ...payload(), ...edits }).success,
      ).toBe(false);
  });
  it("saves multiple roles and their linked documents; only owner and reviewers can download", async () => {
    const data = payload({
      startup: startup(),
      investor: investor(),
      advisor: qualifiedAdvisor(),
    });
    data.attachments = registrationDocumentSlots(data.profiles)
      .filter((d) => d.required)
      .map(({ key }) => ({ key }));
    let submission = request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .field("payload", JSON.stringify(data));
    for (const entry of data.attachments)
      submission = submission.attach("documents", pdf, {
        filename: "evidence.pdf",
        contentType: "application/pdf",
      });
    const result = await submission.expect(201),
      id = result.body.user.id;
    const application = await store.getProfileApplication(id);
    expect(application.documents.map((d) => d.key)).toEqual(
      data.attachments.map((d) => d.key),
    );
    const profile = await store.findAdvisorProfileByUserId(id);
    expect(profile).toMatchObject({
      educationUniversity: "Sample University",
      regulatoryLicenseNo: "L123",
      previousFirm: "Sample Firm",
      yearsExperience: 0,
    });
    const admin = await store.ensureAdminAccount({
      fullName: "Reviewer",
      email: "admin@example.test",
      passwordHash: "unused",
    });
    const detail = await request(app)
      .get(`/api/admin/console/users/${id}`)
      .set("Authorization", `Bearer ${createToken(admin)}`)
      .expect(200);
    expect(detail.body.application.documents[0].path).toBeUndefined();
    expect(detail.body.application.profiles.advisor.references[0].contact).toBe(
      "reference@example.test",
    );
    const doc = application.documents[0],
      route = `/api/admin/console/users/${id}/application-documents/${doc.id}`;
    await request(app).get(route).expect(401);
    const download = await request(app)
      .get(route)
      .set("Authorization", `Bearer ${createToken(admin)}`)
      .expect(200);
    expect(download.headers["cache-control"]).toContain("no-store");
    expect(download.body).toEqual(pdf);
    const other = await store.createUserProfile({
      fullName: "Other",
      email: "other@example.test",
      passwordHash: "unused",
      requestedRoles: ["investor"],
    });
    await store.updateApproval(other.id, {
      status: "approved",
      approvedRoles: ["investor"],
    });
    await request(app)
      .get(`/api/profile-application/documents/${doc.id}`)
      .set("Authorization", `Bearer ${createToken(other)}`)
      .expect(404);
    await request(app)
      .get(route)
      .set("Authorization", `Bearer ${createToken(other)}`)
      .expect(403);
    await store.updateApproval(id, {
      status: "approved",
      approvedRoles: data.requestedRoles,
    });
    await request(app)
      .get(`/api/profile-application/documents/${doc.id}`)
      .set(
        "Authorization",
        `Bearer ${createToken(await store.findUserById(id))}`,
      )
      .expect(200);
    const publicProfile = await request(app)
      .get(`/api/advisors/${id}/public-profile`)
      .set("Authorization", `Bearer ${createToken(other)}`)
      .expect(200);
    expect(JSON.stringify(publicProfile.body)).not.toContain(
      "reference@example.test",
    );
    await store.adminMutate(admin.id, "user.admin_role", other.id, {
      role: "support",
    });
    const support = await request(app)
      .get(`/api/admin/console/users/${id}`)
      .set("Authorization", `Bearer ${createToken(other)}`)
      .expect(200);
    expect(support.body.application).toBeNull();
    await request(app)
      .get(route)
      .set("Authorization", `Bearer ${createToken(other)}`)
      .expect(403);
  });
  it("requires credential evidence, rejects fabricated attachments and spoofed file types", async () => {
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(payload({ advisor: qualifiedAdvisor() }))
      .expect(400);
    const data = payload({ startup: startup() });
    data.attachments = [{ key: "startup.pitchDeck" }];
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(data)
      .expect(400);
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .field("payload", JSON.stringify(data))
      .attach("documents", Buffer.from("<script>bad</script>"), {
        filename: "fake.pdf",
        contentType: "application/pdf",
      })
      .expect(400);
    expect(await store.listUsers()).toHaveLength(0);
  });
  it("cleans uploaded documents when saving the application fails and allows retry", async () => {
    const data = payload({ startup: startup() });
    data.attachments = [{ key: "startup.pitchDeck" }];
    const saved = vi
      .spyOn(store, "createProfileApplication")
      .mockRejectedValueOnce(new Error("Synthetic save failure"));
    const cleanup = vi.spyOn(store, "deleteApplicationDocuments");
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .field("payload", JSON.stringify(data))
      .attach("documents", pdf, "deck.pdf")
      .expect(500);
    expect(await store.listUsers()).toHaveLength(0);
    expect(cleanup).toHaveBeenCalledOnce();
    expect(
      await store.downloadApplicationDocument(cleanup.mock.calls[0][0][0]),
    ).toBeNull();
    saved.mockRestore();
    data.attachments = [];
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(data)
      .expect(201);
    await request(app)
      .post("/api/auth/register-profile")
      .set("X-Forwarded-For", testIp)
      .send(data)
      .expect(409);
    expect(await store.listUsers()).toHaveLength(1);
  });
});

it("uses the real Supabase mapping in an atomic SQL transaction with restricted grants", async () => {
  let rpc;
  vi.stubGlobal("fetch", async (_url, init) => {
    rpc = JSON.parse(init.body);
    return new Response(
      JSON.stringify({
        ...rpc.p_user,
        requested_roles: [],
        approved_roles: [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
  const data = payload({
    startup: startup(),
    investor: investor(),
    advisor: qualifiedAdvisor(),
  });
  data.attachments = registrationDocumentSlots(data.profiles)
    .filter((d) => d.required)
    .map(({ key }) => ({ key }));
  const parsed = registrationSchema.parse(data),
    id = randomUUID();
  const sqlStore = createSupabaseStore({
    supabaseUrl: "https://registration.example.test",
    supabaseServiceRoleKey: "fixture-key",
  });
  await sqlStore.createProfileApplication(
    {
      id,
      fullName: data.fullName,
      email: data.email,
      passwordHash: "hash",
      phone: data.phone,
      location: "Lahore, Pakistan",
      bio: "",
      requestedRoles: data.requestedRoles,
    },
    buildRegistrationProfiles(parsed),
    {
      version: 1,
      city: data.city,
      country: data.country,
      profiles: parsed.profiles,
      documents: [],
    },
  );
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;",
    );
    const schema = await readFile(
      new URL("../supabase/schema.sql", import.meta.url),
      "utf8",
    );
    await db.exec(
      schema.match(
        /create table if not exists public\.platform_users[\s\S]*?\n\);/i,
      )[0],
    );
    const client = {
      query: async (sql, params) =>
        params ? db.query(sql, params) : (await db.exec(sql)).at(-1),
    };
    await applyMigrations(client, await loadMigrations(), { info() {} });
    const invoke = (args) =>
      db.query(
        "SELECT public.create_profile_application($1::jsonb,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb)",
        [
          args.p_user,
          args.p_startup,
          args.p_investor,
          args.p_advisor,
          args.p_application,
        ].map(JSON.stringify),
      );
    await invoke(rpc);
    expect(
      (
        await db.query("SELECT status,phone FROM platform_users WHERE id=$1", [
          id,
        ])
      ).rows[0],
    ).toEqual({ status: "pending", phone: data.phone });
    expect(
      (
        await db.query(
          "SELECT education_university,regulatory_license_no FROM advisor_profiles WHERE user_id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({
      education_university: "Sample University",
      regulatory_license_no: "L123",
    });
    expect(
      (
        await db.query(
          "SELECT details FROM profile_applications WHERE user_id=$1",
          [id],
        )
      ).rows[0].details.profiles.advisor.references,
    ).toEqual(parsed.profiles.advisor.references);
    const broken = structuredClone(rpc);
    broken.p_user.id = randomUUID();
    broken.p_user.email = "retry@example.test";
    broken.p_advisor.title = null;
    await expect(invoke(broken)).rejects.toThrow();
    expect(
      (await db.query("SELECT count(*)::int AS n FROM platform_users")).rows[0]
        .n,
    ).toBe(1);
    const grants = (
      await db.query(
        "SELECT has_table_privilege('anon','profile_applications','SELECT') AS anon, has_table_privilege('authenticated','profile_applications','SELECT') AS authenticated, has_function_privilege('anon','create_profile_application(jsonb,jsonb,jsonb,jsonb,jsonb)','EXECUTE') AS rpc_anon, has_function_privilege('service_role','create_profile_application(jsonb,jsonb,jsonb,jsonb,jsonb)','EXECUTE') AS rpc_server",
      )
    ).rows[0];
    expect(grants).toEqual({
      anon: false,
      authenticated: false,
      rpc_anon: false,
      rpc_server: true,
    });
  } finally {
    await db.close();
  }
}, 60_000);
