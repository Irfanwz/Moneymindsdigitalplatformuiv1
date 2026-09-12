import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { VerifiedBadge } from "@/app/components/shared/VerifiedBadge";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  Globe,
  Linkedin,
  Mail,
  Award,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdvisorPublicProfile } from "@/app/lib/api";
import type { AdvisorProfile } from "@/app/types/advisor-profile";

export function PublicAdvisorProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [advisorName, setAdvisorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token || !userId) return;
    let active = true;
    async function load() {
      try {
        const res = await getAdvisorPublicProfile(session!.token, userId!);
        if (active) {
          setProfile(res.profile);
          setAdvisorName(res.name);
        }
      } catch {
        // not found
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token, userId]);

  const currentRole = user?.currentRole ?? "startup";

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
          <h2 className="text-xl font-semibold mb-4">Advisor not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const expertiseAreas = profile.expertiseAreas?.filter((e) => e.area) ?? [];

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
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-medium">
                    {advisorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-semibold">{advisorName}</h1>
                    <CredibilityBadge type="verified" label="Verified" />
                    {profile.isVerified && <VerifiedBadge verifiedAt={profile.verifiedAt} />}
                  </div>
                  <p className="text-muted-foreground mb-2">{profile.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {profile.specialization && (
                      <Badge variant="outline">{profile.specialization}</Badge>
                    )}
                    {profile.yearsExperience && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {profile.yearsExperience} years experience
                      </span>
                    )}
                    {profile.clientsHelped && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {profile.clientsHelped}+ clients helped
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {profile.servicesOffered && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Services Offered</h3>
                  <p className="text-sm text-muted-foreground">{profile.servicesOffered}</p>
                </div>
              )}

              {profile.previousRoles && (
                <div>
                  <h3 className="font-semibold mb-2">Previous Roles</h3>
                  <p className="text-sm text-muted-foreground">{profile.previousRoles}</p>
                </div>
              )}
            </Card>

            {/* Expertise */}
            {expertiseAreas.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Expertise Areas</h3>
                <div className="space-y-3">
                  {expertiseAreas.map((item) => (
                    <div key={item.area}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.area}</span>
                        <span className="text-xs text-muted-foreground">{item.level}%</span>
                      </div>
                      <Progress value={item.level} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Certifications</h3>
                <div className="space-y-3">
                  {profile.certifications.map((cert) => (
                    <div key={cert.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Award className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm font-medium">{cert.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {cert.issuer} {cert.year && `· ${cert.year}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <div className="space-y-3">
                {profile.availability && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <Badge variant="outline">{profile.availability}</Badge>
                  </div>
                )}
                {profile.typicalRate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Typical Rate</span>
                    <span className="font-medium">{profile.typicalRate}</span>
                  </div>
                )}
                {profile.engagementType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Engagement</span>
                    <span className="font-medium">{profile.engagementType}</span>
                  </div>
                )}
                {profile.preferredStage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Preferred Stage</span>
                    <span className="font-medium">{profile.preferredStage}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Industries */}
            {profile.industries?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.industries.map((ind) => (
                    <Badge key={ind} variant="outline">{ind}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact Links */}
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
