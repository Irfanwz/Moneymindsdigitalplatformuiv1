import { chartTooltipTheme } from "@/app/components/ui/chart-theme";
import { Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  DollarSign,
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
  getStartupProfile,
  getMyEnrollments,
  searchAdvisors,
  listTrainings,
} from "@/app/lib/api";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { Training, TrainingEnrollment } from "@/app/types/training";
import type { AdvisorSearchResult } from "@/app/types/search";

const COLORS = ["#0891b2", "#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899"];

export function StartupAnalytics() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const token = session?.token ?? "";
    setLoading(true);
    setError("");

    async function load() {
      try {
        const [profileRes, enrollRes, advisorRes, trainingRes] = await Promise.all([
          getStartupProfile(token),
          getMyEnrollments(token),
          searchAdvisors(token, { source: "database" }),
          listTrainings(token),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setEnrollments(enrollRes.enrollments);
          setAdvisors(advisorRes.advisors);
          setTrainings(trainingRes.trainings);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load startup analytics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token, attempt]);

  const companyName = profile?.companyName ?? user?.fullName ?? "Startup";

  const profileSections = [
    { name: "Company Info", filled: !!(profile?.companyName && profile?.industry) },
    { name: "Description", filled: !!(profile?.description && profile.description.length >= 20) },
    { name: "Team Members", filled: (profile?.teamMembers?.length ?? 0) > 0 },
    { name: "Funding Info", filled: !!(profile?.stage && profile?.totalRaised) },
    { name: "Investment Pitch", filled: !!(profile?.pitch) },
    { name: "Contact Links", filled: !!(profile?.website || profile?.linkedin) },
    { name: "Location", filled: !!(profile?.location) },
    { name: "Founded Year", filled: !!(profile?.foundedYear) },
  ];
  const completedSections = profileSections.filter((s) => s.filled).length;
  const profileCompletion = Math.round((completedSections / profileSections.length) * 100);

  const trainingById = new Map(trainings.map((t) => [t.id, t]));
  const trainingProgressData = enrollments.map((e, i) => {
    const title = trainingById.get(e.trainingId)?.title || `Training ${i + 1}`;
    return {
      name: title.length > 22 ? `${title.slice(0, 20)}…` : title,
      fullTitle: title,
      progress: e.progress ?? 0,
    };
  });

  const enrollmentTimeline = [...enrollments]
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime())
    .map((e, i) => ({
      date: new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      enrollments: i + 1,
    }));

  const specMap = new Map<string, number>();
  advisors.forEach((a) => {
    const spec = a.specialization || "General";
    specMap.set(spec, (specMap.get(spec) ?? 0) + 1);
  });
  const advisorSpecData = Array.from(specMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const teamSize = profile?.teamMembers?.length ?? 0;
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const completedTrainings = enrollments.filter((e) => (e.progress ?? 0) >= 100).length;

  const kpis = [
    {
      label: "Profile Readiness",
      value: `${profileCompletion}%`,
      detail: `${completedSections} of ${profileSections.length} sections complete`,
      icon: Target,
    },
    {
      label: "Team Size",
      value: teamSize,
      detail: "Listed leadership & team",
      icon: Users,
    },
    {
      label: "Training Completion",
      value: `${completedTrainings}/${enrollments.length}`,
      detail: enrollments.length ? `${avgProgress}% average progress` : "No active courses",
      icon: GraduationCap,
    },
    {
      label: "Advisor Network",
      value: advisors.length,
      detail: "Verified advisors available",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]">
      <Header userRole="startup" userName={companyName} />

      <main className="w-full">
        {/* Institutional Hero Header */}
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.30),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.14),transparent_55%)]" />
          <div className="flex flex-col gap-5 px-4 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between xl:px-14">
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 rounded-none text-xs font-medium text-cyan-200 transition-all hover:bg-cyan-950 hover:text-white">
                <Link to="/startup/dashboard">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to dashboard
                </Link>
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                  Startup <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Analytics</span>
                </h1>
                {profile && (
                  <Badge variant="outline" className={profile.isVerified ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-amber-500/40 bg-amber-500/15 text-amber-200"}>
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {profile.isVerified ? "Verified Company" : "Verification Pending"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300">
                Real-time profile readiness, training progression, and advisor ecosystem insights for {companyName}.
              </p>
            </div>

            {profile && (
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-800/60 bg-slate-950/60 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Stage</p>
                  <p className="mt-0.5 text-sm font-semibold text-cyan-200">{profile.stage || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Raised</p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-300">{profile.totalRaised || "Not set"}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Target Raise</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{profile.fundingGoal || "Not set"}</p>
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
              <Button size="sm" variant="outline" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30" onClick={() => setAttempt((a) => a + 1)}>
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
              {/* Stats Overview */}
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
                {/* Profile Completion Breakdown */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-lg font-semibold">Profile Readiness Breakdown</h2>
                    </div>
                    {profileCompletion < 100 && (
                      <Button asChild variant="outline" size="sm" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                        <Link to="/startup/edit-profile">
                          Complete profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {profileSections.map((section) => (
                      <div key={section.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{section.name}</span>
                          <Badge
                            variant={section.filled ? "secondary" : "outline"}
                            className={section.filled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}
                          >
                            {section.filled ? "Complete" : "Missing"}
                          </Badge>
                        </div>
                        <Progress
                          value={section.filled ? 100 : 0}
                          className="h-1.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Readiness</span>
                      <span className="font-bold tabular-nums text-cyan-700 dark:text-cyan-300">{profileCompletion}%</span>
                    </div>
                    <Progress
                      value={profileCompletion}
                      className="mt-2 h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                    />
                  </div>
                </Card>

                {/* Training Progress */}
                <Card className="flex flex-col rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-lg font-semibold">Training Progress by Course</h2>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      Avg: {avgProgress}%
                    </span>
                  </div>
                  {trainingProgressData.length > 0 ? (
                    <div className="flex flex-1 flex-col justify-between">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={trainingProgressData} margin={{ top: 8, right: 8, bottom: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={32} />
                          <Tooltip {...chartTooltipTheme} />
                          <Bar dataKey="progress" name="Progress (%)" fill="#0891b2" radius={[6, 6, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                        <span className="text-muted-foreground">Completed Trainings</span>
                        <span className="font-semibold tabular-nums">{completedTrainings} of {enrollments.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-12 text-muted-foreground">
                      <GraduationCap className="mb-2 h-8 w-8 opacity-50" />
                      <p className="text-sm">No trainings enrolled yet</p>
                      <Button asChild variant="outline" size="sm" className="mt-3 rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                        <Link to="/startup/trainings">Browse trainings <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                      </Button>
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Enrollment Timeline */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-semibold">Cumulative Training Enrollments</h2>
                  </div>
                  {enrollmentTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={enrollmentTimeline}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
                        <Tooltip {...chartTooltipTheme} />
                        <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#10b981" fill="#10b981" fillOpacity={0.18} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-14 text-sm text-muted-foreground">
                      No enrollment history recorded yet
                    </div>
                  )}
                </Card>

                {/* Advisor Specializations */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-lg font-semibold">Platform Advisor Specializations</h2>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="rounded-none text-xs font-medium text-cyan-700 hover:bg-cyan-50/70 hover:text-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200">
                      <Link to="/startup/find-advisors">Explore <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                  {advisorSpecData.length > 0 ? (
                    <div className="grid items-center gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <Pie
                            data={advisorSpecData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={78}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {advisorSpecData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...chartTooltipTheme} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5">
                        {advisorSpecData.slice(0, 6).map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2.5 text-sm">
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
                            <span className="font-semibold tabular-nums">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed py-14 text-sm text-muted-foreground">
                      No advisor records available yet
                    </div>
                  )}
                </Card>
              </div>

              {/* Capital & Valuation Summary */}
              {profile && (
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 p-6 shadow-sm dark:border-cyan-800/35">
                  <div className="mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-semibold">Capital &amp; Profile Snapshot</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Current Stage", value: profile.stage || "Not specified" },
                      { label: "Total Raised", value: profile.totalRaised || "Not specified" },
                      { label: "Funding Goal", value: profile.fundingGoal || "Not specified" },
                      { label: "Valuation", value: profile.valuation || "Not specified" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                        <p className="mt-1 text-lg font-bold tracking-tight">{item.value}</p>
                      </div>
                    ))}
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
