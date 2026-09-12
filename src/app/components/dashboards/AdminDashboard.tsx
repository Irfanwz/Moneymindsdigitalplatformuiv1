import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import {
  getAdminUsers,
  getUserVerification,
  getVerificationSummary,
  updateUserApproval,
  adminListVerifications,
  adminApproveVerification,
  adminRejectVerification,
  type ProfileVerification,
} from "@/app/lib/api";
import { toast } from "sonner";
import type { AIVerification, VerificationSummary } from "@/app/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Header } from "@/app/components/Header";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { AIVerificationReport } from "@/app/components/admin/AIVerificationReport";
import type { AppRole, AuthUser } from "@/app/types/auth";

interface ApprovalDraft {
  approvedRoles: AppRole[];
  adminNotes: string;
  rejectionReason: string;
}

const roleLabels: Record<AppRole, string> = {
  startup: "Startup",
  investor: "Investor",
  advisor: "Financial Advisor",
};

export function AdminDashboard() {
  const { session, user } = useAuth();
  const [profiles, setProfiles] = useState<AuthUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ApprovalDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verifications, setVerifications] = useState<Record<string, AIVerification>>({});
  const [vSummary, setVSummary] = useState<VerificationSummary | null>(null);
  const [reportDialogUserId, setReportDialogUserId] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [docVerifications, setDocVerifications] = useState<ProfileVerification[]>([]);
  const [docVerifLoading, setDocVerifLoading] = useState(false);
  const [docVerifNote, setDocVerifNote] = useState("");
  const [docVerifBusy, setDocVerifBusy] = useState<string | null>(null);

  const pendingProfiles = profiles.filter((profile) => profile.status === "pending");
  const approvedProfiles = profiles.filter((profile) => profile.status === "approved");
  const rejectedProfiles = profiles.filter((profile) => profile.status === "rejected");

  const filteredUsers = profiles.filter((profile) => {
    const matchesSearch =
      userSearch === "" ||
      profile.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      profile.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const loadProfiles = async () => {
    if (!session?.token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAdminUsers(session.token);
      setProfiles(response.users);
      loadVerifications(response.users);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load profile submissions.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openReport = async (userId: string) => {
    setReportDialogUserId(userId);
    if (verifications[userId]) return; // already loaded
    if (!session?.token) return;
    setLoadingReport(true);
    try {
      const res = await getUserVerification(session.token, userId);
      setVerifications((prev) => ({ ...prev, [userId]: res.verification }));
    } catch { /* no report yet */ }
    setLoadingReport(false);
  };

  const loadVerifications = async (userList: AuthUser[]) => {
    if (!session?.token) return;
    try {
      const summaryRes = await getVerificationSummary(session.token);
      setVSummary(summaryRes.summary);
    } catch { /* ignore */ }

    const pending = userList.filter((u) => u.status === "pending");
    const results: Record<string, AIVerification> = {};
    await Promise.allSettled(
      pending.map(async (u) => {
        try {
          const res = await getUserVerification(session.token, u.id);
          results[u.id] = res.verification;
        } catch { /* no report yet */ }
      }),
    );
    setVerifications((prev) => ({ ...prev, ...results }));
  };

  useEffect(() => {
    loadProfiles();
    loadDocVerifications();
  }, [session?.token]);

  const loadDocVerifications = async () => {
    if (!session?.token) return;
    setDocVerifLoading(true);
    try {
      const res = await adminListVerifications(session.token);
      setDocVerifications(res.verifications);
    } catch { /* ignore */ }
    finally { setDocVerifLoading(false); }
  };

  const handleDocApprove = async (id: string) => {
    if (!session?.token) return;
    setDocVerifBusy(id);
    try {
      await adminApproveVerification(session.token, id, docVerifNote || undefined);
      toast.success("Verification approved — profile is now verified.");
      setDocVerifNote("");
      loadDocVerifications();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve.");
    } finally { setDocVerifBusy(null); }
  };

  const handleDocReject = async (id: string) => {
    if (!session?.token) return;
    setDocVerifBusy(id);
    try {
      await adminRejectVerification(session.token, id, docVerifNote || undefined);
      toast.success("Verification rejected.");
      setDocVerifNote("");
      loadDocVerifications();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject.");
    } finally { setDocVerifBusy(null); }
  };

  const getDraft = (profile: AuthUser): ApprovalDraft => {
    return drafts[profile.id] ?? {
      approvedRoles: profile.requestedRoles,
      adminNotes: profile.adminNotes ?? "",
      rejectionReason: profile.rejectionReason ?? "",
    };
  };

  const updateDraft = (
    profileId: string,
    fallbackDraft: ApprovalDraft,
    updater: (draft: ApprovalDraft) => ApprovalDraft,
  ) => {
    setDrafts((currentDrafts) => {
      const existingDraft = currentDrafts[profileId] ?? fallbackDraft;

      return {
        ...currentDrafts,
        [profileId]: updater(existingDraft),
      };
    });
  };

  const handleApproval = async (profile: AuthUser, status: "approved" | "rejected") => {
    if (!session?.token) {
      return;
    }

    const draft = getDraft(profile);
    setBusyUserId(profile.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateUserApproval(session.token, profile.id, {
        status,
        approvedRoles: draft.approvedRoles,
        adminNotes: draft.adminNotes,
        rejectionReason: draft.rejectionReason,
      });

      setProfiles((currentProfiles) =>
        currentProfiles.map((entry) => (entry.id === response.user.id ? response.user : entry)),
      );
      setSuccessMessage(response.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update the approval status.";
      setErrorMessage(message);
    } finally {
      setBusyUserId(null);
    }
  };

  const statCards = [
    {
      label: "Pending approvals",
      value: pendingProfiles.length,
      icon: Clock,
    },
    {
      label: "Approved users",
      value: approvedProfiles.length,
      icon: CheckCircle2,
    },
    {
      label: "Rejected users",
      value: rejectedProfiles.length,
      icon: XCircle,
    },
    {
      label: "Profiles reviewed",
      value: profiles.length,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName={user?.fullName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Admin approval dashboard</h1>
            <p className="text-muted-foreground">
              Review submitted general profiles and control which roles each user can access.
            </p>
          </div>
          <Button variant="outline" onClick={loadProfiles} disabled={isLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh queue
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-semibold">{stat.value}</div>
              </Card>
            );
          })}
        </div>

        {/* AI Verification Summary Bar */}
        {vSummary && vSummary.total > 0 && (
          <Card className="p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold">AI Verifications:</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {vSummary.accept} Accept
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                {vSummary.review} Review
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                {vSummary.reject} Reject
              </span>
              {vSummary.running > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {vSummary.running} Running
                </span>
              )}
              {vSummary.failed > 0 && (
                <span className="text-muted-foreground">{vSummary.failed} Failed</span>
              )}
            </div>
          </Card>
        )}

        {errorMessage ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Admin action failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="mb-6">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Update saved</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Pending profile approvals</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Users cannot sign in until one of these profiles is approved.
                  </p>
                </div>
                <Badge variant="outline">{pendingProfiles.length} pending</Badge>
              </div>

              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading pending profiles...</div>
              ) : pendingProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                  No profiles are waiting for approval.
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingProfiles.map((profile) => {
                    const draft = getDraft(profile);

                    return (
                      <Card key={profile.id} className="p-5 border-border/80">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-semibold">{profile.fullName}</h3>
                              <Badge variant="outline">{profile.email}</Badge>
                              <Badge variant="secondary">Submitted</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {profile.location ? <span>{profile.location}</span> : null}
                              {profile.phone ? <span>{profile.phone}</span> : null}
                              <span>{new Date(profile.createdAt).toLocaleString()}</span>
                            </div>
                            {profile.bio ? (
                              <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.requestedRoles.map((role) => (
                              <Badge key={role} variant="outline">
                                {roleLabels[role]}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* AI Verification Badge */}
                        {(() => {
                          const v = verifications[profile.id];
                          if (!v) return null;
                          if (v.status === "running") {
                            return (
                              <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                AI verification running...
                              </div>
                            );
                          }
                          if (v.status === "failed" || v.status === "skipped") {
                            return (
                              <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                <AlertTriangle className="h-4 w-4" />
                                AI: {v.status === "failed" ? "Failed" : "Skipped"} — manual review needed
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto"
                                  onClick={() => openReport(profile.id)}
                                >
                                  <Eye className="mr-1 h-3 w-3" /> Details
                                </Button>
                              </div>
                            );
                          }
                          if (v.status === "complete" && v.recommendation) {
                            const recMap = {
                              accept: { label: "Accept", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", Icon: CheckCircle2 },
                              review: { label: "Review", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", Icon: AlertTriangle },
                              reject: { label: "Reject", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30", Icon: XCircle },
                            };
                            const r = recMap[v.recommendation as keyof typeof recMap];
                            if (!r) return null;
                            return (
                              <div className={`mt-4 flex items-center gap-2 rounded-lg border p-3 ${r.cls}`}>
                                <r.Icon className="h-4 w-4 shrink-0" />
                                <span className="text-sm font-medium">
                                  AI: {r.label} &middot; {v.confidence}% confidence
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto"
                                  onClick={() => openReport(profile.id)}
                                >
                                  <Eye className="mr-1 h-3 w-3" /> View Report
                                </Button>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                          <div>
                            <Label>Approved roles</Label>
                            <div className="mt-3 space-y-3">
                              {profile.requestedRoles.map((role) => (
                                <label key={role} className="flex items-center gap-3 rounded-xl border p-3">
                                  <Checkbox
                                    checked={draft.approvedRoles.includes(role)}
                                    onCheckedChange={(checked) => {
                                      updateDraft(profile.id, draft, (currentDraft) => {
                                        const approvedRoles = checked === true
                                          ? [...new Set([...currentDraft.approvedRoles, role])]
                                          : currentDraft.approvedRoles.filter((entry) => entry !== role);

                                        return {
                                          ...currentDraft,
                                          approvedRoles,
                                        };
                                      });
                                    }}
                                  />
                                  <span className="text-sm font-medium">{roleLabels[role]}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`notes-${profile.id}`}>Admin notes</Label>
                              <Textarea
                                id={`notes-${profile.id}`}
                                value={draft.adminNotes}
                                onChange={(event) =>
                                  updateDraft(profile.id, draft, (currentDraft) => ({
                                    ...currentDraft,
                                    adminNotes: event.target.value,
                                  }))
                                }
                                placeholder="Optional notes for the approval record"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`rejection-${profile.id}`}>Rejection reason</Label>
                              <Input
                                id={`rejection-${profile.id}`}
                                value={draft.rejectionReason}
                                onChange={(event) =>
                                  updateDraft(profile.id, draft, (currentDraft) => ({
                                    ...currentDraft,
                                    rejectionReason: event.target.value,
                                  }))
                                }
                                placeholder="Required if you reject this profile"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <Button
                            className="sm:flex-1"
                            disabled={busyUserId === profile.id}
                            onClick={() => handleApproval(profile, "approved")}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {busyUserId === profile.id ? "Saving..." : "Approve selected roles"}
                          </Button>
                          <Button
                            variant="outline"
                            className="sm:flex-1"
                            disabled={busyUserId === profile.id}
                            onClick={() => handleApproval(profile, "rejected")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject profile
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recently approved</h2>
              <div className="space-y-3">
                {approvedProfiles.slice(0, 5).map((profile) => (
                  <div key={profile.id} className="rounded-xl border p-4">
                    <div className="font-medium">{profile.fullName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{profile.email}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.approvedRoles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {approvedProfiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No approvals yet.</div>
                ) : null}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recently rejected</h2>
              <div className="space-y-3">
                {rejectedProfiles.slice(0, 5).map((profile) => (
                  <div key={profile.id} className="rounded-xl border p-4">
                    <div className="font-medium">{profile.fullName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{profile.email}</div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {profile.rejectionReason || "No rejection reason recorded."}
                    </div>
                  </div>
                ))}
                {rejectedProfiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No rejected profiles.</div>
                ) : null}
              </div>
            </Card>
          </div>
        </div>

        {/* AI Report Dialog */}
        <Dialog
          open={reportDialogUserId !== null}
          onOpenChange={(open) => { if (!open) setReportDialogUserId(null); }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                AI Due Diligence Report
                {reportDialogUserId && profiles.find((p) => p.id === reportDialogUserId) && (
                  <span className="font-normal text-muted-foreground">
                    {" "}— {profiles.find((p) => p.id === reportDialogUserId)?.fullName}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                Automated background verification based on web search and AI analysis.
              </DialogDescription>
            </DialogHeader>
            {reportDialogUserId && session?.token && (
              <AIVerificationReport
                verification={verifications[reportDialogUserId] ?? null}
                loading={loadingReport}
                token={session.token}
                onRetryComplete={() => {
                  toast.success("Verification re-queued. Refresh in 30-60 seconds.");
                  setReportDialogUserId(null);
                  loadProfiles();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Document Verification Queue */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                Profile Verification Queue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Documents needing manual review or admin approval
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadDocVerifications} disabled={docVerifLoading}>
              <RefreshCcw className={`h-4 w-4 mr-1 ${docVerifLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {docVerifLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : docVerifications.filter((r) => r.status === "manual_review" || r.status === "pending").length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No verifications pending review
            </div>
          ) : (
            <div className="space-y-4">
              {docVerifications
                .filter((r) => r.status === "manual_review" || r.status === "pending")
                .map((r) => (
                  <div key={r.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-medium text-sm capitalize">{r.docType.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.claimToVerify}</p>
                        <p className="text-xs text-muted-foreground">
                          User ID: {r.userId} · Submitted {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                        {r.status === "manual_review" ? "Manual Review" : "Pending"}
                      </Badge>
                    </div>

                    {r.aiReasoning && (
                      <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground italic">
                        AI: "{r.aiReasoning}" {r.aiConfidence !== null ? `(confidence: ${r.aiConfidence}%)` : ""}
                      </div>
                    )}

                    {r.docUrl && !r.docUrl.startsWith("local://") && (
                      <a
                        href={r.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> View Document
                      </a>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Admin note (optional)</Label>
                      <input
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Add a note for the user…"
                        value={docVerifBusy === r.id ? docVerifNote : ""}
                        onChange={(e) => setDocVerifNote(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={docVerifBusy === r.id}
                        onClick={() => handleDocApprove(r.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200"
                        disabled={docVerifBusy === r.id}
                        onClick={() => handleDocReject(r.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* All Users Table */}
        <Card className="p-6 mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">All registered users</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete list of every account in the system — {profiles.length} total
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 w-60"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                    className="capitalize"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No users match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Roles</th>
                    <th className="pb-3 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((profile) => (
                    <tr key={profile.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 font-medium">{profile.fullName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{profile.email}</td>
                      <td className="py-3 pr-4">
                        {profile.status === "approved" ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Approved
                          </Badge>
                        ) : profile.status === "rejected" ? (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
                            Rejected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {(profile.status === "approved" ? profile.approvedRoles : profile.requestedRoles).map(
                            (role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {roleLabels[role]}
                              </Badge>
                            ),
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
