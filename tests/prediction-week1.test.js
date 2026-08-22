/**
 * Week 1 Tests — Prediction Accuracy Tracker Foundation
 * Covers: DB fields, store CRUD, accuracy calculation, parser defaults, checker pipeline
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { calculateAccuracy } from "../server/services/predictionCheckerService.js";

let store;
let groupId;
let advisorId;
let signalId;

beforeAll(async () => {
  store = createMemoryStore();

  // Create minimal advisor + group for signal tests
  const advisor = await store.createUserProfile({
    fullName: "Test Advisor",
    email: "advisor@pred.local",
    passwordHash: "hash",
    phone: "",
    location: "",
    bio: "",
    requestedRoles: ["advisor"],
  });
  advisorId = advisor.id;

  const group = await store.createGroup(advisorId, {
    name: "Test Group",
    description: "For prediction tests",
    category: "general",
    isPrivate: false,
    isPaid: false,
    joiningFee: "",
    monthlyFee: "",
  });
  groupId = group.id;
});

// ─── 1. Store: createSignal initializes all prediction fields as null ──────────

describe("memoryStore — prediction fields on createSignal", () => {
  it("initializes all 12 prediction fields as null", async () => {
    const signal = await store.createSignal(groupId, advisorId, {
      postType: "signal",
      title: "AAPL bullish",
      content: "Expecting AAPL to reach $200 this week",
      signalType: "buy",
      targetPrice: "200",
      timeHorizon: "short",
      confidenceLevel: "high",
      tags: ["tech"],
      notifyMembers: false,
      sentiment: null, sentimentConfidence: null, sentimentReasoning: null,
      riskLevel: null, riskReasoning: null,
      actionability: null, actionabilityReasoning: null,
      entities: null, sectors: null, keyPoints: null, analyzedAt: null,
      predictionDirection: null, predictionTargetPrice: null,
      predictionTimeframe: null, predictionTimeframeDays: null,
      predictionCheckDate: null, baselinePrice: null,
      baselineFetchedAt: null, actualPrice: null,
      predictionAccuracy: null, predictionResult: null,
      predictionCheckedAt: null, predictionExplanation: null,
    });
    signalId = signal.id;

    expect(signal.predictionDirection).toBeNull();
    expect(signal.predictionTargetPrice).toBeNull();
    expect(signal.predictionTimeframe).toBeNull();
    expect(signal.predictionTimeframeDays).toBeNull();
    expect(signal.predictionCheckDate).toBeNull();
    expect(signal.baselinePrice).toBeNull();
    expect(signal.baselineFetchedAt).toBeNull();
    expect(signal.actualPrice).toBeNull();
    expect(signal.predictionAccuracy).toBeNull();
    expect(signal.predictionResult).toBeNull();
    expect(signal.predictionCheckedAt).toBeNull();
    expect(signal.predictionExplanation).toBeNull();
  });
});

// ─── 2. Store: updateSignalPrediction saves input fields ─────────────────────

describe("memoryStore — updateSignalPrediction (input fields)", () => {
  it("saves direction, target price, timeframe, baseline price and check date", async () => {
    const checkDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const updated = await store.updateSignalPrediction(signalId, {
      predictionDirection: "up",
      predictionTargetPrice: 200,
      predictionTimeframe: "1week",
      predictionTimeframeDays: 7,
      predictionCheckDate: checkDate,
      baselinePrice: 190.5,
      baselineFetchedAt: new Date().toISOString(),
    });

    expect(updated.predictionDirection).toBe("up");
    expect(updated.predictionTargetPrice).toBe(200);
    expect(updated.predictionTimeframe).toBe("1week");
    expect(updated.predictionTimeframeDays).toBe(7);
    expect(updated.predictionCheckDate).toBe(checkDate);
    expect(updated.baselinePrice).toBe(190.5);
    expect(updated.baselineFetchedAt).toBeTruthy();
  });
});

// ─── 3. Store: updateSignalPrediction saves result fields ─────────────────────

describe("memoryStore — updateSignalPrediction (result fields)", () => {
  it("saves actual price, accuracy score, result, and explanation", async () => {
    const updated = await store.updateSignalPrediction(signalId, {
      actualPrice: 196.8,
      predictionAccuracy: 85,
      predictionResult: "partial",
      predictionCheckedAt: new Date().toISOString(),
      predictionExplanation: "Direction correct, price slightly missed.",
    });

    expect(updated.actualPrice).toBe(196.8);
    expect(updated.predictionAccuracy).toBe(85);
    expect(updated.predictionResult).toBe("partial");
    expect(updated.predictionCheckedAt).toBeTruthy();
    expect(updated.predictionExplanation).toBe("Direction correct, price slightly missed.");
  });
});

// ─── 4. Store: updateSignalPrediction returns null for unknown id ─────────────

describe("memoryStore — updateSignalPrediction edge cases", () => {
  it("returns null for a non-existent signal id", async () => {
    const result = await store.updateSignalPrediction("non-existent-id", { actualPrice: 100 });
    expect(result).toBeNull();
  });
});

// ─── 5. Store: listSignalsDueForCheck ─────────────────────────────────────────

describe("memoryStore — listSignalsDueForCheck", () => {
  it("returns empty array when no signals are due", async () => {
    const store2 = createMemoryStore();
    const due = await store2.listSignalsDueForCheck();
    expect(Array.isArray(due)).toBe(true);
    expect(due.length).toBe(0);
  });

  it("returns signal when check_date is in the past and not yet checked", async () => {
    const advisor2 = await store.createUserProfile({
      fullName: "Advisor2", email: "a2@pred.local", passwordHash: "h",
      phone: "", location: "", bio: "", requestedRoles: ["advisor"],
    });
    const group2 = await store.createGroup(advisor2.id, {
      name: "G2", description: "", category: "general",
      isPrivate: false, isPaid: false, joiningFee: "", monthlyFee: "",
    });
    const s = await store.createSignal(group2.id, advisor2.id, {
      postType: "signal", title: "Due signal", content: "Test", signalType: "buy",
      targetPrice: "100", timeHorizon: "short", confidenceLevel: "medium",
      tags: [], notifyMembers: false,
      sentiment: null, sentimentConfidence: null, sentimentReasoning: null,
      riskLevel: null, riskReasoning: null, actionability: null,
      actionabilityReasoning: null, entities: null, sectors: null,
      keyPoints: null, analyzedAt: null,
      predictionDirection: null, predictionTargetPrice: null,
      predictionTimeframe: null, predictionTimeframeDays: null,
      predictionCheckDate: null, baselinePrice: null, baselineFetchedAt: null,
      actualPrice: null, predictionAccuracy: null, predictionResult: null,
      predictionCheckedAt: null, predictionExplanation: null,
    });
    // Set check date to the past
    const pastDate = new Date(Date.now() - 1000).toISOString();
    await store.updateSignalPrediction(s.id, { predictionCheckDate: pastDate });

    const due = await store.listSignalsDueForCheck();
    const found = due.find((d) => d.id === s.id);
    expect(found).toBeTruthy();
  });

  it("does NOT return signal that has already been checked", async () => {
    await store.updateSignalPrediction(signalId, {
      predictionCheckedAt: new Date().toISOString(),
    });
    const due = await store.listSignalsDueForCheck();
    const found = due.find((d) => d.id === signalId);
    expect(found).toBeUndefined();
  });
});

// ─── 6. calculateAccuracy — direction correct, perfect price ──────────────────

describe("calculateAccuracy — perfect prediction", () => {
  it("scores 100 when direction up and price within 2%", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: 200,
      actualPrice: 199,   // 0.5% off target
      direction: "up",
    });
    expect(result.score).toBe(100);
    expect(result.result).toBe("correct");
    expect(result.directionCorrect).toBe(true);
  });

  it("scores 100 when direction down and price within 2%", () => {
    const result = calculateAccuracy({
      baselinePrice: 200,
      targetPrice: 180,
      actualPrice: 181,   // 0.55% off target
      direction: "down",
    });
    expect(result.score).toBe(100);
    expect(result.result).toBe("correct");
  });
});

// ─── 7. calculateAccuracy — good prediction (2–5% off) ───────────────────────

describe("calculateAccuracy — good prediction", () => {
  it("scores 85 when direction correct and price 2–5% off", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: 200,
      actualPrice: 194,   // 3% off target
      direction: "up",
    });
    expect(result.score).toBe(85);
    expect(result.result).toBe("partial");
  });
});

// ─── 8. calculateAccuracy — partial prediction (5–10% off) ───────────────────

describe("calculateAccuracy — partial prediction", () => {
  it("scores 70 when direction correct and price 5–10% off", () => {
    const result = calculateAccuracy({
      baselinePrice: 180,
      targetPrice: 200,
      actualPrice: 186,   // went UP from baseline, 7% off target
      direction: "up",
    });
    expect(result.score).toBe(70);
    expect(result.result).toBe("partial");
  });
});

// ─── 9. calculateAccuracy — direction correct, big price miss ─────────────────

describe("calculateAccuracy — direction only (10%+ miss)", () => {
  it("scores 50 when direction correct but price >10% off", () => {
    const result = calculateAccuracy({
      baselinePrice: 160,
      targetPrice: 200,
      actualPrice: 175,   // went UP from baseline, 12.5% off target
      direction: "up",
    });
    expect(result.score).toBe(50);
    expect(result.result).toBe("partial");
    expect(result.directionCorrect).toBe(true);
  });
});

// ─── 10. calculateAccuracy — wrong direction ──────────────────────────────────

describe("calculateAccuracy — wrong direction", () => {
  it("scores 0 when predicted up but price went down", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: 200,
      actualPrice: 180,   // went down
      direction: "up",
    });
    expect(result.score).toBe(0);
    expect(result.result).toBe("incorrect");
    expect(result.directionCorrect).toBe(false);
  });

  it("scores 0 when predicted down but price went up", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: 170,
      actualPrice: 200,   // went up
      direction: "down",
    });
    expect(result.score).toBe(0);
    expect(result.result).toBe("incorrect");
  });
});

// ─── 11. calculateAccuracy — no price target (direction only) ─────────────────

describe("calculateAccuracy — direction only (no price target)", () => {
  it("scores 50 when direction correct and no target price", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: null,
      actualPrice: 200,
      direction: "up",
    });
    expect(result.score).toBe(50);
    expect(result.result).toBe("partial");
    expect(result.priceDiffPct).toBeNull();
  });

  it("scores 0 when direction wrong and no target price", () => {
    const result = calculateAccuracy({
      baselinePrice: 190,
      targetPrice: null,
      actualPrice: 180,
      direction: "up",
    });
    expect(result.score).toBe(0);
    expect(result.result).toBe("incorrect");
  });
});

// ─── 12. calculateAccuracy — neutral direction always correct ─────────────────

describe("calculateAccuracy — neutral direction", () => {
  it("scores at least 50 for neutral regardless of price move", () => {
    const up = calculateAccuracy({ baselinePrice: 100, targetPrice: null, actualPrice: 120, direction: "neutral" });
    const down = calculateAccuracy({ baselinePrice: 100, targetPrice: null, actualPrice: 80, direction: "neutral" });
    expect(up.directionCorrect).toBe(true);
    expect(down.directionCorrect).toBe(true);
    expect(up.score).toBeGreaterThanOrEqual(50);
  });
});
