export interface AdvisorExpertise {
  area: string;
  level: number;
}

export interface AdvisorCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface AdvisorProfile {
  id: string | null;
  userId: string;
  title: string;
  bio: string;
  website: string;
  linkedin: string;
  twitter: string;
  contactEmail: string;
  yearsExperience: string;
  clientsHelped: string;
  specialization: string;
  previousRoles: string;
  expertiseAreas: AdvisorExpertise[];
  certifications: AdvisorCertification[];
  industries: string[];
  preferredStage: string;
  engagementType: string;
  availability: string;
  typicalRate: string;
  servicesOffered: string;
  defaultGroupType: string;
  defaultJoiningFee: string;
  defaultMonthlyFee: string;
  autoApproveMembers: boolean;
  allowGroupDiscovery: boolean;
  enablePaymentProcessing: boolean;
  paymentEmail: string;
  taxId: string;
  isPublic: boolean;
  showContactInfo: boolean;
  allowConnectionRequests: boolean;
  showTestimonials: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  verificationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
