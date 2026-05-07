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

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

export function buildInvestorProfile(user, profile) {
  return {
    id: profile?.id ?? null,
    userId: user.id,
    investorType: profile?.investorType ?? "",
    preferredStage: profile?.preferredStage ?? "",
    minInvestment: profile?.minInvestment ?? "",
    maxInvestment: profile?.maxInvestment ?? "",
    portfolioSize: profile?.portfolioSize ?? "",
    investmentThesis: profile?.investmentThesis ?? "",
    industries: profile?.industries ?? [],
    otherInterests: profile?.otherInterests ?? "",
    geographicFocus: profile?.geographicFocus ?? "",
    firmName: profile?.firmName ?? "",
    title: profile?.title ?? "",
    website: profile?.website ?? "",
    linkedin: profile?.linkedin ?? "",
    twitter: profile?.twitter ?? "",
    contactEmail: profile?.contactEmail ?? user.email,
    bio: profile?.bio ?? user.bio ?? "",
    isPrivate: profile?.isPrivate ?? true,
    anonymousBrowsing: profile?.anonymousBrowsing ?? false,
    showInvestmentPreferences: profile?.showInvestmentPreferences ?? true,
    allowConnectionRequests: profile?.allowConnectionRequests ?? true,
    showContactInfo: profile?.showContactInfo ?? false,
    createdAt: profile?.createdAt ?? null,
    updatedAt: profile?.updatedAt ?? null,
  };
}

export function normalizeInvestorProfileInput(input, user) {
  return {
    investorType: trimText(input?.investorType),
    preferredStage: trimText(input?.preferredStage),
    minInvestment: trimText(input?.minInvestment),
    maxInvestment: trimText(input?.maxInvestment),
    portfolioSize: trimText(input?.portfolioSize),
    investmentThesis: trimText(input?.investmentThesis),
    industries: normalizeStringArray(input?.industries),
    otherInterests: trimText(input?.otherInterests),
    geographicFocus: trimText(input?.geographicFocus),
    firmName: trimText(input?.firmName),
    title: trimText(input?.title),
    website: trimText(input?.website),
    linkedin: trimText(input?.linkedin),
    twitter: trimText(input?.twitter),
    contactEmail: trimText(input?.contactEmail) || user.email,
    bio: trimText(input?.bio),
    isPrivate: normalizeBoolean(input?.isPrivate, true),
    anonymousBrowsing: normalizeBoolean(input?.anonymousBrowsing, false),
    showInvestmentPreferences: normalizeBoolean(input?.showInvestmentPreferences, true),
    allowConnectionRequests: normalizeBoolean(input?.allowConnectionRequests, true),
    showContactInfo: normalizeBoolean(input?.showContactInfo, false),
  };
}
