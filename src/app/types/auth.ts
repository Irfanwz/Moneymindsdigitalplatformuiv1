export type AppRole = "startup" | "investor" | "advisor";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  status: ApprovalStatus;
  requestedRoles: AppRole[];
  approvedRoles: AppRole[];
  isAdmin: boolean;
  adminRole?: 'super_admin' | 'reviewer' | 'support' | 'finance' | null;
  isSuspended?: boolean;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentRole?: AppRole | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface ProfileApplicationPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  requestedRoles: AppRole[];
  profiles: Partial<Record<AppRole, Record<string, any>>>;
  attachments: { key: string }[];
  files?: File[];
}
