/**
 * credibilityService.js — Advisor Credibility Scoring Engine
 *
 * Takes all checked predictions for an advisor, classifies each into 4 types,
 * applies points + streak penalty + volume multiplier, returns a 0–100 score.
 *
 * Classification:
 *   Perfect Match  — direction correct + price within 2%    → +10 pts
 *   Late Match     — direction correct + price 2–10% off    → +6 pts
 *   Date Only      — direction correct + price >10% off     → +3 pts
 *   Incorrect      — direction wrong                        → -5 pts
 *
 * Consecutive incorrect streak: extra -2 per streak length
 *
 * Volume Multiplier:
 *   < 5 predictions  → score hidden (null)
 *   5–15             → ×0.8
 *   16–50            → ×1.0
 *   51–100           → ×1.1
 *   100+             → ×1.2
 *
 * Tiers:
 *   90–100 → Elite        (Unlimited fees)
 *   75–89  → Expert       (Max $500 join / $200/month)
 *   60–74  → Reliable     (Max $200 join / $100/month)
 *   40–59  → Developing   (Max $50  join / $25/month)
 *   20–39  → Inconsistent (Free only)
 *   0–19   → Poor         (Free only)
 */

// ─── Point values ────────────────────────────────────────────────────────────

const POINTS = {
  perfect:   10,
  late:       6,
  dateOnly:   3,
  incorrect: -5,
};

const STREAK_PENALTY = -2; // extra per consecutive incorrect

// ─── Volume multiplier ──────────────────────────────────────────────────────

const MIN_PREDICTIONS = 5;

function getVolumeMultiplier(count) {
  if (count < MIN_PREDICTIONS) return null;     // too few → hide score
  if (count <= 15) return 0.8;
  if (count <= 50) return 1.0;
  if (count <= 100) return 1.1;
  return 1.2;
}

// ─── Tier lookup ─────────────────────────────────────────────────────────────

const TIERS = [
  { min: 90, tier: "elite",        label: "Elite Advisor",      color: "purple", maxJoinFee: Infinity, maxMonthlyFee: Infinity },
  { min: 75, tier: "expert",       label: "Expert",             color: "green",  maxJoinFee: 500,      maxMonthlyFee: 200 },
  { min: 60, tier: "reliable",     label: "Reliable",           color: "blue",   maxJoinFee: 200,      maxMonthlyFee: 100 },
  { min: 40, tier: "developing",   label: "Developing",         color: "yellow", maxJoinFee: 50,       maxMonthlyFee: 25 },
  { min: 20, tier: "inconsistent", label: "Inconsistent",       color: "orange", maxJoinFee: 0,        maxMonthlyFee: 0 },
  { min: 0,  tier: "poor",         label: "Poor Track Record",  color: "red",    maxJoinFee: 0,        maxMonthlyFee: 0 },
];

export function getTierForScore(score) {
  for (const t of TIERS) {
    if (score >= t.min) return t;
  }
  return TIERS[TIERS.length - 1];
}

// ─── Prediction classifier ──────────────────────────────────────────────────

/**
 * Classify a checked prediction into one of 4 credibility types.
 *
 * Uses the existing predictionAccuracy (0–100) and predictionResult fields
 * from the prediction checker:
 *   - accuracy 90+  → Perfect Match
 *   - accuracy 70–89 → Late Match (direction right, price not perfect)
 *   - accuracy 50–69 → Date Only (direction right, price far off)
 *   - accuracy <50 or result "incorrect" → Incorrect
 */
export function classifyPrediction(signal) {
  const result = signal.predictionResult;
  const accuracy = signal.predictionAccuracy ?? 0;

  if (result === "incorrect") return "incorrect";
  if (accuracy >= 90)  return "perfect";
  if (accuracy >= 70)  return "late";
  if (accuracy >= 50)  return "dateOnly";
  return "incorrect";
}

// ─── Main scoring function ───────────────────────────────────────────────────

/**
 * Calculate the credibility score for an advisor.
 *
 * @param {object[]} checkedSignals — signals with predictionResult + predictionAccuracy set
 * @returns {{ score: number|null, tier: object, breakdown: object, streakPenalty: number, volumeMultiplier: number|null, totalPredictions: number }}
 */
export function calculateCredibilityScore(checkedSignals) {
  const total = checkedSignals.length;

  // Not enough data
  if (total < MIN_PREDICTIONS) {
    return {
      score: null,
      rawScore: null,
      tier: null,
      breakdown: { perfect: 0, late: 0, dateOnly: 0, incorrect: 0 },
      streakPenalty: 0,
      volumeMultiplier: null,
      totalPredictions: total,
      minRequired: MIN_PREDICTIONS,
    };
  }

  // 1) Classify each prediction
  const breakdown = { perfect: 0, late: 0, dateOnly: 0, incorrect: 0 };
  const classifications = [];

  for (const signal of checkedSignals) {
    const type = classifyPrediction(signal);
    breakdown[type]++;
    classifications.push({ signalId: signal.id, type, checkedAt: signal.predictionCheckedAt });
  }

  // 2) Calculate raw points
  let rawPoints =
    breakdown.perfect   * POINTS.perfect +
    breakdown.late      * POINTS.late +
    breakdown.dateOnly  * POINTS.dateOnly +
    breakdown.incorrect * POINTS.incorrect;

  // 3) Streak penalty — consecutive incorrect from most recent
  const sorted = [...classifications].sort((a, b) => (b.checkedAt ?? "").localeCompare(a.checkedAt ?? ""));
  let consecutiveIncorrect = 0;
  for (const c of sorted) {
    if (c.type === "incorrect") consecutiveIncorrect++;
    else break;
  }
  const streakPenalty = consecutiveIncorrect > 1 ? consecutiveIncorrect * STREAK_PENALTY : 0;
  rawPoints += streakPenalty;

  // 4) Normalize to 0–100
  // Max possible = total * POINTS.perfect = total * 10
  const maxPoints = total * POINTS.perfect;
  // Min possible = total * POINTS.incorrect = total * -5, but clamp to 0
  let normalized = maxPoints > 0 ? Math.round((rawPoints / maxPoints) * 100) : 0;
  normalized = Math.max(0, Math.min(100, normalized));

  // 5) Apply volume multiplier
  const volumeMultiplier = getVolumeMultiplier(total);
  const finalScore = Math.max(0, Math.min(100, Math.round(normalized * volumeMultiplier)));

  // 6) Determine tier
  const tier = getTierForScore(finalScore);

  return {
    score: finalScore,
    rawScore: normalized,
    tier,
    breakdown,
    streakPenalty,
    volumeMultiplier,
    totalPredictions: total,
    minRequired: MIN_PREDICTIONS,
  };
}

// ─── Fee cap validation ──────────────────────────────────────────────────────

/**
 * Check if an advisor's fee is within their credibility tier cap.
 * Returns { allowed: true } or { allowed: false, reason, maxJoinFee, maxMonthlyFee }.
 */
export function validateFeeCap(credibilityScore, joiningFee, monthlyFee) {
  if (credibilityScore === null) {
    // Not enough predictions — allow free only
    return {
      allowed: joiningFee <= 0 && monthlyFee <= 0,
      reason: joiningFee > 0 || monthlyFee > 0
        ? "You need at least 5 checked predictions before charging fees."
        : null,
      maxJoinFee: 0,
      maxMonthlyFee: 0,
    };
  }

  const tier = getTierForScore(credibilityScore);

  const joinOk = joiningFee <= tier.maxJoinFee;
  const monthlyOk = monthlyFee <= tier.maxMonthlyFee;

  if (joinOk && monthlyOk) {
    return { allowed: true, reason: null, maxJoinFee: tier.maxJoinFee, maxMonthlyFee: tier.maxMonthlyFee };
  }

  const parts = [];
  if (!joinOk) parts.push(`joining fee exceeds $${tier.maxJoinFee} cap`);
  if (!monthlyOk) parts.push(`monthly fee exceeds $${tier.maxMonthlyFee} cap`);

  return {
    allowed: false,
    reason: `Your ${tier.label} tier (score: ${credibilityScore}) limits: ${parts.join(" and ")}. Improve your prediction accuracy to unlock higher fees.`,
    maxJoinFee: tier.maxJoinFee,
    maxMonthlyFee: tier.maxMonthlyFee,
  };
}

// ─── Full pipeline: calculate + persist ──────────────────────────────────────

/**
 * Recalculate credibility score for one advisor and persist to store.
 * @param {string} advisorId
 * @param {object} store
 * @returns {Promise<object>} the credibility result
 */
export async function recalculateForAdvisor(advisorId, store) {
  // Get all checked signals for this advisor
  const allSignals = await store.listSignalsByAdvisor(advisorId).catch(() => []);
  const checked = allSignals.filter(
    (s) => s.predictionResult && s.predictionCheckedAt
  );

  const result = calculateCredibilityScore(checked);

  // Persist to advisor profile
  await store.updateAdvisorCredibility(advisorId, {
    credibilityScore: result.score,
    credibilityTier: result.tier?.tier ?? null,
    credibilityUpdatedAt: new Date().toISOString(),
  });

  // Save history snapshot
  if (result.score !== null) {
    await store.addCredibilityHistory(advisorId, {
      score: result.score,
      tier: result.tier.tier,
      totalPredictions: result.totalPredictions,
      breakdown: result.breakdown,
    });
  }

  return result;
}

/**
 * Recalculate credibility scores for ALL advisors with profiles.
 * Called by the daily cron job.
 */
export async function recalculateAll(store) {
  const advisors = await store.listAdvisorIds().catch(() => []);
  let updated = 0;

  for (const advisorId of advisors) {
    try {
      await recalculateForAdvisor(advisorId, store);
      updated++;
    } catch (err) {
      console.error(`[Credibility] Failed for ${advisorId}:`, err.message);
    }
  }

  return updated;
}
