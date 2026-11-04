import type { AdvisorProfile } from "@/app/types/advisor-profile";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { AppRole } from "@/app/types/auth";

export interface ProfileGap {
  field: string;
  label: string;
}

function notEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function getAdvisorGaps(profile: AdvisorProfile | null): ProfileGap[] {
  if (!profile) return [{ field: "profile", label: "Complete your advisor profile" }];
  const gaps: ProfileGap[] = [];
  if (!notEmpty(profile.linkedin))         gaps.push({ field: "linkedin",         label: "LinkedIn URL" });
  if (!notEmpty(profile.title))            gaps.push({ field: "title",            label: "Professional title" });
  if (!notEmpty(profile.specialization))   gaps.push({ field: "specialization",   label: "Specialization" });
  if (!notEmpty(profile.yearsExperience))  gaps.push({ field: "yearsExperience",  label: "Years of experience" });
  return gaps;
}

export function getStartupGaps(profile: StartupProfile | null): ProfileGap[] {
  if (!profile) return [{ field: "profile", label: "Complete your startup profile" }];
  const gaps: ProfileGap[] = [];
  if (!notEmpty(profile.companyName))  gaps.push({ field: "companyName",  label: "Company name" });
  if (!notEmpty(profile.industry))     gaps.push({ field: "industry",     label: "Industry" });
  if (!notEmpty(profile.description))  gaps.push({ field: "description",  label: "Company description" });
  return gaps;
}

export function getInvestorGaps(profile: InvestorProfile | null): ProfileGap[] {
  if (!profile) return [{ field: "profile", label: "Complete your investor profile" }];
  const gaps: ProfileGap[] = [];
  if (!notEmpty(profile.investorType))      gaps.push({ field: "investorType",      label: "Investor type" });
  if (!notEmpty(profile.title))             gaps.push({ field: "title",             label: "Occupation / professional background" });
  if (!notEmpty(profile.investmentThesis))  gaps.push({ field: "investmentThesis",  label: "Investment thesis" });
  return gaps;
}

export function isProfileComplete(role: AppRole, profile: AdvisorProfile | StartupProfile | InvestorProfile | null): boolean {
  if (role === "advisor") return getAdvisorGaps(profile as AdvisorProfile).length === 0;
  if (role === "startup") return getStartupGaps(profile as StartupProfile).length === 0;
  if (role === "investor") return getInvestorGaps(profile as InvestorProfile).length === 0;
  return true;
}
