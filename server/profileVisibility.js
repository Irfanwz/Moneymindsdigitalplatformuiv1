const pick = (value, fields) => value == null ? null : Object.fromEntries(
  fields.split(" ").filter(key => value[key] !== undefined).map(key => [key, value[key]])
);

// Explicit public fields: financial identifiers and account preferences never
// leave the own-profile endpoint. New private fields stay private by default.
export function publicAdvisorProfile(profile) {
  const result = pick(profile, "id userId title bio website linkedin twitter yearsExperience clientsHelped specialization previousRoles expertiseAreas certifications industries preferredStage engagementType availability typicalRate servicesOffered regulatoryLicenseNo regulatoryBody licenseExpiryDate educationUniversity educationDegree educationYear previousFirm previousRole previousFirmDuration primaryTickers languages conflictDisclosure performanceClaim isPublic showContactInfo allowConnectionRequests showTestimonials credibilityScore credibilityTier credibilityUpdatedAt isVerified verifiedAt createdAt updatedAt");
  if (profile.showContactInfo) result.contactEmail = profile.contactEmail;
  return result;
}

export function publicStartupProfile(profile) {
  const result = pick(profile, "id userId companyName tagline industry foundedYear location description website linkedin twitter stage totalRaised fundingGoal valuation pitch categories teamMembers isPublic showContactInfo allowAdvisorInvitations isVerified verifiedAt createdAt updatedAt");
  if (profile.showContactInfo) result.contactEmail = profile.contactEmail;
  return result;
}

export function profileQualityEvidence({ bio, startup, advisor, investor }) {
  const result = {
    bio,
    startup: pick(startup, "companyName tagline industry foundedYear location description website linkedin stage totalRaised fundingGoal valuation pitch categories"),
    advisor: pick(advisor, "title bio website linkedin yearsExperience clientsHelped specialization previousRoles industries preferredStage engagementType servicesOffered regulatoryBody licenseExpiryDate educationUniversity educationDegree educationYear previousFirm previousRole previousFirmDuration primaryTickers languages conflictDisclosure performanceClaim"),
    investor: pick(investor, "investorType preferredStage minInvestment maxInvestment portfolioSize investmentThesis industries otherInterests geographicFocus firmName title website linkedin bio"),
  };
  if (result.startup) result.startup.teamMembers = (startup.teamMembers || []).map(member => pick(member, "name role"));
  if (result.advisor) {
    result.advisor.certifications = (advisor.certifications || []).map(cert => pick(cert, "name issuer year"));
    result.advisor.expertiseAreas = (advisor.expertiseAreas || []).map(area => pick(area, "area level"));
  }
  return result;
}
