function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((e) => trimText(e)).filter(Boolean))];
}

function normalizeInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeTrainingInput(input) {
  const type = input?.type === "paid" ? "paid" : "free";
  return {
    title: trimText(input?.title),
    description: trimText(input?.description),
    type,
    price: type === "paid" ? normalizeInt(input?.price, 0) : 0,
    format: ["online", "in-person", "hybrid"].includes(input?.format) ? input.format : "online",
    duration: trimText(input?.duration),
    schedule: trimText(input?.schedule),
    capacity: normalizeInt(input?.capacity, 50),
    status: ["upcoming", "ongoing", "completed"].includes(input?.status) ? input.status : "upcoming",
    topics: normalizeStringArray(input?.topics),
    location: trimText(input?.location),
    targetAudience: normalizeStringArray(input?.targetAudience),
    level: ["beginner", "intermediate", "advanced"].includes(input?.level) ? input.level : "beginner",
  };
}
