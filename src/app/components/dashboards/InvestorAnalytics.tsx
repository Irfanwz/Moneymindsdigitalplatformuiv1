import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Eye,
  Bookmark,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
} from "@/app/lib/api";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { StartupSearchResult } from "@/app/types/search";
import type { TrainingEnrollment } from "@/app/types/training";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

export function InvestorAnalytics() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [startups, setStartups] = useState<StartupSearchResult[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.fullName ?? "Investor";
  const savedStartups = new Set<string>(JSON.parse(localStorage.getItem("savedStartups") || "[]"));

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [profileRes, startupsRes, enrollRes] = await Promise.all([
          getInvestorProfile(session!.token),
          searchStartups(session!.token),
          getMyEnrollments(session!.token),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setStartups(startupsRes.startups);
          setEnrollments(enrollRes.enrollments);
        }
      } catch {
        // fallback
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  // Startup industry distribution
  const industryMap = new Map<string, number>();
  startups.forEach((s) => {
    const ind = s.industry || "Other";
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + 1);
  });
  const industryData = Array.from(industryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Startup stage distribution
  const stageMap = new Map<string, number>();
  startups.forEach((s) => {
    const stage = s.stage || "Unknown";
    stageMap.set(stage, (stageMap.get(stage) ?? 0) + 1);
  });
  const stageData = Array.from(stageMap.entries()).map(([name, value]) => ({ name, value }));

  // Training progress
  const trainingProgressData = enrollments.map((e, i) => ({
    name: `Training ${i + 1}`,
    progress: e.progress ?? 0,
  }));
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const completedTrainings = enrollments.filter((e) => (e.progress ?? 0) >= 100).length;

  // Enrollment timeline
  const enrollmentTimeline = enrollments
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime())
    .map((e, i) => ({
      date: new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      enrollments: i + 1,
    }));

  // Saved vs unsaved
  const savedCount = startups.filter((s) => savedStartups.has(s.userId)).length;
  const bookmarkData = [
    { name: "Saved", value: savedCount },
    { name: "Not Saved", value: startups.length - savedCount },
  ].filter((d) => d.value > 0);

  // Investor focus areas
  const investorIndustries = profile?.industries ?? [];

  if (loading) {
    return (
      <DashboardLayout userRole="investor" userName={userName}>
        <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="investor" userName={userName}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/investor/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">Investment insights and portfolio tracking</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Startups Found</span>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{startups.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{savedCount} bookmarked</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Industries Tracked</span>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{investorIndustries.length}</div>
          <div className="text-xs text-muted-foreground mt-1">focus areas</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Trainings</span>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{enrollments.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{completedTrainings} completed</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Progress</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{avgProgress}%</div>
          <div className="text-xs text-muted-foreground mt-1">training completion</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Startup Industry Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Startups by Industry</h2>
          </div>
          {industryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={industryData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={85}
                    dataKey="value"
                  >
                    {industryData.slice(0, 6).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {industryData.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="flex-1 truncate">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No startup data available
            </div>
          )}
        </Card>

        {/* Startup Stage Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Startups by Stage</h2>
          </div>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Startups" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No stage data available
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Training Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Training Progress</h2>
          </div>
          {trainingProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trainingProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="progress" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <GraduationCap className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No trainings enrolled yet</p>
              <Link to="/investor/trainings">
                <Button variant="outline" size="sm" className="mt-3">Browse Trainings</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Enrollment Growth */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Enrollment Growth</h2>
          </div>
          {enrollmentTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollmentTimeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="enrollments" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No enrollment data yet
            </div>
          )}
        </Card>
      </div>

      {/* Bookmarks + Industry Focus */}
      <div className="grid md:grid-cols-2 gap-8">
        {bookmarkData.length > 0 && startups.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Bookmark Rate</h2>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="40%" height={160}>
                <PieChart>
                  <Pie data={bookmarkData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-3xl font-semibold">{savedCount}</div>
                  <div className="text-sm text-muted-foreground">startups bookmarked</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {startups.length > 0 ? Math.round((savedCount / startups.length) * 100) : 0}% of discovered startups
                </div>
              </div>
            </div>
          </Card>
        )}

        {investorIndustries.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Your Industry Focus</h2>
            </div>
            <div className="space-y-3">
              {investorIndustries.map((industry, index) => {
                const matchCount = startups.filter((s) => s.industry === industry).length;
                return (
                  <div key={industry} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="flex-1 text-sm">{industry}</span>
                    <Badge variant="outline" className="text-xs">{matchCount} startups</Badge>
                  </div>
                );
              })}
            </div>
            <Link to="/investor/edit-profile">
              <Button variant="outline" size="sm" className="w-full mt-4">Edit Preferences</Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
