import type { AdvisorGroup, AdvisorSignal, AdvisorAccuracyStats, GroupPredictionSummary, SignalPrediction, CreateGroupPayload, CreateSignalPayload } from "@/app/types/advisor-groups";
import type { AdvisorProfile } from "@/app/types/advisor-profile";
import type { AppRole, AuthUser, ProfileApplicationPayload } from "@/app/types/auth";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { AdvisorSearchResult, StartupSearchResult } from "@/app/types/search";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { Training, TrainingEnrollment, CreateTrainingPayload } from "@/app/types/training";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  user?: AuthUser;

  constructor(message: string, status: number, code?: string, user?: AuthUser) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.user = user;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include", // send HttpOnly cookie on every request
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? "The request could not be completed.",
      response.status,
      payload.code,
      payload.user,
    );
  }

  return payload as T;
}

export function registerProfile(payload: ProfileApplicationPayload) {
  return request<{ message: string; user: AuthUser }>("/api/auth/register-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email: string) {
  return request<{ message: string; resetToken?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return request<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export function getCurrentUser(token?: string) {
  return request<{ user: AuthUser }>("/api/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function logoutRequest() {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function getAdminUsers(token: string, status?: "pending" | "approved" | "rejected") {
  const query = status ? `?status=${status}` : "";

  return request<{ users: AuthUser[] }>(`/api/admin/users${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateUserApproval(
  token: string,
  userId: string,
  payload: {
    status: "approved" | "rejected";
    approvedRoles: AppRole[];
    adminNotes: string;
    rejectionReason: string;
  },
) {
  return request<{ message: string; user: AuthUser }>(`/api/admin/users/${userId}/approval`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// --- AI Verification ---

export interface AIVerification {
  id: string;
  userId: string;
  status: "running" | "complete" | "failed" | "skipped";
  recommendation: "accept" | "review" | "reject" | null;
  confidence: number | null;
  credibilityScore: number | null;
  summary: string | null;
  findings: {
    linkedin_found: boolean;
    linkedin_url: string | null;
    company_verified: boolean;
    company_url: string | null;
    news_mentions: number;
    red_flags: string[];
    positive_signals: string[];
  } | null;
  reportMarkdown: string | null;
  sources: { url: string; title: string; relevance: number }[];
  redFlags: string[];
  searchQueriesRun: number;
  createdAt: string;
  completedAt: string | null;
}

export interface VerificationSummary {
  total: number;
  running: number;
  complete: number;
  failed: number;
  skipped: number;
  accept: number;
  review: number;
  reject: number;
}

export function getUserVerification(token: string, userId: string) {
  return request<{ verification: AIVerification }>(`/api/admin/users/${userId}/verification`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getVerificationSummary(token: string) {
  return request<{ summary: VerificationSummary }>("/api/admin/verifications/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function retryVerification(token: string, userId: string) {
  return request<{ message: string }>(`/api/admin/users/${userId}/verification/retry`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getStartupProfile(token: string) {
  return request<{ profile: StartupProfile }>("/api/startup/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateStartupProfile(token: string, payload: StartupProfile) {
  return request<{ message: string; profile: StartupProfile }>("/api/startup/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getInvestorProfile(token: string) {
  return request<{ profile: InvestorProfile }>("/api/investor/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateInvestorProfile(token: string, payload: InvestorProfile) {
  return request<{ message: string; profile: InvestorProfile }>("/api/investor/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getAdvisorProfile(token: string) {
  return request<{ profile: AdvisorProfile }>("/api/advisor/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateAdvisorProfile(token: string, payload: AdvisorProfile) {
  return request<{ message: string; profile: AdvisorProfile }>("/api/advisor/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// --- Browse Groups ---

export interface BrowseGroup {
  id: string;
  advisorId: string;
  advisorName: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  isPaid: boolean;
  joiningFee: string;
  monthlyFee: string;
  memberCount: number;
  signalCount: number;
  isJoined: boolean;
  createdAt: string;
}

export function browseGroups(token: string) {
  return request<{ groups: BrowseGroup[] }>("/api/groups/browse", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Advisor Groups ---

export function createAdvisorGroup(token: string, payload: CreateGroupPayload) {
  return request<{ message: string; group: AdvisorGroup }>("/api/advisor/groups", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function listAdvisorGroups(token: string) {
  return request<{ groups: AdvisorGroup[] }>("/api/advisor/groups", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAdvisorGroup(token: string, groupId: string) {
  return request<{ group: AdvisorGroup }>(`/api/advisor/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAdvisorGroup(token: string, groupId: string, payload: CreateGroupPayload) {
  return request<{ message: string; group: AdvisorGroup }>(`/api/advisor/groups/${groupId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAdvisorGroup(token: string, groupId: string) {
  return request<{ message: string }>(`/api/advisor/groups/${groupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function joinAdvisorGroup(token: string, groupId: string) {
  return request<{ message: string }>(`/api/advisor/groups/${groupId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function leaveAdvisorGroup(token: string, groupId: string) {
  return request<{ message: string }>(`/api/advisor/groups/${groupId}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Advisor Group Members ---

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: string;
  userName: string;
  email: string;
}

export function listGroupMembers(token: string, groupId: string) {
  return request<{ members: GroupMember[] }>(`/api/advisor/groups/${groupId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function removeGroupMember(token: string, groupId: string, userId: string) {
  return request<{ message: string }>(`/api/advisor/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Advisor Signals ---

export function createAdvisorSignal(token: string, groupId: string, payload: CreateSignalPayload) {
  return request<{ message: string; signal: AdvisorSignal }>(`/api/advisor/groups/${groupId}/signals`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function listAdvisorSignals(token: string, groupId: string) {
  return request<{ signals: AdvisorSignal[] }>(`/api/advisor/groups/${groupId}/signals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAdvisorSignal(token: string, groupId: string, signalId: string, payload: CreateSignalPayload) {
  return request<{ message: string; signal: AdvisorSignal }>(`/api/advisor/groups/${groupId}/signals/${signalId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAdvisorSignal(token: string, groupId: string, signalId: string) {
  return request<{ message: string }>(`/api/advisor/groups/${groupId}/signals/${signalId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Signal Comments & Reactions ---

export interface SignalComment {
  id: string;
  signalId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignalReaction {
  id: string;
  signalId: string;
  userId: string;
  reaction: "like" | "insightful" | "bearish" | "bullish";
  createdAt: string;
}

export function listSignalComments(token: string, signalId: string) {
  return request<{ comments: SignalComment[] }>(`/api/signals/${signalId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createSignalComment(token: string, signalId: string, content: string) {
  return request<{ message: string; comment: SignalComment }>(`/api/signals/${signalId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
}

export function deleteSignalComment(token: string, signalId: string, commentId: string) {
  return request<{ message: string }>(`/api/signals/${signalId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listSignalReactions(token: string, signalId: string) {
  return request<{ reactions: SignalReaction[] }>(`/api/signals/${signalId}/reactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function toggleSignalReaction(token: string, signalId: string, reaction: string) {
  return request<{ message: string; added: boolean }>(`/api/signals/${signalId}/reactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reaction }),
  });
}

// --- Connections ---

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  otherUserId: string;
  otherUserName: string;
  direction: "sent" | "received";
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export function sendConnectionRequest(token: string, toUserId: string, message?: string) {
  return request<{ message: string; connection: Connection }>("/api/connections", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ toUserId, message }),
  });
}

export function listConnections(token: string) {
  return request<{ connections: Connection[] }>("/api/connections", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateConnection(token: string, connectionId: string, status: "accepted" | "rejected") {
  return request<{ connection: Connection }>(`/api/connections/${connectionId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

// --- Notifications ---

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  createdAt: string;
}

export function listNotifications(token: string) {
  return request<{ notifications: Notification[] }>("/api/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function markNotificationRead(token: string, id: string) {
  return request<{ notification: Notification }>(`/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function markAllNotificationsRead(token: string) {
  return request<{ message: string }>("/api/notifications/mark-all-read", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- File Upload ---

export async function uploadFile(token: string, file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiBaseUrl}/api/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.message ?? "Upload failed.", response.status);
  }
  return payload;
}

// --- Public Profiles ---

export function getAdvisorPublicProfile(token: string, userId: string) {
  return request<{ profile: AdvisorProfile; name: string; location: string; bio: string }>(`/api/advisors/${userId}/public-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getStartupPublicProfile(token: string, userId: string) {
  return request<{ profile: StartupProfile; name: string; location: string; bio: string }>(`/api/startups/${userId}/public-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Search & Discovery ---

export function searchStartups(token: string, params?: { industry?: string; stage?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params?.industry) query.set("industry", params.industry);
  if (params?.stage) query.set("stage", params.stage);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return request<{ startups: StartupSearchResult[] }>(`/api/startups/search${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function searchAdvisors(token: string, params?: { industry?: string; specialization?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params?.industry) query.set("industry", params.industry);
  if (params?.specialization) query.set("specialization", params.specialization);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return request<{ advisors: AdvisorSearchResult[] }>(`/api/advisors/search${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Trainings ---

export function createTraining(token: string, payload: CreateTrainingPayload) {
  return request<{ message: string; training: Training }>("/api/trainings", {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
  });
}

export function listTrainings(token: string) {
  return request<{ trainings: Training[] }>("/api/trainings", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTraining(token: string, id: string) {
  return request<{ training: Training }>(`/api/trainings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateTraining(token: string, id: string, payload: CreateTrainingPayload) {
  return request<{ message: string; training: Training }>(`/api/trainings/${id}`, {
    method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
  });
}

export function deleteTraining(token: string, id: string) {
  return request<{ message: string }>(`/api/trainings/${id}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
  });
}

export function enrollInTraining(token: string, id: string) {
  return request<{ message: string; enrollment: TrainingEnrollment }>(`/api/trainings/${id}/enroll`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` },
  });
}

export function unenrollFromTraining(token: string, id: string) {
  return request<{ message: string }>(`/api/trainings/${id}/unenroll`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTrainingEnrollments(token: string, id: string) {
  return request<{ enrollments: TrainingEnrollment[] }>(`/api/trainings/${id}/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getMyEnrollments(token: string) {
  return request<{ enrollments: TrainingEnrollment[] }>("/api/trainings/my-enrollments", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateTrainingProgress(token: string, id: string, progress: number) {
  return request<{ message: string; enrollment: TrainingEnrollment }>(`/api/trainings/${id}/progress`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ progress }),
  });
}

// --- Payments ---

export interface Payment {
  id: string;
  userId: string;
  itemType: "group_join" | "group_monthly" | "training";
  itemId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export function checkout(token: string, payload: { itemType: string; itemId: string; paymentMethod?: string }) {
  return request<{ message: string; payment: Payment }>("/api/payments/checkout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function listPayments(token: string) {
  return request<{ payments: Payment[] }>("/api/payments", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function checkPayment(token: string, itemType: string, itemId: string) {
  return request<{ paid: boolean }>(`/api/payments/check?itemType=${itemType}&itemId=${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Prediction Accuracy API ───────────────────────────────────────────────────

export function getSignalPrediction(token: string, signalId: string) {
  return request<SignalPrediction>(`/api/signals/${signalId}/prediction`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAdvisorAccuracy(token: string, advisorId: string) {
  return request<AdvisorAccuracyStats>(`/api/advisors/${advisorId}/accuracy`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getGroupPredictions(token: string, groupId: string) {
  return request<{ groupId: string; predictions: GroupPredictionSummary[] }>(
    `/api/groups/${groupId}/predictions`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function adminTriggerPredictionCheck(token: string) {
  return request<{ message: string; checked: number }>("/api/admin/predictions/check-now", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminCheckSignalPrediction(token: string, signalId: string) {
  return request<{ message: string; signal: AdvisorSignal }>(
    `/api/admin/predictions/${signalId}/check`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  );
}

// --- Profile Verification (AI-Verified Profiles) ---

export interface ProfileVerification {
  id: string;
  userId: string;
  docType: "certificate" | "degree" | "business_reg" | "linkedin" | "other";
  docUrl: string;
  claimToVerify: string;
  status: "pending" | "analyzing" | "verified" | "rejected" | "manual_review";
  aiConfidence: number | null;
  aiReasoning: string | null;
  aiExtracted: Record<string, unknown> | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export function uploadVerificationDocument(
  token: string,
  file: File,
  docType: string,
  claimToVerify: string
) {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("docType", docType);
  formData.append("claimToVerify", claimToVerify);
  return request<{ message: string; verificationId: string; status: string }>("/api/verify/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function getMyVerifications(token: string) {
  return request<{ verifications: ProfileVerification[] }>("/api/verify/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminListVerifications(token: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<{ verifications: ProfileVerification[] }>(`/api/admin/verifications${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminApproveVerification(token: string, id: string, adminNote?: string) {
  return request<{ message: string }>(`/api/admin/verifications/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ adminNote }),
  });
}

export function adminRejectVerification(token: string, id: string, adminNote?: string) {
  return request<{ message: string }>(`/api/admin/verifications/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ adminNote }),
  });
}
