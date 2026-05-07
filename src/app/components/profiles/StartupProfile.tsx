import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Calendar,
  Edit,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Target,
  Twitter,
  Users,
} from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { getStartupProfile } from "@/app/lib/api";
import { createEmptyStartupProfile } from "@/app/lib/startup-profile";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import type { StartupProfile as StartupProfileData } from "@/app/types/startup-profile";

function buildLogo(companyName: string) {
  const letters = companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return letters || "SU";
}

export function StartupProfile() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfileData>(() => createEmptyStartupProfile(user));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getStartupProfile(session.token);

        if (!isActive) {
          return;
        }

        setProfile(response.profile);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : "Could not load startup profile.";
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [session?.token, user?.id]);

  const teamSizeLabel = useMemo(() => {
    const count = profile.teamMembers.filter((member) => member.name || member.role).length;
    return count > 0 ? `${count} team members` : "Team not added";
  }, [profile.teamMembers]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="startup" userName={profile.companyName || user?.fullName || "Startup"}>
        <Card className="p-8">Loading startup profile...</Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="startup" userName={profile.companyName || user?.fullName || "Startup"}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load startup profile</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {buildLogo(profile.companyName)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {profile.companyName || "Untitled Startup"}
                    </h1>
                    <CredibilityBadge score={profile.categories.length > 1 ? 88 : 82} />
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                    {profile.tagline || "Add a company tagline from the edit profile page."}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {profile.location ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    ) : null}
                    {profile.foundedYear ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Founded {profile.foundedYear}
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {teamSizeLabel}
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/startup/edit-profile">
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(profile.categories.length ? profile.categories : [profile.industry].filter(Boolean)).map((category) => (
                <Badge key={category} variant="secondary" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {profile.showContactInfo && profile.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              ) : null}
              {profile.showContactInfo && profile.linkedin ? (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              ) : null}
              {profile.showContactInfo && profile.twitter ? (
                <a href={`https://twitter.com/${profile.twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                  <Twitter className="h-4 w-4" />
                  {profile.twitter}
                </a>
              ) : null}
              {profile.showContactInfo && profile.contactEmail ? (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                  <Mail className="h-4 w-4" />
                  {profile.contactEmail}
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {profile.description || "No company description has been added yet."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-500" />
                  Investment Pitch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {profile.pitch || "No investment pitch has been added yet."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.teamMembers.length > 0 ? profile.teamMembers.map((member, index) => (
                    <div key={`${member.name}-${index}`} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {buildLogo(member.name || "TM")}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{member.name || "Unnamed member"}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{member.role || "Role not added"}</p>
                        </div>
                      </div>
                      {member.linkedin ? (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  )) : (
                    <p className="text-slate-500 dark:text-slate-400">No team members added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-500" />
                  Funding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Stage</p>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {profile.stage || "Not set"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Raised</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.totalRaised || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Currently Seeking</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.fundingGoal || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Valuation</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.valuation || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Company Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Industry</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profile.industry || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Visibility</p>
                  <Badge variant="outline">{profile.isPublic ? "Public" : "Private"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Advisor Invitations</p>
                  <Badge variant="outline">{profile.allowAdvisorInvitations ? "Enabled" : "Disabled"}</Badge>
                </div>
                {profile.updatedAt ? (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Last Updated</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(profile.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-500" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  This page now reads directly from the startup profile record stored in Supabase.
                </p>
                <Link to="/startup/edit-profile">
                  <Button variant="outline" className="w-full">
                    Update Startup Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
