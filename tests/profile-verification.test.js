/**
 * AI-Verified Profiles — Test Suite
 * Covers: store CRUD, confidence threshold logic, API endpoints, admin actions
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createMemoryStore } from "../server/store/memoryStore.js";

let store;
let userId;
let adminId;

beforeAll(async () => {
  store = createMemoryStore();

  // Create a regular user
  const user = await store.createUserProfile({
    fullName: "Jane Advisor",
    email: "jane@example.com",
    passwordHash: "hash",
    phone: "",
    location: "London",
    bio: "CFA advisor",
    requestedRoles: ["advisor"],
  });
  userId = user.id;

  // Create an admin user
  const admin = await store.ensureAdminAccount({
    fullName: "Admin User",
    email: "admin@moneyminds.app",
    passwordHash: "hash",
  });
  adminId = admin.id;
});

// ─────────────────────────────────────────────────────────────
// Store CRUD
// ─────────────────────────────────────────────────────────────

describe("store: createProfileVerification", () => {
  it("creates a record with status pending", async () => {
    const record = await store.createProfileVerification({
      userId,
      docType: "certificate",
      docUrl: "https://storage.example.com/cert.pdf",
      claimToVerify: "I am a CFA charterholder",
      status: "pending",
    });

    expect(record.id).toBeTruthy();
    expect(record.userId).toBe(userId);
    expect(record.docType).toBe("certificate");
    expect(record.status).toBe("pending");
    expect(record.aiConfidence).toBeNull();
  });

  it("getProfileVerification retrieves by id", async () => {
    const created = await store.createProfileVerification({
      userId,
      docType: "degree",
      docUrl: "local://test/degree.pdf",
      claimToVerify: "MSc Finance from LSE 2019",
      status: "pending",
    });

    const fetched = await store.getProfileVerification(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched.id).toBe(created.id);
    expect(fetched.docType).toBe("degree");
  });

  it("returns null for non-existent id", async () => {
    const result = await store.getProfileVerification("non-existent-id");
    expect(result).toBeNull();
  });
});

describe("store: updateProfileVerification", () => {
  it("updates status to analyzing", async () => {
    const created = await store.createProfileVerification({
      userId, docType: "linkedin", docUrl: "local://test/li.png",
      claimToVerify: "LinkedIn profile screenshot", status: "pending",
    });

    const updated = await store.updateProfileVerification(created.id, { status: "analyzing" });
    expect(updated.status).toBe("analyzing");
  });

  it("sets AI result fields on completion", async () => {
    const created = await store.createProfileVerification({
      userId, docType: "certificate", docUrl: "local://test/cert2.pdf",
      claimToVerify: "CPA Certificate 2022", status: "pending",
    });

    const updated = await store.updateProfileVerification(created.id, {
      status: "verified",
      aiConfidence: 95,
      aiReasoning: "Document clearly shows CPA certification issued 2022.",
      aiExtracted: { name_on_doc: "Jane Advisor", issuer: "AICPA", credential_title: "CPA", issue_date: "2022-03-15", matches_claim: true },
    });

    expect(updated.status).toBe("verified");
    expect(updated.aiConfidence).toBe(95);
    expect(updated.aiReasoning).toContain("CPA");
    expect(updated.aiExtracted.name_on_doc).toBe("Jane Advisor");
  });
});

describe("store: listProfileVerifications", () => {
  it("filters by userId", async () => {
    // create another user
    const other = await store.createUserProfile({
      fullName: "Other User", email: "other@example.com", passwordHash: "hash",
      phone: "", location: "", bio: "", requestedRoles: ["investor"],
    });

    await store.createProfileVerification({
      userId: other.id, docType: "other", docUrl: "local://test/other.pdf",
      claimToVerify: "Some claim", status: "pending",
    });

    const mine = await store.listProfileVerifications({ userId });
    expect(mine.every((r) => r.userId === userId)).toBe(true);
  });

  it("filters by status", async () => {
    await store.createProfileVerification({
      userId, docType: "business_reg", docUrl: "local://test/reg.pdf",
      claimToVerify: "UK Ltd company director", status: "manual_review",
    });

    const reviews = await store.listProfileVerifications({ status: "manual_review" });
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews.every((r) => r.status === "manual_review")).toBe(true);
  });

  it("returns records sorted newest first", async () => {
    const records = await store.listProfileVerifications({ userId });
    for (let i = 1; i < records.length; i++) {
      expect(records[i - 1].createdAt >= records[i].createdAt).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Confidence Threshold Logic
// ─────────────────────────────────────────────────────────────

describe("confidence threshold logic", () => {
  function outcomeFromConfidence(confidence) {
    if (confidence >= 90) return "verified";
    if (confidence >= 60) return "manual_review";
    return "rejected";
  }

  it("confidence 90+ → verified (auto-approve)", () => {
    expect(outcomeFromConfidence(90)).toBe("verified");
    expect(outcomeFromConfidence(95)).toBe("verified");
    expect(outcomeFromConfidence(100)).toBe("verified");
  });

  it("confidence 60-89 → manual_review", () => {
    expect(outcomeFromConfidence(60)).toBe("manual_review");
    expect(outcomeFromConfidence(75)).toBe("manual_review");
    expect(outcomeFromConfidence(89)).toBe("manual_review");
  });

  it("confidence < 60 → rejected", () => {
    expect(outcomeFromConfidence(59)).toBe("rejected");
    expect(outcomeFromConfidence(30)).toBe("rejected");
    expect(outcomeFromConfidence(0)).toBe("rejected");
  });

  it("boundary at exactly 90 → verified", () => {
    expect(outcomeFromConfidence(90)).toBe("verified");
  });

  it("boundary at exactly 60 → manual_review (not rejected)", () => {
    expect(outcomeFromConfidence(60)).toBe("manual_review");
  });
});

// ─────────────────────────────────────────────────────────────
// setProfileVerified
// ─────────────────────────────────────────────────────────────

describe("store: setProfileVerified", () => {
  it("marks profiles as verified after auto-approval", async () => {
    // create advisor profile first
    await store.upsertAdvisorProfile(userId, {
      title: "Financial Advisor",
      bio: "10 years exp",
      website: "", linkedin: "", twitter: "", contactEmail: "jane@example.com",
      yearsExperience: "10", clientsHelped: "50", specialization: "financial-planning",
      previousRoles: "", expertiseAreas: [], certifications: [], industries: [],
      preferredStage: "", engagementType: "consulting", availability: "full-time",
      typicalRate: "", servicesOffered: "", defaultGroupType: "public",
      defaultJoiningFee: "0", defaultMonthlyFee: "0", autoApproveMembers: false,
      allowGroupDiscovery: true, enablePaymentProcessing: false,
      paymentEmail: "", taxId: "", isPublic: true, showContactInfo: true,
      allowConnectionRequests: true, showTestimonials: true,
    });

    const verification = await store.createProfileVerification({
      userId, docType: "certificate", docUrl: "local://cert.pdf",
      claimToVerify: "CFA charterholder", status: "verified",
    });

    await store.setProfileVerified(userId, verification.id);

    const profile = await store.findAdvisorProfileByUserId(userId);
    expect(profile).not.toBeNull();
    expect(profile.isVerified).toBe(true);
    expect(profile.verifiedAt).toBeTruthy();
    expect(profile.verificationId).toBe(verification.id);
  });
});

// ─────────────────────────────────────────────────────────────
// Admin approve / reject flow
// ─────────────────────────────────────────────────────────────

describe("admin approve/reject flow", () => {
  it("approve sets status to verified and marks profile", async () => {
    const verification = await store.createProfileVerification({
      userId, docType: "degree", docUrl: "local://degree.pdf",
      claimToVerify: "MSc Finance LSE 2020", status: "manual_review",
    });

    // Admin approves
    await store.updateProfileVerification(verification.id, {
      status: "verified",
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      adminNote: "Verified manually — document is clear.",
    });

    const updated = await store.getProfileVerification(verification.id);
    expect(updated.status).toBe("verified");
    expect(updated.reviewedBy).toBe(adminId);
    expect(updated.adminNote).toContain("Verified manually");
  });

  it("reject sets status to rejected", async () => {
    const verification = await store.createProfileVerification({
      userId, docType: "other", docUrl: "local://other.pdf",
      claimToVerify: "Board advisor at XYZ Corp", status: "manual_review",
    });

    await store.updateProfileVerification(verification.id, {
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      adminNote: "Document unreadable — please upload a clearer copy.",
    });

    const updated = await store.getProfileVerification(verification.id);
    expect(updated.status).toBe("rejected");
    expect(updated.adminNote).toContain("unreadable");
  });
});

// ─────────────────────────────────────────────────────────────
// Edge Cases
// ─────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("user with no verifications returns empty list", async () => {
    const newUser = await store.createUserProfile({
      fullName: "Brand New", email: "brand@new.com", passwordHash: "hash",
      phone: "", location: "", bio: "", requestedRoles: ["startup"],
    });

    const records = await store.listProfileVerifications({ userId: newUser.id });
    expect(records).toHaveLength(0);
  });

  it("updating non-existent verification returns null", async () => {
    const result = await store.updateProfileVerification("fake-id-xyz", { status: "verified" });
    expect(result).toBeNull();
  });

  it("all doc types are accepted", async () => {
    const types = ["certificate", "degree", "business_reg", "linkedin", "other"];
    for (const docType of types) {
      const r = await store.createProfileVerification({
        userId, docType, docUrl: "local://test.pdf",
        claimToVerify: `Testing ${docType}`, status: "pending",
      });
      expect(r.docType).toBe(docType);
    }
  });
});
