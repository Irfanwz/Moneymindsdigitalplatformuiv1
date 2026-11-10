import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { config } from "../server/config.js";
import {
  registrationSchema,
  buildRegistrationProfiles,
} from "../server/registration.js";
import { registrationDocumentSlots } from "../shared/registrationFields.js";
import {
  collectDueDiligenceContext,
  runDueDiligence,
} from "../server/services/dueDiligenceService.js";
import { performAgentWork } from "../server/services/agentService.js";
import { executeTrackedRun } from "../server/services/agentRuntime.js";
import {
  generateJSON,
  configuredProviders,
} from "../server/services/aiProvider.js";
import { readDocument } from "../server/services/documentReaderService.js";
import { searchService } from "../server/services/searchService.js";
import { readProvidedProfileLinks } from "../server/services/profileLinkService.js";

vi.mock("../server/services/profileLinkService.js", async importOriginal => ({
  ...await importOriginal(), readProvidedProfileLinks:vi.fn(),
}));

vi.mock("../server/services/aiProvider.js", () => ({
  configuredProviders: vi.fn(() => ["test"]),
  generateJSON: vi.fn(),
}));
vi.mock("../server/services/documentReaderService.js", () => ({
  readDocument: vi.fn(),
}));
vi.mock("../server/services/searchService.js", () => ({
  searchService: { batchSearch: vi.fn() },
}));
let store;
const originalKey = config.tavilyApiKey;
const auth = (user) => ({ Cookie: `mm_token=${createToken(user)}` });
const profileFixtures = () => ({
  startup: {
    companyName: "Example Labs",
    applicantPosition: "Founder",
    industry: "Technology",
    stage: "Seed",
    description: "We create business accounting software.",
    joiningPurpose: "Find advisors",
    businessRegistrationStatus: "Registered",
    registrationNumber: "REG-123",
    registrationAuthority: "Example Registry",
    teamMembers: [{ id: "team1", name: "Example Colleague", role: "Engineer" }],
  },
  investor: {
    investorType: "Individual",
    title: "Engineer",
    investmentThesis: "Support early stage software",
    firmName: "Example Ventures",
  },
  advisor: {
    title: "Advisor",
    bio: "Financial planning professional",
    specialization: "Planning",
    yearsExperience: "5",
    linkedin: "https://www.linkedin.com/in/example-person",
    website: "https://advisor.example.test",
    employmentStatus: "Previous / current employment",
    workHistory: [
      {
        id: "job1",
        firm: "Example Firm",
        position: "Analyst",
        duration: "2019-2024",
      },
    ],
    educationStatus: "Qualified",
    education: [
      {
        id: "edu1",
        institution: "Example University",
        qualification: "BSc Finance",
        year: "2018",
      },
      {
        id: "edu2",
        institution: "Second University",
        qualification: "MSc Finance",
        year: "2020",
      },
    ],
    certificationStatus: "Certifications held",
    certifications: [
      {
        id: "cert1",
        name: "Planning Certificate",
        issuer: "Example Institute",
        credentialNumber: "CERT-22",
        year: "2022",
      },
    ],
    licenseStatus: "Licensed",
    licenses: [
      {
        id: "license1",
        type: "Advisor",
        issuer: "Example Authority",
        number: "LICENSE-42",
        expiryDate: "2020-12-31",
      },
    ],
    regulatoryStatus: "Registered",
    registrations: [
      {
        id: "reg1",
        regulator: "Example Regulator",
        jurisdiction: "Example Jurisdiction",
        number: "ADVISOR-88",
      },
    ],
    clientReviews: [
      {
        id: "review1",
        clientName: "Example Client",
        text: "Clear explanations",
        sourceUrl: "https://reviews.example.test/1",
      },
    ],
    references: [
      {
        id: "ref1",
        name: "Example Referee",
        relationship: "Former manager",
        contact: "private-ref@example.test",
      },
    ],
  },
});
async function applicant(roles, approved = false) {
  const profiles = Object.fromEntries(
    roles.map((role) => [role, profileFixtures()[role]]),
  );
  const slots = registrationDocumentSlots(profiles).filter((s) => s.required);
  const data = registrationSchema.parse({
    fullName: "Example Person",
    email: `${randomUUID()}@example.test`,
    password: "Password-Secret-123",
    phone: "+923001234567",
    city: "Lahore",
    country: "Pakistan",
    requestedRoles: roles,
    profiles,
    attachments: slots.map(({ key }) => ({ key })),
  });
  const id = randomUUID();
  const documents = slots.map((slot) => ({
    id: randomUUID(),
    key: slot.key,
    path: `${id}/${slot.key}`,
    name: `${slot.key}.pdf`,
    label: slot.label,
    type: "application/pdf",
  }));
  for (const doc of documents)
    await store.uploadApplicationDocument(doc.path, {
      buffer: Buffer.from(`Evidence for ${doc.key}`),
    });
  const user = await store.createProfileApplication(
    {
      id,
      fullName: data.fullName,
      email: data.email,
      passwordHash: "PRIVATE-PASSWORD-HASH",
      phone: data.phone,
      location: `${data.city}, ${data.country}`,
      requestedRoles: roles,
    },
    buildRegistrationProfiles(data),
    {
      version: 1,
      city: data.city,
      country: data.country,
      profiles: data.profiles,
      documents,
    },
  );
  if (approved)
    await store.updateApproval(id, {
      status: "approved",
      approvedRoles: roles,
    });
  return { user: await store.findUserById(user.id), data, documents };
}
function modelReply(transform = (checks) => checks) {
  generateJSON.mockImplementation(async (_system, prompt, options) => {
    const input = JSON.parse(prompt);
    const checks = input.fields.map((f) => ({
      fieldId: f.id,
      status: "insufficient_evidence",
      reasoning: "More evidence is needed.",
      evidence: [],
    }));
    const data = { checks: transform(checks, input) };
    return { data: options.validate(data), provider: "test" };
  });
}
beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  config.tavilyApiKey = "test-search-key";
  configuredProviders.mockReturnValue(["test"]);
  readProvidedProfileLinks.mockResolvedValue({links:[],sources:[]});
  store = createMemoryStore();
  searchService.batchSearch.mockImplementation(async (queries) =>
    queries.map((query) => ({
      title: "Professional evidence",
      url: `https://sources.example.test/${encodeURIComponent(query)}`,
      content:
        "Example Person is listed as a financial advisor at Example Firm.",
      query,
    })),
  );
  readDocument.mockImplementation(async (buffer) => ({
    text: `Document text: ${buffer.toString()}`,
    method: "test-reader",
  }));
  modelReply();
});
afterEach(() => {
  config.tavilyApiKey = originalKey;
});

describe("Due diligence covers every role and registration field", () => {
  it.each(["startup", "investor", "advisor"])(
    "runs successfully for a %s without requiring another role",
    async (role) => {
      const { user } = await applicant([role]);
      const run = await store.createAgentRun({
        userId: user.id,
        targetId: user.id,
        agentKey: "due-diligence",
      });
      const result = await executeTrackedRun(store, run, (p) =>
        performAgentWork(store, run, p),
      );
      expect(result.status).toBe("completed");
      expect(result.result.roles).toEqual([role]);
      expect(result.result.fieldChecks.some((f) => f.role === role)).toBe(true);
      expect((await store.findUserById(user.id)).status).toBe("pending");
    },
  );
  it("reviews all roles, repeated entries, evidence associations and current edits; never sends account secrets", async () => {
    const { user, documents } = await applicant([
      "startup",
      "investor",
      "advisor",
    ]);
    await store.upsertAdvisorProfile(user.id, {
      ...(await store.findAdvisorProfileByUserId(user.id)),
      title: "Updated title",
      taxId: "PRIVATE-TAX-ID",
      paymentEmail: "PRIVATE-PAYMENT-EMAIL",
    });
    const report = await runDueDiligence(store, user.id);
    expect(report.roles).toEqual(["startup", "investor", "advisor"]);
    expect(new Set(report.fieldChecks.map((f) => f.id)).size).toBe(
      report.fieldChecks.length,
    );
    expect(report.fieldChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "advisor.education.edu2.institution",
          value: "Second University",
          documentKey: "advisor.education.edu2",
        }),
        expect.objectContaining({
          id: "advisor.certifications.cert1.credentialNumber",
          value: "CERT-22",
        }),
        expect.objectContaining({
          id: "advisor.licenses.license1.expiryDate",
          value: "2020-12-31",
          status: "manual_review",
        }),
        expect.objectContaining({
          id: "advisor.registrations.reg1.number",
          value: "ADVISOR-88",
        }),
        expect.objectContaining({
          id: "advisor.clientReviews.review1.text",
          value: "Clear explanations",
        }),
        expect.objectContaining({
          id: "advisor.references.ref1.contact",
          status: "manual_review",
        }),
        expect.objectContaining({
          id: "current.advisor.title",
          value: "Updated title",
        }),
        expect.objectContaining({
          id: "personal.phone",
          status: "manual_review",
        }),
      ]),
    );
    expect(readDocument).toHaveBeenCalledTimes(documents.length);
    const prompts = JSON.stringify(generateJSON.mock.calls);
    expect(prompts).toContain("Second University");
    expect(prompts).toContain(
      "Document text: Evidence for advisor.education.edu2",
    );
    for (const secret of [
      "PRIVATE-PASSWORD-HASH",
      "Password-Secret-123",
      "PRIVATE-TAX-ID",
      "PRIVATE-PAYMENT-EMAIL",
    ])
      expect(prompts + JSON.stringify(report)).not.toContain(secret);
    for (const doc of documents)
      expect(prompts + JSON.stringify(report)).not.toContain(doc.path);
    const queries = JSON.stringify(searchService.batchSearch.mock.calls);
    for (const text of [
      "Second University",
      "LICENSE-42",
      "REG-123",
      "CERT-22",
      "reviews.example.test",
      "Updated title",
    ])
      expect(queries).toContain(text);
    for (const privateValue of [
      user.email,
      user.phone,
      "private-ref@example.test",
    ])
      expect(queries).not.toContain(privateValue);
    expect(report.sources.every((s) => !s.text && !s.path)).toBe(true);
  });
  it("uses legacy profile credentials even without the new status fields or application snapshot", async () => {
    const user = await store.createUserProfile({
      fullName: "Legacy User",
      email: "legacy@example.test",
      passwordHash: "unused",
      requestedRoles: ["advisor"],
    });
    await store.upsertAdvisorProfile(user.id, {
      title: "Legacy advisor",
      expertiseAreas: [],
      industries: [],
      educationUniversity: "Legacy University",
      regulatoryBody: "Legacy Authority",
      regulatoryLicenseNo: "LEG-1",
      certifications: [
        { name: "Legacy cert", issuer: "Legacy issuer", year: "2020" },
      ],
    });
    const report = await runDueDiligence(store, user.id);
    expect(JSON.stringify(report.fieldChecks)).toContain("Legacy cert");
    expect(JSON.stringify(generateJSON.mock.calls)).toContain(
      "Legacy University",
    );
    expect(report.limitations.join(" ")).toContain("no registration snapshot");
  });
  it("keeps optional omissions and preferences separate from verified evidence", async () => {
    const { user } = await applicant(["investor"]);
    const report = await runDueDiligence(store, user.id);
    expect(
      report.fieldChecks.find((f) => f.id === "investor.linkedin"),
    ).toMatchObject({ required: false, status: "not_provided" });
    expect(
      report.fieldChecks.find((f) => f.id === "investor.investmentThesis")
        .status,
    ).toBe("self_reported");
  });
});

describe("Evidence limits and honest failures", () => {
  it("returns supplied page excerpts and blocks substituting search snippets for an inaccessible profile",async()=>{
    const {user}=await applicant(["advisor"]);
    const url=profileFixtures().advisor.linkedin;
    const link={id:"profile-link:1",providedUrl:url,url,fieldIds:["advisor.linkedin"],roles:["advisor"],origins:["Registration application"],accessStatus:"read",reason:"Public text read"};
    const page={id:link.id,kind:"profile_link",url,title:"Supplied profile",text:"Example Person works as Advisor at Example Firm.",prefixes:["advisor.","personal."]};
    readProvidedProfileLinks.mockResolvedValue({links:[link],sources:[page]});
    modelReply(checks=>checks.map(check=>({...check,status:"supported",evidence:[{sourceId:page.id,quote:page.text}]})));
    const read=await runDueDiligence(store,user.id);
    expect(read.profileLinks[0]).toMatchObject({accessStatus:"read",comparisonStatus:"supported"});
    expect(read.profileLinks[0].comparisons.some(c=>c.fieldId==="personal.fullName")).toBe(true);
    expect(read.profileLinks[0].comparisons[0].quotes).toContain(page.text);
    readProvidedProfileLinks.mockResolvedValue({links:[{...link,accessStatus:"login_required",reason:"Login required"}],sources:[]});
    modelReply((checks,input)=>checks.map(check=>({...check,status:"supported",evidence:input.sources.length ? [{sourceId:input.sources[0].id,quote:input.sources[0].text}] : []})));
    const blocked=await runDueDiligence(store,user.id);
    expect(blocked.profileLinks[0]).toMatchObject({accessStatus:"login_required",comparisonStatus:"inconclusive",comparisons:[]});
    expect(blocked.fieldChecks.find(f=>f.id==="advisor.linkedin").status).toBe("manual_review");
  });
  it("accepts only retrieved citations with exact excerpts and fills omitted assessments", async () => {
    const { user } = await applicant(["investor"]);
    modelReply((checks, input) =>
      checks.slice(0, -1).map((check, i) => ({
        ...check,
        status: "supported",
        evidence: [
          {
            sourceId: i === 0 ? input.sources[0].id : "invented-source",
            quote: input.sources[0].text,
          },
        ],
      })),
    );
    const report = await runDueDiligence(store, user.id);
    expect(report.counts.supported).toBeGreaterThan(0);
    expect(report.counts.insufficient_evidence).toBeGreaterThan(0);
    expect(report.limitations.join(" ")).toContain("omitted by the model");
    expect(
      report.fieldChecks
        .flatMap((f) => f.evidence)
        .some((e) => e.sourceId === "invented-source"),
    ).toBe(false);
  });
  it("rejects invented quotes even when a real source ID is cited", async () => {
    const { user } = await applicant(["investor"]);
    modelReply((checks, input) =>
      checks.map((check) => ({
        ...check,
        status: "inconsistent",
        evidence: [
          {
            sourceId: input.sources[0].id,
            quote: "A fabricated allegation not found in the source",
          },
        ],
      })),
    );
    const report = await runDueDiligence(store, user.id);
    expect(report.counts.inconsistent).toBe(0);
    expect(report.counts.insufficient_evidence).toBeGreaterThan(0);
  });
  it("labels unreadable and missing uploads for manual review without losing other fields", async () => {
    const { user, documents } = await applicant(["advisor"]);
    await store.deleteApplicationDocuments([documents[0].path]);
    readDocument.mockRejectedValue(new Error("Vision reader unavailable"));
    const report = await runDueDiligence(store, user.id);
    expect(report.documents.every((d) => d.status === "unreadable")).toBe(true);
    expect(
      report.fieldChecks
        .filter((f) => f.id.startsWith("document."))
        .every((f) => f.status === "manual_review"),
    ).toBe(true);
    expect(
      report.fieldChecks.some(
        (f) => f.id === "advisor.education.edu2.institution",
      ),
    ).toBe(true);
  });
  it("does not turn document text into authenticity certification and discloses truncation", async () => {
    const { user } = await applicant(["startup"]);
    readDocument.mockResolvedValue({
      text: "Example registry evidence. ".repeat(1500),
      method: "test-reader",
    });
    modelReply((checks, input) =>
      checks.map((check) => ({
        ...check,
        status: "supported",
        evidence: input.sources
          .filter((s) => s.kind === "document")
          .map((s) => ({ sourceId: s.id, quote: s.text.slice(0, 40) })),
      })),
    );
    const report = await runDueDiligence(store, user.id);
    expect(
      report.fieldChecks.find((f) => f.id === "document.startup.registration")
        .status,
    ).toBe("manual_review");
    expect(report.documents[0].truncated).toBe(true);
    expect(report.limitations.join(" ")).toContain("20,000");
  });
  it.each(["unconfigured", "no results"])(
    "discloses %s search without inventing external verification",
    async (mode) => {
      if (mode === "unconfigured") config.tavilyApiKey = "";
      searchService.batchSearch.mockResolvedValue([]);
      const { user } = await applicant(["investor"]);
      const report = await runDueDiligence(store, user.id);
      expect(report.search.status).toBe(
        mode === "unconfigured" ? "not_configured" : "no_results",
      );
      expect(report.counts.supported).toBe(0);
      expect(report.limitations.join(" ").toLowerCase()).toContain(
        "external verification remains incomplete",
      );
      if (mode === "unconfigured")
        expect(searchService.batchSearch).not.toHaveBeenCalled();
    },
  );
  it("fails visibly if the model or application storage fails; never marks the user verified", async () => {
    const { user } = await applicant(["advisor"]);
    generateJSON.mockRejectedValue(new Error("Provider unavailable"));
    const run = await store.createAgentRun({
      userId: user.id,
      targetId: user.id,
      agentKey: "due-diligence",
    });
    const saved = await executeTrackedRun(store, run, (p) =>
      performAgentWork(store, run, p),
    );
    expect(saved).toMatchObject({ status: "failed", result: null });
    expect(
      (await store.findAdvisorProfileByUserId(user.id)).isVerified,
    ).not.toBe(true);
    vi.spyOn(store, "getProfileApplication").mockRejectedValue(
      new Error("Application storage unavailable"),
    );
    await expect(collectDueDiligenceContext(store, user.id)).rejects.toThrow(
      "Application storage unavailable",
    );
  });
});

describe("Due diligence access and persistence", () => {
  it.each(["startup", "investor", "advisor"])(
    "lets an approved %s run and retrieve their own full report",
    async (role) => {
      const { user } = await applicant([role], true);
      const app = createApp(store, { backgroundJobs: false });
      const res = await request(app)
        .post("/api/agents/runs")
        .set(auth(user))
        .send({ agentKey: "due-diligence" })
        .expect(202);
      await vi.waitFor(async () =>
        expect((await store.getAgentRun(res.body.run.id)).status).toBe(
          "completed",
        ),
      );
      const saved = await request(app)
        .get("/api/agents/runs")
        .set(auth(user))
        .expect(200);
      expect(saved.body.runs[0].result.roles).toEqual([role]);
    },
  );
  it("allows admin review before approval but denies other applicants and support access", async () => {
    const { user } = await applicant(["advisor"]);
    const { user: other } = await applicant(["investor"], true);
    const admin = await store.ensureAdminAccount({
      fullName: "Admin",
      email: "admin@example.test",
      passwordHash: "unused",
    });
    const app = createApp(store, { backgroundJobs: false });
    await request(app)
      .post("/api/agents/runs")
      .set(auth(user))
      .send({ agentKey: "due-diligence" })
      .expect(403);
    await request(app)
      .post("/api/agents/runs")
      .set(auth(other))
      .send({ agentKey: "due-diligence", targetId: user.id })
      .expect(403);
    const res = await request(app)
      .post("/api/agents/runs")
      .set(auth(admin))
      .send({ agentKey: "due-diligence", targetId: user.id })
      .expect(202);
    await vi.waitFor(async () =>
      expect((await store.getAgentRun(res.body.run.id)).status).toBe(
        "completed",
      ),
    );
    expect(
      (await request(app).get("/api/agents/runs").set(auth(other))).body.runs,
    ).toHaveLength(0);
    await request(app)
      .post(`/api/agents/runs/${res.body.run.id}/execute`)
      .set(auth(other))
      .expect(404);
    const realFind = store.findUserById.bind(store);
    vi.spyOn(store, "findUserById").mockImplementation(async (id) => {
      const found = await realFind(id);
      return id === admin.id ? { ...found, adminRole: "support" } : found;
    });
    await request(app).get("/api/agents/runs").set(auth(admin)).expect(403);
    await request(app)
      .post("/api/agents/runs")
      .set(auth(admin))
      .send({ agentKey: "due-diligence", targetId: user.id })
      .expect(403);
  });
});
