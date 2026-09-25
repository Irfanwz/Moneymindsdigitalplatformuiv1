/**
 * Credibility Score System — Week 1 Tests
 * Covers: classification, scoring, streak penalty, volume multiplier, fee caps, tiers, store
 */
import { describe, it, expect, beforeAll } from "vitest";
import {
  classifyPrediction,
  calculateCredibilityScore,
  getTierForScore,
  validateFeeCap,
} from "../server/services/credibilityService.js";
import { createMemoryStore } from "../server/store/memoryStore.js";

// ─── Helper: mock signal ────────────────────────────────────────────────────

function signal(accuracy, result, checkedAt = "2026-09-10T00:00:00Z") {
  return {
    id: Math.random().toString(36).slice(2),
    predictionAccuracy: accuracy,
    predictionResult: result,
    predictionCheckedAt: checkedAt,
  };
}

// ─── Classification ─────────────────────────────────────────────────────────

describe("classifyPrediction", () => {
  it("accuracy 90+ → perfect", () => {
    expect(classifyPrediction(signal(100, "correct"))).toBe("perfect");
    expect(classifyPrediction(signal(95, "correct"))).toBe("perfect");
    expect(classifyPrediction(signal(90, "correct"))).toBe("perfect");
  });

  it("accuracy 70–89 → late", () => {
    expect(classifyPrediction(signal(85, "partial"))).toBe("late");
    expect(classifyPrediction(signal(70, "partial"))).toBe("late");
  });

  it("accuracy 50–69 → dateOnly", () => {
    expect(classifyPrediction(signal(50, "partial"))).toBe("dateOnly");
    expect(classifyPrediction(signal(65, "partial"))).toBe("dateOnly");
  });

  it("result incorrect → incorrect regardless of accuracy", () => {
    expect(classifyPrediction(signal(80, "incorrect"))).toBe("incorrect");
    expect(classifyPrediction(signal(0, "incorrect"))).toBe("incorrect");
  });

  it("accuracy < 50 with partial result → incorrect", () => {
    expect(classifyPrediction(signal(40, "partial"))).toBe("incorrect");
  });

  it("boundary: exactly 90 → perfect", () => {
    expect(classifyPrediction(signal(90, "correct"))).toBe("perfect");
  });

  it("boundary: exactly 70 → late", () => {
    expect(classifyPrediction(signal(70, "partial"))).toBe("late");
  });

  it("boundary: exactly 50 → dateOnly", () => {
    expect(classifyPrediction(signal(50, "partial"))).toBe("dateOnly");
  });
});

// ─── Scoring ────────────────────────────────────────────────────────────────

describe("calculateCredibilityScore", () => {
  it("returns null score when < 5 predictions", () => {
    const signals = [signal(100, "correct"), signal(85, "partial")];
    const result = calculateCredibilityScore(signals);
    expect(result.score).toBeNull();
    expect(result.totalPredictions).toBe(2);
  });

  it("all perfect predictions (5) → high score", () => {
    const signals = Array(5).fill(null).map(() => signal(100, "correct"));
    const result = calculateCredibilityScore(signals);
    expect(result.score).toBeGreaterThanOrEqual(70); // ×0.8 for 5 predictions
    expect(result.breakdown.perfect).toBe(5);
    expect(result.tier.tier).not.toBe("poor");
  });

  it("all incorrect predictions (5) → score 0", () => {
    const signals = Array(5).fill(null).map(() => signal(0, "incorrect"));
    const result = calculateCredibilityScore(signals);
    expect(result.score).toBe(0);
    expect(result.breakdown.incorrect).toBe(5);
    expect(result.tier.tier).toBe("poor");
  });

  it("mixed predictions produce middle score", () => {
    const signals = [
      signal(100, "correct"),
      signal(85, "partial"),
      signal(70, "partial"),
      signal(50, "partial"),
      signal(0, "incorrect"),
    ];
    const result = calculateCredibilityScore(signals);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
    expect(result.breakdown.perfect).toBe(1);    // 100 → perfect
    expect(result.breakdown.late).toBe(2);       // 85 + 70 → late
    expect(result.breakdown.dateOnly).toBe(1);   // 50 → dateOnly
    expect(result.breakdown.incorrect).toBe(1);  // 0 → incorrect
  });

  it("volume multiplier: 5 predictions → ×0.8", () => {
    const signals = Array(5).fill(null).map(() => signal(100, "correct"));
    const result = calculateCredibilityScore(signals);
    expect(result.volumeMultiplier).toBe(0.8);
  });

  it("volume multiplier: 20 predictions → ×1.0", () => {
    const signals = Array(20).fill(null).map(() => signal(100, "correct"));
    const result = calculateCredibilityScore(signals);
    expect(result.volumeMultiplier).toBe(1.0);
  });

  it("volume multiplier: 60 predictions → ×1.1", () => {
    const signals = Array(60).fill(null).map(() => signal(100, "correct"));
    const result = calculateCredibilityScore(signals);
    expect(result.volumeMultiplier).toBe(1.1);
  });

  it("volume multiplier: 120 predictions → ×1.2", () => {
    const signals = Array(120).fill(null).map(() => signal(100, "correct"));
    const result = calculateCredibilityScore(signals);
    expect(result.volumeMultiplier).toBe(1.2);
  });
});

// ─── Streak Penalty ─────────────────────────────────────────────────────────

describe("streak penalty", () => {
  it("no penalty for single incorrect at end", () => {
    const signals = [
      signal(100, "correct", "2026-09-01T00:00:00Z"),
      signal(100, "correct", "2026-09-02T00:00:00Z"),
      signal(100, "correct", "2026-09-03T00:00:00Z"),
      signal(100, "correct", "2026-09-04T00:00:00Z"),
      signal(0, "incorrect", "2026-09-05T00:00:00Z"),
    ];
    const result = calculateCredibilityScore(signals);
    expect(result.streakPenalty).toBe(0); // only 1 consecutive → no extra penalty
  });

  it("applies penalty for 3 consecutive incorrect at end", () => {
    const signals = [
      signal(100, "correct", "2026-09-01T00:00:00Z"),
      signal(100, "correct", "2026-09-02T00:00:00Z"),
      signal(0, "incorrect", "2026-09-03T00:00:00Z"),
      signal(0, "incorrect", "2026-09-04T00:00:00Z"),
      signal(0, "incorrect", "2026-09-05T00:00:00Z"),
    ];
    const result = calculateCredibilityScore(signals);
    expect(result.streakPenalty).toBe(-6); // 3 × -2
  });

  it("streak resets when a correct prediction breaks it", () => {
    const signals = [
      signal(0, "incorrect", "2026-09-01T00:00:00Z"),
      signal(0, "incorrect", "2026-09-02T00:00:00Z"),
      signal(100, "correct", "2026-09-03T00:00:00Z"),   // breaks streak
      signal(0, "incorrect", "2026-09-04T00:00:00Z"),
      signal(0, "incorrect", "2026-09-05T00:00:00Z"),
    ];
    const result = calculateCredibilityScore(signals);
    expect(result.streakPenalty).toBe(-4); // 2 consecutive at end × -2
  });
});

// ─── Tiers ──────────────────────────────────────────────────────────────────

describe("getTierForScore", () => {
  it("90+ → elite", () => expect(getTierForScore(95).tier).toBe("elite"));
  it("75-89 → expert", () => expect(getTierForScore(80).tier).toBe("expert"));
  it("60-74 → reliable", () => expect(getTierForScore(65).tier).toBe("reliable"));
  it("40-59 → developing", () => expect(getTierForScore(45).tier).toBe("developing"));
  it("20-39 → inconsistent", () => expect(getTierForScore(30).tier).toBe("inconsistent"));
  it("0-19 → poor", () => expect(getTierForScore(10).tier).toBe("poor"));

  it("boundary: exactly 90 → elite", () => expect(getTierForScore(90).tier).toBe("elite"));
  it("boundary: exactly 75 → expert", () => expect(getTierForScore(75).tier).toBe("expert"));
  it("boundary: exactly 60 → reliable", () => expect(getTierForScore(60).tier).toBe("reliable"));
  it("boundary: exactly 40 → developing", () => expect(getTierForScore(40).tier).toBe("developing"));
  it("boundary: exactly 0 → poor", () => expect(getTierForScore(0).tier).toBe("poor"));
});

// ─── Fee Caps ───────────────────────────────────────────────────────────────

describe("validateFeeCap", () => {
  it("null score → only free allowed", () => {
    expect(validateFeeCap(null, 0, 0).allowed).toBe(true);
    expect(validateFeeCap(null, 50, 0).allowed).toBe(false);
  });

  it("elite (95) → unlimited fees", () => {
    expect(validateFeeCap(95, 1000, 500).allowed).toBe(true);
  });

  it("expert (80) → max $500 join / $200 monthly", () => {
    expect(validateFeeCap(80, 500, 200).allowed).toBe(true);
    expect(validateFeeCap(80, 501, 200).allowed).toBe(false);
    expect(validateFeeCap(80, 500, 201).allowed).toBe(false);
  });

  it("reliable (65) → max $200 join / $100 monthly", () => {
    expect(validateFeeCap(65, 200, 100).allowed).toBe(true);
    expect(validateFeeCap(65, 201, 0).allowed).toBe(false);
  });

  it("developing (45) → max $50 join / $25 monthly", () => {
    expect(validateFeeCap(45, 50, 25).allowed).toBe(true);
    expect(validateFeeCap(45, 51, 0).allowed).toBe(false);
  });

  it("poor (10) → free only", () => {
    expect(validateFeeCap(10, 0, 0).allowed).toBe(true);
    expect(validateFeeCap(10, 1, 0).allowed).toBe(false);
  });

  it("rejection includes reason message", () => {
    const result = validateFeeCap(65, 500, 0);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Reliable");
    expect(result.reason).toContain("$200");
  });
});

// ─── Store: Credibility Methods ─────────────────────────────────────────────

describe("store: credibility", () => {
  let store;
  let advisorId;

  beforeAll(async () => {
    store = createMemoryStore();
    const user = await store.createUserProfile({
      fullName: "Score Advisor", email: "score@test.com", passwordHash: "hash",
      phone: "", location: "", bio: "", requestedRoles: ["advisor"],
    });
    advisorId = user.id;
    await store.upsertAdvisorProfile(advisorId, {
      title: "Test", bio: "", website: "", linkedin: "", twitter: "",
      contactEmail: "", yearsExperience: "", clientsHelped: "",
      specialization: "", previousRoles: "", expertiseAreas: [],
      certifications: [], industries: [], preferredStage: "",
      engagementType: "", availability: "", typicalRate: "",
      servicesOffered: "", defaultGroupType: "public",
      defaultJoiningFee: "0", defaultMonthlyFee: "0",
      autoApproveMembers: false, allowGroupDiscovery: true,
      enablePaymentProcessing: false, paymentEmail: "", taxId: "",
      isPublic: true, showContactInfo: true, allowConnectionRequests: true,
      showTestimonials: true,
    });
  });

  it("updateAdvisorCredibility persists score", async () => {
    await store.updateAdvisorCredibility(advisorId, {
      credibilityScore: 85,
      credibilityTier: "expert",
      credibilityUpdatedAt: "2026-09-12T00:00:00Z",
    });
    const profile = await store.findAdvisorProfileByUserId(advisorId);
    expect(profile.credibilityScore).toBe(85);
    expect(profile.credibilityTier).toBe("expert");
  });

  it("addCredibilityHistory + getCredibilityHistory works", async () => {
    await store.addCredibilityHistory(advisorId, {
      score: 85, tier: "expert", totalPredictions: 20,
      breakdown: { perfect: 10, late: 5, dateOnly: 3, incorrect: 2 },
    });
    await store.addCredibilityHistory(advisorId, {
      score: 88, tier: "expert", totalPredictions: 21,
      breakdown: { perfect: 11, late: 5, dateOnly: 3, incorrect: 2 },
    });

    const history = await store.getCredibilityHistory(advisorId);
    expect(history.length).toBe(2);
    // Both inserted in same tick — just check both scores are present
    const scores = history.map((h) => h.score);
    expect(scores).toContain(85);
    expect(scores).toContain(88);
  });

  it("listAdvisorIds returns all advisor userIds", async () => {
    const ids = await store.listAdvisorIds();
    expect(ids).toContain(advisorId);
  });
});
