import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { TrendingUp, MapPin, Briefcase, DollarSign, Edit, Target, Award, Building2, Globe, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function InvestorProfile() {
  const investorData = {
    name: "Sarah Thompson",
    title: "Partner at Venture Capital Partners",
    logo: "ST",
    location: "New York, NY",
    experience: "12+ years",
    firm: "Venture Capital Partners",
    website: "https://vcpartners.com",
    linkedin: "https://linkedin.com/in/sarah-thompson",
    twitter: "@sarahvc",
    email: "sarah@vcpartners.com",
    credibilityScore: 92,
    bio: "Experienced venture capitalist focused on early-stage AI and SaaS startups. Former operator with exits at Google and Salesforce. Passionate about backing exceptional founders solving hard problems.",
    investmentFocus: ["AI/ML", "SaaS", "FinTech", "HealthTech"],
    checkSize: "$500K - $5M",
    stage: "Seed to Series A",
    portfolioCount: 28,
    activeInvestments: 15,
    exits: 5,
    metrics: [
      { label: "Portfolio Companies", value: "28", trend: "+3" },
      { label: "Active Investments", value: "15", trend: "+2" },
      { label: "Total Deployed", value: "$45M", trend: "+$8M" },
      { label: "Successful Exits", value: "5", trend: "+1" },
    ],
    portfolioHighlights: [
      { name: "DataSync AI", outcome: "Acquired by Microsoft", return: "8.5x" },
      { name: "CloudFlow", outcome: "Series C, $50M", return: "4.2x" },
      { name: "HealthTech Pro", outcome: "IPO 2024", return: "12.1x" },
    ],
    expertise: [
      "Go-to-Market Strategy",
      "Product Development",
      "Fundraising",
      "Team Building",
      "Sales & Distribution",
    ],
    achievements: [
      "Forbes 30 Under 30 in Venture Capital",
      "TechCrunch Top VC 2025",
      "Keynote Speaker at Web Summit",
      "Board Member at 8 Portfolio Companies",
    ],
  };

  return (
    <DashboardLayout userRole="investor" userName={investorData.name}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {investorData.logo}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{investorData.name}</h1>
                    <CredibilityBadge score={investorData.credibilityScore} />
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{investorData.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {investorData.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {investorData.experience} in VC
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {investorData.firm}
                    </div>
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

            <div className="flex flex-wrap gap-2 mb-6">
              {investorData.investmentFocus.map((focus) => (
                <Badge key={focus} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {focus}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a href={investorData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                <Globe className="h-4 w-4" />
                Website
              </a>
              <a href={investorData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a href={`https://twitter.com/${investorData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
                <Twitter className="h-4 w-4" />
                {investorData.twitter}
              </a>
              <a href={`mailto:${investorData.email}`} className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline">
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
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{investorData.bio}</p>
              </CardContent>
            </Card>

            {/* Portfolio Metrics */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {investorData.metrics.map((metric) => (
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

            {/* Notable Investments */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Notable Investments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investorData.portfolioHighlights.map((company) => (
                    <div key={company.name} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{company.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{company.outcome}</p>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          {company.return}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  <p className="font-medium text-slate-900 dark:text-white">{investorData.checkSize}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Stage</p>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {investorData.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {investorData.investmentFocus.map((focus) => (
                      <Badge key={focus} variant="outline" className="text-xs">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expertise */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {investorData.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {investorData.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                      <span>{achievement}</span>
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
