export interface StartupTeamMember {
  name: string;
  role: string;
  linkedin: string;
}

export interface StartupProfile {
  id: string | null;
  userId: string;
  companyName: string;
  tagline: string;
  industry: string;
  foundedYear: string;
  location: string;
  description: string;
  website: string;
  linkedin: string;
  twitter: string;
  contactEmail: string;
  stage: string;
  totalRaised: string;
  fundingGoal: string;
  valuation: string;
  pitch: string;
  categories: string[];
  teamMembers: StartupTeamMember[];
  isPublic: boolean;
  showContactInfo: boolean;
  allowAdvisorInvitations: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
