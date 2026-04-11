import { useState } from "react";
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
} from "lucide-react";

interface AdvisorCardProps {
  advisor: {
    id: string;
    name: string;
    title: string;
    location: string;
    credibilityScore: number;
    verified: boolean;
    aiVerified: boolean;
    yearsExperience: number;
    specializations: string[];
    industries: string[];
    clientsHelped: number;
    bio: string;
    rate?: string;
    availability: "available" | "limited" | "waitlist";
  };
}

function AdvisorCard({ advisor }: AdvisorCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-700";
      case "limited":
        return "bg-amber-100 text-amber-700";
      case "waitlist":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available Now";
      case "limited":
        return "Limited Capacity";
      case "waitlist":
        return "Waitlist";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-medium">{advisor.name[0]}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg">{advisor.name}</h3>
                {advisor.verified && (
                  <CredibilityBadge type="verified" label="Verified" />
                )}
                {advisor.aiVerified && <CredibilityBadge type="ai-verified" />}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {advisor.title}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {advisor.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {advisor.yearsExperience} years
                </span>
              </div>
            </div>

            {/* Credibility Score */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-accent" />
                <div className="text-2xl font-semibold text-accent">
                  {advisor.credibilityScore}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Credibility Score
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {advisor.bio}
          </p>

          {/* Specializations */}
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-2">
              Specializations
            </div>
            <div className="flex flex-wrap gap-2">
              {advisor.specializations.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Industries</div>
            <div className="flex flex-wrap gap-2">
              {advisor.industries.map((industry) => (
                <Badge
                  key={industry}
                  variant="outline"
                  className="text-xs bg-accent/5"
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-accent" />
                {advisor.clientsHelped}+ clients helped
              </span>
              {advisor.rate && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {advisor.rate}
                </span>
              )}
              <span
                className={`px-2 py-1 rounded-full text-xs ${getAvailabilityColor(
                  advisor.availability
                )}`}
              >
                {getAvailabilityText(advisor.availability)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Connect
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
  userName: string;
}

export function FindAdvisorsPage({ userRole, userName }: FindAdvisorsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("credibility");

  // Mock advisor data
  const advisors = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      title: "Senior Financial Advisor & CFO Consultant",
      location: "San Francisco, CA",
      credibilityScore: 95,
      verified: true,
      aiVerified: true,
      yearsExperience: 15,
      specializations: ["Financial Planning", "Fundraising", "Cap Table Mgmt"],
      industries: ["FinTech", "SaaS", "AI/ML"],
      clientsHelped: 120,
      bio: "Financial advisor with 15+ years of experience helping startups navigate fundraising, financial planning, and cap table management. Previously served as CFO at two successful FinTech companies.",
      rate: "$200/hr",
      availability: "limited" as const,
    },
    {
      id: "2",
      name: "Michael Ross",
      title: "Growth Strategy Advisor",
      location: "New York, NY",
      credibilityScore: 92,
      verified: true,
      aiVerified: true,
      yearsExperience: 12,
      specializations: ["Growth Strategy", "Fundraising", "M&A Advisory"],
      industries: ["HealthTech", "CleanTech", "EdTech"],
      clientsHelped: 85,
      bio: "Former VP of Strategy at multiple unicorn startups. Specializing in growth strategy, fundraising, and M&A advisory for health and clean tech companies.",
      rate: "$250/hr",
      availability: "available" as const,
    },
    {
      id: "3",
      name: "Emily Watson",
      title: "CFO Services & Tax Strategy",
      location: "Austin, TX",
      credibilityScore: 88,
      verified: true,
      aiVerified: false,
      yearsExperience: 10,
      specializations: ["CFO Services", "Tax Strategy", "Financial Planning"],
      industries: ["SaaS", "E-Commerce", "FinTech"],
      clientsHelped: 95,
      bio: "Certified public accountant and CFO consultant. Helping startups optimize their financial operations and tax strategies for sustainable growth.",
      rate: "$5,000/mo",
      availability: "limited" as const,
    },
    {
      id: "4",
      name: "David Kumar",
      title: "Fundraising & Investor Relations Expert",
      location: "Boston, MA",
      credibilityScore: 94,
      verified: true,
      aiVerified: true,
      yearsExperience: 18,
      specializations: ["Fundraising Strategy", "Investor Relations", "Due Diligence"],
      industries: ["FinTech", "HealthTech", "AI/ML"],
      clientsHelped: 150,
      bio: "Helped 150+ startups raise over $500M in funding. Former partner at a top-tier VC firm with deep expertise in due diligence and investor relations.",
      rate: "$300/hr",
      availability: "waitlist" as const,
    },
    {
      id: "5",
      name: "Jennifer Lee",
      title: "Financial Modeling & Valuation Specialist",
      location: "Seattle, WA",
      credibilityScore: 90,
      verified: true,
      aiVerified: true,
      yearsExperience: 8,
      specializations: ["Financial Modeling", "Valuation", "Cap Table Mgmt"],
      industries: ["SaaS", "CleanTech", "Blockchain"],
      clientsHelped: 70,
      bio: "Financial modeling expert with background in investment banking. Specializing in startup valuations and complex cap table management.",
      rate: "$175/hr",
      availability: "available" as const,
    },
  ];

  const filteredAdvisors = advisors
    .filter((advisor) => {
      const matchesSearch =
        searchQuery === "" ||
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.specializations.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesIndustry =
        selectedIndustry === "all" ||
        advisor.industries.includes(selectedIndustry);

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        advisor.specializations.includes(selectedSpecialization);

      return matchesSearch && matchesIndustry && matchesSpecialization;
    })
    .sort((a, b) => {
      if (sortBy === "credibility") {
        return b.credibilityScore - a.credibilityScore;
      } else if (sortBy === "experience") {
        return b.yearsExperience - a.yearsExperience;
      } else if (sortBy === "clients") {
        return b.clientsHelped - a.clientsHelped;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Find Financial Advisors</h1>
          <p className="text-muted-foreground">
            Connect with verified financial advisors to help grow your business
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialization, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
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
              </div>

              <div>
                <Select
                  value={selectedSpecialization}
                  onValueChange={setSelectedSpecialization}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    <SelectItem value="Financial Planning">
                      Financial Planning
                    </SelectItem>
                    <SelectItem value="Fundraising">Fundraising Strategy</SelectItem>
                    <SelectItem value="CFO Services">CFO Services</SelectItem>
                    <SelectItem value="Cap Table Mgmt">
                      Cap Table Management
                    </SelectItem>
                    <SelectItem value="Growth Strategy">Growth Strategy</SelectItem>
                    <SelectItem value="M&A Advisory">M&A Advisory</SelectItem>
                    <SelectItem value="Tax Strategy">Tax Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credibility">Highest Credibility</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="clients">Most Clients Helped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAdvisors.length} advisor
            {filteredAdvisors.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <CredibilityBadge type="verified" label="Verified" />
            <span className="text-sm text-muted-foreground">
              All advisors are verified
            </span>
          </div>
        </div>

        {/* Advisor Listings */}
        <div className="space-y-4">
          {filteredAdvisors.map((advisor) => (
            <AdvisorCard key={advisor.id} advisor={advisor} />
          ))}
        </div>

        {/* Empty State */}
        {filteredAdvisors.length === 0 && (
          <Card className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No advisors found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters to find the right advisor
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("all");
                setSelectedSpecialization("all");
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
