import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Shield, MapPin, Calendar, Activity, CheckCircle, AlertTriangle, Users,
  Settings, FileBarChart, BarChart3, TrendingUp, UserCheck, UserX, Clock,
  Bell, Lock, Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdminUsers } from "@/app/lib/api";
import type { AuthUser } from "@/app/types/auth";

export function AdminProfile() {
  const { session, user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [recentApproved, setRecentApproved] = useState<{ name: string; time: string }[]>([]);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);

  // Settings dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsAutoApprove, setSettingsAutoApprove] = useState(false);
  const [settingsEmailNotifications, setSettingsEmailNotifications] = useState(true);
  const [settingsMaintenanceMode, setSettingsMaintenanceMode] = useState(false);
  const [settingsPublicRegistration, setSettingsPublicRegistration] = useState(true);
  const [settingsRequireVerification, setSettingsRequireVerification] = useState(true);

  // Reports dialog
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          getAdminUsers(session!.token, "pending"),
          getAdminUsers(session!.token, "approved"),
          getAdminUsers(session!.token, "rejected"),
        ]);
        if (!active) return;
        setPendingCount(pendingRes.users.length);
        setApprovedCount(approvedRes.users.length);
        setRejectedCount(rejectedRes.users.length);
        setTotalCount(pendingRes.users.length + approvedRes.users.length + rejectedRes.users.length);
        setAllUsers([...pendingRes.users, ...approvedRes.users, ...rejectedRes.users]);

        // Get recent approved for activity feed
        const sorted = [...approvedRes.users]
          .filter((u) => u.approvedAt)
          .sort((a, b) => new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime())
          .slice(0, 4);
        setRecentApproved(sorted.map((u) => ({
          name: u.fullName,
          time: u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : "Recently",
        })));
      } catch {
        // fallback
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  // Compute reports data
  const roleBreakdown = {
    startups: allUsers.filter((u) => u.approvedRoles?.includes("startup")).length,
    investors: allUsers.filter((u) => u.approvedRoles?.includes("investor")).length,
    advisors: allUsers.filter((u) => u.approvedRoles?.includes("advisor")).length,
  };
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const recentSignups = allUsers
    .filter((u) => {
      const created = new Date(u.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return created >= sevenDaysAgo;
    }).length;
  const avgResponseTime = pendingCount > 0 ? `${pendingCount} pending` : "All processed";

  const adminName = user?.fullName ?? "Admin";
  const adminEmail = user?.email ?? "";
  const adminLocation = user?.location ?? "Remote";
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const initials = adminName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const stats = [
    { label: "Total Users", value: totalCount.toString(), trend: "" },
    { label: "Approved Users", value: approvedCount.toString(), trend: "" },
    { label: "Pending Approval", value: pendingCount.toString(), trend: pendingCount > 0 ? "Needs attention" : "All clear" },
    { label: "Rejected", value: rejectedCount.toString(), trend: "" },
  ];

  return (
    <DashboardLayout userRole="admin" userName={adminName}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{adminName}</h1>
                    <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">Platform Administrator</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {adminLocation && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {adminLocation}
                      </div>
                    )}
                    {joinedDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Joined {joinedDate}
                      </div>
                    )}
                    {adminEmail && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {adminEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["User Management", "Content Moderation", "Verification", "Analytics", "System Config"].map((permission) => (
                <Badge key={permission} variant="outline" className="border-slate-300 dark:border-slate-700">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Admin Statistics */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-500" />
                  Platform Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        {stat.trend && (
                          <span className="text-sm text-emerald-500 dark:text-emerald-400">{stat.trend}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-cyan-500" />
                  Recently Approved Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentApproved.length > 0 ? (
                  <div className="space-y-3">
                    {recentApproved.map((activity, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                Approved user
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{activity.name}</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-500">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/admin/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
                <Link to="/admin/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pending Verifications
                    {pendingCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">{pendingCount}</Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/admin/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsReportsOpen(true)}>
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Active Reports
                </Button>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Platform moderation and content review",
                    "User verification and approval",
                    "Handle user reports and disputes",
                    "Monitor platform health and metrics",
                    "Enforce community guidelines",
                  ].map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Platform Settings</DialogTitle>
            <DialogDescription>Configure platform-wide settings and policies</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium flex items-center gap-2"><Eye className="h-4 w-4" />Public Registration</div>
                <div className="text-sm text-muted-foreground">Allow new users to register on the platform</div>
              </div>
              <Switch checked={settingsPublicRegistration} onCheckedChange={setSettingsPublicRegistration} />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium flex items-center gap-2"><UserCheck className="h-4 w-4" />Auto-Approve Users</div>
                <div className="text-sm text-muted-foreground">Skip manual approval for new registrations</div>
              </div>
              <Switch checked={settingsAutoApprove} onCheckedChange={setSettingsAutoApprove} />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium flex items-center gap-2"><Lock className="h-4 w-4" />Require Verification</div>
                <div className="text-sm text-muted-foreground">Require identity verification before approval</div>
              </div>
              <Switch checked={settingsRequireVerification} onCheckedChange={setSettingsRequireVerification} />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium flex items-center gap-2"><Bell className="h-4 w-4" />Email Notifications</div>
                <div className="text-sm text-muted-foreground">Send email alerts for new registrations and reports</div>
              </div>
              <Switch checked={settingsEmailNotifications} onCheckedChange={setSettingsEmailNotifications} />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Maintenance Mode</div>
                <div className="text-sm text-muted-foreground">Temporarily disable platform access for non-admins</div>
              </div>
              <Switch checked={settingsMaintenanceMode} onCheckedChange={setSettingsMaintenanceMode} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileBarChart className="h-5 w-5" />Platform Reports</DialogTitle>
            <DialogDescription>Overview of platform activity and user metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Growth */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-cyan-500" />User Growth</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-sm text-muted-foreground">Total Users</div>
                  <div className="text-2xl font-bold">{totalCount}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-sm text-muted-foreground">New (7 days)</div>
                  <div className="text-2xl font-bold">{recentSignups}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                  <div className="text-2xl font-bold">{approvalRate}%</div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-cyan-500" />Role Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Startups</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${totalCount > 0 ? (roleBreakdown.startups / totalCount) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{roleBreakdown.startups}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Investors</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${totalCount > 0 ? (roleBreakdown.investors / totalCount) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{roleBreakdown.investors}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advisors</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalCount > 0 ? (roleBreakdown.advisors / totalCount) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{roleBreakdown.advisors}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Pipeline */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-500" />Approval Pipeline</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingCount}</div>
                </div>
                <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-400">Approved</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{approvedCount}</div>
                </div>
                <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center gap-2 mb-1">
                    <UserX className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 dark:text-red-400">Rejected</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{rejectedCount}</div>
                </div>
              </div>
            </div>

            {/* Queue Status */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-500" />Queue Status</h3>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-muted-foreground mb-1">Processing Status</div>
                <div className="text-lg font-medium">{avgResponseTime}</div>
                {pendingCount > 0 && (
                  <Link to="/admin/dashboard" className="text-sm text-cyan-600 hover:underline mt-2 inline-block">
                    Go to approval queue →
                  </Link>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
