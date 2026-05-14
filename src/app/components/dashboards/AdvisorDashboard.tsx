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
  Eye,
  DollarSign,
  Lock,
  Globe,
  UserPlus,
  GraduationCap,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getAdvisorProfile,
  listAdvisorGroups,
  listTrainings,
  listAdvisorSignals,
} from "@/app/lib/api";
import type { AdvisorExpertise, AdvisorProfile } from "@/app/types/advisor-profile";
import type { AdvisorGroup, AdvisorSignal } from "@/app/types/advisor-groups";
import type { Training } from "@/app/types/training";

export function AdvisorDashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [groups, setGroups] = useState<AdvisorGroup[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [signals, setSignals] = useState<AdvisorSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.fullName ?? "Advisor";

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [profileRes, groupsRes, trainingsRes] = await Promise.all([
          getAdvisorProfile(session!.token),
          listAdvisorGroups(session!.token),
          listTrainings(session!.token),
        ]);
        if (!active) return;

        setProfile(profileRes.profile);
        setGroups(groupsRes.groups);

        // Filter trainings created by this advisor
        const myTrainings = trainingsRes.trainings.filter(
          (t) => t.advisorId === user?.id
        );
        setTrainings(myTrainings);

        // Load signals from all groups
        const allSignals: AdvisorSignal[] = [];
        for (const group of groupsRes.groups) {
          try {
            const sigRes = await listAdvisorSignals(session!.token, group.id);
            allSignals.push(...sigRes.signals);
          } catch {
            // skip group
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
  }, [session?.token, user?.id]);

  const expertiseAreas = profile?.expertiseAreas?.filter((e) => e.area) ?? [];
  const displayExpertise: AdvisorExpertise[] = expertiseAreas.length > 0
    ? expertiseAreas
    : [
        { area: "Financial Planning", level: 95 },
        { area: "Fundraising", level: 88 },
        { area: "Cap Table Mgmt", level: 92 },
      ];

  // Compute real group metrics
  const totalGroups = groups.length;
  const paidGroups = groups.filter((g) => g.isPaid).length;
  const freeGroups = totalGroups - paidGroups;
  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount ?? 0), 0);
  const totalSignalCount = groups.reduce((sum, g) => sum + (g.signalCount ?? 0), 0);

  // Compute real training metrics
  const activeTrainings = trainings.filter((t) => t.status === "ongoing" || t.status === "upcoming").length;
  const totalEnrolled = trainings.reduce((sum, t) => sum + (t.enrolled ?? 0), 0);
  const trainingRevenue = trainings.reduce((sum, t) => t.type === "paid" ? sum + t.price * (t.enrolled ?? 0) : sum, 0);

  // Monthly revenue from paid groups (estimated from fee * members)
  const monthlyRevenue = groups.reduce((sum, g) => {
    if (g.isPaid && g.monthlyFee) {
      return sum + parseFloat(g.monthlyFee || "0") * (g.memberCount ?? 0);
    }
    return sum;
  }, 0);

  const stats = [
    { label: "Credibility Score", value: profile ? "95" : "—", change: "", icon: Award },
    { label: "Total Groups", value: totalGroups.toString(), change: "", icon: Users },
    { label: "Total Members", value: totalMembers.toString(), change: "", icon: UserPlus },
    { label: "Monthly Revenue", value: monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : "$0", change: "", icon: DollarSign },
  ];

  // Sort signals by date for the insights section
  const recentSignals = [...signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Advisor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and track your impact
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  {stat.change && <div className="text-sm text-accent">{stat.change}</div>}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Group & Revenue Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Group & Revenue Overview</h2>
                <Link to="/advisor/groups">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    View All Groups
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Groups Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Groups Breakdown</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-medium">Total Groups</span>
                        </div>
                        <span className="font-semibold">{totalGroups}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Paid Groups</div>
                            <div className="text-xs text-muted-foreground">Premium content</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{paidGroups}</div>
                          {paidGroups > 0 && (
                            <Badge variant="default" className="text-xs bg-accent">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Free Groups</div>
                            <div className="text-xs text-muted-foreground">Open access</div>
                          </div>
                        </div>
                        <div className="font-semibold">{freeGroups}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members & Signals Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Content & Engagement</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-medium">Total Members</span>
                        </div>
                        <span className="font-semibold">{totalMembers}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Published Signals</div>
                            <div className="text-xs text-muted-foreground">Across all groups</div>
                          </div>
                        </div>
                        <div className="font-semibold">{totalSignalCount}</div>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Training Enrollments</div>
                            <div className="text-xs text-muted-foreground">Across all trainings</div>
                          </div>
                        </div>
                        <div className="font-semibold">{totalEnrolled}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Section */}
              <div className="pt-6 border-t">
                <div className="text-sm text-muted-foreground mb-4">Revenue Insights</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-accent/5 border border-accent/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Monthly Group Revenue</span>
                    </div>
                    <div className="text-2xl font-semibold text-accent">
                      ${monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">From paid groups</div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Training Revenue</span>
                    </div>
                    <div className="text-2xl font-semibold">
                      ${trainingRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">From paid trainings</div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-semibold">
                      ${(monthlyRevenue + trainingRevenue).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Combined</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Credibility Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Credibility Profile</h2>
                <CredibilityBadge type="verified" label="Expert Verified" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-3xl">95/100</div>
                      <div className="text-sm text-muted-foreground">
                        Overall Credibility Score
                      </div>
                    </div>
                    <div className="h-20 w-20 rounded-full border-4 border-accent flex items-center justify-center">
                      <Award className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Expertise</span>
                      <span className="text-sm text-muted-foreground">
                        {expertiseAreas.length > 0 ? `${expertiseAreas.length} areas` : "98%"}
                      </span>
                    </div>
                    <Progress value={expertiseAreas.length > 0 ? Math.min(expertiseAreas.length * 20, 100) : 98} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Content</span>
                      <span className="text-sm text-muted-foreground">{signals.length} posts</span>
                    </div>
                    <Progress value={Math.min(signals.length * 10, 100)} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Groups</span>
                      <span className="text-sm text-muted-foreground">{totalGroups} groups</span>
                    </div>
                    <Progress value={Math.min(totalGroups * 25, 100)} className="h-2" />
                  </div>
                </div>

                {profile?.certifications && profile.certifications.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">
                      Certifications
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {profile.certifications.map((cert) => (
                        <div key={cert.name} className="px-3 py-2 bg-accent/10 rounded-lg text-sm">
                          {cert.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Published Insights / Signals */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Insights</h2>
                {groups.length > 0 && (
                  <Button onClick={() => navigate(`/advisor/groups/${groups[0].id}/create-signal`)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {recentSignals.length > 0 ? (
                  recentSignals.map((signal) => (
                    <Card key={signal.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{signal.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {signal.postType === "signal" ? "Signal" : "Post"}
                            </span>
                            <span>{new Date(signal.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm px-2 py-1 rounded ${
                            signal.postType === "signal"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {signal.signalType || signal.postType}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No posts yet. Create your first insight!</p>
                  </div>
                )}
              </div>

              {signals.length > 3 && (
                <Link to="/advisor/groups">
                  <Button variant="outline" className="w-full mt-4">
                    View All Insights
                  </Button>
                </Link>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/advisor/groups">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Groups
                  </Button>
                </Link>
                <Link to="/advisor/trainings">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Manage Trainings
                  </Button>
                </Link>
                {groups.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/advisor/groups/${groups[0].id}/create-signal`)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Insight
                  </Button>
                )}
                <Link to="/advisor/edit-profile">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/advisor/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Training Programs Quick Access */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Training Programs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Share your expertise through structured training programs
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Trainings</span>
                  <span className="font-semibold">{activeTrainings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Enrolled</span>
                  <span className="font-semibold">{totalEnrolled}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Training Revenue</span>
                  <span className="font-semibold">${trainingRevenue.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/advisor/trainings">
                <Button variant="default" size="sm" className="w-full">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Manage Trainings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            {/* Expertise Areas */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Expertise Areas</h3>
              <div className="space-y-3">
                {displayExpertise.map((item) => (
                  <div key={item.area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.area}</span>
                      <span className="text-xs text-muted-foreground">{item.level}%</span>
                    </div>
                    <Progress value={item.level} className="h-1.5" />
                  </div>
                ))}
              </div>
              <Link to="/advisor/edit-profile">
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Add Expertise
                </Button>
              </Link>
            </Card>

            {/* Recent Groups */}
            {groups.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Your Groups</h3>
                <div className="space-y-3">
                  {groups.slice(0, 3).map((group) => (
                    <div key={group.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{group.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.memberCount} members · {group.signalCount} signals
                        </div>
                      </div>
                      <Badge variant={group.isPaid ? "default" : "outline"} className="text-xs">
                        {group.isPaid ? "Paid" : "Free"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link to="/advisor/groups">
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Groups
                  </Button>
                </Link>
              </Card>
            )}

            {/* Growth Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Groups</span>
                  <span className="text-sm font-semibold">{totalGroups}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Members</span>
                  <span className="text-sm font-semibold">{totalMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Signals</span>
                  <span className="text-sm font-semibold">{totalSignalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trainings</span>
                  <span className="text-sm font-semibold">{trainings.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
