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

function normalizeInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeExpertiseAreas(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => ({
      area: trimText(entry?.area),
      level: Math.max(0, Math.min(100, Number(entry?.level) || 50)),
    }))
    .filter((entry) => entry.area);
}

function normalizeCertifications(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => ({
      name: trimText(entry?.name),
      issuer: trimText(entry?.issuer),
      year: trimText(entry?.year),
    }))
    .filter((entry) => entry.name || entry.issuer);
}

export function buildAdvisorProfile(user, profile) {
  return {
    id: profile?.id ?? null,
    userId: user.id,
    title: profile?.title ?? "",
    bio: profile?.bio ?? user.bio ?? "",
    website: profile?.website ?? "",
    linkedin: profile?.linkedin ?? "",
    twitter: profile?.twitter ?? "",
    contactEmail: profile?.contactEmail ?? user.email,
    yearsExperience: profile?.yearsExperience != null ? String(profile.yearsExperience) : "",
    clientsHelped: profile?.clientsHelped != null ? String(profile.clientsHelped) : "",
    specialization: profile?.specialization ?? "",
    previousRoles: profile?.previousRoles ?? "",
    expertiseAreas: profile?.expertiseAreas ?? [],
    certifications: profile?.certifications ?? [],
    industries: profile?.industries ?? [],
    preferredStage: profile?.preferredStage ?? "",
    engagementType: profile?.engagementType ?? "",
    availability: profile?.availability ?? "",
    typicalRate: profile?.typicalRate ?? "",
    servicesOffered: profile?.servicesOffered ?? "",
    regulatoryLicenseNo: profile?.regulatoryLicenseNo ?? "",
    regulatoryBody: profile?.regulatoryBody ?? "",
    licenseExpiryDate: profile?.licenseExpiryDate ?? "",
    educationUniversity: profile?.educationUniversity ?? "",
    educationDegree: profile?.educationDegree ?? "",
    educationYear: profile?.educationYear ?? "",
    previousFirm: profile?.previousFirm ?? "",
    previousRole: profile?.previousRole ?? "",
    previousFirmDuration: profile?.previousFirmDuration ?? "",
    primaryTickers: profile?.primaryTickers ?? [],
    languages: profile?.languages ?? [],
    conflictDisclosure: profile?.conflictDisclosure ?? false,
    performanceClaim: profile?.performanceClaim ?? "",
    defaultGroupType: profile?.defaultGroupType ?? "free",
    defaultJoiningFee: profile?.defaultJoiningFee ?? "",
    defaultMonthlyFee: profile?.defaultMonthlyFee ?? "",
    autoApproveMembers: profile?.autoApproveMembers ?? true,
    allowGroupDiscovery: profile?.allowGroupDiscovery ?? true,
    enablePaymentProcessing: profile?.enablePaymentProcessing ?? false,
    paymentEmail: profile?.paymentEmail ?? "",
    taxId: profile?.taxId ?? "",
    isPublic: profile?.isPublic ?? true,
    showContactInfo: profile?.showContactInfo ?? true,
    allowConnectionRequests: profile?.allowConnectionRequests ?? true,
    showTestimonials: profile?.showTestimonials ?? true,
    credibilityScore: profile?.credibilityScore ?? null,
    credibilityTier: profile?.credibilityTier ?? null,
    credibilityUpdatedAt: profile?.credibilityUpdatedAt ?? null,
    createdAt: profile?.createdAt ?? null,
    updatedAt: profile?.updatedAt ?? null,
  };
}

export function normalizeAdvisorProfileInput(input, user) {
  return {
    title: trimText(input?.title),
    bio: trimText(input?.bio),
    website: trimText(input?.website),
    linkedin: trimText(input?.linkedin),
    twitter: trimText(input?.twitter),
    contactEmail: trimText(input?.contactEmail) || user.email,
    yearsExperience: normalizeInteger(input?.yearsExperience),
    clientsHelped: normalizeInteger(input?.clientsHelped),
    specialization: trimText(input?.specialization),
    previousRoles: trimText(input?.previousRoles),
    expertiseAreas: normalizeExpertiseAreas(input?.expertiseAreas),
    certifications: normalizeCertifications(input?.certifications),
    industries: normalizeStringArray(input?.industries),
    preferredStage: trimText(input?.preferredStage),
    engagementType: trimText(input?.engagementType),
    availability: trimText(input?.availability),
    typicalRate: trimText(input?.typicalRate),
    servicesOffered: trimText(input?.servicesOffered),
    regulatoryLicenseNo: trimText(input?.regulatoryLicenseNo),
    regulatoryBody: trimText(input?.regulatoryBody),
    licenseExpiryDate: trimText(input?.licenseExpiryDate),
    educationUniversity: trimText(input?.educationUniversity),
    educationDegree: trimText(input?.educationDegree),
    educationYear: trimText(input?.educationYear),
    previousFirm: trimText(input?.previousFirm),
    previousRole: trimText(input?.previousRole),
    previousFirmDuration: trimText(input?.previousFirmDuration),
    primaryTickers: normalizeStringArray(input?.primaryTickers),
    languages: normalizeStringArray(input?.languages),
    conflictDisclosure: normalizeBoolean(input?.conflictDisclosure, false),
    performanceClaim: trimText(input?.performanceClaim),
    defaultGroupType: trimText(input?.defaultGroupType) || "free",
    defaultJoiningFee: trimText(input?.defaultJoiningFee),
    defaultMonthlyFee: trimText(input?.defaultMonthlyFee),
    autoApproveMembers: normalizeBoolean(input?.autoApproveMembers, true),
    allowGroupDiscovery: normalizeBoolean(input?.allowGroupDiscovery, true),
    enablePaymentProcessing: normalizeBoolean(input?.enablePaymentProcessing, false),
    paymentEmail: trimText(input?.paymentEmail),
    taxId: trimText(input?.taxId),
    isPublic: normalizeBoolean(input?.isPublic, true),
    showContactInfo: normalizeBoolean(input?.showContactInfo, true),
    allowConnectionRequests: normalizeBoolean(input?.allowConnectionRequests, true),
    showTestimonials: normalizeBoolean(input?.showTestimonials, true),
  };
}
