import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export function AdvisorDashboard() {
  // Group and revenue metrics
  const groupMetrics = {
    totalGroups: 3,
    paidGroups: 1,
    freeGroups: 2,
    totalSubscribers: 646,
    paidSubscribers: 89,
    freeMembers: 557,
    monthlyRevenue: 8850, // $99/month * 89 subscribers + some with joining fees
    totalRevenue: 42400, // lifetime revenue
  };

  // Training metrics
  const trainingMetrics = {
    totalTrainings: 4,
    activeTrainings: 2,
    totalEnrolled: 176,
    trainingRevenue: 72650,
  };

  const stats = [
    { label: "Credibility Score", value: "95", change: "+5", icon: Award },
    { label: "Total Groups", value: groupMetrics.totalGroups.toString(), change: "+1", icon: Users },
    { label: "Total Subscribers", value: groupMetrics.totalSubscribers.toString(), change: "+42", icon: UserPlus },
    { label: "Monthly Revenue", value: `$${(groupMetrics.monthlyRevenue / 1000).toFixed(1)}k`, change: "+$1.2k", icon: DollarSign },
  ];

  const insights = [
    {
      title: "Navigating Series A Funding in 2026",
      views: 1240,
      engagement: "High",
      date: "2 days ago",
    },
    {
      title: "Financial Planning for Early-Stage Startups",
      views: 890,
      engagement: "Medium",
      date: "5 days ago",
    },
    {
      title: "Understanding Cap Tables",
      views: 2100,
      engagement: "High",
      date: "1 week ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName="Dr. Sarah Chen" />

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
                  <div className="text-sm text-accent">{stat.change}</div>
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
                        <span className="font-semibold">{groupMetrics.totalGroups}</span>
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
                          <div className="font-semibold">{groupMetrics.paidGroups}</div>
                          <Badge variant="default" className="text-xs bg-accent">
                            <DollarSign className="h-3 w-3 mr-0.5" />
                            Active
                          </Badge>
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
                        <div className="font-semibold">{groupMetrics.freeGroups}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscribers Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Subscribers Breakdown</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-medium">Total Subscribers</span>
                        </div>
                        <span className="font-semibold">{groupMetrics.totalSubscribers}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Paid Subscribers</div>
                            <div className="text-xs text-muted-foreground">Active subscriptions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{groupMetrics.paidSubscribers}</div>
                          <div className="text-xs text-accent">+12 this month</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Free Members</div>
                            <div className="text-xs text-muted-foreground">Community members</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{groupMetrics.freeMembers}</div>
                          <div className="text-xs text-muted-foreground">+30 this month</div>
                        </div>
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
                      <span className="text-xs text-muted-foreground">Monthly Recurring Revenue</span>
                    </div>
                    <div className="text-2xl font-semibold text-accent">
                      ${groupMetrics.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-accent mt-1">+$1,200 vs last month</div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total Lifetime Revenue</span>
                    </div>
                    <div className="text-2xl font-semibold">
                      ${groupMetrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Since launch</div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Avg Revenue per Subscriber</span>
                    </div>
                    <div className="text-2xl font-semibold">
                      ${Math.round(groupMetrics.monthlyRevenue / groupMetrics.paidSubscribers)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Per month</div>
                  </div>
                </div>
              </div>

              {/* Quick Insight */}
              <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-accent mb-1">Growth Opportunity</div>
                    <p className="text-muted-foreground">
                      You have {groupMetrics.freeMembers} free members. Converting just 10% to paid subscriptions 
                      could add <span className="font-semibold">${Math.round(groupMetrics.freeMembers * 0.1 * 99).toLocaleString()}/month</span> in revenue.
                    </p>
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
                      <span className="text-sm text-muted-foreground">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement</span>
                      <span className="text-sm text-muted-foreground">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Content Quality</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Recent Achievements
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 bg-accent/10 rounded-lg text-sm">
                      Top 5% Advisors
                    </div>
                    <div className="px-3 py-2 bg-accent/10 rounded-lg text-sm">
                      100+ Clients Helped
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Published Insights */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Insights</h2>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </div>

              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.title} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{insight.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {insight.views} views
                          </span>
                          <span>{insight.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm px-2 py-1 rounded ${
                            insight.engagement === "High"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {insight.engagement}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Insights
              </Button>
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
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Insight
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  View Connections
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
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
                  <span className="font-semibold">{trainingMetrics.activeTrainings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Enrolled</span>
                  <span className="font-semibold">{trainingMetrics.totalEnrolled}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Training Revenue</span>
                  <span className="font-semibold">${(trainingMetrics.trainingRevenue / 1000).toFixed(1)}k</span>
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
                {[
                  { area: "Financial Planning", level: 95 },
                  { area: "Fundraising", level: 88 },
                  { area: "Cap Table Mgmt", level: 92 },
                ].map((item) => (
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

            {/* Connection Requests */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Connection Requests</h3>
              <div className="space-y-3">
                {["TechVenture Inc", "HealthTech Solutions"].map((company) => (
                  <div key={company} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{company}</div>
                      <div className="text-xs text-muted-foreground">Wants to connect</div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Decline
                  </Button>
                </div>
              </div>
            </Card>

            {/* Growth Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <span className="text-sm font-semibold">+127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Connections</span>
                  <span className="text-sm font-semibold">+6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="text-sm font-semibold text-accent">+15%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}