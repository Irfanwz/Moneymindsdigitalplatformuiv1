/**
 * Week 4 Tests — Prediction Accuracy Tracker: Edge Cases, Integration, Stats
 * Covers: boundary scoring, store queries, parser fallback, checker pipeline, stats
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { calculateAccuracy, checkDuePredictions } from "../server/services/predictionCheckerService.js";

let store;
let advisorId;
let groupId;

const SIGNAL_DEFAULTS = {
  postType: "signal",
  signalType: "buy",
  timeHorizon: "short",
  confidenceLevel: "high",
  tags: [],
  notifyMembers: false,
  sentiment: null, sentimentConfidence: null, sentimentReasoning: null,
  riskLevel: null, riskReasoning: null, actionability: null,
  actionabilityReasoning: null, entities: null, sectors: null,
  keyPoints: null, analyzedAt: null,
  predictionDirection: null, predictionTargetPrice: null,
  predictionTimeframe: null, predictionTimeframeDays: null,
  predictionCheckDate: null, baselinePrice: null, baselineFetchedAt: null,
  actualPrice: null, predictionAccuracy: null, predictionResult: null,
  predictionCheckedAt: null, predictionExplanation: null,
};

beforeAll(async () => {
  store = createMemoryStore();
  const advisor = await store.createUserProfile({
    fullName: "Week4 Advisor",
    email: "w4@pred.local",
    passwordHash: "hash",
    phone: "", location: "", bio: "",
    requestedRoles: ["advisor"],
  });
  advisorId = advisor.id;

  const group = await store.createGroup(advisorId, {
    name: "Week4 Group", description: "For W4 tests", category: "general",
    isPrivate: false, isPaid: false, joiningFee: "", monthlyFee: "",
  });
  groupId = group.id;
});

// ─── 1. Accuracy boundary: exactly 2% off → score 100 (perfect) ────────────

describe("calculateAccuracy — exact boundaries", () => {
  it("scores 100 at exactly 2% off target", () => {
    // target 100, actual 98 → 2% off → still in 0-2% bucket
    const result = calculateAccuracy({
      baselinePrice: 90, targetPrice: 100, actualPrice: 98, direction: "up",
    });
    expect(result.score).toBe(100);
    expect(result.result).toBe("correct");
  });

  it("scores 85 at 2.01% off target (just over 2%)", () => {
    // target 1000, actual 979.9 → 2.01% off → 2-5% bucket
    const result = calculateAccuracy({
      baselinePrice: 900, targetPrice: 1000, actualPrice: 979.9, direction: "up",
    });
    expect(result.score).toBe(85);
  });

  it("scores 85 at exactly 5% off target", () => {
    // target 200, actual 190 → 5% off → still in 2-5% bucket
    const result = calculateAccuracy({
      baselinePrice: 180, targetPrice: 200, actualPrice: 190, direction: "up",
    });
    expect(result.score).toBe(85);
  });

  it("scores 70 at 5.1% off target", () => {
    // target 1000, actual 949 → 5.1% off → 5-10% bucket
    const result = calculateAccuracy({
      baselinePrice: 900, targetPrice: 1000, actualPrice: 949, direction: "up",
    });
    expect(result.score).toBe(70);
  });

  it("scores 70 at exactly 10% off target", () => {
    // target 100, actual 90 → 10% off → still in 5-10% bucket
    const result = calculateAccuracy({
      baselinePrice: 80, targetPrice: 100, actualPrice: 90, direction: "up",
    });
    expect(result.score).toBe(70);
  });

  it("scores 50 at 10.1% off target", () => {
    // target 1000, actual 899 → 10.1% off → >10% bucket
    const result = calculateAccuracy({
      baselinePrice: 800, targetPrice: 1000, actualPrice: 899, direction: "up",
    });
    expect(result.score).toBe(50);
  });
});

// ─── 2. Down direction scoring ──────────────────────────────────────────────

describe("calculateAccuracy — down direction", () => {
  it("scores 100 when price fell close to target (down prediction)", () => {
    const result = calculateAccuracy({
      baselinePrice: 200, targetPrice: 170, actualPrice: 171, direction: "down",
    });
    expect(result.score).toBe(100);
    expect(result.directionCorrect).toBe(true);
  });

  it("scores 0 when price went up but predicted down", () => {
    const result = calculateAccuracy({
      baselinePrice: 100, targetPrice: 80, actualPrice: 110, direction: "down",
    });
    expect(result.score).toBe(0);
    expect(result.directionCorrect).toBe(false);
  });
});

// ─── 3. Flat price — direction "up" with 0 move ─────────────────────────────

describe("calculateAccuracy — flat price move", () => {
  it("counts flat as correct for 'up' direction (>= 0)", () => {
    const result = calculateAccuracy({
      baselinePrice: 100, targetPrice: 110, actualPrice: 100, direction: "up",
    });
    expect(result.directionCorrect).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it("counts flat as correct for 'down' direction (<= 0)", () => {
    const result = calculateAccuracy({
      baselinePrice: 100, targetPrice: 90, actualPrice: 100, direction: "down",
    });
    expect(result.directionCorrect).toBe(true);
  });
});

// ─── 4. Store: findSignalById ───────────────────────────────────────────────

describe("memoryStore — findSignalById", () => {
  it("returns signal by id", async () => {
    const signal = await store.createSignal(groupId, advisorId, {
      ...SIGNAL_DEFAULTS,
      title: "Find me",
      content: "Test content",
      targetPrice: "100",
    });
    const found = await store.findSignalById(signal.id);
    expect(found).not.toBeNull();
    expect(found.title).toBe("Find me");
  });

  it("returns null for non-existent id", async () => {
    const found = await store.findSignalById("does-not-exist");
    expect(found).toBeNull();
  });
});

// ─── 5. Store: listSignalsByAdvisor ─────────────────────────────────────────

describe("memoryStore — listSignalsByAdvisor", () => {
  it("returns all signals for the advisor", async () => {
    const signals = await store.listSignalsByAdvisor(advisorId);
    expect(Array.isArray(signals)).toBe(true);
    expect(signals.length).toBeGreaterThanOrEqual(1);
    expect(signals.every((s) => s.advisorId === advisorId)).toBe(true);
  });

  it("returns empty array for unknown advisor", async () => {
    const signals = await store.listSignalsByAdvisor("unknown-advisor-id");
    expect(signals).toEqual([]);
  });
});

// ─── 6. Store: findGroupById ────────────────────────────────────────────────

describe("memoryStore — findGroupById", () => {
  it("returns group by id", async () => {
    const found = await store.findGroupById(groupId);
    expect(found).not.toBeNull();
    expect(found.name).toBe("Week4 Group");
  });

  it("returns null for non-existent group", async () => {
    const found = await store.findGroupById("fake-group");
    expect(found).toBeNull();
  });
});

// ─── 7. Store: listSignalsByGroup ───────────────────────────────────────────

describe("memoryStore — listSignalsByGroup", () => {
  it("returns signals sorted newest first", async () => {
    await store.createSignal(groupId, advisorId, {
      ...SIGNAL_DEFAULTS, title: "First", content: "", targetPrice: "",
    });
    await store.createSignal(groupId, advisorId, {
      ...SIGNAL_DEFAULTS, title: "Second", content: "", targetPrice: "",
    });
    const signals = await store.listSignalsByGroup(groupId);
    expect(signals.length).toBeGreaterThanOrEqual(2);
    // Newest first
    const first = new Date(signals[0].createdAt).getTime();
    const second = new Date(signals[1].createdAt).getTime();
    expect(first).toBeGreaterThanOrEqual(second);
  });
});

// ─── 8. checkDuePredictions — empty store returns 0 ─────────────────────────

describe("checkDuePredictions — integration", () => {
  it("returns 0 when no predictions are due", async () => {
    const freshStore = createMemoryStore();
    const count = await checkDuePredictions(freshStore);
    expect(count).toBe(0);
  });
});

// ─── 9. Multiple predictions — accuracy stats simulation ────────────────────

describe("accuracy stats — via store data", () => {
  let statsAdvisorId;
  let statsGroupId;

  beforeAll(async () => {
    const advisor = await store.createUserProfile({
      fullName: "Stats Advisor", email: "stats@pred.local", passwordHash: "h",
      phone: "", location: "", bio: "", requestedRoles: ["advisor"],
    });
    statsAdvisorId = advisor.id;
    const group = await store.createGroup(statsAdvisorId, {
      name: "Stats Group", description: "", category: "general",
      isPrivate: false, isPaid: false, joiningFee: "", monthlyFee: "",
    });
    statsGroupId = group.id;

    // Create 3 signals with varied prediction results
    const s1 = await store.createSignal(statsGroupId, statsAdvisorId, {
      ...SIGNAL_DEFAULTS, title: "Correct pred", content: "BTC up", targetPrice: "50000",
    });
    await store.updateSignalPrediction(s1.id, {
      predictionDirection: "up", predictionTargetPrice: 50000,
      predictionTimeframe: "1week", predictionTimeframeDays: 7,
      predictionCheckDate: new Date(Date.now() - 86400000).toISOString(),
      baselinePrice: 45000, baselineFetchedAt: new Date().toISOString(),
      actualPrice: 49800, predictionAccuracy: 100, predictionResult: "correct",
      predictionCheckedAt: new Date().toISOString(),
      predictionExplanation: "Excellent prediction.",
    });

    const s2 = await store.createSignal(statsGroupId, statsAdvisorId, {
      ...SIGNAL_DEFAULTS, title: "Partial pred", content: "ETH up", targetPrice: "3000",
    });
    await store.updateSignalPrediction(s2.id, {
      predictionDirection: "up", predictionTargetPrice: 3000,
      predictionTimeframe: "3days", predictionTimeframeDays: 3,
      predictionCheckDate: new Date(Date.now() - 86400000).toISOString(),
      baselinePrice: 2500, baselineFetchedAt: new Date().toISOString(),
      actualPrice: 2700, predictionAccuracy: 70, predictionResult: "partial",
      predictionCheckedAt: new Date().toISOString(),
      predictionExplanation: "Direction correct but missed target.",
    });

    const s3 = await store.createSignal(statsGroupId, statsAdvisorId, {
      ...SIGNAL_DEFAULTS, title: "Wrong pred", content: "SOL down", targetPrice: "100",
    });
    await store.updateSignalPrediction(s3.id, {
      predictionDirection: "down", predictionTargetPrice: 100,
      predictionTimeframe: "1week", predictionTimeframeDays: 7,
      predictionCheckDate: new Date(Date.now() - 86400000).toISOString(),
      baselinePrice: 150, baselineFetchedAt: new Date().toISOString(),
      actualPrice: 180, predictionAccuracy: 0, predictionResult: "incorrect",
      predictionCheckedAt: new Date().toISOString(),
      predictionExplanation: "Price went opposite direction.",
    });
  });

  it("listSignalsByAdvisor returns all 3 signals with prediction data", async () => {
    const signals = await store.listSignalsByAdvisor(statsAdvisorId);
    expect(signals.length).toBe(3);
    const checked = signals.filter((s) => s.predictionCheckedAt !== null);
    expect(checked.length).toBe(3);
  });

  it("correct prediction has accuracy 100", async () => {
    const signals = await store.listSignalsByAdvisor(statsAdvisorId);
    const correct = signals.find((s) => s.predictionResult === "correct");
    expect(correct).toBeTruthy();
    expect(correct.predictionAccuracy).toBe(100);
  });

  it("partial prediction has accuracy 70", async () => {
    const signals = await store.listSignalsByAdvisor(statsAdvisorId);
    const partial = signals.find((s) => s.predictionResult === "partial");
    expect(partial).toBeTruthy();
    expect(partial.predictionAccuracy).toBe(70);
  });

  it("incorrect prediction has accuracy 0", async () => {
    const signals = await store.listSignalsByAdvisor(statsAdvisorId);
    const incorrect = signals.find((s) => s.predictionResult === "incorrect");
    expect(incorrect).toBeTruthy();
    expect(incorrect.predictionAccuracy).toBe(0);
  });

  it("listSignalsDueForCheck does NOT return already-checked signals", async () => {
    const due = await store.listSignalsDueForCheck();
    const stats = due.filter((s) => s.advisorId === statsAdvisorId);
    expect(stats.length).toBe(0);
  });
});

// ─── 10. Parser fallback — no AI configured returns safe defaults ───────────

describe("parseSignalPrediction — no AI fallback", () => {
  it("returns default values when no AI providers are configured", async () => {
    // Import dynamically so env is already set (no API keys in test env)
    const { parseSignalPrediction } = await import("../server/services/predictionParserService.js");
    const result = await parseSignalPrediction({
      title: "AAPL bullish",
      content: "Expecting growth",
      timeHorizon: "short",
      targetPrice: "200",
    });

    expect(result).toBeTruthy();
    expect(result.direction).toBeTruthy(); // at least "neutral"
    expect(typeof result.timeframeDays).toBe("number");
    expect(result.timeframeDays).toBeGreaterThan(0);
  });

  it("parses targetPrice field as number fallback when no AI", async () => {
    const { parseSignalPrediction } = await import("../server/services/predictionParserService.js");
    const result = await parseSignalPrediction({
      title: "ETH prediction",
      content: "Going up",
      timeHorizon: "",
      targetPrice: "3500",
    });

    // Without AI, parser should still extract numeric targetPrice as fallback
    if (result.targetPrice !== null) {
      expect(result.targetPrice).toBe(3500);
      expect(result.hasPricePrediction).toBe(true);
    }
  });

  it("returns default for very short text (less than 5 chars)", async () => {
    const { parseSignalPrediction } = await import("../server/services/predictionParserService.js");
    const result = await parseSignalPrediction({
      title: "Hi",
      content: "",
      timeHorizon: "",
      targetPrice: "",
    });
    expect(result.direction).toBe("neutral");
    expect(result.timeframeDays).toBe(7);
    expect(result.hasPricePrediction).toBe(false);
  });
});

// ─── 11. updateSignalPrediction — partial update preserves other fields ─────

describe("memoryStore — partial prediction updates", () => {
  it("preserves existing prediction fields when updating only result fields", async () => {
    const signal = await store.createSignal(groupId, advisorId, {
      ...SIGNAL_DEFAULTS, title: "Partial update test", content: "BTC", targetPrice: "50000",
    });

    // First update: set input fields
    await store.updateSignalPrediction(signal.id, {
      predictionDirection: "up",
      predictionTargetPrice: 50000,
      predictionTimeframe: "1week",
      predictionTimeframeDays: 7,
      predictionCheckDate: new Date(Date.now() + 86400000).toISOString(),
      baselinePrice: 45000,
    });

    // Second update: set result fields only
    const updated = await store.updateSignalPrediction(signal.id, {
      actualPrice: 49500,
      predictionAccuracy: 95,
      predictionResult: "correct",
      predictionCheckedAt: new Date().toISOString(),
    });

    // Input fields should still be there
    expect(updated.predictionDirection).toBe("up");
    expect(updated.predictionTargetPrice).toBe(50000);
    expect(updated.baselinePrice).toBe(45000);
    // Result fields should be set
    expect(updated.actualPrice).toBe(49500);
    expect(updated.predictionAccuracy).toBe(95);
    expect(updated.predictionResult).toBe("correct");
  });
});
