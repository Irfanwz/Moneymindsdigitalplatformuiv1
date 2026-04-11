import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Users, MapPin, Briefcase, Award, Edit, Target, Star, Globe, Linkedin, Twitter, Mail, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function AdvisorProfile() {
  const advisorData = {
    name: "Dr. James Mitchell",
    title: "Serial Entrepreneur & Startup Advisor",
    logo: "JM",
    location: "Austin, TX",
    experience: "20+ years",
    specialization: "Go-to-Market & Sales Strategy",
    website: "https://jamesmitchell.com",
    linkedin: "https://linkedin.com/in/james-mitchell",
    twitter: "@jamesmitchell",
    email: "james@advisors.com",
    credibilityScore: 88,
    bio: "Serial entrepreneur with 3 successful exits totaling $250M+. Currently advising 12 high-growth startups on go-to-market strategy, sales operations, and fundraising. Former VP of Sales at Salesforce, where I helped scale ARR from $100M to $1B.",
    expertise: ["Go-to-Market", "Sales Strategy", "Fundraising", "Product-Market Fit", "Team Building"],
    industries: ["SaaS", "FinTech", "Enterprise Software", "B2B"],
    hourlyRate: "$500/hr",
    availability: "10 hours/month",
    startups: 12,
    totalHours: 850,
    rating: 4.9,
    metrics: [
      { label: "Active Startups", value: "12", trend: "+2" },
      { label: "Advisory Hours", value: "850", trend: "+120" },
      { label: "Avg Rating", value: "4.9", trend: "★" },
      { label: "Success Rate", value: "78%", trend: "+5%" },
    ],
    achievements: [
      "Built and sold 3 companies (total: $250M+)",
      "Helped 15+ startups raise Series A-C",
      "TechCrunch Top Advisor 2025",
      "Guest Lecturer at Stanford GSB",
      "Author of 'Zero to Revenue'",
    ],
    testimonials: [
      {
        name: "Alex Chen",
        company: "TechVenture AI",
        role: "CEO",
        text: "James helped us close our seed round in 6 weeks. His go-to-market playbook was invaluable.",
        rating: 5,
      },
      {
        name: "Maria Rodriguez",
        company: "CloudSync",
        role: "Founder",
        text: "Best advisor we've worked with. Practical advice that actually works.",
        rating: 5,
      },
    ],
    publications: [
      "The Modern GTM Playbook",
      "Scaling Sales Teams: 0 to 100",
      "Fundraising in 2025: A Founder's Guide",
    ],
  };

  return (
    <DashboardLayout userRole="advisor" userName={advisorData.name}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {advisorData.logo}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{advisorData.name}</h1>
                    <CredibilityBadge score={advisorData.credibilityScore} />
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">{advisorData.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {advisorData.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {advisorData.experience} experience
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {advisorData.rating} rating
                    </div>
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

            <div className="flex flex-wrap gap-2 mb-6">
              {advisorData.expertise.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a href={advisorData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                <Globe className="h-4 w-4" />
                Website
              </a>
              <a href={advisorData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a href={`https://twitter.com/${advisorData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                <Twitter className="h-4 w-4" />
                {advisorData.twitter}
              </a>
              <a href={`mailto:${advisorData.email}`} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
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
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{advisorData.bio}</p>
              </CardContent>
            </Card>

            {/* Advisory Metrics */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  Advisory Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {advisorData.metrics.map((metric) => (
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

            {/* Testimonials */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-emerald-500" />
                  Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advisorData.testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-3 italic">"{testimonial.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-medium">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}, {testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publications */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  Publications & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advisorData.publications.map((publication, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {publication}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hourly Rate</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{advisorData.hourlyRate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Available</p>
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {advisorData.availability}
                  </Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0">
                  Book Session
                </Button>
              </CardContent>
            </Card>

            {/* Specialization */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-slate-900 dark:text-white">{advisorData.specialization}</p>
              </CardContent>
            </Card>

            {/* Industries */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Industries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {advisorData.industries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advisorData.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
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
