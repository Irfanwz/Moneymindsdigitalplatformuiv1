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
    if (!session?.token) return;

    let active = true;

    async function load() {
      try {
        const response = await getInvestorProfile(session!.token);
        if (active) setProfile(response.profile);
      } catch {
        // Use defaults
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [session?.token]);

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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{userName}</h1>
                    <CredibilityBadge type="verified" label="Verified" />
                  </div>
                  {(profile.title || profile.firmName) && (
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                      {[profile.title, profile.firmName].filter(Boolean).join(" at ")}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {user?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {profile.investorType && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {INVESTOR_TYPE_LABELS[profile.investorType] ?? profile.investorType}
                      </div>
                    )}
                    {profile.firmName && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {profile.firmName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Link to="/investor/edit-profile">
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {profile.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.industries.map((focus) => (
                  <Badge key={focus} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {focus}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {profile.twitter && (
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Twitter className="h-4 w-4" />
                  {profile.twitter}
                </span>
              )}
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
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
                    <TrendingUp className="h-5 w-5 text-purple-500" />
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
                  <Target className="h-5 w-5 text-purple-500" />
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
                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
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
