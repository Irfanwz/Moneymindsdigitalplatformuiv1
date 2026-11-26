import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Building2,
  Eye,
  Bookmark,
  Filter,
  Search,
  Sparkles,
  Bot,
  ArrowRight,
  GraduationCap,
  BarChart3,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { PieChart, Pie, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from "recharts";
import { chartTooltipTheme } from "@/app/components/ui/chart-theme";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getInvestorProfile,
  updateInvestorProfile,
  searchStartups,
  getMyEnrollments,
  listConnections,
  getStartupPublicProfile,
} from "@/app/lib/api";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { StartupSearchResult } from "@/app/types/search";
import type { TrainingEnrollment } from "@/app/types/training";
import type { Connection } from "@/app/lib/api";

export function InvestorDashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [startupResults, setStartupResults] = useState<StartupSearchResult[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [startupsLoading, setStartupsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recommended");
  const [analyticsView, setAnalyticsView] = useState<"stage" | "sector">("stage");
  const [savedStartups, setSavedStartups] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("savedStartups") || "[]"))
  );
  const [followingStartups, setFollowingStartups] = useState<
    { userId: string; name: string; industry: string; stage: string; tagline: string; totalRaised: string; description: string }[]
  >([]);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    setStartupsLoading(true);
    setLoadError("");
    async function load() {
      try {
        const [profileRes, startupsRes, enrollRes, connectionsRes] = await Promise.all([
          getInvestorProfile(session?.token ?? ""),
          searchStartups(session?.token ?? ""),
          getMyEnrollments(session?.token ?? ""),
          listConnections(session?.token ?? ""),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setStartupResults(startupsRes.startups);
          setEnrollments(enrollRes.enrollments);

          const accepted = connectionsRes.connections.filter((c: Connection) => c.status === "accepted");
          const followingProfiles = await Promise.all(
            accepted.map(async (c: Connection) => {
              try {
                const res = await getStartupPublicProfile(session?.token ?? "", c.otherUserId);
                return {
                  userId: c.otherUserId,
                  name: res.profile?.companyName || res.name || c.otherUserName,
                  industry: res.profile?.industry || "",
                  stage: res.profile?.stage || "",
                  tagline: res.profile?.tagline || "",
                  totalRaised: res.profile?.totalRaised || "",
                  description: res.profile?.description?.slice(0, 100) || "",
                };
              } catch {
                return {
                  userId: c.otherUserId,
                  name: c.otherUserName,
                  industry: "",
                  stage: "",
                  tagline: "",
                  totalRaised: "",
                  description: "",
                };
              }
            })
          );
          if (active) setFollowingStartups(followingProfiles.filter((p) => p.name));
        }
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : "Could not load investment dashboard.");
        }
      } finally {
        if (active) setStartupsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token, loadAttempt]);

  const handleSearch = async (overrideQuery?: string) => {
    if (!session?.user) return;
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    setStartupsLoading(true);
    try {
      const res = await searchStartups(session?.token ?? "", { q: query.trim() || undefined });
      setStartupResults(res.startups);
      setActiveTab("recommended");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not search startups.");
    } finally {
      setStartupsLoading(false);
    }
  };

  const handlePrivacyToggle = async (field: "isPrivate" | "anonymousBrowsing", value: boolean) => {
    if (!session?.user || !profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    try {
      await updateInvestorProfile(session?.token ?? "", updated);
      toast.success("Privacy preference saved.");
    } catch (err) {
      setProfile({ ...profile });
      toast.error(err instanceof Error ? err.message : "Could not save privacy setting.");
    }
  };

  const displayIndustries = (profile?.industries?.length ?? 0) > 0
    ? profile!.industries
    : ["FinTech", "HealthTech", "CleanTech", "EdTech", "AI/ML", "SaaS"];

  const userName = user?.fullName ?? "Investor";
  const enrolledCount = enrollments.length;

  const stats = [
    { label: "Startups available", value: startupResults.length.toString(), detail: "Verified ventures in directory", icon: Building2 },
    { label: "Following", value: followingStartups.length.toString(), detail: "Accepted founder connections", icon: Users },
    { label: "Industries tracked", value: (profile?.industries?.length ?? 0).toString(), detail: "Preferred sector mandates", icon: Eye },
    { label: "Trainings enrolled", value: enrolledCount.toString(), detail: "Active investor programs", icon: GraduationCap },
  ];

  const toggleSaveStartup = (userId: string) => {
    setSavedStartups((prev) => {
      const next = new Set(prev);
      const added = !next.has(userId);
      if (added) next.add(userId);
      else next.delete(userId);
      localStorage.setItem("savedStartups", JSON.stringify([...next]));
      toast.success(added ? "Startup saved to watchlist." : "Removed from watchlist.");
      return next;
    });
  };

  const startups = startupResults.map((s) => ({
    id: s.id,
    userId: s.userId,
    name: s.companyName,
    industry: s.industry,
    stage: s.stage,
    description: s.tagline || s.description?.slice(0, 110) || "",
    funding: s.totalRaised || "N/A",
  }));

  const sectorBreakdown = Array.from(
    startupResults.reduce((acc, s) => {
      const sector = s.industry?.trim() || "Other";
      acc.set(sector, (acc.get(sector) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1]);

  const stageBreakdown = Array.from(
    startupResults.reduce((acc, s) => {
      const stage = s.stage?.trim() || "Unspecified";
      acc.set(stage, (acc.get(stage) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1]);

  const activeBreakdown = (analyticsView === "stage" ? stageBreakdown : sectorBreakdown)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      pct: startupResults.length ? Math.round((count / startupResults.length) * 100) : 0,
    }));

  const CHART_COLORS = ["#06b6d4", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

  const outlineBtn =
    "rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 hover:text-cyan-800 dark:hover:text-cyan-200 transition-all";
  const primaryBtn =
    "rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm transition-all border-0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]">
      <Header userRole="investor" userName={userName} />

      <main className="w-full">
        {/* Institutional Dark Hero Header */}
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.32),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_55%)]" />
          <div className="grid gap-8 px-4 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,28%)] lg:items-center xl:px-14 xl:py-11">
            <div className="min-w-0">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <TrendingUp aria-hidden="true" className="h-4 w-4" />
                Investor dashboard
              </p>
              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-5xl">
                Welcome back, <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Discover audited startups, track deal-room connections, and run AI sector intelligence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-none bg-emerald-300 font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-200">
                  <Link to="/investor/ai-agents">
                    <Bot aria-hidden="true" className="h-4 w-4" />
                    Browse AI agents
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-none border-cyan-800 bg-transparent font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                  <Link to="/investor/find-advisors">Find advisors</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-none font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                  <Link to="/investor/analytics">View analytics</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-800/70 bg-slate-950/50 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Investment mandate</p>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-[11px]">
                  {profile?.investorType || "Investor"}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-emerald-300">
                {profile?.preferredStage || "All stages"}
              </p>
              <p className="text-xs text-slate-300">
                {profile?.minInvestment || profile?.maxInvestment
                  ? `Check size: ${profile.minInvestment || "?"} – ${profile.maxInvestment || "?"}`
                  : "Set your check size and sectors in Edit Profile"}
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8 xl:px-14">
          {loadError && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loadError}</span>
              </div>
              <Button size="sm" variant="outline" className={outlineBtn} onClick={() => setLoadAttempt((a) => a + 1)}>
                Retry
              </Button>
            </div>
          )}

          {/* KPI Grid */}
          <section aria-label="Investor metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label} className="min-w-0 gap-2 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm transition-all hover:border-cyan-500/40 hover:shadow-md dark:border-cyan-800/35">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </Card>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            {/* Main Column: Discover Startups */}
            <div className="min-w-0 space-y-6">
              <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-5 sm:p-6 shadow-sm dark:border-cyan-800/35">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discover startups</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Search verified startups in the MoneyMinds database</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className={outlineBtn}>
                      <Link to="/investor/find-advisors">
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        Find advisors
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <Input
                        placeholder="Search by industry, stage, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void handleSearch(); }}
                        className="pl-10 pr-9 rounded-xl bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => { setSearchQuery(""); void handleSearch(""); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <Button onClick={() => void handleSearch()} className={primaryBtn}>
                      <Search className="mr-1.5 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1">
                    <TabsTrigger value="recommended" className="rounded-lg">Recommended ({startups.length})</TabsTrigger>
                    <TabsTrigger value="following" className="rounded-lg">Following ({followingStartups.length})</TabsTrigger>
                    <TabsTrigger value="saved" className="rounded-lg">Saved ({startups.filter((s) => savedStartups.has(s.userId)).length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recommended" className="space-y-4">
                    {startupsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-36 rounded-2xl border border-border/60 bg-muted/40 animate-pulse" />
                        ))}
                      </div>
                    ) : startups.length > 0 ? (
                      startups.map((startup) => (
                        <Card key={startup.id ?? startup.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/40 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">{startup.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                  {startup.description || "Verified startup on MoneyMinds."}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-3">
                                  {startup.industry && (
                                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">{startup.industry}</Badge>
                                  )}
                                  {startup.stage && (
                                    <Badge variant="outline" className="border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">{startup.stage}</Badge>
                                  )}
                                  {startup.funding && startup.funding !== "N/A" && (
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Raised: {startup.funding}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                              className={`flex-1 ${primaryBtn}`}
                              onClick={() => navigate(`/startups/${startup.userId}/profile`)}
                            >
                              View profile
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              aria-label={savedStartups.has(startup.userId) ? "Remove from saved" : "Save startup"}
                              className={`${outlineBtn} ${savedStartups.has(startup.userId) ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300" : ""}`}
                              onClick={() => toggleSaveStartup(startup.userId)}
                            >
                              <Bookmark className={`h-4 w-4 ${savedStartups.has(startup.userId) ? "fill-cyan-600 text-cyan-600 dark:fill-cyan-400 dark:text-cyan-400" : ""}`} />
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400 rounded-xl border border-dashed">
                        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">No startups found. Try adjusting your search.</p>
                        {searchQuery && (
                          <Button variant="outline" size="sm" className={`mt-3 ${outlineBtn}`} onClick={() => { setSearchQuery(""); void handleSearch(""); }}>
                            Reset search
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="following" className="space-y-4">
                    {followingStartups.length > 0 ? (
                      followingStartups.map((startup) => (
                        <Card key={startup.userId} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/40 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shrink-0">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-slate-900 dark:text-white">{startup.name}</h3>
                                  <CredibilityBadge type="verified" label="Connected" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  {startup.tagline || startup.description || "No description available"}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {startup.industry && (
                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-700 dark:text-cyan-300">{startup.industry}</Badge>
                                  )}
                                  {startup.stage && (
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-700 dark:text-indigo-300">{startup.stage}</Badge>
                                  )}
                                  {startup.totalRaised && (
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300">Raised: {startup.totalRaised}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                              className={`flex-1 ${primaryBtn}`}
                              onClick={() => navigate(`/startups/${startup.userId}/profile`)}
                            >
                              View profile
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              aria-label={savedStartups.has(startup.userId) ? "Remove from saved" : "Save startup"}
                              className={`${outlineBtn} ${savedStartups.has(startup.userId) ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40" : ""}`}
                              onClick={() => toggleSaveStartup(startup.userId)}
                            >
                              <Bookmark className={`h-4 w-4 ${savedStartups.has(startup.userId) ? "fill-cyan-600 text-cyan-600 dark:fill-cyan-400 dark:text-cyan-400" : ""}`} />
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400 rounded-xl border border-dashed">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium mb-1">No connections yet</p>
                        <p className="text-sm">Connect with startups to track them here.</p>
                        <Button variant="outline" size="sm" className={`mt-4 ${outlineBtn}`} onClick={() => setActiveTab("recommended")}>
                          Browse startups
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="saved" className="space-y-4">
                    {startups.filter((s) => savedStartups.has(s.userId)).length > 0 ? (
                      startups.filter((s) => savedStartups.has(s.userId)).map((startup) => (
                        <Card key={startup.id ?? startup.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/40 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shrink-0">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{startup.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{startup.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {startup.industry && (
                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-700 dark:text-cyan-300">{startup.industry}</Badge>
                                  )}
                                  {startup.stage && (
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-700 dark:text-indigo-300">{startup.stage}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                              className={`flex-1 ${primaryBtn}`}
                              onClick={() => navigate(`/startups/${startup.userId}/profile`)}
                            >
                              View profile
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              aria-label="Remove from saved"
                              className={`${outlineBtn} border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40`}
                              onClick={() => toggleSaveStartup(startup.userId)}
                            >
                              <Bookmark className="h-4 w-4 fill-cyan-600 text-cyan-600 dark:fill-cyan-400 dark:text-cyan-400" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400 rounded-xl border border-dashed">
                        <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No saved startups yet. Bookmark startups to see them here.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="min-w-0 space-y-6">
              {/* Analytics Chart Preview & Quick Access */}
              <Card className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border-cyan-500/30 bg-gradient-to-b from-white to-cyan-50/40 dark:from-[#0b152a] dark:to-[#070d1d] shadow-md space-y-4">
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/15 blur-2xl" />

                <div className="flex items-start justify-between gap-2 relative">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Deal-flow intelligence
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-0.5">Deal-flow analytics</h3>
                  </div>

                  {/* Stage vs Sector Toggle */}
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900/90 p-0.5 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("stage")}
                      className={`px-2.5 py-1 rounded-none transition-all cursor-pointer ${
                        analyticsView === "stage"
                          ? "bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("sector")}
                      className={`px-2.5 py-1 rounded-none transition-all cursor-pointer ${
                        analyticsView === "sector"
                          ? "bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Sector
                    </button>
                  </div>
                </div>

                {startupsLoading ? (
                  <div className="h-44 rounded-xl bg-muted/40 animate-pulse" />
                ) : activeBreakdown.length > 0 ? (
                  <>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4 pt-1">
                      {/* Donut Ring with Center Total */}
                      <div className="relative h-[120px] w-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activeBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={56}
                              paddingAngle={3}
                              dataKey="count"
                              stroke="none"
                            >
                              {activeBreakdown.map((_, idx) => (
                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip {...chartTooltipTheme} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white leading-none">
                            {startupResults.length}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                            Total
                          </span>
                        </div>
                      </div>

                      {/* Ranked Progress Breakdown */}
                      <div className="space-y-2.5 min-w-0">
                        {activeBreakdown.map((item, idx) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                                  {item.name}
                                </span>
                              </span>
                              <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
                                {item.count}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(8, Math.round((item.count / Math.max(1, activeBreakdown[0].count)) * 100))}%`,
                                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setAnalyticsView("sector")}
                        className="rounded-xl bg-slate-100/80 dark:bg-slate-900/70 px-3 py-2.5 border border-slate-200/70 dark:border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer"
                      >
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                          Sectors
                          <Eye className="h-3 w-3 text-slate-400" />
                        </span>
                        <span className="mt-1 block text-lg font-extrabold tabular-nums text-slate-900 dark:text-white leading-tight">
                          {sectorBreakdown.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("saved")}
                        className="rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 px-3 py-2.5 border border-cyan-200/70 dark:border-cyan-800/50 hover:border-cyan-500/60 text-left transition-all cursor-pointer"
                      >
                        <span className="text-[11px] font-medium text-cyan-800/80 dark:text-cyan-300/80 flex items-center justify-between">
                          Saved
                          <Bookmark className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                        </span>
                        <span className="mt-1 block text-lg font-extrabold tabular-nums text-cyan-700 dark:text-cyan-300 leading-tight">
                          {startups.filter((s) => savedStartups.has(s.userId)).length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("following")}
                        className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-2.5 border border-emerald-200/70 dark:border-emerald-800/50 hover:border-emerald-500/60 text-left transition-all cursor-pointer"
                      >
                        <span className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-300/80 flex items-center justify-between">
                          Connected
                          <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </span>
                        <span className="mt-1 block text-lg font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300 leading-tight">
                          {followingStartups.length}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center rounded-xl border border-dashed">
                    No startup data available for chart preview.
                  </p>
                )}

                <Button
                  asChild
                  className="group w-full justify-center gap-2 rounded-none bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white dark:text-slate-950 font-bold h-10 px-4 shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all border-0"
                >
                  <Link to="/investor/analytics">
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span>View full analytics</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </Card>

              {/* Privacy Controls */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Profile visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Private profile</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Hide from public searches
                      </div>
                    </div>
                    <Switch
                      disabled={!profile}
                      checked={profile?.isPrivate ?? false}
                      onCheckedChange={(val) => void handlePrivacyToggle("isPrivate", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Anonymous browsing</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Don&apos;t show profile views
                      </div>
                    </div>
                    <Switch
                      disabled={!profile}
                      checked={profile?.anonymousBrowsing ?? false}
                      onCheckedChange={(val) => void handlePrivacyToggle("anonymousBrowsing", val)}
                    />
                  </div>
                </div>
              </Card>

              {/* Industry Preferences */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Industry focus</h3>
                <p className="text-xs text-muted-foreground mb-3">Click a sector to filter startups</p>
                <div className="flex flex-wrap gap-2">
                  {displayIndustries.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => {
                        setSearchQuery(industry);
                        void handleSearch(industry);
                      }}
                      className="rounded-full border border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer"
                    >
                      {industry}
                    </button>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className={`w-full mt-4 ${outlineBtn}`}>
                  <Link to="/investor/edit-profile">Edit preferences</Link>
                </Button>
              </Card>

              {/* Investment Criteria */}
              {profile && (
                <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Investment criteria</h3>
                  <div className="space-y-3">
                    {profile.investorType && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Investor type</span>
                        <span className="font-medium text-slate-900 dark:text-white">{profile.investorType}</span>
                      </div>
                    )}
                    {profile.preferredStage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Preferred stage</span>
                        <span className="font-medium text-slate-900 dark:text-white">{profile.preferredStage}</span>
                      </div>
                    )}
                    {(profile.minInvestment || profile.maxInvestment) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Check size</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {profile.minInvestment || "?"} – {profile.maxInvestment || "?"}
                        </span>
                      </div>
                    )}
                    {profile.geographicFocus && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Geographic focus</span>
                        <span className="font-medium text-slate-900 dark:text-white">{profile.geographicFocus}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* AI Agents Quick Access */}
              <Card className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 dark:from-cyan-500/15 dark:to-emerald-500/15 border-cyan-500/30 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white">AI Intelligence Agents</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Run sector-specific AI agents for live market signals, risks, and sourced research.
                </p>
                <Button asChild size="sm" className={`w-full ${primaryBtn}`}>
                  <Link to="/investor/ai-agents">
                    <Bot className="mr-1.5 h-4 w-4" />
                    Browse AI agents
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </Card>

              {/* Training Programs */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Training programs</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Learn from expert advisors through professional training programs.
                </p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-500 dark:text-slate-400">Enrolled trainings</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{enrolledCount}</span>
                </div>
                <Button asChild variant="outline" size="sm" className={`w-full ${outlineBtn}`}>
                  <Link to="/investor/trainings">
                    Browse trainings
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </Card>

              {/* AI Insights */}
              <Card className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 border-emerald-500/30 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white">AI insights</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  {profile?.industries?.length
                    ? `Generate AI research tailored to your focus on ${profile.industries[0]}.`
                    : "Explore sector intelligence reports powered by MoneyMinds AI."}
                </p>
                <Button asChild variant="outline" size="sm" className={`w-full ${outlineBtn}`}>
                  <Link to="/investor/ai-agents">Explore AI insights</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
