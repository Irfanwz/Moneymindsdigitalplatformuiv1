import { useState } from "react";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { Badge } from "@/app/components/ui/badge";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  User,
  Shield,
  TrendingUp,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
  Linkedin,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InvestorEditProfile() {
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(true);
  const [anonymousBrowsing, setAnonymousBrowsing] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState([
    "FinTech",
    "HealthTech",
    "AI/ML",
  ]);

  const industries = [
    "FinTech",
    "HealthTech",
    "CleanTech",
    "EdTech",
    "AI/ML",
    "SaaS",
    "E-Commerce",
    "Blockchain",
  ];

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const handleSave = () => {
    // Handle save logic here
    navigate("/investor/dashboard");
  };

  const handleCancel = () => {
    navigate("/investor/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="investor" userName="Alex Morgan" />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your investor profile and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <CredibilityBadge type="verified" label="Verified" />
            </div>

            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl font-medium">AM</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name *</Label>
                  <Input
                    id="first-name"
                    placeholder="Alex"
                    defaultValue="Alex"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="last-name">Last Name *</Label>
                  <Input
                    id="last-name"
                    placeholder="Morgan"
                    defaultValue="Morgan"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex.morgan@example.com"
                    defaultValue="alex.morgan@example.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  defaultValue="New York, NY"
                  className="mt-2"
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, investment experience, and what you're looking for..."
                  defaultValue="Angel investor with 15+ years of experience in early-stage technology companies. Focus on B2B SaaS and FinTech."
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This will only be visible if you make your profile public
                </p>
              </div>

              {/* Social Links */}
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <div className="relative mt-2">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    placeholder="linkedin.com/in/alexmorgan"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Investment Profile */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Investment Profile</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investor-type">Investor Type *</Label>
                  <Select defaultValue="angel">
                    <SelectTrigger id="investor-type" className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="angel">Angel Investor</SelectItem>
                      <SelectItem value="vc">Venture Capital</SelectItem>
                      <SelectItem value="pe">Private Equity</SelectItem>
                      <SelectItem value="corporate">
                        Corporate Investor
                      </SelectItem>
                      <SelectItem value="family-office">
                        Family Office
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment-stage">
                    Preferred Investment Stage
                  </Label>
                  <Select defaultValue="seed">
                    <SelectTrigger id="investment-stage" className="mt-2">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="growth">Growth Stage</SelectItem>
                      <SelectItem value="all">All Stages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-investment">
                    Typical Investment Range (Min)
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min-investment"
                      type="text"
                      placeholder="25,000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-investment">
                    Typical Investment Range (Max)
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max-investment"
                      type="text"
                      placeholder="250,000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio-size">
                  Current Portfolio Size (Optional)
                </Label>
                <Select>
                  <SelectTrigger id="portfolio-size" className="mt-2">
                    <SelectValue placeholder="Select portfolio size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 companies</SelectItem>
                    <SelectItem value="6-10">6-10 companies</SelectItem>
                    <SelectItem value="11-25">11-25 companies</SelectItem>
                    <SelectItem value="26-50">26-50 companies</SelectItem>
                    <SelectItem value="50+">50+ companies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="investment-thesis">Investment Thesis</Label>
                <Textarea
                  id="investment-thesis"
                  placeholder="Describe your investment philosophy, areas of expertise, and what you look for in startups..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Industry Preferences */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Industry Preferences</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Select Industries of Interest *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose industries you're interested in investing in
                </p>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Badge
                      key={industry}
                      variant={
                        selectedIndustries.includes(industry)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-colors ${
                        selectedIndustries.includes(industry)
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "hover:bg-accent/10"
                      }`}
                      onClick={() => toggleIndustry(industry)}
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="other-interests">Other Interests</Label>
                <Input
                  id="other-interests"
                  placeholder="Specify other industries or niches..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="geography">Geographic Focus</Label>
                <Select defaultValue="north-america">
                  <SelectTrigger id="geography" className="mt-2">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="latam">Latin America</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Privacy & Visibility Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">
                Privacy & Visibility Settings
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="font-medium text-accent mb-1">
                      Private by Default
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Investor profiles are private by default. Control who can
                      see your information and activity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {isPrivate ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Private Profile
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hide your profile from public searches and startup
                    discovery
                  </div>
                </div>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Anonymous Browsing</div>
                  <div className="text-sm text-muted-foreground">
                    Browse startup profiles without showing your profile views
                  </div>
                </div>
                <Switch
                  checked={anonymousBrowsing}
                  onCheckedChange={setAnonymousBrowsing}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Investment Preferences</div>
                  <div className="text-sm text-muted-foreground">
                    Display your industry and stage preferences to matched
                    startups
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Allow Connection Requests</div>
                  <div className="text-sm text-muted-foreground">
                    Let verified startups send you connection requests
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">
                    Show Contact Information to Connections
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Share email and phone with startups you connect with
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Notification Preferences
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose what updates you'd like to receive
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">New Startup Matches</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when startups match your preferences
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Weekly Digest</div>
                  <div className="text-sm text-muted-foreground">
                    Receive a weekly summary of new opportunities
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Funding Round Announcements</div>
                  <div className="text-sm text-muted-foreground">
                    Updates on funding rounds in your preferred industries
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
