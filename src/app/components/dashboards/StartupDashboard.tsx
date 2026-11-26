import { useEffect, useState } from "react";
import { StartupCompanyDetails } from "./StartupCompanyDetails";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Progress } from "@/app/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  Calendar,
  Check,
  CircleCheck,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getStartupProfile,
  getMyEnrollments,
  searchAdvisors,
  listTrainings,
} from "@/app/lib/api";
import { Badge } from "@/app/components/ui/badge";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { Training, TrainingEnrollment } from "@/app/types/training";
import type { AdvisorSearchResult } from "@/app/types/search";

const initialStatus = {
  profile: "loading",
  enrollments: "loading",
  advisors: "loading",
  trainings: "loading",
} satisfies Record<string, LoadStatus>;

type LoadStatus = "loading" | "ready" | "failed";
type DashboardSource = keyof typeof initialStatus;

export function StartupDashboard() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorSearchResult[]>([]);
  const [status, setStatus] = useState<Record<DashboardSource, LoadStatus>>(initialStatus);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const token = session.token ?? "";
    setStatus(initialStatus);

    async function load<T>(source: DashboardSource, request: () => Promise<T>, save: (data: T) => void) {
      try {
        const data = await request();
        if (!active) return;
        save(data);
        setStatus((current) => ({ ...current, [source]: "ready" }));
      } catch {
        if (active) setStatus((current) => ({ ...current, [source]: "failed" }));
      }
    }

    void load("profile", () => getStartupProfile(token), ({ profile }) => setProfile(profile));
    void load("enrollments", () => getMyEnrollments(token), ({ enrollments }) => setEnrollments(enrollments));
    void load("advisors", () => searchAdvisors(token, { source: "database" }), ({ advisors }) => setAdvisors(advisors.slice(0, 3)));
    void load("trainings", () => listTrainings(token), ({ trainings }) => setTrainings(trainings));

    return () => { active = false; };
  }, [session?.user?.id, session?.token, loadAttempt]);

  const profileReady = status.profile === "ready";
  const enrollmentsReady = status.enrollments === "ready";
  const trainingListLoading = status.trainings === "loading" || status.enrollments === "loading";
  const trainingListFailed = status.trainings === "failed" || status.enrollments === "failed";
  const failedSources = [
    { status: status.profile, label: "company profile" },
    { status: status.enrollments, label: "training enrollments" },
    { status: status.advisors, label: "advisor recommendations" },
    { status: status.trainings, label: "training catalog" },
  ].filter((source) => source.status === "failed").map(({ label }) => label);

  const userName = user?.fullName ?? "Startup";
  const companyName = (profileReady && profile?.companyName) || userName;
  const companyFacts = [
    { label: "Industry", value: profile?.industry },
    { label: "Funding stage", value: profile?.stage },
    { label: "Target raise", value: profile?.fundingGoal },
    { label: "Location", value: profile?.location },
  ].filter(({ value }) => Boolean(value));

  // Calculate profile completion percentage
  const profileFields = profile
    ? [
        profile.companyName,
        profile.tagline,
        profile.industry,
        profile.foundedYear,
        profile.location,
        profile.description,
        profile.website,
        profile.stage,
        profile.totalRaised,
        profile.pitch,
      ]
    : [];
  const filledFields = profileFields.filter((f) => f && f.trim() !== "").length;
  const profileCompletion = profile
    ? Math.round((filledFields / profileFields.length) * 100)
    : 0;

  const enrolledCount = enrollments.length;
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

  const completedCount = enrollments.filter((enrollment) => enrollment.progress >= 100).length;
  const notStartedCount = enrollments.filter((enrollment) => !enrollment.progress).length;
  const trainingStatuses = [
    { label: "Completed", count: completedCount, color: "bg-emerald-500" },
    { label: "In progress", count: enrolledCount - completedCount - notStartedCount, color: "bg-cyan-500" },
    { label: "Not started", count: notStartedCount, color: "bg-slate-400" },
  ];

  const now = new Date();
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
  const monthlyEnrollments = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const end = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1);
    return {
      month: monthFormatter.format(start),
      count: enrollments.filter(({ enrolledAt }) => {
        const date = Date.parse(enrolledAt);
        return date >= start.getTime() && date < end;
      }).length,
    };
  });
  const hasRecentEnrollments = monthlyEnrollments.some(({ count }) => count > 0);

  const teamCount = profile?.teamMembers?.length ?? 0;
  const stats = [
    { label: "Team members", value: profileReady ? teamCount : "—", detail: "Listed on your company profile", icon: Users },
    { label: "Training enrollments", value: enrollmentsReady ? enrolledCount : "—", detail: "Courses you’re enrolled in", icon: GraduationCap },
    { label: "Trainings completed", value: enrollmentsReady ? completedCount : "—", detail: "Courses at 100% progress", icon: CircleCheck },
    { label: "Average training progress", value: enrollmentsReady && enrolledCount ? `${avgProgress}%` : "—", detail: "Across your enrolled courses", icon: BarChart3 },
  ];
  const checklist = [
    { label: "Company information", complete: Boolean(profile?.companyName?.trim()), icon: Building2, section: "company-name" },
    { label: "Investment pitch", complete: Boolean(profile?.pitch?.trim()), icon: Sparkles, section: "pitch" },
    { label: "Team members", complete: teamCount > 0, icon: Users, section: "startup-team" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/70 via-background to-background dark:from-[#0b1728]">
      <Header userRole="startup" userName={companyName} />

      <main className="w-full">
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.32),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_55%)]" />
          <div className="grid gap-8 px-4 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,28%)] lg:items-center xl:px-14 xl:py-11">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <Building2 aria-hidden="true" className="h-4 w-4" />
                  Startup dashboard
                </p>
                {profileReady && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    profile?.isVerified
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${profile?.isVerified ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {profile?.isVerified ? "Verified Startup" : "Verification Pending"}
                  </span>
                )}
              </div>
              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-5xl">
                Welcome back, <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">{companyName}</span>
              </h1>
              {profileReady && profile?.tagline && (
                <p className="mt-2 max-w-2xl text-sm text-slate-300/90 sm:text-base">{profile.tagline}</p>
              )}
              {profileReady && companyFacts.length > 0 && (
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {companyFacts.map(({ label, value }) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-xs text-slate-400">{label}</dt>
                      <dd className="break-words font-medium text-slate-100">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-none bg-emerald-300 font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-200">
                  <Link to="/startup/edit-profile">
                    {!profileReady || profileCompletion === 100 ? "Edit profile" : "Complete profile"}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-none border-cyan-800 bg-transparent font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                  <Link to="/startup/find-advisors">Find advisors</Link>
                </Button>
                {profile && profileReady && (
                  <Button asChild variant="ghost" className="rounded-none font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                    <a href="#company-details">View company details</a>
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-800/70 bg-slate-950/50 p-5 sm:p-6">
              <p className="text-sm font-medium text-slate-300">Profile completion</p>
              {!profileReady ? (
                <p className="mt-2 text-sm text-slate-300">{status.profile === "loading" ? "Loading profile…" : "Profile progress unavailable"}</p>
              ) : (
                <>
                  <p className="mt-2 text-4xl font-bold tabular-nums text-emerald-300">{profileCompletion}%</p>
                  <Progress value={profileCompletion} aria-label="Profile completion" className="mt-4 h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-cyan-400" />
                  <p className="mt-3 text-xs text-slate-300">{filledFields} of {profileFields.length || 10} profile fields filled</p>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8 xl:px-14">
          {failedSources.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p role="alert" className="text-sm">Couldn’t load {failedSources.join(", ")}.</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30"
                onClick={() => {
                  setStatus(initialStatus);
                  setLoadAttempt((attempt) => attempt + 1);
                }}
              >
                Retry dashboard data
              </Button>
            </div>
          )}

          <section aria-label="Startup performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label} className="min-w-0 gap-3 rounded-2xl border-cyan-900/10 bg-card/90 p-4 shadow-sm transition-all hover:border-cyan-500/40 hover:shadow-md sm:p-5 dark:border-cyan-800/35">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </Card>
            ))}
          </section>

          <section aria-label="Training analytics" className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Card className="min-w-0 gap-4 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Training enrollments by month</h2>
                  <p className="text-sm text-muted-foreground">Courses you’re still enrolled in, grouped by enrollment month</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-none text-xs font-medium text-cyan-700 hover:bg-cyan-50/70 hover:text-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200">
                  <Link to="/startup/analytics">Full analytics <ArrowRight aria-hidden="true" className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              {hasRecentEnrollments && enrollmentsReady ? (
                <ChartContainer
                  config={{ count: { label: "Enrollments", color: "#0891b2" } }}
                  className="h-52 w-full"
                >
                  <BarChart data={monthlyEnrollments} accessibilityLayer margin={{ top: 8, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} interval={0} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={26} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[5, 5, 0, 0]} maxBarSize={46} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="grid min-h-52 place-items-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">
                  {status.enrollments === "loading" ? "Loading enrollments…" : !enrollmentsReady ? "Enrollments unavailable." : "No current enrollments from the past six months."}
                </p>
              )}
            </Card>

            <Card className="min-w-0 gap-4 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
              <div>
                <h2 className="text-lg font-semibold">Training progress breakdown</h2>
                <p className="text-sm text-muted-foreground">Current enrollments by completion status</p>
              </div>
              {enrolledCount > 0 && enrollmentsReady ? (
                <>
                  <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-full bg-muted">
                    {trainingStatuses.map(({ label, count, color }) => (
                      <div key={label} className={color} style={{ width: `${(count / enrolledCount) * 100}%` }} />
                    ))}
                  </div>
                  <ul className="divide-y divide-border">
                    {trainingStatuses.map(({ label, count, color }) => (
                      <li key={label} className="flex items-center gap-3 py-3 text-sm">
                        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="flex-1">{label}</span>
                        <span className="font-semibold tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-start justify-center gap-3 rounded-xl border border-dashed p-4">
                  <p className="text-sm text-muted-foreground">
                    {status.enrollments === "loading" ? "Loading progress…" : !enrollmentsReady ? "Progress unavailable." : "Enroll in a course to track your progress here."}
                  </p>
                  {enrollmentsReady && (
                    <Button asChild variant="outline" size="sm" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                      <Link to="/startup/trainings">Browse trainings <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-6">
              <Card className="gap-3 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
                <h2 className="text-lg font-semibold">Profile checklist</h2>
                {!profileReady ? (
                  <p className="text-sm text-muted-foreground">{status.profile === "loading" ? "Loading checklist…" : "Checklist unavailable"}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {checklist.map(({ label, complete, icon: Icon, section }) => (
                      <li key={label} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="flex items-center gap-3 text-sm font-medium">
                          <Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </span>
                        {complete ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            <Check aria-hidden="true" className="h-4 w-4" />
                            Added
                          </span>
                        ) : (
                          <Link to={`/startup/edit-profile#${section}`} aria-label={`Add ${label.toLowerCase()}`} className="text-sm font-semibold text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-300">
                            Add details
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {profile && profileReady && <StartupCompanyDetails profile={profile} />}
            </div>

            {/* Sidebar */}
            <div className="min-w-0 space-y-6">
              {/* Quick Actions */}
              <Card className="gap-4 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
                <h3 className="text-lg font-semibold">Company tools</h3>
                <div className="grid gap-2">
                  {[
                    { to: "/startup/profile", label: "Company profile", description: "Review your company and team details", icon: Building2 },
                    { to: "/startup/analytics", label: "Startup analytics", description: "Track profile and training progress", icon: BarChart3 },
                    { to: "/startup/groups", label: "Advisor groups", description: "Browse groups you can join", icon: Users },
                  ].map(({ to, label, description, icon: Icon }) => (
                    <Link key={to} to={to} className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5 focus-visible:outline-2 focus-visible:outline-cyan-500">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-xs text-muted-foreground">{description}</span>
                      </span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Explore advisors */}
              <Card className="gap-4 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
                <h3 className="text-lg font-semibold">Explore advisors</h3>
                <div className="space-y-4">
                  {status.advisors === "loading" ? (
                    <div className="text-sm text-muted-foreground">Loading advisors...</div>
                  ) : status.advisors === "failed" ? (
                    <div className="text-sm text-muted-foreground">Advisors unavailable.</div>
                  ) : advisors.length > 0 ? (
                    advisors.map((advisor) => (
                      <Link key={advisor.id} to={`/advisors/${advisor.userId || advisor.id}/profile`} className="block space-y-2 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-cyan-500">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {advisor.name?.[0] ?? "A"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{advisor.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {advisor.specialization || advisor.title || "Advisor"}
                            </div>
                          </div>
                        </div>
                        {advisor.expertiseAreas?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                                style={{ width: `${advisor.expertiseAreas[0].level}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium tabular-nums text-muted-foreground">
                              {advisor.expertiseAreas[0].level}%
                            </span>
                          </div>
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No advisors found yet.</div>
                  )}
                  <Button asChild variant="outline" className="mt-2 w-full rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                    <Link to="/startup/find-advisors">
                      View all advisors <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Training */}
              <Card className="gap-4 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm sm:p-6 dark:border-cyan-800/35">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Training</h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    if (trainingListLoading || trainingListFailed) {
                      return <p className="text-sm text-muted-foreground">{trainingListLoading ? "Loading trainings…" : "Trainings unavailable."}</p>;
                    }
                    // Enrolled trainings with real titles
                    const enrolledTrainings = enrollments
                      .map((e) => {
                        const training = trainings.find((t) => t.id === e.trainingId);
                        return training ? { ...training, progress: e.progress, enrolledAt: e.enrolledAt, enrollmentId: e.id } : null;
                      })
                      .filter(Boolean) as (Training & { progress: number; enrolledAt: string; enrollmentId: string })[];

                    // Upcoming trainings not yet enrolled in
                    const enrolledIds = new Set(enrollments.map((e) => e.trainingId));
                    const upcomingTrainings = trainings
                      .filter((t) => (t.status === "upcoming" || t.status === "ongoing") && !enrolledIds.has(t.id) && (!t.targetAudience?.length || t.targetAudience.some((audience) => ["startup", "startups", "all"].includes(audience.trim().toLowerCase()))))
                      .slice(0, 2);

                    const hasEvents = enrolledTrainings.length > 0 || upcomingTrainings.length > 0;

                    if (!hasEvents) {
                      return (
                        <div className="text-center py-4">
                          <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <div className="text-sm text-muted-foreground">No training to show yet</div>
                          <Button asChild variant="outline" size="sm" className="mt-2 rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                            <Link to="/startup/trainings">Browse trainings <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <>
                        {enrolledTrainings.slice(0, 3).map((t) => (
                          <Link key={t.enrollmentId} to={`/startup/trainings/${t.id}`}>
                            <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex flex-col items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2 w-14 h-14 shrink-0">
                                <GraduationCap className="h-4 w-4 text-cyan-700 dark:text-cyan-300 mb-0.5" />
                                <div className="text-xs font-semibold tabular-nums text-cyan-800 dark:text-cyan-200">{t.progress}%</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{t.title}</div>
                                <div className="text-xs text-muted-foreground">{t.schedule || t.duration}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={t.status === "ongoing" ? "default" : "outline"} className="text-xs">
                                    {t.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{t.format}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {upcomingTrainings.map((t) => (
                          <Link key={t.id} to={`/startup/trainings/${t.id}`}>
                            <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-dashed border-border">
                              <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-2 w-14 h-14 shrink-0">
                                <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                                <div className="text-xs font-medium">New</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{t.title}</div>
                                <div className="text-xs text-muted-foreground">{t.schedule || t.duration}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{t.status}</Badge>
                                  <span className="text-xs text-muted-foreground">{t.type === "free" ? "Free" : `$${t.price}`}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
