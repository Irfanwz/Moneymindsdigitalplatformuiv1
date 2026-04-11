import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Building2,
  Eye,
  Bookmark,
  Filter,
  Search,
  Sparkles,
  Bot,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";

export function InvestorDashboard() {
  const stats = [
    { label: "Startups Following", value: "12", icon: Bookmark, color: "text-purple-500" },
    { label: "Active AI Agents", value: "2", icon: Bot, color: "text-cyan-500" },
    { label: "Profile Views", value: "342", icon: Eye, color: "text-pink-500" },
    { label: "Saved Searches", value: "8", icon: Filter, color: "text-emerald-500" },
  ];

  const startups = [
    {
      name: "TechVenture Inc",
      industry: "FinTech",
      stage: "Series A",
      score: 87,
      verified: true,
      aiVerified: true,
      description: "AI-powered financial analytics platform",
      funding: "$2.5M",
    },
    {
      name: "HealthTech Solutions",
      industry: "HealthTech",
      stage: "Seed",
      score: 92,
      verified: true,
      aiVerified: true,
      description: "Telemedicine platform for rural areas",
      funding: "$500K",
    },
    {
      name: "GreenEnergy Corp",
      industry: "CleanTech",
      stage: "Pre-Seed",
      score: 78,
      verified: false,
      aiVerified: true,
      description: "Solar panel installation automation",
      funding: "$250K",
    },
  ];

  return (
    <DashboardLayout userRole="investor" userName="Alex Morgan">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Investment Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Discover verified startups and track your interests
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Discovery Section */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discover Startups</h2>
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-600 dark:text-purple-400">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by industry, stage, or keyword..."
                  className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800/50">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-4">
                {startups.map((startup) => (
                  <Card key={startup.name} className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{startup.name}</h3>
                            {startup.verified && (
                              <CredibilityBadge type="verified" label="Verified" />
                            )}
                            {startup.aiVerified && (
                              <CredibilityBadge type="ai-verified" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {startup.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400">{startup.industry}</Badge>
                            <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">{startup.stage}</Badge>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Raised: {startup.funding}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Credibility</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                          {startup.score}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">View Profile</Button>
                      <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="following">
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your following list will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your saved startups will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Privacy Controls */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Profile Visibility</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Private Profile</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Hide from public searches
                  </div>
                </div>
                <div className="h-6 w-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Anonymous Browsing</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Don't show profile views
                  </div>
                </div>
                <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </Card>

          {/* Industry Preferences */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Industry Focus</h3>
            <div className="flex flex-wrap gap-2">
              {["FinTech", "HealthTech", "CleanTech", "EdTech", "AI/ML", "SaaS"].map(
                (industry) => (
                  <Badge
                    key={industry}
                    variant="outline"
                    className="cursor-pointer border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {industry}
                  </Badge>
                )
              )}
            </div>
            <Link to="/investor/edit-profile">
              <Button variant="outline" className="w-full mt-4 border-slate-200 dark:border-slate-700" size="sm">
                Edit Preferences
              </Button>
            </Link>
          </Card>

          {/* Recent Notifications */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Updates</h3>
            <div className="space-y-3">
              {[
                "5 new startups match your criteria",
                "TechVenture updated their profile",
                "New funding round announced",
              ].map((notification, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-1.5"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{notification}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Agents Quick Access */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 dark:from-cyan-500/20 dark:to-purple-500/20 border-cyan-500/30 dark:border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-cyan-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Intelligence Agents</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Subscribe to industry-specific AI agents for expert market insights
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Active Subscriptions</span>
                <span className="font-bold text-slate-900 dark:text-white">2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Monthly Spend</span>
                <span className="font-bold text-slate-900 dark:text-white">$578</span>
              </div>
            </div>
            <Link to="/investor/ai-agents">
              <Button size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
                <Bot className="mr-2 h-4 w-4" />
                Browse AI Agents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          {/* Training Programs */}
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-purple-500/30 dark:border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Training Programs</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Learn from expert advisors through professional training programs
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Enrolled Trainings</span>
                <span className="font-bold text-slate-900 dark:text-white">2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Hours Completed</span>
                <span className="font-bold text-slate-900 dark:text-white">24</span>
              </div>
            </div>
            <Link to="/investor/trainings">
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">
                <GraduationCap className="mr-2 h-4 w-4" />
                Browse Trainings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          {/* AI Insights */}
          <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-emerald-500/30 dark:border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Insights</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Based on your activity, we recommend exploring CleanTech startups this week.
            </p>
            <Button variant="outline" size="sm" className="w-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              Explore Recommendations
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}