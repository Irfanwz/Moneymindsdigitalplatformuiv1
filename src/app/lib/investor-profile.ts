import type { AuthUser } from "@/app/types/auth";
import type { InvestorProfile } from "@/app/types/investor-profile";

export function createEmptyInvestorProfile(user?: AuthUser | null): InvestorProfile {
  return {
    id: null,
    userId: user?.id ?? "",
    investorType: "",
    preferredStage: "",
    minInvestment: "",
    maxInvestment: "",
    portfolioSize: "",
    investmentThesis: "",
    industries: [],
    otherInterests: "",
    geographicFocus: "",
    firmName: "",
    title: "",
    website: "",
    linkedin: "",
    twitter: "",
    contactEmail: user?.email ?? "",
    bio: user?.bio ?? "",
    isPrivate: true,
    anonymousBrowsing: false,
    showInvestmentPreferences: true,
    allowConnectionRequests: true,
    showContactInfo: false,
    createdAt: null,
    updatedAt: null,
  };
}
