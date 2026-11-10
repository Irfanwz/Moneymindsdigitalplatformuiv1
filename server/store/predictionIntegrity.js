// Once market evidence is committed, deleting or rewriting it would change
// an advisor's track record. Visibility moderation remains available separately.
export function hasPredictionEvidence(signal) {
  return signal.predictionCheckDate != null || signal.baselinePrice != null || signal.predictionCheckedAt != null;
}

export function predictionConflict() {
  return Object.assign(new Error("This prediction's recorded evidence must be preserved. Publish a new post for changes."), {
    code: "PREDICTION_HISTORY_LOCKED", status: 409,
  });
}

const inputs = ["predictionTicker", "predictionAssetType", "predictionDirection", "predictionTargetPrice", "predictionTimeframe",
  "predictionTimeframeDays", "predictionCheckDate", "baselinePrice", "baselineFetchedAt"];
const outcomes = ["actualPrice", "predictionAccuracy", "predictionResult", "predictionCheckedAt", "predictionExplanation", "predictionPriceEvidence"];

export function assertPredictionUpdate(signal, data) {
  const locked = [...(hasPredictionEvidence(signal) ? inputs : []), ...(signal.predictionCheckedAt ? outcomes : [])];
  if (locked.some(key => data[key] !== undefined && JSON.stringify(data[key]) !== JSON.stringify(signal[key]))) throw predictionConflict();
}
