import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  Mail,
  Users,
  DollarSign,
  Loader2,
  Building2,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStartupPublicProfile } from "@/app/lib/api";
import type { StartupProfile } from "@/app/types/startup-profile";

export function PublicStartupProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token || !userId) return;
    let active = true;
    async function load() {
      try {
        const res = await getStartupPublicProfile(session!.token, userId!);
        if (active) setProfile(res.profile);
      } catch {
        // not found
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token, userId]);

  const currentRole = user?.currentRole ?? "investor";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={currentRole} userName={user?.fullName ?? ""} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole={currentRole} userName={user?.fullName ?? ""} />
        <div className="container mx-auto px-6 py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Startup not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={currentRole} userName={user?.fullName ?? ""} />

      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-semibold">{profile.companyName}</h1>
                    <CredibilityBadge type="verified" label="Verified" />
                  </div>
                  {profile.tagline && (
                    <p className="text-muted-foreground mb-2">{profile.tagline}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {profile.industry && <Badge variant="outline">{profile.industry}</Badge>}
                    {profile.stage && <Badge variant="outline">{profile.stage}</Badge>}
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{profile.location}
                      </span>
                    )}
                    {profile.foundedYear && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />Founded {profile.foundedYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {profile.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                </div>
              )}

              {profile.pitch && (
                <div>
                  <h3 className="font-semibold mb-2">Investment Pitch</h3>
                  <p className="text-sm text-muted-foreground">{profile.pitch}</p>
                </div>
              )}
            </Card>

            {/* Team */}
            {profile.teamMembers?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  <Users className="inline mr-2 h-4 w-4" />
                  Team ({profile.teamMembers.length})
                </h3>
                <div className="space-y-3">
                  {profile.teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">{member.name?.[0] ?? "?"}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.role}</div>
                      </div>
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 text-muted-foreground hover:text-accent" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                <DollarSign className="inline mr-2 h-4 w-4" />
                Funding
              </h3>
              <div className="space-y-3">
                {profile.stage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="font-medium">{profile.stage}</span>
                  </div>
                )}
                {profile.totalRaised && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Raised</span>
                    <span className="font-medium">{profile.totalRaised}</span>
                  </div>
                )}
                {profile.fundingGoal && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Seeking</span>
                    <span className="font-medium">{profile.fundingGoal}</span>
                  </div>
                )}
                {profile.valuation && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valuation</span>
                    <span className="font-medium">{profile.valuation}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Categories */}
            {profile.categories?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.categories.map((cat) => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact */}
            {profile.showContactInfo && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Contact</h3>
                <div className="space-y-2">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:underline">
                      <Globe className="h-4 w-4" />Website
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:underline">
                      <Linkedin className="h-4 w-4" />LinkedIn
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:underline">
                      <Twitter className="h-4 w-4" />Twitter
                    </a>
                  )}
                  {profile.contactEmail && (
                    <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                      <Mail className="h-4 w-4" />Email
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
