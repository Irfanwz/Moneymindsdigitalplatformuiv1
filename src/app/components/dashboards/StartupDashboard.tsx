import { useEffect, useState } from "react";
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
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getStartupProfile,
  getMyEnrollments,
  searchAdvisors,
  listTrainings,
} from "@/app/lib/api";
import { Badge } from "@/app/components/ui/badge";
import type { StartupProfile } from "@/app/types/startup-profile";
import type { Training, TrainingEnrollment } from "@/app/types/training";
import type { AdvisorSearchResult } from "@/app/types/search";

export function StartupDashboard() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const [profileRes, enrollRes, advisorRes, trainingsRes] = await Promise.all([
          getStartupProfile(session!.token),
          getMyEnrollments(session!.token),
          searchAdvisors(session!.token),
          listTrainings(session!.token),
        ]);
        if (active) {
          setProfile(profileRes.profile);
          setEnrollments(enrollRes.enrollments);
          setAdvisors(advisorRes.advisors.slice(0, 3));
          setTrainings(trainingsRes.trainings);
        }
      } catch {
        // fallback to defaults
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const userName = user?.fullName ?? "Startup";
  const companyName = profile?.companyName ?? userName;

  // Calculate profile completion percentage
  const profileFields = profile
    ? [
        profile.companyName,
        profile.tagline,
        profile.industry,
        profile.foundedYear,
        profile.location,
        profile.description,
        profile.website,
        profile.stage,
        profile.totalRaised,
        profile.pitch,
      ]
    : [];
  const filledFields = profileFields.filter((f) => f && f.trim() !== "").length;
  const profileCompletion = profile
    ? Math.round((filledFields / profileFields.length) * 100)
    : 0;

  const enrolledCount = enrollments.length;
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0);
  const avgProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

  const stats = [
    { label: "Profile Completion", value: `${profileCompletion}%`, change: profile ? "Live" : "—" },
    { label: "Team Members", value: profile?.teamMembers?.length?.toString() ?? "0", change: "" },
    { label: "Advisor Connections", value: advisors.length.toString(), change: "Available" },
    { label: "Trainings Enrolled", value: enrolledCount.toString(), change: avgProgress > 0 ? `${avgProgress}% avg` : "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="startup" userName={companyName} />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {companyName}</h1>
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
                {stat.change && (
                  <div className="text-sm text-accent">{stat.change}</div>
                )}
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
                {profileCompletion >= 80 && <CredibilityBadge type="ai-verified" />}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${profile?.companyName ? "bg-green-100" : "bg-amber-100"} flex items-center justify-center`}>
                        <FileCheck className={`h-4 w-4 ${profile?.companyName ? "text-green-600" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Company Information</div>
                        <div className="text-xs text-muted-foreground">
                          {profile?.companyName ? "Verified" : "Incomplete"}
                        </div>
                      </div>
                    </div>
                    <CredibilityBadge
                      type={profile?.companyName ? "verified" : "pending"}
                      label={profile?.companyName ? "Complete" : "Pending"}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${profile?.pitch ? "bg-green-100" : "bg-amber-100"} flex items-center justify-center`}>
                        <Sparkles className={`h-4 w-4 ${profile?.pitch ? "text-green-600" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Investment Pitch</div>
                        <div className="text-xs text-muted-foreground">
                          {profile?.pitch ? "Completed" : "Not yet added"}
                        </div>
                      </div>
                    </div>
                    <CredibilityBadge
                      type={profile?.pitch ? "verified" : "pending"}
                      label={profile?.pitch ? "Complete" : "Pending"}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${(profile?.teamMembers?.length ?? 0) > 0 ? "bg-green-100" : "bg-amber-100"} flex items-center justify-center`}>
                        <Building2 className={`h-4 w-4 ${(profile?.teamMembers?.length ?? 0) > 0 ? "text-green-600" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Team Members</div>
                        <div className="text-xs text-muted-foreground">
                          {(profile?.teamMembers?.length ?? 0) > 0
                            ? `${profile!.teamMembers.length} member${profile!.teamMembers.length > 1 ? "s" : ""} added`
                            : "No team members yet"}
                        </div>
                      </div>
                    </div>
                    <CredibilityBadge
                      type={(profile?.teamMembers?.length ?? 0) > 0 ? "verified" : "pending"}
                      label={(profile?.teamMembers?.length ?? 0) > 0 ? "Complete" : "Pending"}
                    />
                  </div>
                </div>

                <Link to="/startup/edit-profile">
                  <Button className="w-full">
                    Complete Your Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Startup Info Summary */}
            {profile && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Company Overview</h2>
                <div className="space-y-4">
                  {profile.industry && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <span className="text-sm font-medium">{profile.industry}</span>
                    </div>
                  )}
                  {profile.stage && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Stage</span>
                      <span className="text-sm font-medium">{profile.stage}</span>
                    </div>
                  )}
                  {profile.totalRaised && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Total Raised</span>
                      <span className="text-sm font-medium">{profile.totalRaised}</span>
                    </div>
                  )}
                  {profile.fundingGoal && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Funding Goal</span>
                      <span className="text-sm font-medium">{profile.fundingGoal}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{profile.location}</span>
                    </div>
                  )}
                  {profile.foundedYear && (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Founded</span>
                      <span className="text-sm font-medium">{profile.foundedYear}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
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
                <Link to="/startup/find-advisors">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Find Advisors
                  </Button>
                </Link>
                <Link to="/startup/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
                <Link to="/startup/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recommended Advisors */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recommended Advisors</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading advisors...</div>
                ) : advisors.length > 0 ? (
                  advisors.map((advisor) => (
                    <div key={advisor.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {advisor.name?.[0] ?? "A"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{advisor.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {advisor.specialization || advisor.title || "Advisor"}
                          </div>
                        </div>
                      </div>
                      {advisor.expertiseAreas?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${advisor.expertiseAreas[0].level}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {advisor.expertiseAreas[0].level}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No advisors found yet.</div>
                )}
                <Link to="/startup/find-advisors">
                  <Button variant="outline" className="w-full mt-2">
                    View All Advisors
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Upcoming Events</h3>
              </div>
              <div className="space-y-3">
                {(() => {
                  // Enrolled trainings with real titles
                  const enrolledTrainings = enrollments
                    .map((e) => {
                      const training = trainings.find((t) => t.id === e.trainingId);
                      return training ? { ...training, progress: e.progress, enrolledAt: e.enrolledAt, enrollmentId: e.id } : null;
                    })
                    .filter(Boolean) as (Training & { progress: number; enrolledAt: string; enrollmentId: string })[];

                  // Upcoming trainings not yet enrolled in
                  const enrolledIds = new Set(enrollments.map((e) => e.trainingId));
                  const upcomingTrainings = trainings
                    .filter((t) => (t.status === "upcoming" || t.status === "ongoing") && !enrolledIds.has(t.id) && (t.targetAudience?.includes("startup") || t.targetAudience?.includes("all") || t.targetAudience?.length === 0))
                    .slice(0, 2);

                  const hasEvents = enrolledTrainings.length > 0 || upcomingTrainings.length > 0;

                  if (!hasEvents) {
                    return (
                      <div className="text-center py-4">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <div className="text-sm text-muted-foreground">No upcoming events</div>
                        <Link to="/startup/trainings">
                          <Button variant="outline" size="sm" className="mt-2">Browse Trainings</Button>
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <>
                      {enrolledTrainings.slice(0, 3).map((t) => (
                        <Link key={t.enrollmentId} to={`/startup/trainings/${t.id}`}>
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center bg-accent/10 rounded-lg p-2 w-14 h-14 shrink-0">
                              <GraduationCap className="h-4 w-4 text-accent mb-1" />
                              <div className="text-xs font-medium">{t.progress}%</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{t.title}</div>
                              <div className="text-xs text-muted-foreground">{t.schedule || t.duration}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={t.status === "ongoing" ? "default" : "outline"} className="text-xs">
                                  {t.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{t.format}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {upcomingTrainings.map((t) => (
                        <Link key={t.id} to={`/startup/trainings/${t.id}`}>
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-dashed border-border">
                            <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-2 w-14 h-14 shrink-0">
                              <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                              <div className="text-xs font-medium">New</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{t.title}</div>
                              <div className="text-xs text-muted-foreground">{t.schedule || t.duration}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">upcoming</Badge>
                                <span className="text-xs text-muted-foreground">{t.type === "free" ? "Free" : `$${t.price}`}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  );
                })()}
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
                  <span className="font-semibold">{enrolledCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Progress</span>
                  <span className="font-semibold">{avgProgress}%</span>
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
