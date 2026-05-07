export interface StartupSearchResult {
  id: string;
  userId: string;
  companyName: string;
  tagline: string;
  industry: string;
  stage: string;
  totalRaised: string;
  description: string;
  categories: string[];
  location: string;
}

export interface AdvisorSearchResult {
  id: string;
  userId: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  yearsExperience: number | null;
  clientsHelped: number | null;
  specialization: string;
  typicalRate: string;
  availability: string;
  industries: string[];
  expertiseAreas: { area: string; level: number }[];
}
