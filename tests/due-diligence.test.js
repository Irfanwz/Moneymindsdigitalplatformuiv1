import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createHash, randomUUID } from "node:crypto";
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
import { estimateAIInput } from "../server/services/aiTokenEstimate.js";

vi.mock("../server/services/profileLinkService.js", async importOriginal => ({
  ...await importOriginal(), readProvidedProfileLinks:vi.fn(),
}));

vi.mock("../server/services/aiProvider.js", () => ({
  configuredProviders: vi.fn(() => ["groq"]),
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
  configuredProviders.mockReturnValue(["groq"]);
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
    // The first run initializes the model tokenizer, including during parallel CI work.
    15000,
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

describe("Due diligence request sizing and complete evidence review", () => {
  const registrationField = "startup.registrationNumber";
  // Deterministic registry fingerprints exceed the token budget while the
  // complete document stays below the retained 20,000-character boundary.
  const ledger = () => Array.from({ length: 280 }, (_, i) =>
    `${String(i).padStart(4, "0")}: ${createHash("sha256").update(`registry-entry-${i}`).digest("hex")}\n`,
  ).join("").slice(0, 17500);
  function expectBoundedRequests() {
    for (const [system, prompt, options] of generateJSON.mock.calls) {
      expect(estimateAIInput(system, prompt, config.groqModel)).toBeLessThanOrEqual(5000);
      expect(JSON.parse(prompt).fields.length).toBeLessThanOrEqual(8);
      expect(options).toMatchObject({ maxTokens: 1800, maxCompletionTokens: 2500, rateLimitRetry: { maxRetries: 3, maxWaitMs: 180000 } });
    }
  }
  function documentChunks(fieldId = registrationField) {
    return generateJSON.mock.calls.flatMap(([, prompt]) => {
      const input = JSON.parse(prompt);
      return input.fields.some(field => field.id === fieldId)
        ? input.sources.filter(source => source.kind === "document")
        : [];
    });
  }
  function expectEveryCharacterShown(text, chunks) {
    const covered = new Uint8Array(text.length);
    for (const chunk of chunks) {
      const offset = text.indexOf(chunk.text);
      expect(offset).toBeGreaterThanOrEqual(0);
      expect(Buffer.from(chunk.text, "utf8").toString("utf8")).toBe(chunk.text);
      covered.fill(1, offset, offset + chunk.text.length);
    }
    expect(covered.every(value => value === 1)).toBe(true);
  }

  it("uses sequential bounded requests and produces exactly one result for every collected field", async () => {
    const { user } = await applicant(["startup", "investor", "advisor"]);
    const context = await collectDueDiligenceContext(store, user.id);
    let active = 0;
    let peak = 0;
    generateJSON.mockImplementation(async (_system, prompt, options) => {
      active++;
      peak = Math.max(peak, active);
      try {
        await Promise.resolve();
        const input = JSON.parse(prompt);
        return {
          data: options.validate({ checks: input.fields.map(field => ({
            fieldId: field.id, status: "insufficient_evidence",
            reasoning: "The supplied records do not establish this claim.", evidence: [],
          })) }),
          provider: "test",
        };
      } finally {
        active--;
      }
    });
    const report = await runDueDiligence(store, user.id);
    expect(peak).toBe(1);
    expectBoundedRequests();
    expect(report.fieldChecks.map(field => field.id).sort()).toEqual(context.fields.map(field => field.id).sort());
    expect(new Set(report.fieldChecks.map(field => field.id)).size).toBe(context.fields.length);
  });

  it("reports absent evidence without paying for empty model assessments", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["investor"]);
    readDocument.mockResolvedValue({ text: "", method: "test-reader" });
    const context = await collectDueDiligenceContext(store, user.id);
    const report = await runDueDiligence(store, user.id);
    expect(generateJSON).not.toHaveBeenCalled();
    expect(report.fieldChecks.map(field => field.id)).toEqual(context.fields.map(field => field.id));
    expect(report.fieldChecks.find(field => field.id === "personal.fullName").status).toBe("insufficient_evidence");
    expect(report.fieldChecks.find(field => field.id === "investor.title").status).toBe("insufficient_evidence");
    expect(report.counts.supported).toBe(0);
  });

  it("preserves differing original and current claims for manual review without empty AI calls", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["investor"]);
    await store.upsertInvestorProfile(user.id, {
      ...(await store.findInvestorProfileByUserId(user.id)), title: "Doctor",
    });
    const report = await runDueDiligence(store, user.id);
    expect(generateJSON).not.toHaveBeenCalled();
    expect(report.fieldChecks.find(field => field.id === "investor.title")).toMatchObject({
      value: "Engineer", status: "manual_review", evidence: [],
    });
    expect(report.fieldChecks.find(field => field.id === "current.investor.title")).toMatchObject({
      value: "Doctor", status: "manual_review", evidence: [],
    });
    expect(report.fieldChecks.find(field => field.id === "investor.firmName").status).toBe("insufficient_evidence");
  });

  it("reviews shared sources in a few token-bounded calls without dropping complete claims or evidence", async () => {
    const { user } = await applicant(["investor"]);
    await store.upsertInvestorProfile(user.id, {
      ...(await store.findInvestorProfileByUserId(user.id)),
      portfolioSize: "12",
      bio: "Angel investor supporting early stage software companies.",
      contactEmail: "private-investor@example.test",
    });
    const sourceTexts = Array.from({ length: 8 }, (_, i) =>
      `Record ${i}: Example Person is an individual investor and Engineer at Example Ventures. ` +
      "The public professional record describes the investor's portfolio and career history. ".repeat(12),
    );
    searchService.batchSearch.mockImplementation(async queries => queries.flatMap(query =>
      sourceTexts.map((content, i) => ({
        title: `Professional record ${i}`,
        url: `https://sources.example.test/shared-${i}`,
        content,
        query,
      })),
    ));
    const context = await collectDueDiligenceContext(store, user.id);
    const report = await runDueDiligence(store, user.id);
    const inputs = generateJSON.mock.calls.map(([, prompt]) => JSON.parse(prompt));
    const expectedClaims = context.fields.filter(field => field.policy === "evidence" && field.value !== "" && field.value != null);
    expect(expectedClaims.length).toBeGreaterThanOrEqual(8);
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs.length).toBeLessThanOrEqual(2);
    for (const claim of expectedClaims) {
      expect(inputs.flatMap(input => input.fields)).toContainEqual(expect.objectContaining({ id: claim.id, value: claim.value }));
    }
    for (const text of sourceTexts) {
      expect(inputs.flatMap(input => input.sources).some(source => source.text === text)).toBe(true);
    }
    const inputTokens = generateJSON.mock.calls.reduce((sum, [system, prompt]) => sum + estimateAIInput(system, prompt, config.groqModel), 0);
    expect(inputTokens).toBeLessThanOrEqual(6500);
    expect(report.fieldChecks.map(field => field.id)).toEqual(context.fields.map(field => field.id));
    expectBoundedRequests();
  });

  it("reviews the entire retained document and preserves a contradiction near its end", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const initial = "REG-123 is recorded as active.";
    const correction = "Correction: registration REG-123 was revoked by the issuing registry.";
    const text = initial + "\n" + ledger() + "\n" + correction;
    readDocument.mockResolvedValue({ text, method: "test-reader" });
    modelReply((checks, input) => checks.map(check => {
      const source = input.sources.find(source => source.kind === "document");
      if (!source) return check;
      const quote = source.text.includes(correction) ? correction : source.text.includes(initial) ? initial : null;
      return quote ? { ...check, status: quote === correction ? "inconsistent" : "supported", evidence: [{ sourceId: source.id, quote }] } : check;
    }));
    const report = await runDueDiligence(store, user.id);
    const chunks = documentChunks();
    expect(chunks.length).toBeGreaterThan(1);
    expect(new Set(chunks.map(chunk => chunk.id)).size).toBe(1);
    expectEveryCharacterShown(text, chunks);
    expect(report.fieldChecks.find(field => field.id === registrationField)).toMatchObject({
      status: "inconsistent",
      evidence: expect.arrayContaining([expect.objectContaining({ quote: correction })]),
    });
    expectBoundedRequests();
  });

  it("retains short quotes that cross an evidence chunk boundary", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const original = ledger();
    readDocument.mockResolvedValue({ text: original, method: "test-reader" });
    await runDueDiligence(store, user.id);
    const firstChunk = documentChunks()[0];
    expect(firstChunk.text.length).toBeLessThan(original.length);
    const quote = "Registry confirms that REG-123 belongs to Example Labs.";
    const boundary = original.indexOf(firstChunk.text) + firstChunk.text.length;
    const start = boundary - 12;
    const text = original.slice(0, start) + quote + original.slice(start + quote.length);
    generateJSON.mockClear();
    readDocument.mockResolvedValue({ text, method: "test-reader" });
    modelReply((checks, input) => checks.map(check => {
      const source = input.sources.find(source => source.text.includes(quote));
      return source ? { ...check, status: "supported", evidence: [{ sourceId: source.id, quote }] } : check;
    }));
    const report = await runDueDiligence(store, user.id);
    expect(documentChunks().some(chunk => chunk.text.includes(quote))).toBe(true);
    expect(report.fieldChecks.find(field => field.id === registrationField)).toMatchObject({ status: "supported" });
    expectEveryCharacterShown(text, documentChunks());
    expectBoundedRequests();
  }, 15000);

  it("bounds Unicode evidence tokens without corrupting or losing retained text", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const text = Array.from({ length: 300 }, (_, i) => `ریکارڈ ${String(i).padStart(4, "0")} کمپنی رجسٹریشن کی تصدیق 🧾✅\n`).join("");
    readDocument.mockResolvedValue({ text, method: "test-reader" });
    await runDueDiligence(store, user.id);
    expectBoundedRequests();
    const chunks = documentChunks();
    expect(chunks.length).toBeGreaterThan(1);
    expectEveryCharacterShown(text, chunks);
  }, 15000);

  it("rejects a quote from an unseen part of a real source even if its source ID is valid", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const hiddenQuote = "The company has an independently confirmed active registration.";
    const text = ledger() + "\n" + hiddenQuote;
    readDocument.mockResolvedValue({ text, method: "test-reader" });
    let unshownQuotes = 0;
    modelReply((checks, input) => checks.map(check => {
      const source = input.sources.find(source => source.kind === "document");
      if (!source || source.text.includes(hiddenQuote)) return check;
      if (check.fieldId === registrationField) unshownQuotes++;
      return { ...check, status: "supported", evidence: [{ sourceId: source.id, quote: hiddenQuote }] };
    }));
    const report = await runDueDiligence(store, user.id);
    expect(unshownQuotes).toBeGreaterThan(0);
    expect(report.fieldChecks.find(field => field.id === registrationField)).toMatchObject({ status: "insufficient_evidence", evidence: [] });
  });

  it("keeps ambiguous identity for manual review even after an earlier supporting excerpt", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const support = "REG-123 is assigned to Example Labs.";
    const ambiguity = "Two companies share this name; the identity cannot be resolved from this record.";
    readDocument.mockResolvedValue({ text: support + "\n" + ledger() + "\n" + ambiguity, method: "test-reader" });
    modelReply((checks, input) => checks.map(check => {
      const source = input.sources.find(source => source.kind === "document");
      if (source?.text.includes(ambiguity)) return { ...check, status: "manual_review", reasoning: ambiguity, evidence: [{ sourceId: source.id, quote: ambiguity }] };
      if (source?.text.includes(support)) return { ...check, status: "supported", evidence: [{ sourceId: source.id, quote: support }] };
      return check;
    }));
    const report = await runDueDiligence(store, user.id);
    expect(report.fieldChecks.find(field => field.id === registrationField)).toMatchObject({ status: "manual_review" });
  });

  it("does not declare a field supported when the model omits an assessment for a later chunk", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const end = "END OF REGISTRY EVIDENCE";
    readDocument.mockResolvedValue({ text: ledger() + "\n" + end, method: "test-reader" });
    modelReply((checks, input) => {
      const source = input.sources.find(source => source.kind === "document");
      if (source?.text.includes(end)) return checks.filter(check => check.fieldId !== registrationField);
      return checks.map(check => source ? { ...check, status: "supported", evidence: [{ sourceId: source.id, quote: source.text.slice(0, 45) }] } : check);
    });
    const report = await runDueDiligence(store, user.id);
    expect(["manual_review", "insufficient_evidence"]).toContain(report.fieldChecks.find(field => field.id === registrationField).status);
    expect(report.limitations.join(" ")).toContain("omitted by the model");
  });

  it("preserves oversized field values and flags incomplete original/current comparisons", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["investor"]);
    const largeValue = "Very long professional title. ".repeat(1500);
    await store.upsertInvestorProfile(user.id, {
      ...(await store.findInvestorProfileByUserId(user.id)), title: largeValue,
    });
    const report = await runDueDiligence(store, user.id);
    expect(report.fieldChecks.find(field => field.id === "current.investor.title")).toMatchObject({ value: largeValue, status: "manual_review" });
    expect(report.fieldChecks.find(field => field.id === "investor.title").status).toBe("manual_review");
    expect(report.limitations.join(" ")).toMatch(/size|large|budget|fit/i);
    expect(JSON.stringify(generateJSON.mock.calls)).not.toContain(largeValue);
    expectBoundedRequests();
  });

  it("flags oversized source metadata without sending an oversized request or inventing a review", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["startup"]);
    const originalGet = store.getProfileApplication.bind(store);
    const largeLabel = "Full legal document name ".repeat(1500);
    vi.spyOn(store, "getProfileApplication").mockImplementation(async id => {
      const application = await originalGet(id);
      return { ...application, documents: application.documents.map(doc => ({ ...doc, label: largeLabel })) };
    });
    const report = await runDueDiligence(store, user.id);
    expect(report.fieldChecks.find(field => field.id === registrationField)).toMatchObject({ value: "REG-123", status: "manual_review" });
    expect(report.limitations.join(" ")).toMatch(/size|large|budget|fit/i);
    expect(JSON.stringify(generateJSON.mock.calls)).not.toContain(largeLabel);
    expectBoundedRequests();
  });

  it("makes no AI calls when indivisible shared applicant context cannot fit", async () => {
    config.tavilyApiKey = "";
    const { user } = await applicant(["investor"]);
    const originalFind = store.findUserById.bind(store);
    const largeName = "Extended legal applicant name ".repeat(1500);
    vi.spyOn(store, "findUserById").mockImplementation(async id => ({
      ...(await originalFind(id)), fullName: largeName,
    }));
    const report = await runDueDiligence(store, user.id);
    expect(generateJSON).not.toHaveBeenCalled();
    expect(report.fieldChecks.find(field => field.id === "personal.fullName")).toMatchObject({ value: largeName, status: "manual_review" });
    expect(report.fieldChecks.find(field => field.id === "investor.title").status).toBe("manual_review");
    expect(report.limitations.join(" ")).toMatch(/size|large|budget|fit/i);
  });

  it.each(["AI_BUDGET_EXCEEDED", "AI_USAGE_STORAGE_FAILED"])("propagates %s instead of turning it into a partial success", async code => {
    const { user } = await applicant(["startup"]);
    const error = Object.assign(new Error("AI operation cannot proceed"), { code });
    generateJSON.mockRejectedValue(error);
    await expect(runDueDiligence(store, user.id)).rejects.toBe(error);
    expect(generateJSON).toHaveBeenCalledTimes(1);
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
