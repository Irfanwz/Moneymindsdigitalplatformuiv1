function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.map((e) => trimText(e)).filter(Boolean))];
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeGroupInput(input) {
  const name = trimText(input?.name);
  const description = trimText(input?.description);
  const isPaid = normalizeBoolean(input?.isPaid, false);

  return {
    name,
    description,
    category: trimText(input?.category) || "general",
    isPrivate: normalizeBoolean(input?.isPrivate, false),
    isPaid,
    joiningFee: isPaid ? trimText(input?.joiningFee) : "",
    monthlyFee: isPaid ? trimText(input?.monthlyFee) : "",
  };
}

export function normalizeSignalInput(input) {
  const postType = input?.postType === "post" ? "post" : "signal";

  return {
    postType,
    title: trimText(input?.title),
    content: trimText(input?.content),
    signalType: postType === "signal" ? trimText(input?.signalType) : "",
    targetPrice: postType === "signal" ? trimText(input?.targetPrice) : "",
    timeHorizon: postType === "signal" ? trimText(input?.timeHorizon) : "",
    confidenceLevel: postType === "signal" ? (trimText(input?.confidenceLevel) || "medium") : "",
    tags: normalizeStringArray(input?.tags),
    notifyMembers: normalizeBoolean(input?.notifyMembers, true),
    // AI Sentiment — initialized as null, populated async after creation
    sentiment: null,
    sentimentConfidence: null,
    sentimentReasoning: null,
    riskLevel: null,
    riskReasoning: null,
    actionability: null,
    actionabilityReasoning: null,
    entities: null,
    sectors: null,
    keyPoints: null,
    analyzedAt: null,
    // Prediction Accuracy — initialized as null, populated async after creation
    predictionDirection: null,
    predictionTargetPrice: null,
    predictionTimeframe: null,
    predictionTimeframeDays: null,
    predictionCheckDate: null,
    baselinePrice: null,
    baselineFetchedAt: null,
    actualPrice: null,
    predictionAccuracy: null,
    predictionResult: null,
    predictionCheckedAt: null,
    predictionExplanation: null,
  };
}
