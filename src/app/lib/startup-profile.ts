import type { AuthUser } from "@/app/types/auth";
import type { StartupProfile } from "@/app/types/startup-profile";

export function createEmptyStartupProfile(user?: AuthUser | null): StartupProfile {
  return {
    id: null,
    userId: user?.id ?? "",
    companyName: "",
    tagline: "",
    industry: "",
    foundedYear: "",
    location: user?.location ?? "",
    description: "",
    website: "",
    linkedin: "",
    twitter: "",
    contactEmail: user?.email ?? "",
    stage: "",
    totalRaised: "",
    fundingGoal: "",
    valuation: "",
    pitch: "",
    categories: [],
    teamMembers: [
      { name: "", role: "", linkedin: "" },
    ],
    isPublic: true,
    showContactInfo: true,
    allowAdvisorInvitations: true,
    createdAt: null,
    updatedAt: null,
  };
}

export function stringifyCategories(categories: string[]) {
  return categories.join(", ");
}

export function parseCategories(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
