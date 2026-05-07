import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getInvestorProfile, updateInvestorProfile, uploadFile } from "@/app/lib/api";
import { createEmptyInvestorProfile } from "@/app/lib/investor-profile";
import type { InvestorProfile } from "@/app/types/investor-profile";

const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "CleanTech",
  "EdTech",
  "AI/ML",
  "SaaS",
  "E-Commerce",
  "Blockchain",
];

export function InvestorEditProfile() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile>(() => createEmptyInvestorProfile(user));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.token) return;
    setPhotoUploading(true);
    try {
      const result = await uploadFile(session.token, file);
      setPhotoUrl(result.url);
    } catch {
      setError("Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  useEffect(() => {
    if (!session?.token) return;

    let active = true;

    async function load() {
      try {
        const response = await getInvestorProfile(session!.token);
        if (active) setProfile(response.profile);
      } catch {
        // Use empty profile defaults
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [session?.token]);

  const updateField = <K extends keyof InvestorProfile>(field: K, value: InvestorProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleIndustry = (industry: string) => {
    setProfile((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  };

  const handleSave = async () => {
    if (!session?.token) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateInvestorProfile(session.token, profile);
      setProfile(response.profile);
      navigate("/investor/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/investor/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="investor" userName={user?.fullName ?? ""} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="investor" userName={user?.fullName ?? ""} />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your investor profile and preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">
            {error}
          </div>
        )}

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
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-medium">
                        {user?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() ?? ""}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("photo-upload")?.click()} disabled={photoUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {photoUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>

              {/* Firm & Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firm-name">Firm Name</Label>
                  <Input
                    id="firm-name"
                    placeholder="Venture Capital Partners"
                    value={profile.firmName}
                    onChange={(e) => updateField("firmName", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title / Role</Label>
                  <Input
                    id="title"
                    placeholder="Partner"
                    value={profile.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex.morgan@example.com"
                    value={profile.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://vcpartners.com"
                    value={profile.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, investment experience, and what you're looking for..."
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This will only be visible if you make your profile public
                </p>
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <div className="relative mt-2">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/alexmorgan"
                      value={profile.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="@alexmorgan"
                    value={profile.twitter}
                    onChange={(e) => updateField("twitter", e.target.value)}
                    className="mt-2"
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
                  <Select
                    value={profile.investorType}
                    onValueChange={(val) => updateField("investorType", val)}
                  >
                    <SelectTrigger id="investor-type" className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="angel">Angel Investor</SelectItem>
                      <SelectItem value="vc">Venture Capital</SelectItem>
                      <SelectItem value="pe">Private Equity</SelectItem>
                      <SelectItem value="corporate">Corporate Investor</SelectItem>
                      <SelectItem value="family-office">Family Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment-stage">Preferred Investment Stage</Label>
                  <Select
                    value={profile.preferredStage}
                    onValueChange={(val) => updateField("preferredStage", val)}
                  >
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
                  <Label htmlFor="min-investment">Typical Investment Range (Min)</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min-investment"
                      type="text"
                      placeholder="25,000"
                      value={profile.minInvestment}
                      onChange={(e) => updateField("minInvestment", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-investment">Typical Investment Range (Max)</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max-investment"
                      type="text"
                      placeholder="250,000"
                      value={profile.maxInvestment}
                      onChange={(e) => updateField("maxInvestment", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio-size">Current Portfolio Size (Optional)</Label>
                <Select
                  value={profile.portfolioSize}
                  onValueChange={(val) => updateField("portfolioSize", val)}
                >
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
                  value={profile.investmentThesis}
                  onChange={(e) => updateField("investmentThesis", e.target.value)}
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
                  {INDUSTRIES.map((industry) => (
                    <Badge
                      key={industry}
                      variant={
                        profile.industries.includes(industry)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-colors ${
                        profile.industries.includes(industry)
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
                  value={profile.otherInterests}
                  onChange={(e) => updateField("otherInterests", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="geography">Geographic Focus</Label>
                <Select
                  value={profile.geographicFocus}
                  onValueChange={(val) => updateField("geographicFocus", val)}
                >
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
              <h2 className="text-xl font-semibold">Privacy & Visibility Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="font-medium text-accent mb-1">Private by Default</div>
                    <p className="text-sm text-muted-foreground">
                      Investor profiles are private by default. Control who can see your information and activity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {profile.isPrivate ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Private Profile
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hide your profile from public searches and startup discovery
                  </div>
                </div>
                <Switch
                  checked={profile.isPrivate}
                  onCheckedChange={(val) => updateField("isPrivate", val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Anonymous Browsing</div>
                  <div className="text-sm text-muted-foreground">
                    Browse startup profiles without showing your profile views
                  </div>
                </div>
                <Switch
                  checked={profile.anonymousBrowsing}
                  onCheckedChange={(val) => updateField("anonymousBrowsing", val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Investment Preferences</div>
                  <div className="text-sm text-muted-foreground">
                    Display your industry and stage preferences to matched startups
                  </div>
                </div>
                <Switch
                  checked={profile.showInvestmentPreferences}
                  onCheckedChange={(val) => updateField("showInvestmentPreferences", val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Allow Connection Requests</div>
                  <div className="text-sm text-muted-foreground">
                    Let verified startups send you connection requests
                  </div>
                </div>
                <Switch
                  checked={profile.allowConnectionRequests}
                  onCheckedChange={(val) => updateField("allowConnectionRequests", val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Contact Information to Connections</div>
                  <div className="text-sm text-muted-foreground">
                    Share email and phone with startups you connect with
                  </div>
                </div>
                <Switch
                  checked={profile.showContactInfo}
                  onCheckedChange={(val) => updateField("showContactInfo", val)}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
