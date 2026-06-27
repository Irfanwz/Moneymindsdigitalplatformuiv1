import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { getAdminUsers, updateUserApproval } from "@/app/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Header } from "@/app/components/Header";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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

  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load profile submissions.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [session?.token]);

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
