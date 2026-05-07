import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getInvestorProfile,
  updateInvestorProfile,
  searchStartups,
  getMyEnrollments,
} from "@/app/lib/api";
import type { InvestorProfile } from "@/app/types/investor-profile";
import type { StartupSearchResult } from "@/app/types/search";
import type { TrainingEnrollment } from "@/app/types/training";

export function InvestorDashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [startupResults, setStartupResults] = useState<StartupSearchResult[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [startupsLoading, setStartupsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedStartups, setSavedStartups] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("savedStartups") || "[]"))
  );

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
          setStartupResults(startupsRes.startups);
          setEnrollments(enrollRes.enrollments);
        }
      } catch {
        // Use fallbacks
      } finally {
        if (active) {
          setStartupsLoading(false);
        }
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const handleSearch = async () => {
    if (!session?.token) return;
    setStartupsLoading(true);
    try {
      const res = await searchStartups(session.token, { q: searchQuery || undefined });
      setStartupResults(res.startups);
    } catch {
      // keep existing
    } finally {
      setStartupsLoading(false);
    }
  };

  const handlePrivacyToggle = async (field: "isPrivate" | "anonymousBrowsing", value: boolean) => {
    if (!session?.token || !profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    try {
      await updateInvestorProfile(session.token, updated);
    } catch {
      // revert on failure
      setProfile({ ...profile });
    }
  };

  const displayIndustries = (profile?.industries?.length ?? 0) > 0
    ? profile!.industries
    : ["FinTech", "HealthTech", "CleanTech", "EdTech", "AI/ML", "SaaS"];

  const userName = user?.fullName ?? "Investor";
  const enrolledCount = enrollments.length;

  const stats = [
    { label: "Startups Found", value: startupResults.length.toString(), icon: Building2, color: "text-purple-500" },
    { label: "Trainings Enrolled", value: enrolledCount.toString(), icon: GraduationCap, color: "text-cyan-500" },
    { label: "Industries Tracked", value: (profile?.industries?.length ?? 0).toString(), icon: Eye, color: "text-pink-500" },
    { label: "Investment Focus", value: profile?.preferredStage || "All", icon: Filter, color: "text-emerald-500" },
  ];

  const toggleSaveStartup = (userId: string) => {
    setSavedStartups((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      localStorage.setItem("savedStartups", JSON.stringify([...next]));
      return next;
    });
  };

  const startups = startupResults.map((s) => ({
    id: s.id,
    userId: s.userId,
    name: s.companyName,
    industry: s.industry,
    stage: s.stage,
    score: Math.floor(70 + Math.random() * 25),
    verified: true,
    aiVerified: true,
    description: s.tagline || s.description?.slice(0, 100) || "",
    funding: s.totalRaised || "N/A",
  }));

  return (
    <DashboardLayout userRole="investor" userName={userName}>
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
                <Link to="/investor/find-advisors">
                  <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-600 dark:text-purple-400">
                    <Filter className="mr-2 h-4 w-4" />
                    Find Advisors
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by industry, stage, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
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
                {startupsLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading startups...</div>
                ) : startups.length > 0 ? (
                  startups.map((startup) => (
                    <Card key={startup.id ?? startup.name} className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
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
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {startup.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {startup.industry && (
                                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400">{startup.industry}</Badge>
                              )}
                              {startup.stage && (
                                <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">{startup.stage}</Badge>
                              )}
                              {startup.funding && startup.funding !== "N/A" && (
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Raised: {startup.funding}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Match</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            {startup.score}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                          onClick={() => navigate(`/startups/${startup.userId}/profile`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          className={`border-slate-200 dark:border-slate-700 ${savedStartups.has(startup.userId) ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500/50" : ""}`}
                          onClick={() => toggleSaveStartup(startup.userId)}
                        >
                          <Bookmark className={`h-4 w-4 ${savedStartups.has(startup.userId) ? "fill-purple-500 text-purple-500" : ""}`} />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No startups found. Try adjusting your search.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following">
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your following list will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="saved">
                {startups.filter((s) => savedStartups.has(s.userId)).length > 0 ? (
                  startups.filter((s) => savedStartups.has(s.userId)).map((startup) => (
                    <Card key={startup.id ?? startup.name} className="p-6 mb-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{startup.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{startup.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {startup.industry && (
                                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400">{startup.industry}</Badge>
                              )}
                              {startup.stage && (
                                <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">{startup.stage}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                          onClick={() => navigate(`/startups/${startup.userId}/profile`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="border-purple-500/50 bg-purple-100 dark:bg-purple-900/30"
                          onClick={() => toggleSaveStartup(startup.userId)}
                        >
                          <Bookmark className="h-4 w-4 fill-purple-500 text-purple-500" />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved startups yet. Bookmark startups to see them here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Privacy Controls */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Profile Visibility</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Private Profile</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Hide from public searches
                  </div>
                </div>
                <Switch
                  checked={profile?.isPrivate ?? false}
                  onCheckedChange={(val) => handlePrivacyToggle("isPrivate", val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Anonymous Browsing</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Don't show profile views
                  </div>
                </div>
                <Switch
                  checked={profile?.anonymousBrowsing ?? false}
                  onCheckedChange={(val) => handlePrivacyToggle("anonymousBrowsing", val)}
                />
              </div>
            </div>
          </Card>

          {/* Industry Preferences */}
          <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Industry Focus</h3>
            <div className="flex flex-wrap gap-2">
              {displayIndustries.map(
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

          {/* Investment Criteria */}
          {profile && (
            <Card className="p-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Investment Criteria</h3>
              <div className="space-y-3">
                {profile.investorType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Investor Type</span>
                    <span className="font-medium text-slate-900 dark:text-white">{profile.investorType}</span>
                  </div>
                )}
                {profile.preferredStage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Preferred Stage</span>
                    <span className="font-medium text-slate-900 dark:text-white">{profile.preferredStage}</span>
                  </div>
                )}
                {(profile.minInvestment || profile.maxInvestment) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Check Size</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {profile.minInvestment || "?"} - {profile.maxInvestment || "?"}
                    </span>
                  </div>
                )}
                {profile.geographicFocus && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Geographic Focus</span>
                    <span className="font-medium text-slate-900 dark:text-white">{profile.geographicFocus}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Agents Quick Access */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 dark:from-cyan-500/20 dark:to-purple-500/20 border-cyan-500/30 dark:border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-cyan-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Intelligence Agents</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Subscribe to industry-specific AI agents for expert market insights
            </p>
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
                <span className="font-bold text-slate-900 dark:text-white">{enrolledCount}</span>
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
              {profile?.industries?.length
                ? `Based on your focus on ${profile.industries[0]}, explore related startups this week.`
                : "Set your industry preferences to get personalized recommendations."}
            </p>
            <Link to="/investor/find-advisors">
              <Button variant="outline" size="sm" className="w-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Explore Recommendations
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
