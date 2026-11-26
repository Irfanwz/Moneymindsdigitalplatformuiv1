import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  FileText,
  Award,
  PlusCircle,
  DollarSign,
  Lock,
  Globe,
  UserPlus,
  GraduationCap,
  ArrowRight,
  BarChart3,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getAdvisorProfile,
  listAdvisorGroups,
  listTrainings,
  listAdvisorSignals,
  getMyCredibility,
  type CredibilityScore,
} from "@/app/lib/api";
import type { AdvisorProfile } from "@/app/types/advisor-profile";
import type { AdvisorGroup, AdvisorSignal } from "@/app/types/advisor-groups";
import type { Training } from "@/app/types/training";

export function AdvisorDashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [credibility, setCredibility] = useState<CredibilityScore | null>(null);
  const [groups, setGroups] = useState<AdvisorGroup[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [signals, setSignals] = useState<AdvisorSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const token = session?.token ?? "";
    setLoading(true);
    setLoadError("");
    async function load() {
      try {
        const [profileRes, groupsRes, trainingsRes, credibilityRes] = await Promise.all([
          getAdvisorProfile(token),
          listAdvisorGroups(token),
          listTrainings(token),
          getMyCredibility(token).catch(() => null),
        ]);
        if (!active) return;

        setProfile(profileRes.profile);
        if (credibilityRes) setCredibility(credibilityRes);
        setGroups(groupsRes.groups);

        const myTrainings = trainingsRes.trainings.filter(
          (t) => t.advisorId === user?.id
        );
        setTrainings(myTrainings);

        const allSignals: AdvisorSignal[] = [];
        for (const group of groupsRes.groups) {
          try {
            const sigRes = await listAdvisorSignals(token, group.id);
            allSignals.push(...sigRes.signals);
          } catch {
            // skip group
          }
        }
        if (active) setSignals(allSignals);
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : "Could not load advisor dashboard.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token, user?.id, attempt]);

  const expertiseAreas = profile?.expertiseAreas?.filter((e) => e.area) ?? [];

  const totalGroups = groups.length;
  const paidGroups = groups.filter((g) => g.isPaid).length;
  const freeGroups = totalGroups - paidGroups;
  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount ?? 0), 0);
  const totalSignalCount = groups.reduce((sum, g) => sum + (g.signalCount ?? 0), 0);

  const activeTrainings = trainings.filter((t) => t.status === "ongoing" || t.status === "upcoming").length;
  const totalEnrolled = trainings.reduce((sum, t) => sum + (t.enrolled ?? 0), 0);
  const trainingRevenue = trainings.reduce((sum, t) => t.type === "paid" ? sum + t.price * (t.enrolled ?? 0) : sum, 0);

  const monthlyRevenue = groups.reduce((sum, g) => {
    if (g.isPaid && g.monthlyFee) {
      return sum + parseFloat(g.monthlyFee || "0") * (g.memberCount ?? 0);
    }
    return sum;
  }, 0);

  const credibilityValue = credibility?.score !== null && credibility?.score !== undefined
    ? `${credibility.score}/100`
    : "—";

  const stats = [
    { label: "Credibility score", value: credibilityValue, detail: credibility?.label || "Audited prediction track record", icon: Award },
    { label: "Total groups", value: totalGroups.toString(), detail: `${paidGroups} paid · ${freeGroups} free`, icon: Users },
    { label: "Total members", value: totalMembers.toString(), detail: "Across all advisory rooms", icon: UserPlus },
    { label: "Monthly revenue", value: `$${monthlyRevenue.toLocaleString()}`, detail: "Estimated from paid groups", icon: DollarSign },
  ];

  const recentSignals = [...signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const outlineBtn =
    "rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 hover:text-cyan-800 dark:hover:text-cyan-200 transition-all";
  const primaryBtn =
    "rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm transition-all border-0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]">
      <Header userRole="advisor" userName={userName} />

      <main className="w-full">
        {/* Institutional Dark Hero Header */}
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.32),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_55%)]" />
          <div className="grid gap-8 px-4 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,28%)] lg:items-center xl:px-14 xl:py-11">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  Advisor dashboard
                </p>
                {profile && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    profile.isVerified
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${profile.isVerified ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {profile.isVerified ? "Verified Advisor" : "Verification Pending"}
                  </span>
                )}
              </div>
              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-5xl">
                Welcome back, <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                {profile?.title || "Manage your advisory groups, publish audited market signals, and grow your training programs."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {groups.length > 0 ? (
                  <Button
                    onClick={() => navigate(`/advisor/groups/${groups[0].id}/create-signal`)}
                    className="rounded-none bg-emerald-300 font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-200"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post new insight
                  </Button>
                ) : (
                  <Button asChild className="rounded-none bg-emerald-300 font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-200">
                    <Link to="/advisor/groups">
                      <Users className="h-4 w-4" />
                      Create first group
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="rounded-none border-cyan-800 bg-transparent font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                  <Link to="/advisor/trainings">Manage trainings</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-none font-medium text-cyan-100 transition-all hover:bg-cyan-950 hover:text-white">
                  <Link to="/advisor/analytics">View analytics</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-800/70 bg-slate-950/50 p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Audited credibility</p>
                <Award className="h-4 w-4 text-emerald-300" />
              </div>
              <p className="text-4xl font-bold tabular-nums text-emerald-300">{credibilityValue}</p>
              <p className="text-xs text-slate-300">
                {credibility?.totalPredictions
                  ? `${credibility.correctPredictions ?? 0} of ${credibility.totalPredictions} predictions verified`
                  : "Publish market signals to build an audited track record"}
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
              <Button size="sm" variant="outline" className={outlineBtn} onClick={() => setAttempt((a) => a + 1)}>
                Retry
              </Button>
            </div>
          )}

          {/* Stats Grid */}
          <section aria-label="Advisor metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label} className="min-w-0 gap-2 rounded-2xl border-cyan-900/10 bg-card/90 p-5 shadow-sm transition-all hover:border-cyan-500/40 hover:shadow-md dark:border-cyan-800/35">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight tabular-nums">{loading ? "—" : value}</div>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </Card>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Main Column */}
            <div className="min-w-0 space-y-6">
              {/* Group & Revenue Overview */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Group &amp; revenue overview</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Live breakdown across your advisory rooms and trainings</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className={outlineBtn}>
                    <Link to="/advisor/groups">
                      <Users className="mr-1.5 h-3.5 w-3.5" />
                      View all groups
                    </Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Groups Breakdown */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Groups breakdown</div>
                    <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <span className="text-sm font-medium">Total groups</span>
                      </div>
                      <span className="font-bold tabular-nums">{totalGroups}</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Paid groups</div>
                          <div className="text-xs text-muted-foreground">Premium content</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold tabular-nums">{paidGroups}</div>
                        {paidGroups > 0 && (
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Free groups</div>
                          <div className="text-xs text-muted-foreground">Open access</div>
                        </div>
                      </div>
                      <div className="font-bold tabular-nums">{freeGroups}</div>
                    </div>
                  </div>

                  {/* Members & Signals Breakdown */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content &amp; engagement</div>
                    <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <span className="text-sm font-medium">Total members</span>
                      </div>
                      <span className="font-bold tabular-nums">{totalMembers}</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Published signals</div>
                          <div className="text-xs text-muted-foreground">Across all groups</div>
                        </div>
                      </div>
                      <div className="font-bold tabular-nums">{totalSignalCount}</div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Training enrollments</div>
                          <div className="text-xs text-muted-foreground">Across all trainings</div>
                        </div>
                      </div>
                      <div className="font-bold tabular-nums">{totalEnrolled}</div>
                    </div>
                  </div>
                </div>

                {/* Revenue Section */}
                <div className="pt-5 border-t border-border/60">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue insights</div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <DollarSign className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                        <span className="text-xs font-medium text-cyan-800 dark:text-cyan-300">Monthly group revenue</span>
                      </div>
                      <div className="text-2xl font-bold tabular-nums text-cyan-700 dark:text-cyan-300">
                        ${monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">From paid groups</div>
                    </div>

                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Training revenue</span>
                      </div>
                      <div className="text-2xl font-bold tabular-nums">
                        ${trainingRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">From paid trainings</div>
                    </div>

                    <div className="p-4 border border-emerald-200 dark:border-emerald-800/50 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Total revenue</span>
                      </div>
                      <div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                        ${(monthlyRevenue + trainingRevenue).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Combined</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Credibility Overview */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-xl font-bold">Credibility profile</h2>
                  <div className="flex items-center gap-2">
                    {credibility?.score !== null && credibility?.score !== undefined ? (
                      <CredibilityBadge score={credibility.score} tier={credibility.tier ?? undefined} label={credibility.label ?? undefined} />
                    ) : (
                      <CredibilityBadge type="pending" label="Not scored yet" />
                    )}
                    <Button asChild variant="ghost" size="sm" className="rounded-none text-xs text-cyan-700 dark:text-cyan-300">
                      <Link to="/advisor/credibility">Details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-3xl tabular-nums">{credibilityValue}</div>
                      <div className="text-sm text-muted-foreground">Overall credibility score</div>
                    </div>
                    <div className="h-16 w-16 rounded-2xl border-2 border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
                      <Award className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">Expertise</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {expertiseAreas.length} {expertiseAreas.length === 1 ? "area" : "areas"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(expertiseAreas.length * 20, 100)}
                        className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">Content</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{signals.length} posts</span>
                      </div>
                      <Progress
                        value={Math.min(signals.length * 10, 100)}
                        className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">Groups</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{totalGroups} groups</span>
                      </div>
                      <Progress
                        value={Math.min(totalGroups * 25, 100)}
                        className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                      />
                    </div>
                  </div>

                  {profile?.certifications && profile.certifications.length > 0 && (
                    <div className="pt-4 border-t border-border/60">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Certifications</div>
                      <div className="flex gap-2 flex-wrap">
                        {profile.certifications.map((cert) => (
                          <Badge key={cert.name} variant="outline" className="border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 px-3 py-1">
                            {cert.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Published Insights / Signals */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Your insights</h2>
                  {groups.length > 0 && (
                    <Button className={`${primaryBtn} h-10 min-w-[132px] px-5`} onClick={() => navigate(`/advisor/groups/${groups[0].id}/create-signal`)}>
                      <PlusCircle className="mr-1.5 h-4 w-4" />
                      New post
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {recentSignals.length > 0 ? (
                    recentSignals.map((signal) => (
                      <Card key={signal.id} className="p-4 rounded-xl border-border/80 hover:border-cyan-500/40 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate">{signal.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {signal.postType === "signal" ? "Signal" : "Post"}
                              </span>
                              <span>{new Date(signal.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              signal.postType === "signal"
                                ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                : "border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
                            }
                          >
                            {signal.signalType || signal.postType}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No posts yet. Create your first insight!</p>
                    </div>
                  )}
                </div>

                {signals.length > 3 && (
                  <Button asChild variant="outline" className={`w-full mt-4 ${outlineBtn}`}>
                    <Link to="/advisor/groups">View all insights</Link>
                  </Button>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="min-w-0 space-y-6">
              {/* Quick Actions */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <h3 className="font-bold mb-4">Quick actions</h3>
                <div className="grid gap-2">
                  {[
                    { to: "/advisor/groups", label: "Manage groups", icon: Users },
                    { to: "/advisor/trainings", label: "Manage trainings", icon: GraduationCap },
                    { to: "/advisor/edit-profile", label: "Edit profile", icon: TrendingUp },
                    { to: "/advisor/analytics", label: "View analytics", icon: BarChart3 },
                  ].map(({ to, label, icon: Icon }) => (
                    <Button key={to} asChild variant="outline" className={`w-full justify-between ${outlineBtn}`}>
                      <Link to={to}>
                        <span className="flex items-center">
                          <Icon className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          {label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>
                  ))}
                  {groups.length > 0 && (
                    <Button
                      variant="outline"
                      className={`w-full justify-between ${outlineBtn}`}
                      onClick={() => navigate(`/advisor/groups/${groups[0].id}/create-signal`)}
                    >
                      <span className="flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Create insight
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </Card>

              {/* Training Programs Quick Access */}
              <Card className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 dark:from-cyan-500/15 dark:to-emerald-500/15 border-cyan-500/30 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-bold">Training programs</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your expertise through structured training programs.
                </p>
                <div className="space-y-2.5 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active trainings</span>
                    <span className="font-bold tabular-nums">{activeTrainings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total enrolled</span>
                    <span className="font-bold tabular-nums">{totalEnrolled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Training revenue</span>
                    <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-300">${trainingRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <Button asChild size="sm" className={`w-full ${primaryBtn}`}>
                  <Link to="/advisor/trainings">
                    <GraduationCap className="mr-1.5 h-4 w-4" />
                    Manage trainings
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </Card>

              {/* Expertise Areas */}
              <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                <h3 className="font-bold mb-4">Expertise areas</h3>
                {expertiseAreas.length > 0 ? (
                  <div className="space-y-3">
                    {expertiseAreas.map((item) => (
                      <div key={item.area}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.area}</span>
                          <span className="text-xs font-mono text-muted-foreground tabular-nums">{item.level}%</span>
                        </div>
                        <Progress
                          value={item.level}
                          className="h-1.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-3 rounded-xl border border-dashed text-center">
                    No expertise areas added yet.
                  </p>
                )}
                <Button asChild variant="outline" size="sm" className={`w-full mt-4 ${outlineBtn}`}>
                  <Link to="/advisor/edit-profile">
                    {expertiseAreas.length > 0 ? "Edit expertise" : "Add expertise"}
                  </Link>
                </Button>
              </Card>

              {/* Recent Groups */}
              {groups.length > 0 && (
                <Card className="p-5 sm:p-6 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <h3 className="font-bold mb-4">Your groups</h3>
                  <div className="space-y-2.5">
                    {groups.slice(0, 3).map((group) => (
                      <Link
                        key={group.id}
                        to="/advisor/groups"
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-cyan-500/30 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all"
                      >
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{group.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {group.memberCount} members · {group.signalCount} signals
                          </div>
                        </div>
                        <Badge variant={group.isPaid ? "default" : "outline"} className={group.isPaid ? "bg-emerald-600 text-white text-[10px]" : "text-[10px]"}>
                          {group.isPaid ? "Paid" : "Free"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className={`w-full mt-4 ${outlineBtn}`}>
                    <Link to="/advisor/groups">View all groups</Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
