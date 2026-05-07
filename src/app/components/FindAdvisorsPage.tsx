import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Search,
  Filter,
  Award,
  Briefcase,
  MapPin,
  TrendingUp,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { searchAdvisors, sendConnectionRequest } from "@/app/lib/api";
import type { AdvisorSearchResult } from "@/app/types/search";

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
  "not-accepting": "Not Accepting",
};

function getAvailabilityColor(availability: string) {
  switch (availability) {
    case "available": return "bg-green-100 text-green-700";
    case "limited": return "bg-amber-100 text-amber-700";
    case "waitlist": return "bg-slate-100 text-slate-700";
    default: return "bg-muted text-muted-foreground";
  }
}

function AdvisorCard({ advisor, onViewProfile, onConnect }: { advisor: AdvisorSearchResult; onViewProfile: (userId: string) => void; onConnect: (userId: string) => void }) {
  const initials = advisor.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "";
  const specLabel = SPECIALIZATION_LABELS[advisor.specialization] ?? advisor.specialization;
  const expertiseNames = advisor.expertiseAreas?.filter((e) => e.area).map((e) => e.area) ?? [];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-medium">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg">{advisor.name}</h3>
                <CredibilityBadge type="verified" label="Verified" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{advisor.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {advisor.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{advisor.location}</span>
                )}
                {advisor.yearsExperience && (
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{advisor.yearsExperience} years</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-accent" />
                <div className="text-2xl font-semibold text-accent">
                  {Math.min(99, 75 + (advisor.yearsExperience ?? 0) + Math.floor((advisor.clientsHelped ?? 0) / 10))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Credibility Score</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{advisor.bio}</p>

          {(expertiseNames.length > 0 || specLabel) && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2">Specializations</div>
              <div className="flex flex-wrap gap-2">
                {specLabel && <Badge variant="outline" className="text-xs">{specLabel}</Badge>}
                {expertiseNames.map((name) => (
                  <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          {advisor.industries.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Industries</div>
              <div className="flex flex-wrap gap-2">
                {advisor.industries.map((industry) => (
                  <Badge key={industry} variant="outline" className="text-xs bg-accent/5">{industry}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {advisor.clientsHelped && (
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-accent" />{advisor.clientsHelped}+ clients helped</span>
              )}
              {advisor.typicalRate && (
                <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" />{advisor.typicalRate}</span>
              )}
              {advisor.availability && (
                <span className={`px-2 py-1 rounded-full text-xs ${getAvailabilityColor(advisor.availability)}`}>
                  {AVAILABILITY_LABELS[advisor.availability] ?? advisor.availability}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewProfile(advisor.userId)}>View Profile</Button>
              <Button size="sm" onClick={() => onConnect(advisor.userId)}>
                <MessageSquare className="mr-2 h-4 w-4" />Connect
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface FindAdvisorsPageProps {
  userRole: "startup" | "investor";
  userName?: string;
}

export function FindAdvisorsPage({ userRole }: FindAdvisorsPageProps) {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<AdvisorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("credibility");

  const userName = user?.fullName ?? "";

  const loadAdvisors = async (params?: { industry?: string; specialization?: string; q?: string }) => {
    if (!session?.token) return;
    setIsLoading(true);
    try {
      const res = await searchAdvisors(session.token, params);
      setAdvisors(res.advisors);
    } catch {
      // keep existing
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisors();
  }, [session?.token]);

  const handleSearch = () => {
    loadAdvisors({
      industry: selectedIndustry !== "all" ? selectedIndustry : undefined,
      specialization: selectedSpecialization !== "all" ? selectedSpecialization : undefined,
      q: searchQuery || undefined,
    });
  };

  useEffect(() => {
    handleSearch();
  }, [selectedIndustry, selectedSpecialization]);

  const sortedAdvisors = [...advisors].sort((a, b) => {
    if (sortBy === "experience") return (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0);
    if (sortBy === "clients") return (b.clientsHelped ?? 0) - (a.clientsHelped ?? 0);
    // default: credibility (approximate)
    const scoreA = 75 + (a.yearsExperience ?? 0) + Math.floor((a.clientsHelped ?? 0) / 10);
    const scoreB = 75 + (b.yearsExperience ?? 0) + Math.floor((b.clientsHelped ?? 0) / 10);
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Find Financial Advisors</h1>
          <p className="text-muted-foreground">Connect with verified financial advisors to help grow your business</p>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialization, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="pl-10"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger><SelectValue placeholder="All Industries" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="CleanTech">CleanTech</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger><SelectValue placeholder="All Specializations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="financial-planning">Financial Planning</SelectItem>
                  <SelectItem value="fundraising">Fundraising Strategy</SelectItem>
                  <SelectItem value="cfo-services">CFO Services</SelectItem>
                  <SelectItem value="cap-table">Cap Table Management</SelectItem>
                  <SelectItem value="growth-strategy">Growth Strategy</SelectItem>
                  <SelectItem value="m-and-a">M&A Advisory</SelectItem>
                  <SelectItem value="tax-strategy">Tax Strategy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credibility">Highest Credibility</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="clients">Most Clients Helped</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full" onClick={handleSearch}>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `Showing ${sortedAdvisors.length} advisor${sortedAdvisors.length !== 1 ? "s" : ""}`}
          </div>
          <div className="flex items-center gap-2">
            <CredibilityBadge type="verified" label="Verified" />
            <span className="text-sm text-muted-foreground">All advisors are verified</span>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {sortedAdvisors.map((advisor) => (
              <AdvisorCard
                key={advisor.id}
                advisor={advisor}
                onViewProfile={(userId) => navigate(`/advisors/${userId}/profile`)}
                onConnect={async (userId) => {
                  if (!session?.token) return;
                  try {
                    await sendConnectionRequest(session.token, userId);
                    alert("Connection request sent!");
                  } catch {
                    alert("Failed to send connection request.");
                  }
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && sortedAdvisors.length === 0 && (
          <Card className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No advisors found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("all");
                setSelectedSpecialization("all");
                loadAdvisors();
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
