export interface InvestorProfile {
  id: string | null;
  userId: string;
  investorType: string;
  preferredStage: string;
  minInvestment: string;
  maxInvestment: string;
  portfolioSize: string;
  investmentThesis: string;
  industries: string[];
  otherInterests: string;
  geographicFocus: string;
  firmName: string;
  title: string;
  website: string;
  linkedin: string;
  twitter: string;
  contactEmail: string;
  bio: string;
  isPrivate: boolean;
  anonymousBrowsing: boolean;
  showInvestmentPreferences: boolean;
  allowConnectionRequests: boolean;
  showContactInfo: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
