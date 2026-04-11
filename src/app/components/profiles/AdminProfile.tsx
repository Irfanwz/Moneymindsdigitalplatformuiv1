import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Shield, MapPin, Calendar, Edit, Activity, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminProfile() {
  const adminData = {
    name: "Emily Rodriguez",
    role: "Platform Administrator",
    logo: "ER",
    location: "Remote",
    joinedDate: "Jan 2024",
    department: "Platform Operations",
    email: "emily.rodriguez@moneyminds.com",
    permissions: ["User Management", "Content Moderation", "Verification", "Analytics", "System Config"],
    stats: [
      { label: "Users Verified", value: "1,234", trend: "+48" },
      { label: "Reports Handled", value: "567", trend: "+23" },
      { label: "Active Cases", value: "12", trend: "-3" },
      { label: "Avg Response Time", value: "2.3h", trend: "-0.5h" },
    ],
    recentActivity: [
      { action: "Verified startup", target: "TechVenture AI", time: "5m ago", type: "success" },
      { action: "Resolved report", target: "Content Policy Violation", time: "1h ago", type: "success" },
      { action: "Updated verification criteria", target: "Investor Guidelines", time: "3h ago", type: "info" },
      { action: "Flagged account", target: "Suspicious Activity", time: "5h ago", type: "warning" },
    ],
    responsibilities: [
      "Platform moderation and content review",
      "User verification and credibility scoring",
      "Handle user reports and disputes",
      "Monitor platform health and metrics",
      "Enforce community guidelines",
    ],
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30";
      default:
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30";
    }
  };

  return (
    <DashboardLayout userRole="admin" userName={adminData.name}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {adminData.logo}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{adminData.name}</h1>
                    <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{adminData.role}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {adminData.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Joined {adminData.joinedDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {adminData.department}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Settings
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {adminData.permissions.map((permission) => (
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
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {adminData.stats.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <span className="text-sm text-emerald-500 dark:text-emerald-400">{stat.trend}</span>
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
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminData.recentActivity.map((activity, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{activity.target}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-500">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300">{adminData.email}</p>
              </CardContent>
            </Card>

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
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pending Verifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Active Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
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
                  {adminData.responsibilities.map((responsibility, index) => (
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
    </DashboardLayout>
  );
}
