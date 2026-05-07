function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .map((entry) => trimText(entry))
      .filter(Boolean),
  )];
}

function normalizeTeamMembers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((member) => ({
      name: trimText(member?.name),
      role: trimText(member?.role),
      linkedin: trimText(member?.linkedin),
    }))
    .filter((member) => member.name || member.role || member.linkedin);
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeFoundedYear(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildStartupProfile(user, profile) {
  return {
    id: profile?.id ?? null,
    userId: user.id,
    companyName: profile?.companyName ?? "",
    tagline: profile?.tagline ?? "",
    industry: profile?.industry ?? "",
    foundedYear: profile?.foundedYear ? String(profile.foundedYear) : "",
    location: profile?.location ?? user.location ?? "",
    description: profile?.description ?? "",
    website: profile?.website ?? "",
    linkedin: profile?.linkedin ?? "",
    twitter: profile?.twitter ?? "",
    contactEmail: profile?.contactEmail ?? user.email,
    stage: profile?.stage ?? "",
    totalRaised: profile?.totalRaised ?? "",
    fundingGoal: profile?.fundingGoal ?? "",
    valuation: profile?.valuation ?? "",
    pitch: profile?.pitch ?? "",
    categories: profile?.categories?.length
      ? profile.categories
      : profile?.industry
        ? [profile.industry]
        : [],
    teamMembers: profile?.teamMembers ?? [],
    isPublic: profile?.isPublic ?? true,
    showContactInfo: profile?.showContactInfo ?? true,
    allowAdvisorInvitations: profile?.allowAdvisorInvitations ?? true,
    createdAt: profile?.createdAt ?? null,
    updatedAt: profile?.updatedAt ?? null,
  };
}

export function normalizeStartupProfileInput(input, user) {
  const companyName = trimText(input?.companyName);
  const industry = trimText(input?.industry);
  const description = trimText(input?.description);
  const stage = trimText(input?.stage);
  const categories = normalizeStringArray(input?.categories);

  return {
    companyName,
    tagline: trimText(input?.tagline),
    industry,
    foundedYear: normalizeFoundedYear(input?.foundedYear),
    location: trimText(input?.location),
    description,
    website: trimText(input?.website),
    linkedin: trimText(input?.linkedin),
    twitter: trimText(input?.twitter),
    contactEmail: trimText(input?.contactEmail) || user.email,
    stage,
    totalRaised: trimText(input?.totalRaised),
    fundingGoal: trimText(input?.fundingGoal),
    valuation: trimText(input?.valuation),
    pitch: trimText(input?.pitch),
    categories: categories.length ? categories : industry ? [industry] : [],
    teamMembers: normalizeTeamMembers(input?.teamMembers),
    isPublic: normalizeBoolean(input?.isPublic, true),
    showContactInfo: normalizeBoolean(input?.showContactInfo, true),
    allowAdvisorInvitations: normalizeBoolean(input?.allowAdvisorInvitations, true),
  };
}
