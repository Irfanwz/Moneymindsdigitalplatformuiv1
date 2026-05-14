import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Calendar, Clock, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdvisorProfile } from "@/app/lib/api";
import { createEmptyAdvisorProfile } from "@/app/lib/advisor-profile";
import type { AdvisorProfile } from "@/app/types/advisor-profile";

export function AdvisorSessionsPage() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<AdvisorProfile>(() => createEmptyAdvisorProfile(user));
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
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sessions & Bookings</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">0</div>
                <p className="text-sm text-muted-foreground mt-2">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600">{profile.typicalRate || "—"}</div>
                <p className="text-sm text-muted-foreground mt-2">Typical Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <p className="text-sm text-muted-foreground mt-2">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No upcoming sessions yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Clients can book sessions with you once you connect your calendar or booking system.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Booking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No previous bookings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Session Rate</p>
                  <p className="font-semibold">{profile.typicalRate || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Availability</p>
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {profile.availability === "available" ? "Available" : profile.availability || "Not set"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Engagement Type</p>
                  <p className="font-semibold text-sm">{profile.engagementType || "Not set"}</p>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Settings
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calendar Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Connect Your Calendar</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Link Google Calendar, Calendly, or another booking system to automatically manage session availability.
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Booking Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg break-all text-xs font-mono">
                  {`${window.location.origin}/advisors/${user?.id}/profile`}
                </div>
                <Button size="sm" className="w-full">
                  Copy Link
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Share this link for clients to view your profile and request sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
