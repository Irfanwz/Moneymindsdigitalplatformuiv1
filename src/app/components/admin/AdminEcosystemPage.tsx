import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { request, updateUserApproval } from "@/app/lib/api";
import { adminCan } from "../../../../shared/adminPermissions.js";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type RoleTab = "startup" | "investor" | "advisor";
type StatusFilter = "all" | "approved" | "pending" | "rejected" | "suspended";

interface RoleStats {
  total: number;
  approved: number;
  pending: number;
  suspended: number;
}

interface EcosystemUser {
  id: string;
  fullName: string;
  email: string;
  status: string;
  isSuspended?: boolean;
  createdAt?: string;
  currentRole?: string;
  approvedRoles?: string[];
  requestedRoles?: string[];
  profile?: Record<string, any> | null;
  credibility?: {
    score?: number | null;
    tier?: string | null;
    label?: string | null;
    totalPredictions?: number;
    correctPredictions?: number;
  } | null;
}

interface EcosystemResponse {
  summary: {
    startups: RoleStats;
    investors: RoleStats;
    advisors: RoleStats;
  };
  startups: EcosystemUser[];
  investors: EcosystemUser[];
  advisors: EcosystemUser[];
}

interface UserDetailResponse {
  user: EcosystemUser & { adminNotes?: string; rejectionReason?: string };
  profiles: {
    startup: Record<string, any> | null;
    investor: Record<string, any> | null;
    advisor: Record<string, any> | null;
  };
  verification: {
    status?: string;
    recommendation?: string;
    confidenceScore?: number;
    summary?: string;
  } | null;
  documents: Array<{
    id: string;
    documentType?: string;
    status?: string;
    fileName?: string;
  }>;
}

const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString() : "—");
const fmtMoney = (v?: number | string | null) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  return Number.isFinite(num) ? `$${num.toLocaleString()}` : String(v);
};

export function AdminEcosystemPage() {
  const { user: adminUser } = useAuth();
  const [data, setData] = useState<EcosystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("startup");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedItem, setSelectedItem] = useState<{
    role: RoleTab;
    item: EcosystemUser;
  } | null>(null);
  const [detailData, setDetailData] = useState<UserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadEcosystem = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await request<EcosystemResponse>("/api/admin/console/ecosystem");
      setData(res);
    } catch {
      try {
        const fallback = await request<{ users: EcosystemUser[] }>("/api/admin/console/users");
        const nonAdmins = (fallback.users ?? []).filter(
          (u: EcosystemUser & { isAdmin?: boolean }) => !u.isAdmin,
        );
        const hasRole = (u: EcosystemUser, role: RoleTab) =>
          u.currentRole === role ||
          (Array.isArray(u.approvedRoles) && u.approvedRoles.includes(role)) ||
          (Array.isArray(u.requestedRoles) && u.requestedRoles.includes(role));

        const startups = nonAdmins.filter((u) => hasRole(u, "startup"));
        const investors = nonAdmins.filter((u) => hasRole(u, "investor"));
        const advisors = nonAdmins.filter((u) => hasRole(u, "advisor"));
        const countStats = (list: EcosystemUser[]): RoleStats => ({
          total: list.length,
          approved: list.filter((x) => x.status === "approved" && !x.isSuspended).length,
          pending: list.filter((x) => x.status === "pending").length,
          suspended: list.filter((x) => x.isSuspended).length,
        });
        setData({
          summary: {
            startups: countStats(startups),
            investors: countStats(investors),
            advisors: countStats(advisors),
          },
          startups,
          investors,
          advisors,
        });
      } catch (fallbackErr) {
        setError(
          fallbackErr instanceof Error
            ? fallbackErr.message
            : "Failed to load ecosystem directory.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEcosystem();
  }, [loadEcosystem]);

  const openDetails = async (role: RoleTab, item: EcosystemUser) => {
    setSelectedItem({ role, item });
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await request<UserDetailResponse>(`/api/admin/console/users/${item.id}`);
      setDetailData(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load full profile details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApproval = async (targetUser: EcosystemUser, status: "approved" | "rejected", role: RoleTab) => {
    setActionBusy(true);
    try {
      const roles = Array.from(
        new Set([...(targetUser.approvedRoles ?? []), ...(status === "approved" ? [role] : [])]),
      );
      await updateUserApproval("", targetUser.id, {
        status,
        approvedRoles: status === "approved" ? roles : targetUser.approvedRoles ?? [],
        adminNotes: `Updated from Admin Ecosystem Hub (${role})`,
      });
      toast.success(`${targetUser.fullName} ${status === "approved" ? "approved" : "rejected"}.`);
      await loadEcosystem();
      if (selectedItem?.item.id === targetUser.id) {
        await openDetails(role, { ...targetUser, status });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleSuspend = async (targetUser: EcosystemUser, role: RoleTab) => {
    setActionBusy(true);
    const nextSuspended = !targetUser.isSuspended;
    try {
      await request<{ message: string }>("/api/admin/console/actions", {
        method: "POST",
        body: JSON.stringify({
          action: "user.suspension",
          targetId: targetUser.id,
          payload: {
            suspended: nextSuspended,
            reason: nextSuspended ? "Suspended via Admin Ecosystem Hub" : "Reactivated via Admin Ecosystem Hub",
          },
        }),
      });
      toast.success(nextSuspended ? `${targetUser.fullName} suspended.` : `${targetUser.fullName} reactivated.`);
      await loadEcosystem();
      if (selectedItem?.item.id === targetUser.id) {
        await openDetails(role, { ...targetUser, isSuspended: nextSuspended });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suspension update failed.");
    } finally {
      setActionBusy(false);
    }
  };

  const activeList = useMemo(() => {
    if (!data) return [];
    const list =
      activeTab === "startup"
        ? data.startups
        : activeTab === "investor"
          ? data.investors
          : data.advisors;

    const q = searchQuery.trim().toLowerCase();
    return list.filter((entry) => {
      if (statusFilter === "suspended" && !entry.isSuspended) return false;
      if (statusFilter !== "all" && statusFilter !== "suspended") {
        if (entry.isSuspended || entry.status !== statusFilter) return false;
      }
      if (!q) return true;
      const p = entry.profile ?? {};
      const haystack = [
        entry.fullName,
        entry.email,
        p.companyName,
        p.firmName,
        p.title,
        p.industry || p.sector,
        p.stage || p.preferredStage,
        p.investorType,
        p.location || p.geographicFocus,
        ...(Array.isArray(p.industries) ? p.industries : Array.isArray(p.preferredSectors) ? p.preferredSectors : []),
        ...(Array.isArray(p.expertiseAreas) ? p.expertiseAreas.map((e: any) => e?.area || e) : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, activeTab, searchQuery, statusFilter]);

  const roleBoxes: Array<{
    key: RoleTab;
    title: string;
    subtitle: string;
    icon: typeof Rocket;
    stats: RoleStats;
    accentClass: string;
    iconBgClass: string;
    activeRingClass: string;
  }> = [
    {
      key: "startup",
      title: "Startups",
      subtitle: "Founders, ventures, fundraising & traction",
      icon: Rocket,
      stats: data?.summary.startups ?? { total: 0, approved: 0, pending: 0, suspended: 0 },
      accentClass: "text-emerald-600 dark:text-emerald-400",
      iconBgClass: "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
      activeRingClass: "border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
    },
    {
      key: "investor",
      title: "Investors",
      subtitle: "Funds, angels, mandates & ticket sizes",
      icon: Briefcase,
      stats: data?.summary.investors ?? { total: 0, approved: 0, pending: 0, suspended: 0 },
      accentClass: "text-cyan-600 dark:text-cyan-400",
      iconBgClass: "bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400",
      activeRingClass: "border-cyan-500 ring-1 ring-cyan-500/40 bg-cyan-50/40 dark:bg-cyan-950/20",
    },
    {
      key: "advisor",
      title: "Advisors",
      subtitle: "Market experts, credibility scores & rooms",
      icon: Award,
      stats: data?.summary.advisors ?? { total: 0, approved: 0, pending: 0, suspended: 0 },
      accentClass: "text-teal-600 dark:text-teal-400",
      iconBgClass: "bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400",
      activeRingClass: "border-teal-500 ring-1 ring-teal-500/40 bg-teal-50/40 dark:bg-teal-950/20",
    },
  ];

  const renderStatusBadge = (entry: EcosystemUser) => {
    if (entry.isSuspended) {
      return (
        <Badge className="rounded-none bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          Suspended
        </Badge>
      );
    }
    if (entry.status === "approved") {
      return (
        <Badge className="rounded-none bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          Approved
        </Badge>
      );
    }
    if (entry.status === "pending") {
      return (
        <Badge className="rounded-none bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="rounded-none bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30 capitalize">
        {entry.status || "Unknown"}
      </Badge>
    );
  };

  const canReview = adminCan(adminUser, "reviews");
  const canSuspend = adminCan(adminUser, "users.suspend");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-cyan-900/20 dark:border-cyan-800/40 bg-[#070d1d] p-6 text-slate-100">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Ecosystem Hub
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
            Startups, Investors &amp; Advisors
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Select any role box below to inspect full profiles, verification status, financial metrics, and governance actions.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadEcosystem()}
          disabled={loading}
          className="rounded-none border-cyan-800 bg-transparent text-cyan-100 hover:bg-cyan-950 hover:text-white"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Directory
        </Button>
      </div>

      {/* 3 Role Boxes */}
      <div className="grid gap-4 md:grid-cols-3">
        {roleBoxes.map((box) => {
          const Icon = box.icon;
          const isActive = activeTab === box.key;
          return (
            <Card
              key={box.key}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab(box.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTab(box.key);
                }
              }}
              className={`cursor-pointer p-5 transition-all rounded-none border hover:shadow-md ${
                isActive
                  ? box.activeRingClass
                  : "border-slate-200 dark:border-slate-800 bg-card hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center border ${box.iconBgClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-none text-[11px] font-semibold ${
                    isActive
                      ? "border-cyan-500 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10"
                      : "border-slate-300 dark:border-slate-700 text-muted-foreground"
                  }`}
                >
                  {isActive ? "Selected" : "Click to view"}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-bold">{box.title}</h3>
                  <span className={`text-3xl font-extrabold tabular-nums ${box.accentClass}`}>
                    {box.stats.total}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{box.subtitle}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Approved</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {box.stats.approved}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {box.stats.pending}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Suspended</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {box.stats.suspended}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 rounded-none border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}s by name, email, company, sector, or location...`}
              className="pl-9 rounded-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "approved", "pending", "rejected", "suspended"] as StatusFilter[]).map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className={`rounded-none capitalize ${
                  statusFilter === st
                    ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white border-0"
                    : ""
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Error / Loading / Grid */}
      {error && (
        <Card className="p-6 rounded-none border-rose-500/40 bg-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4" />
            {error}
          </div>
          <Button size="sm" variant="outline" onClick={() => void loadEcosystem()}>
            Retry
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="p-5 rounded-none h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <Card className="p-10 rounded-none text-center border-dashed">
          <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-60 mb-2" />
          <p className="font-semibold">No {activeTab} accounts match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try clearing the search query or switching the status filter.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeList.map((entry) => {
            const p = entry.profile ?? {};
            const displayTitle =
              activeTab === "startup"
                ? p.companyName || entry.fullName
                : activeTab === "investor"
                  ? p.firmName || entry.fullName
                  : entry.fullName;

            const subtitle =
              activeTab === "startup"
                ? [p.industry || p.sector, p.stage].filter(Boolean).join(" · ") || "Startup Venture"
                : activeTab === "investor"
                  ? p.investorType || "Institutional / Angel Investor"
                  : p.title || "Market Advisor";

            return (
              <Card
                key={`${activeTab}-${entry.id}`}
                className="p-5 rounded-none border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate">{displayTitle}</h3>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium truncate">
                        {subtitle}
                      </p>
                    </div>
                    {renderStatusBadge(entry)}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 truncate">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.fullName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.email}</span>
                    </p>
                    {p.location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Role-specific quick metrics */}
                  {activeTab === "startup" && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Funding Goal</span>
                        <span className="font-semibold tabular-nums">{fmtMoney(p.fundingGoal)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Valuation</span>
                        <span className="font-semibold tabular-nums">{fmtMoney(p.valuation)}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "investor" && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Ticket Range</span>
                        <span className="font-semibold tabular-nums">
                          {(p.minInvestment || p.minTicketSize || p.maxInvestment || p.maxTicketSize)
                            ? `${fmtMoney(p.minInvestment ?? p.minTicketSize)} – ${fmtMoney(p.maxInvestment ?? p.maxTicketSize)}`
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Portfolio</span>
                        <span className="font-semibold tabular-nums">
                          {p.portfolioSize ?? p.portfolioCount ?? "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "advisor" && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Credibility</span>
                        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {(entry.credibility?.score ?? p.credibilityScore) !== null &&
                          (entry.credibility?.score ?? p.credibilityScore) !== undefined
                            ? `${entry.credibility?.score ?? p.credibilityScore}/100`
                            : "Unrated"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Experience</span>
                        <span className="font-semibold tabular-nums">
                          {p.yearsExperience ? `${p.yearsExperience} yrs` : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <Button
                    size="sm"
                    onClick={() => void openDetails(activeTab, entry)}
                    className="flex-1 rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold border-0"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View Details
                  </Button>
                  {(p.isPublic ?? p.isPublished ?? true) && (activeTab === "startup" || activeTab === "advisor") && (
                    <Button asChild size="sm" variant="outline" className="rounded-none">
                      <Link
                        to={
                          activeTab === "startup"
                            ? `/startups/${entry.id}/profile`
                            : `/advisors/${entry.id}/profile`
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-none">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
                  <div>
                    <DialogTitle className="text-xl font-extrabold">
                      {selectedItem.item.profile?.companyName ||
                        selectedItem.item.profile?.firmName ||
                        selectedItem.item.fullName}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedItem.role.toUpperCase()} PROFILE · {selectedItem.item.email}
                    </DialogDescription>
                  </div>
                  {renderStatusBadge(detailData?.user ?? selectedItem.item)}
                </div>
              </DialogHeader>

              {detailLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading complete account &amp; verification details…
                </div>
              ) : (
                <div className="space-y-5 mt-2">
                  {/* Account Summary */}
                  <Card className="p-4 rounded-none bg-muted/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Account &amp; Governance
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Full Name</span>
                        <span className="font-medium">{detailData?.user.fullName ?? selectedItem.item.fullName}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Joined</span>
                        <span className="font-medium">{fmtDate(selectedItem.item.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Approved Roles</span>
                        <span className="font-medium capitalize">
                          {(detailData?.user.approvedRoles ?? selectedItem.item.approvedRoles ?? []).join(", ") || "None"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">AI Verification</span>
                        <span className="font-medium capitalize">
                          {detailData?.verification?.recommendation
                            ? `${detailData.verification.recommendation} (${detailData.verification.confidenceScore ?? "—"}%)`
                            : detailData?.verification?.status || "Not run"}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Role Specific Profile Details */}
                  {selectedItem.role === "startup" && (
                    <Card className="p-4 rounded-none">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                        <Rocket className="h-3.5 w-3.5" />
                        Startup Venture Details
                      </h4>
                      {(() => {
                        const sp = detailData?.profiles?.startup ?? selectedItem.item.profile;
                        if (!sp) return <p className="text-sm text-muted-foreground">No startup profile submitted yet.</p>;
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div><span className="text-xs text-muted-foreground block">Company</span><span className="font-semibold">{sp.companyName || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Sector &amp; Stage</span><span className="font-semibold">{[sp.industry || sp.sector, sp.stage].filter(Boolean).join(" · ") || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Funding Goal</span><span className="font-semibold">{fmtMoney(sp.fundingGoal)}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Funds Raised</span><span className="font-semibold">{fmtMoney(sp.totalRaised ?? sp.fundsRaised)}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Valuation</span><span className="font-semibold">{fmtMoney(sp.valuation)}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Team Size</span><span className="font-semibold">{Array.isArray(sp.teamMembers) ? sp.teamMembers.length : (sp.teamSize ?? "—")}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Location</span><span className="font-semibold">{sp.location || "—"}</span></div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Website</span>
                                {sp.website ? (
                                  <a href={sp.website} target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5" />
                                    {sp.website}
                                  </a>
                                ) : "—"}
                              </div>
                            </div>
                            {sp.tagline && (
                              <div><span className="text-xs text-muted-foreground block">Tagline</span><p>{sp.tagline}</p></div>
                            )}
                            {sp.description && (
                              <div><span className="text-xs text-muted-foreground block">Overview</span><p className="text-muted-foreground whitespace-pre-line">{sp.description}</p></div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  )}

                  {selectedItem.role === "investor" && (
                    <Card className="p-4 rounded-none">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Investor Mandate Details
                      </h4>
                      {(() => {
                        const ip = detailData?.profiles?.investor ?? selectedItem.item.profile;
                        if (!ip) return <p className="text-sm text-muted-foreground">No investor profile submitted yet.</p>;
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div><span className="text-xs text-muted-foreground block">Firm / Entity</span><span className="font-semibold">{ip.firmName || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Investor Type</span><span className="font-semibold">{ip.investorType || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Ticket Range</span><span className="font-semibold">{fmtMoney(ip.minInvestment ?? ip.minTicketSize)} – {fmtMoney(ip.maxInvestment ?? ip.maxTicketSize)}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Portfolio Size</span><span className="font-semibold">{ip.portfolioSize ?? ip.portfolioCount ?? "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Preferred Sectors</span><span className="font-semibold">{(Array.isArray(ip.industries) && ip.industries.length ? ip.industries : Array.isArray(ip.preferredSectors) ? ip.preferredSectors : []).join(", ") || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Preferred Stage</span><span className="font-semibold">{ip.preferredStage || (Array.isArray(ip.preferredStages) && ip.preferredStages.length ? ip.preferredStages.join(", ") : "—")}</span></div>
                            </div>
                            {ip.investmentThesis && (
                              <div><span className="text-xs text-muted-foreground block">Investment Thesis</span><p className="text-muted-foreground whitespace-pre-line">{ip.investmentThesis}</p></div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  )}

                  {selectedItem.role === "advisor" && (
                    <Card className="p-4 rounded-none">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        Advisor Expertise &amp; Credibility
                      </h4>
                      {(() => {
                        const ap = detailData?.profiles?.advisor ?? selectedItem.item.profile;
                        if (!ap) return <p className="text-sm text-muted-foreground">No advisor profile submitted yet.</p>;
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div><span className="text-xs text-muted-foreground block">Headline / Title</span><span className="font-semibold">{ap.title || "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Experience</span><span className="font-semibold">{ap.yearsExperience ? `${ap.yearsExperience} years` : "—"}</span></div>
                              <div><span className="text-xs text-muted-foreground block">Typical Rate</span><span className="font-semibold">{fmtMoney(ap.typicalRate ?? ap.hourlyRate)}</span></div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Credibility Score</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {(selectedItem.item.credibility?.score ?? ap.credibilityScore) !== null &&
                                  (selectedItem.item.credibility?.score ?? ap.credibilityScore) !== undefined
                                    ? `${selectedItem.item.credibility?.score ?? ap.credibilityScore}/100 (${selectedItem.item.credibility?.label || ap.credibilityTier || "Rated"})`
                                    : "Unrated"}
                                </span>
                              </div>
                            </div>
                            {Array.isArray(ap.expertiseAreas) && ap.expertiseAreas.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground block mb-1.5">Expertise Areas</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {ap.expertiseAreas.map((area: any, i: number) => (
                                    <Badge key={i} variant="outline" className="rounded-none">
                                      {typeof area === "string" ? area : area.area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ap.bio && (
                              <div><span className="text-xs text-muted-foreground block">Biography</span><p className="text-muted-foreground whitespace-pre-line">{ap.bio}</p></div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  )}

                  {/* Admin Governance Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                    {canReview && (detailData?.user.status ?? selectedItem.item.status) !== "approved" && (
                      <Button
                        disabled={actionBusy}
                        onClick={() => void handleApproval(selectedItem.item, "approved", selectedItem.role)}
                        className="rounded-none bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <UserCheck className="mr-1.5 h-4 w-4" />
                        Approve Account
                      </Button>
                    )}
                    {canReview && (detailData?.user.status ?? selectedItem.item.status) === "pending" && (
                      <Button
                        disabled={actionBusy}
                        variant="outline"
                        onClick={() => void handleApproval(selectedItem.item, "rejected", selectedItem.role)}
                        className="rounded-none border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                      </Button>
                    )}
                    {canSuspend && (
                      <Button
                        disabled={actionBusy}
                        variant="outline"
                        onClick={() => void handleToggleSuspend(selectedItem.item, selectedItem.role)}
                        className="rounded-none border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <ShieldAlert className="mr-1.5 h-4 w-4" />
                        {(detailData?.user.isSuspended ?? selectedItem.item.isSuspended) ? "Reactivate" : "Suspend"}
                      </Button>
                    )}
                    <Button variant="outline" className="rounded-none" onClick={() => setSelectedItem(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
