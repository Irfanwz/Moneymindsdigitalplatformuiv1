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
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const response = await getAdvisorProfile(session!.token);
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{userName}</h1>
                    <CredibilityBadge type="verified" label="Expert Verified" />
                  </div>
                  {profile.title && (
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{profile.title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {user?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {profile.yearsExperience && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {profile.yearsExperience}+ years experience
                      </div>
                    )}
                    {profile.specialization && (
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4" />
                        {SPECIALIZATION_LABELS[profile.specialization] ?? profile.specialization}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Link to="/advisor/edit-profile">
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {profile.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.industries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {ind}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Globe className="h-4 w-4" />Website
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Linkedin className="h-4 w-4" />LinkedIn
                </a>
              )}
              {profile.twitter && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Twitter className="h-4 w-4" />{profile.twitter}
                </span>
              )}
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Mail className="h-4 w-4" />Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
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

            {profile.expertiseAreas.length > 0 && profile.expertiseAreas.some((e) => e.area) && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-500" />
                    Expertise Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.expertiseAreas.filter((e) => e.area).map((expertise, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{expertise.area}</span>
                        <span className="text-xs text-slate-500">{expertise.level}%</span>
                      </div>
                      <Progress value={expertise.level} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {profile.certifications.length > 0 && profile.certifications.some((c) => c.name) && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.certifications.filter((c) => c.name).map((cert, index) => (
                      <div key={index} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="font-medium text-slate-900 dark:text-white">{cert.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {[cert.issuer, cert.year].filter(Boolean).join(" - ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.servicesOffered && (
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.typicalRate && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Rate</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.typicalRate}</p>
                  </div>
                )}
                {profile.availability && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                    </Badge>
                  </div>
                )}
                <Button onClick={() => navigate("/advisor/sessions")} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0">
                  Book Session
                </Button>
              </CardContent>
            </Card>

            {/* Prediction accuracy track record */}
            {user?.id && (
              <AdvisorAccuracyCard
                advisorId={user.id}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            )}

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
