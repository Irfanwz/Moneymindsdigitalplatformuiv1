import { chartTooltipTheme } from "@/app/components/ui/chart-theme";
import { Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Eye,
  Bookmark,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getInvestorProfile,
  searchStartups,
  getMyEnrollments,
  listTrainings,
} from "@/app/lib/api";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { StartupSearchResult } from "@/app/types/search";
import type { Training, TrainingEnrollment } from "@/app/types/training";

const COLORS = ["#0891b2", "#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899"];

export function InvestorAnalytics() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [startups, setStartups] = useState<StartupSearchResult[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const userName = user?.fullName ?? "Investor";
  const savedStartups = new Set<string>(JSON.parse(localStorage.getItem("savedStartups") || "[]"));

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const token = session?.token ?? "";
    setLoading(true);
    setError("");
    async function load() {
      try {
        const [profileRes, startupsRes, enrollRes, trainingRes] = await Promise.all([
          getInvestorProfile(token),
          searchStartups(token),
          getMyEnrollments(token),
          listTrainings(token),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setStartups(startupsRes.startups);
          setEnrollments(enrollRes.enrollments);
          setTrainings(trainingRes.trainings);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load investor analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token, attempt]);

  const industryMap = new Map<string, number>();
  startups.forEach((s) => {
    const ind = s.industry || "Other";
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + 1);
  });
  const industryData = Array.from(industryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const stageMap = new Map<string, number>();
  startups.forEach((s) => {
    const stage = s.stage || "Unknown";
    stageMap.set(stage, (stageMap.get(stage) ?? 0) + 1);
  });
  const stageData = Array.from(stageMap.entries()).map(([name, value]) => ({ name, value }));

  const trainingById = new Map(trainings.map((t) => [t.id, t]));
  const trainingProgressData = enrollments.map((e, i) => {
    const title = trainingById.get(e.trainingId)?.title || `Training ${i + 1}`;
    return {
      name: title.length > 22 ? `${title.slice(0, 20)}…` : title,
      progress: e.progress ?? 0,
    };
  });
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const completedTrainings = enrollments.filter((e) => (e.progress ?? 0) >= 100).length;

  const enrollmentTimeline = [...enrollments]
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime())
    .map((e, i) => ({
      date: new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      enrollments: i + 1,
    }));

  const savedCount = startups.filter((s) => savedStartups.has(s.userId)).length;
  const bookmarkData = [
    { name: "Saved", value: savedCount },
    { name: "Other", value: Math.max(0, startups.length - savedCount) },
  ].filter((d) => d.value > 0);

  const investorIndustries = profile?.industries ?? [];

  const kpis = [
    { label: "Startups available", value: startups.length, detail: `${savedCount} bookmarked`, icon: Building2 },
    { label: "Industries tracked", value: investorIndustries.length, detail: "Focus mandates", icon: Eye },
    { label: "Trainings enrolled", value: enrollments.length, detail: `${completedTrainings} completed`, icon: GraduationCap },
    { label: "Average progress", value: `${avgProgress}%`, detail: "Training completion", icon: TrendingUp },
  ];

  const outlineBtn =
    "rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30";

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]">
      <Header userRole="investor" userName={userName} />

      <main className="w-full">
        {/* Institutional Dark Hero Header */}
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.30),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.14),transparent_55%)]" />
          <div className="flex flex-col gap-5 px-4 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between xl:px-14">
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 rounded-none text-xs font-medium text-cyan-200 transition-all hover:bg-cyan-950 hover:text-white">
                <Link to="/investor/dashboard">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                Investor <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Analytics</span>
              </h1>
              <p className="text-sm text-slate-300">
                Real-time deal-flow sector breakdown, stage distribution, and training progress.
              </p>
            </div>

            {profile && (
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-800/60 bg-slate-950/60 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Type</p>
                  <p className="mt-0.5 text-sm font-semibold text-cyan-200">{profile.investorType || "Investor"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Preferred stage</p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-300">{profile.preferredStage || "All stages"}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Check size</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {profile.minInvestment || profile.maxInvestment ? `${profile.minInvestment || "?"} – ${profile.maxInvestment || "?"}` : "Not set"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8 xl:px-14">
          {error && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" className={outlineBtn} onClick={() => setAttempt((a) => a + 1)}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-32 animate-pulse rounded-2xl border-cyan-900/10 bg-card/70 p-5" />
              ))}
            </div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map(({ label, value, detail, icon: Icon }) => (
                  <Card key={label} className="rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm transition-all hover:border-cyan-500/40 hover:shadow-md dark:border-cyan-800/35">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-muted-foreground">{label}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
                  </Card>
                ))}
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Startup Industry Distribution */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-lg font-semibold">Startups by industry</h2>
                  </div>
                  {industryData.length > 0 ? (
                    <div className="grid items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
                      <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                          <Pie
                            data={industryData.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={82}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {industryData.slice(0, 6).map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...chartTooltipTheme} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5">
                        {industryData.slice(0, 6).map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2.5 text-sm">
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
                            <Badge variant="outline" className="text-xs tabular-nums">{item.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-12 text-sm text-muted-foreground">
                      No startup data available
                    </div>
                  )}
                </Card>

                {/* Startup Stage Distribution */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-lg font-semibold">Startups by stage</h2>
                  </div>
                  {stageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stageData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
                        <Tooltip {...chartTooltipTheme} />
                        <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} name="Startups" maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-12 text-sm text-muted-foreground">
                      No stage data available
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Training Progress */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="text-lg font-semibold">Training progress</h2>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">Avg: {avgProgress}%</span>
                  </div>
                  {trainingProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={trainingProgressData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={32} />
                        <Tooltip {...chartTooltipTheme} />
                        <Bar dataKey="progress" name="Progress (%)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-muted-foreground">
                      <GraduationCap className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No trainings enrolled yet</p>
                      <Button asChild variant="outline" size="sm" className={`mt-3 ${outlineBtn}`}>
                        <Link to="/investor/trainings">
                          Browse trainings <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Enrollment Growth */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-lg font-semibold">Enrollment growth</h2>
                  </div>
                  {enrollmentTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={enrollmentTimeline}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
                        <Tooltip {...chartTooltipTheme} />
                        <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#0891b2" fill="#0891b2" fillOpacity={0.18} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-14 text-sm text-muted-foreground">
                      No enrollment data yet
                    </div>
                  )}
                </Card>
              </div>

              {bookmarkData.length > 0 && startups.length > 0 && (
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-4 flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-lg font-semibold">Watchlist bookmark rate</h2>
                  </div>
                  <div className="grid items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={bookmarkData} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={2} dataKey="value">
                          <Cell fill="#0891b2" />
                          <Cell fill="#cbd5e1" />
                        </Pie>
                        <Tooltip {...chartTooltipTheme} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 text-sm">
                      {bookmarkData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between max-w-xs">
                          <span className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: index === 0 ? "#0891b2" : "#cbd5e1" }} />
                            <span>{item.name}</span>
                          </span>
                          <span className="font-semibold tabular-nums">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
