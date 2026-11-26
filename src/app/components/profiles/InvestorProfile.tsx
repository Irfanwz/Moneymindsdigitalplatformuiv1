import { SubmittedApplication } from "@/app/components/registration/RegistrationSummary";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { TrendingUp, MapPin, Briefcase, DollarSign, Edit, Target, Building2, Globe, Linkedin, Twitter, Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getInvestorProfile } from "@/app/lib/api";
import { createEmptyInvestorProfile } from "@/app/lib/investor-profile";
import type { InvestorProfile as InvestorProfileType } from "@/app/types/investor-profile";

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  angel: "Angel Investor",
  vc: "Venture Capital",
  pe: "Private Equity",
  corporate: "Corporate Investor",
  "family-office": "Family Office",
};

const STAGE_LABELS: Record<string, string> = {
  "pre-seed": "Pre-Seed",
  seed: "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  growth: "Growth Stage",
  all: "All Stages",
};

const GEO_LABELS: Record<string, string> = {
  "north-america": "North America",
  europe: "Europe",
  asia: "Asia",
  latam: "Latin America",
  global: "Global",
};

export function InvestorProfile() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfileType>(() => createEmptyInvestorProfile(user));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    let active = true;

    async function load() {
      try {
        const response = await getInvestorProfile((session?.token ?? ""));
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
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <DashboardLayout userRole="investor" userName={userName}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const checkSize =
    profile.minInvestment && profile.maxInvestment
      ? `$${profile.minInvestment} - $${profile.maxInvestment}`
      : profile.minInvestment
        ? `$${profile.minInvestment}+`
        : profile.maxInvestment
          ? `Up to $${profile.maxInvestment}`
          : "Not specified";

  return (
    <DashboardLayout userRole="investor" userName={userName}>
      <SubmittedApplication role="investor" />
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
                    {profile.isVerified && <CredibilityBadge type="verified" label="Verified" />}
                  </div>
                  {(profile.title || profile.firmName) && (
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
                      {[profile.title, profile.firmName].filter(Boolean).join(" at ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button asChild variant="outline" className="rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30">
                  <Link to="/investor/dashboard">Back to dashboard</Link>
                </Button>
                <Button asChild className="gap-2 rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm transition-all">
                  <Link to="/investor/edit-profile">
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
              {profile.investorType && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  {INVESTOR_TYPE_LABELS[profile.investorType] ?? profile.investorType}
                </div>
              )}
              {profile.firmName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {profile.firmName}
                </div>
              )}
            </div>

            {profile.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profile.industries.map((focus) => (
                  <Badge key={focus} variant="secondary" className="rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/50 px-3 py-0.5">
                    {focus}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {profile.twitter && (
                <span className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400">
                  <Twitter className="h-4 w-4" />
                  {profile.twitter}
                </span>
              )}
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-400 hover:underline">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!profile.bio && !profile.investmentThesis && (
              <Card className="p-8 text-center rounded-2xl border-dashed border-cyan-500/30 bg-white dark:bg-[#070d1a]">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-cyan-600 dark:text-cyan-400 opacity-70" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Complete your investor profile</h2>
                <p className="text-sm text-muted-foreground mb-4">Add your bio, investment thesis, and target check size so founders understand your mandate.</p>
                <Button asChild className="rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm">
                  <Link to="/investor/edit-profile">Complete profile</Link>
                </Button>
              </Card>
            )}
            {/* About */}
            {profile.bio && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Investment Thesis */}
            {profile.investmentThesis && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-500" />
                    Investment Thesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.investmentThesis}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Criteria */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-500" />
                  Investment Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Check Size</p>
                  <p className="font-medium text-slate-900 dark:text-white">{checkSize}</p>
                </div>
                {profile.preferredStage && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Stage</p>
                    <Badge variant="secondary" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                      {STAGE_LABELS[profile.preferredStage] ?? profile.preferredStage}
                    </Badge>
                  </div>
                )}
                {profile.portfolioSize && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Portfolio Size</p>
                    <p className="font-medium text-slate-900 dark:text-white">{profile.portfolioSize} companies</p>
                  </div>
                )}
                {profile.geographicFocus && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Geographic Focus</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {GEO_LABELS[profile.geographicFocus] ?? profile.geographicFocus}
                    </p>
                  </div>
                )}
                {profile.industries.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.industries.map((focus) => (
                        <Badge key={focus} variant="outline" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
