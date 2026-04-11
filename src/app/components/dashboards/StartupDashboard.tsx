import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Progress } from "@/app/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  Users,
  FileCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  GraduationCap,
} from "lucide-react";

export function StartupDashboard() {
  const stats = [
    { label: "Profile Views", value: "1,247", change: "+12%" },
    { label: "Investor Interests", value: "23", change: "+5" },
    { label: "Advisor Connections", value: "8", change: "+3" },
    { label: "Credibility Score", value: "87/100", change: "+7" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="startup" userName="TechVenture Inc" />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, TechVenture</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your startup profile
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-sm text-accent">{stat.change}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Due Diligence Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Due Diligence Status</h2>
                <CredibilityBadge type="ai-verified" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Company Information</div>
                        <div className="text-xs text-muted-foreground">Verified</div>
                      </div>
                    </div>
                    <CredibilityBadge type="verified" label="Complete" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">AI Background Check</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    <CredibilityBadge type="ai-verified" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Financial Documents</div>
                        <div className="text-xs text-muted-foreground">In Review</div>
                      </div>
                    </div>
                    <CredibilityBadge type="pending" label="In Progress" />
                  </div>
                </div>

                <Button className="w-full">
                  Apply for Full Due Diligence
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Investor viewed your profile",
                    time: "2 hours ago",
                    type: "view",
                  },
                  {
                    title: "New advisor match: Sarah Chen",
                    time: "5 hours ago",
                    type: "match",
                  },
                  {
                    title: "Profile credibility score increased",
                    time: "1 day ago",
                    type: "achievement",
                  },
                  {
                    title: "Document verification completed",
                    time: "2 days ago",
                    type: "verification",
                  },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-accent"></div>
                    <div className="flex-1">
                      <div className="text-sm">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/startup/edit-profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Find Advisors
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </Card>

            {/* Recommended Advisors */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recommended Advisors</h3>
              <div className="space-y-4">
                {[
                  { name: "Sarah Chen", role: "FinTech Expert", score: 95 },
                  { name: "Michael Ross", role: "Growth Advisor", score: 92 },
                  { name: "Emily Watson", role: "CFO Consultant", score: 88 },
                ].map((advisor) => (
                  <div key={advisor.name} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">{advisor.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{advisor.name}</div>
                        <div className="text-xs text-muted-foreground">{advisor.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${advisor.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{advisor.score}%</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  View All Advisors
                </Button>
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Upcoming</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-2 w-14 h-14">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <div className="text-xs font-medium">Mar 15</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Investor Meetup</div>
                    <div className="text-xs text-muted-foreground">Virtual Event</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Training Programs */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Training Programs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Learn from expert advisors and accelerate your growth
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled Trainings</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hours Completed</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
              <Link to="/startup/trainings">
                <Button variant="default" size="sm" className="w-full">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Browse Trainings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}