import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Sparkles,
  FileCheck,
  XCircle,
} from "lucide-react";

export function AdminDashboard() {
  const stats = [
    { label: "Pending Verifications", value: "24", status: "warning", icon: Clock },
    { label: "AI Alerts", value: "8", status: "alert", icon: AlertTriangle },
    { label: "Active Users", value: "1,247", status: "success", icon: Users },
    { label: "Verifications Today", value: "15", status: "info", icon: CheckCircle2 },
  ];

  const pendingVerifications = [
    {
      name: "NewTech Startup",
      type: "startup",
      submitted: "2 hours ago",
      reason: "Initial Profile Verification",
    },
    {
      name: "Michael Chen",
      type: "advisor",
      submitted: "5 hours ago",
      reason: "Expert Credentials Review",
    },
    {
      name: "InvestCorp LLC",
      type: "investor",
      submitted: "1 day ago",
      reason: "Identity Verification",
    },
  ];

  const aiAlerts = [
    {
      title: "Suspicious Activity Detected",
      entity: "QuickFund Solutions",
      severity: "high",
      time: "15 min ago",
      description: "Multiple rapid profile changes",
    },
    {
      title: "Credential Mismatch",
      entity: "John Doe",
      severity: "medium",
      time: "1 hour ago",
      description: "LinkedIn data inconsistency",
    },
    {
      title: "Duplicate Content",
      entity: "TechAdvice Blog",
      severity: "low",
      time: "3 hours ago",
      description: "Similar content from different source",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName="Admin User" />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform activity and manage verifications
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
                <div className="text-2xl font-semibold">{stat.value}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* AI Alerts Panel */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Alerts
                </h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {aiAlerts.map((alert, idx) => (
                  <Card
                    key={idx}
                    className={`p-4 ${
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50/50"
                        : alert.severity === "medium"
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              alert.severity === "high"
                                ? "text-red-600"
                                : alert.severity === "medium"
                                ? "text-amber-600"
                                : "text-gray-600"
                            }`}
                          />
                          <h3 className="font-semibold">{alert.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {alert.entity}
                        </p>
                        <p className="text-sm">{alert.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          alert.severity === "high"
                            ? "border-red-300 text-red-700"
                            : alert.severity === "medium"
                            ? "border-amber-300 text-amber-700"
                            : "border-gray-300 text-gray-700"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Moderation Queue */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Moderation Queue</h2>

              <Tabs defaultValue="verification" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="verification" className="space-y-4">
                  {pendingVerifications.map((item, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <Badge variant="outline">{item.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.reason}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {item.submitted}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileCheck className="mr-1 h-4 w-4" />
                          Review
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="content">
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content pending review</p>
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports to review</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Today's Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <span className="text-sm font-semibold">32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verifications</span>
                  <span className="text-sm font-semibold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Alerts</span>
                  <span className="text-sm font-semibold text-amber-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reports Resolved</span>
                  <span className="text-sm font-semibold text-green-600">12</span>
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Services</span>
                  <Badge className="bg-green-100 text-green-700">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-700">Optimal</Badge>
                </div>
              </div>
            </Card>

            {/* Recent Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Actions</h3>
              <div className="space-y-3">
                {[
                  "Verified TechVenture Inc",
                  "Resolved AI alert #1234",
                  "Approved advisor credentials",
                  "Updated user permissions",
                ].map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent mt-1.5"></div>
                    <p className="text-sm text-muted-foreground">{action}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Verification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Configuration
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
