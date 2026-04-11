import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Building2, MapPin, Users, Calendar, Globe, Linkedin, Twitter, Mail, Edit, TrendingUp, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";

export function StartupProfile() {
  const startupData = {
    name: "TechVenture AI",
    tagline: "Building the future of AI-powered business intelligence",
    logo: "TA",
    location: "San Francisco, CA",
    founded: "2024",
    teamSize: "12-15",
    website: "https://techventure.ai",
    linkedin: "https://linkedin.com/company/techventure-ai",
    twitter: "@techventureai",
    email: "hello@techventure.ai",
    credibilityScore: 85,
    description: "TechVenture AI is revolutionizing how businesses make data-driven decisions through advanced artificial intelligence and machine learning solutions. Our platform helps companies analyze market trends, predict customer behavior, and optimize operations in real-time.",
    industry: "Artificial Intelligence",
    stage: "Seed",
    fundingGoal: "$2M",
    raised: "$500K",
    categories: ["AI/ML", "SaaS", "B2B", "Analytics"],
    metrics: [
      { label: "MRR", value: "$45K", trend: "+25%" },
      { label: "Active Users", value: "1,250", trend: "+40%" },
      { label: "Team Size", value: "15", trend: "+3" },
      { label: "Markets", value: "3", trend: "+1" },
    ],
    highlights: [
      "Featured in TechCrunch Disrupt 2025",
      "Y Combinator S25 Graduate",
      "AI Innovation Award Winner",
      "Partnership with Fortune 500 Companies",
    ],
    team: [
      { name: "Alex Chen", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Sarah Johnson", role: "CTO & Co-founder", linkedin: "#" },
      { name: "Michael Zhang", role: "Head of Product", linkedin: "#" },
    ],
  };

  return (
    <DashboardLayout userRole="startup" userName="Alex Chen">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {startupData.logo}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{startupData.name}</h1>
                    <CredibilityBadge score={startupData.credibilityScore} />
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{startupData.tagline}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {startupData.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Founded {startupData.founded}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {startupData.teamSize} employees
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
              {startupData.categories.map((category) => (
                <Badge key={category} variant="secondary" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a href={startupData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                <Globe className="h-4 w-4" />
                Website
              </a>
              <a href={startupData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a href={`https://twitter.com/${startupData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                <Twitter className="h-4 w-4" />
                {startupData.twitter}
              </a>
              <a href={`mailto:${startupData.email}`} className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline">
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{startupData.description}</p>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {startupData.metrics.map((metric) => (
                    <div key={metric.label} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                        <span className="text-sm text-emerald-500 dark:text-emerald-400">{metric.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {startupData.team.map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                        </div>
                      </div>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Info */}
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
                    {startupData.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Goal</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{startupData.fundingGoal}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Raised</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-900 dark:text-white font-medium">{startupData.raised}</span>
                      <span className="text-slate-500 dark:text-slate-400">25%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-500" />
                  Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {startupData.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
