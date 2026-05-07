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
  location: string;
  bio: string;
  requestedRoles: AppRole[];
}
