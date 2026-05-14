import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  GraduationCap,
  Building2,
  Target,
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
  getStartupProfile,
  getMyEnrollments,
  searchAdvisors,
} from "@/app/lib/api";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { TrainingEnrollment } from "@/app/types/training";
import type { AdvisorSearchResult } from "@/app/types/search";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function StartupAnalytics() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [profileRes, enrollRes, advisorRes] = await Promise.all([
          getStartupProfile(session!.token),
          getMyEnrollments(session!.token),
          searchAdvisors(session!.token),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setEnrollments(enrollRes.enrollments);
          setAdvisors(advisorRes.advisors);
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

  const companyName = profile?.companyName ?? user?.fullName ?? "Startup";

  // Profile completion breakdown
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

  // Profile completion chart data
  const profileChartData = profileSections.map((s) => ({
    name: s.name,
    value: s.filled ? 100 : 0,
  }));

  // Training progress data
  const trainingProgressData = enrollments.map((e, i) => ({
    name: `Training ${i + 1}`,
    progress: e.progress ?? 0,
  }));

  // Training enrollment timeline
  const enrollmentTimeline = enrollments
    .sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime())
    .map((e, i) => ({
      date: new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      enrollments: i + 1,
    }));

  // Advisor specialization distribution
  const specMap = new Map<string, number>();
  advisors.forEach((a) => {
    const spec = a.specialization || "General";
    specMap.set(spec, (specMap.get(spec) ?? 0) + 1);
  });
  const advisorSpecData = Array.from(specMap.entries()).map(([name, value]) => ({ name, value }));

  // Team composition
  const teamSize = profile?.teamMembers?.length ?? 0;

  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const completedTrainings = enrollments.filter((e) => (e.progress ?? 0) >= 100).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="startup" userName={companyName} />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="startup" userName={companyName} />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/startup/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground">Track your startup's progress and engagement</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Profile Score</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{profileCompletion}%</div>
            <div className="text-xs text-muted-foreground mt-1">{completedSections}/{profileSections.length} sections</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Team Size</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{teamSize}</div>
            <div className="text-xs text-muted-foreground mt-1">members</div>
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
              <span className="text-sm text-muted-foreground">Advisors Available</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{advisors.length}</div>
            <div className="text-xs text-muted-foreground mt-1">on platform</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Profile Completion Breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Profile Completion</h2>
            </div>
            <div className="space-y-3">
              {profileSections.map((section) => (
                <div key={section.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{section.name}</span>
                      <Badge variant={section.filled ? "default" : "outline"} className="text-xs">
                        {section.filled ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                    <Progress value={section.filled ? 100 : 0} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall</span>
                <span className="text-sm font-semibold">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2 mt-2" />
            </div>
          </Card>

          {/* Training Progress */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Training Progress</h2>
            </div>
            {trainingProgressData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trainingProgressData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average Progress</span>
                  <span className="font-semibold">{avgProgress}%</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GraduationCap className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No trainings enrolled yet</p>
                <Link to="/startup/trainings">
                  <Button variant="outline" size="sm" className="mt-3">Browse Trainings</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Enrollment Timeline */}
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

          {/* Advisor Specializations */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Advisor Specializations</h2>
            </div>
            {advisorSpecData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={advisorSpecData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {advisorSpecData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {advisorSpecData.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No advisor data available
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
