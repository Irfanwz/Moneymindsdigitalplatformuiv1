import { SubmittedApplication } from "@/app/components/registration/RegistrationSummary";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Progress } from "@/app/components/ui/progress";
import { Users, MapPin, Briefcase, Award, Edit, Target, Globe, Linkedin, Twitter, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdvisorProfile } from "@/app/lib/api";
import { createEmptyAdvisorProfile } from "@/app/lib/advisor-profile";
import type { AdvisorProfile as AdvisorProfileType } from "@/app/types/advisor-profile";
import { AdvisorAccuracyCard } from "@/app/components/signals/AdvisorAccuracyCard";
import { VerifiedBadge } from "@/app/components/shared/VerifiedBadge";
import { VerificationStatusSection } from "@/app/components/verification/VerificationStatusSection";
import { CredibilityScoreCard } from "@/app/components/credibility/CredibilityScoreCard";

const SPECIALIZATION_LABELS: Record<string, string> = {
  "financial-planning": "Financial Planning",
  fundraising: "Fundraising Strategy",
  "cfo-services": "CFO Services",
  "cap-table": "Cap Table Management",
  "m-and-a": "M&A Advisory",
  "tax-strategy": "Tax Strategy",
  "growth-strategy": "Growth Strategy",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available Now",
  limited: "Limited Capacity",
  waitlist: "Waitlist Only",
  "not-accepting": "Not Accepting Clients",
};

export function AdvisorProfile() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdvisorProfileType>(() => createEmptyAdvisorProfile(user));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    async function load() {
      try {
        const response = await getAdvisorProfile((session?.token ?? ""));
        if (active) setProfile(response.profile);
      } catch {
        // Use defaults
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.user?.id, session?.token]);

  const userName = user?.fullName ?? "";
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <DashboardLayout userRole="advisor" userName={userName}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="advisor" userName={userName}>
      <SubmittedApplication role="advisor" />
      <div className="w-full space-y-6">
        {/* Institutional Header Card */}
        <Card className="overflow-hidden rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-cyan-900/40 shadow-sm">
          <div aria-hidden="true" className="h-24 w-full bg-gradient-to-r from-[#070d1d] via-[#0c1a35] to-[#0a2536] relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.35),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.20),transparent_55%)]" />
          </div>
          <CardContent className="px-6 pb-7 pt-0 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-6 relative">
              <div className="flex flex-wrap items-end gap-5">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 ring-4 ring-white dark:ring-[#070d1a] flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0 shadow-md">
                  {initials}
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{userName}</h1>
                    <CredibilityBadge score={profile.credibilityScore} tier={profile.credibilityTier} />
                    {profile.isVerified && <VerifiedBadge verifiedAt={profile.verifiedAt} size="lg" />}
                  </div>
                  {profile.title && (
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">{profile.title}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button asChild variant="outline" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                  <Link to="/advisor/dashboard">Back to dashboard</Link>
                </Button>
                <Button asChild className="gap-2 rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm transition-all">
                  <Link to="/advisor/edit-profile">
                    <Edit className="h-4 w-4" />
                    Edit profile
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-5">
              {user?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  {user.location}
                </div>
              )}
              {profile.yearsExperience && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  {profile.yearsExperience}+ years experience
                </div>
              )}
              {profile.specialization && (
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {SPECIALIZATION_LABELS[profile.specialization] ?? profile.specialization}
                </div>
              )}
            </div>

            {profile.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profile.industries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/50 px-3 py-0.5">
                    {ind}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Globe className="h-4 w-4" />Website
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Linkedin className="h-4 w-4" />LinkedIn
                </a>
              )}
              {profile.twitter && (
                <span className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400">
                  <Twitter className="h-4 w-4" />{profile.twitter}
                </span>
              )}
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Mail className="h-4 w-4" />Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!profile.bio && !profile.servicesOffered && !(profile.expertiseAreas.some((e) => e.area)) && !(profile.certifications.some((c) => c.name)) && (
              <Card className="p-8 text-center rounded-2xl border-dashed border-cyan-500/30 bg-white dark:bg-[#070d1a]">
                <Award className="h-10 w-10 mx-auto mb-3 text-cyan-600 dark:text-cyan-400 opacity-70" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Complete your advisor profile</h2>
                <p className="text-sm text-muted-foreground mb-4">Add your bio, expertise areas, certifications, and advisory services so startups and investors can discover you.</p>
                <Button asChild className="rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm">
                  <Link to="/advisor/edit-profile">Complete profile</Link>
                </Button>
              </Card>
            )}

            {profile.bio && (
              <Card className="rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {profile.expertiseAreas.length > 0 && profile.expertiseAreas.some((e) => e.area) && (
              <Card className="rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Expertise Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.expertiseAreas.filter((e) => e.area).map((expertise, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{expertise.area}</span>
                        <span className="text-xs font-mono tabular-nums text-muted-foreground">{expertise.level}%</span>
                      </div>
                      <Progress
                        value={expertise.level}
                        className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {profile.certifications.length > 0 && profile.certifications.some((c) => c.name) && (
              <Card className="rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.certifications.filter((c) => c.name).map((cert, index) => (
                      <div key={index} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{cert.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.servicesOffered && (
              <Card className="rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{profile.servicesOffered}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl bg-white dark:bg-[#070d1a] border-slate-200/90 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Availability &amp; Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.typicalRate && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Typical rate</p>
                    <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">{profile.typicalRate}</p>
                  </div>
                )}
                {profile.availability && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Status</p>
                    <Badge variant="secondary" className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                    </Badge>
                  </div>
                )}
                <Button onClick={() => navigate("/advisor/sessions")} className="w-full rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm border-0">
                  Manage sessions
                </Button>
              </CardContent>
            </Card>

            {/* Credibility Score */}
            <CredibilityScoreCard
              showActions
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />

            {/* Prediction accuracy track record */}
            {user?.id && (
              <AdvisorAccuracyCard
                advisorId={user.id}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            )}

            {/* Verification status */}
            <VerificationStatusSection
              isVerified={profile.isVerified}
              verifiedAt={profile.verifiedAt}
            />

            {profile.specialization && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Specialization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {SPECIALIZATION_LABELS[profile.specialization] ?? profile.specialization}
                  </p>
                </CardContent>
              </Card>
            )}

            {profile.industries.length > 0 && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.industries.map((industry) => (
                      <Badge key={industry} variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
