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
  Users,
  DollarSign,
  FileText,
  GraduationCap,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
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
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getAdvisorProfile,
  listAdvisorGroups,
  listTrainings,
  listAdvisorSignals,
  getCredibilityHistory,
} from "@/app/lib/api";
import type { AdvisorProfile } from "@/app/types/advisor-profile";
import type { AdvisorGroup, AdvisorSignal } from "@/app/types/advisor-groups";
import type { Training } from "@/app/types/training";
import type { CredibilityHistoryEntry } from "@/app/lib/api";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function AdvisorAnalytics() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [groups, setGroups] = useState<AdvisorGroup[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [signals, setSignals] = useState<AdvisorSignal[]>([]);
  const [credHistory, setCredHistory] = useState<CredibilityHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    async function load() {
      try {
        const [profileRes, groupsRes, trainingsRes, credHistoryRes] = await Promise.all([
          getAdvisorProfile((session?.token ?? "")),
          listAdvisorGroups((session?.token ?? "")),
          listTrainings((session?.token ?? "")),
          getCredibilityHistory((session?.token ?? ""), 30).catch(() => null),
        ]);
        if (!active) return;

        setProfile(profileRes.profile);
        setGroups(groupsRes.groups);
        if (credHistoryRes?.history) {
          // Reverse so oldest is on the left of the chart
          setCredHistory([...credHistoryRes.history].reverse());
        }

        const myTrainings = trainingsRes.trainings.filter(
          (t) => t.advisorId === user?.id
        );
        setTrainings(myTrainings);

        const allSignals: AdvisorSignal[] = [];
        for (const group of groupsRes.groups) {
          try {
            const sigRes = await listAdvisorSignals((session?.token ?? ""), group.id);
            allSignals.push(...sigRes.signals);
          } catch {
            // skip
          }
        }
        if (active) setSignals(allSignals);
      } catch {
        // fallback
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token, user?.id]);

  // Group metrics
  const totalGroups = groups.length;
  const paidGroups = groups.filter((g) => g.isPaid).length;
  const freeGroups = totalGroups - paidGroups;
  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount ?? 0), 0);

  // Revenue
  const monthlyGroupRevenue = groups.reduce((sum, g) => {
    if (g.isPaid && g.monthlyFee) {
      return sum + parseFloat(g.monthlyFee || "0") * (g.memberCount ?? 0);
    }
    return sum;
  }, 0);
  const trainingRevenue = trainings.reduce((sum, t) => t.type === "paid" ? sum + t.price * (t.enrolled ?? 0) : sum, 0);
  const totalRevenue = monthlyGroupRevenue + trainingRevenue;

  // Group members chart data
  const groupMembersData = groups.map((g) => ({
    name: g.name.length > 15 ? g.name.slice(0, 15) + "..." : g.name,
    members: g.memberCount ?? 0,
    signals: g.signalCount ?? 0,
  }));

  // Revenue breakdown
  const revenueBreakdown = [
    { name: "Group Subscriptions", value: monthlyGroupRevenue },
    { name: "Training Fees", value: trainingRevenue },
  ].filter((r) => r.value > 0);

  // Group type distribution
  const groupTypeData = [
    { name: "Paid Groups", value: paidGroups },
    { name: "Free Groups", value: freeGroups },
  ].filter((d) => d.value > 0);

  // Signal type distribution
  const signalTypeMap = new Map<string, number>();
  signals.forEach((s) => {
    const type = s.postType === "signal" ? (s.signalType || "signal") : "post";
    signalTypeMap.set(type, (signalTypeMap.get(type) ?? 0) + 1);
  });
  const signalTypeData = Array.from(signalTypeMap.entries()).map(([name, value]) => ({ name, value }));

  // Signal activity over time
  const signalsByDate = new Map<string, number>();
  signals.forEach((s) => {
    const date = new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    signalsByDate.set(date, (signalsByDate.get(date) ?? 0) + 1);
  });
  const signalActivityData = Array.from(signalsByDate.entries())
    .map(([date, count]) => ({ date, posts: count }));

  // Training stats
  const totalEnrolled = trainings.reduce((sum, t) => sum + (t.enrolled ?? 0), 0);
  const trainingData = trainings.map((t) => ({
    name: t.title.length > 15 ? t.title.slice(0, 15) + "..." : t.title,
    enrolled: t.enrolled ?? 0,
    capacity: t.capacity ?? 0,
  }));

  // Expertise areas
  const expertiseAreas = profile?.expertiseAreas?.filter((e) => e.area) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="advisor" userName={userName} />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/advisor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground">Track your impact, revenue, and growth</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">groups + trainings</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Members</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{totalMembers}</div>
            <div className="text-xs text-muted-foreground mt-1">across {totalGroups} groups</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Published Posts</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{signals.length}</div>
            <div className="text-xs text-muted-foreground mt-1">signals & posts</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Training Enrollments</span>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{totalEnrolled}</div>
            <div className="text-xs text-muted-foreground mt-1">across {trainings.length} trainings</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Group Members */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Group Performance</h2>
            </div>
            {groupMembersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={groupMembersData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip {...chartTooltipTheme} />
                  <Legend />
                  <Bar dataKey="members" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Members" />
                  <Bar dataKey="signals" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Signals" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No groups created yet</p>
                <Link to="/advisor/groups">
                  <Button variant="outline" size="sm" className="mt-3">Create Group</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Revenue Breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
            </div>
            {revenueBreakdown.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {revenueBreakdown.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipTheme} formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-4">
                  {revenueBreakdown.map((item, index) => (
                    <div key={item.name}>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xl font-semibold">${item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <DollarSign className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No revenue data yet</p>
                <p className="text-xs mt-1">Create paid groups or trainings to start earning</p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Signal Activity */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Post Activity</h2>
            </div>
            {signalActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={signalActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip {...chartTooltipTheme} />
                  <Area type="monotone" dataKey="posts" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No posts published yet
              </div>
            )}
          </Card>

          {/* Signal Type Distribution */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Content Mix</h2>
            </div>
            {signalTypeData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={signalTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {signalTypeData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipTheme} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {signalTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="flex-1 capitalize">{item.name}</span>
                      <Badge variant="outline" className="text-xs">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No content data yet
              </div>
            )}
          </Card>
        </div>

        {/* Credibility Score Trend */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Credibility Score Trend</h2>
            </div>
            <Link to="/advisor/credibility">
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
          {credHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={credHistory.map((e) => ({
                date: new Date(e.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                score: e.score,
                tier: e.tier,
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip {...chartTooltipTheme} formatter={(value: number, _name: string) => [`${value}/100`, "Score"]} />
                <ReferenceLine y={90} stroke="#8b5cf6" strokeDasharray="4 2" label={{ value: "Elite", fontSize: 10, fill: "#8b5cf6" }} />
                <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 2" label={{ value: "Expert", fontSize: 10, fill: "#10b981" }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Award className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No credibility history yet</p>
              <p className="text-xs mt-1">Score is recorded daily after predictions are checked</p>
            </div>
          )}
        </Card>

        {/* Training Enrollment */}
        {trainingData.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Training Enrollment vs Capacity</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip {...chartTooltipTheme} />
                <Legend />
                <Bar dataKey="enrolled" fill="#10b981" radius={[4, 4, 0, 0]} name="Enrolled" />
                <Bar dataKey="capacity" fill="var(--muted)" radius={[4, 4, 0, 0]} name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Group Type + Expertise */}
        <div className="grid md:grid-cols-2 gap-8">
          {groupTypeData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Group Distribution</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={groupTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value">
                      {groupTypeData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipTheme} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {groupTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="flex-1">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {expertiseAreas.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Expertise Levels</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={expertiseAreas.map((e) => ({ name: e.area, level: e.level }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip {...chartTooltipTheme} />
                  <Bar dataKey="level" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
