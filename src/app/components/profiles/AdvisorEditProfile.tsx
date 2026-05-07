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
import { Progress } from "@/app/components/ui/progress";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  User,
  Award,
  Briefcase,
  GraduationCap,
  FileText,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Linkedin,
  Twitter,
  Globe,
  DollarSign,
  Users,
  CreditCard,
  Lock,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdvisorProfile, updateAdvisorProfile, uploadFile } from "@/app/lib/api";
import { createEmptyAdvisorProfile } from "@/app/lib/advisor-profile";
import type { AdvisorProfile, AdvisorExpertise, AdvisorCertification } from "@/app/types/advisor-profile";

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

export function AdvisorEditProfile() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<AdvisorProfile>(() => createEmptyAdvisorProfile(user));
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

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.token) return;
    try {
      await uploadFile(session.token, file);
      alert("Certificate uploaded successfully!");
    } catch {
      setError("Failed to upload certificate.");
    }
  };

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const response = await getAdvisorProfile(session!.token);
        if (active) setProfile(response.profile);
      } catch {
        // Use empty defaults
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [session?.token]);

  const updateField = <K extends keyof AdvisorProfile>(field: K, value: AdvisorProfile[K]) => {
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

  const updateExpertise = (index: number, field: keyof AdvisorExpertise, value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      ),
    }));
  };

  const addExpertise = () => {
    setProfile((prev) => ({
      ...prev,
      expertiseAreas: [...prev.expertiseAreas, { area: "", level: 50 }],
    }));
  };

  const removeExpertise = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter((_, i) => i !== index),
    }));
  };

  const updateCertification = (index: number, field: keyof AdvisorCertification, value: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addCertification = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", year: "" }],
    }));
  };

  const removeCertification = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!session?.token) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await updateAdvisorProfile(session.token, profile);
      setProfile(response.profile);
      navigate("/advisor/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/advisor/dashboard");
  };

  const userName = user?.fullName ?? "";
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="advisor" userName={userName} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName={userName} />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your advisor profile and credentials</p>
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
              <CredibilityBadge type="verified" label="Expert Verified" />
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-medium">{initials}</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="advisor-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("advisor-photo-upload")?.click()} disabled={photoUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {photoUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Financial Advisor, CFO Consultant"
                  value={profile.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Professional Website</Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, expertise, and how you help startups..."
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={5}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative mt-2">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      value={profile.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/yourname"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <div className="relative mt-2">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      value={profile.twitter}
                      onChange={(e) => updateField("twitter", e.target.value)}
                      placeholder="@yourhandle"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Professional Background */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Professional Background</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years-experience">Years of Experience *</Label>
                  <Input
                    id="years-experience"
                    type="number"
                    value={profile.yearsExperience}
                    onChange={(e) => updateField("yearsExperience", e.target.value)}
                    placeholder="15"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="clients-helped">Startups/Clients Helped</Label>
                  <Input
                    id="clients-helped"
                    type="number"
                    value={profile.clientsHelped}
                    onChange={(e) => updateField("clientsHelped", e.target.value)}
                    placeholder="100"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialization">Primary Specialization *</Label>
                <Select value={profile.specialization} onValueChange={(val) => updateField("specialization", val)}>
                  <SelectTrigger id="specialization" className="mt-2">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial-planning">Financial Planning</SelectItem>
                    <SelectItem value="fundraising">Fundraising Strategy</SelectItem>
                    <SelectItem value="cfo-services">CFO Services</SelectItem>
                    <SelectItem value="cap-table">Cap Table Management</SelectItem>
                    <SelectItem value="m-and-a">M&A Advisory</SelectItem>
                    <SelectItem value="tax-strategy">Tax Strategy</SelectItem>
                    <SelectItem value="growth-strategy">Growth Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="previous-roles">Previous Roles & Companies</Label>
                <Textarea
                  id="previous-roles"
                  value={profile.previousRoles}
                  onChange={(e) => updateField("previousRoles", e.target.value)}
                  placeholder="List your previous roles, companies, and notable achievements..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Expertise Areas */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Expertise Areas</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addExpertise}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expertise
              </Button>
            </div>

            <div className="space-y-4">
              {profile.expertiseAreas.map((expertise, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Expertise Area {index + 1}</h3>
                    {profile.expertiseAreas.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeExpertise(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Area of Expertise *</Label>
                    <Input
                      placeholder="e.g., Financial Planning, Fundraising"
                      value={expertise.area}
                      onChange={(e) => updateExpertise(index, "area", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Proficiency Level</Label>
                      <span className="text-sm text-muted-foreground">{expertise.level}%</span>
                    </div>
                    <Progress value={expertise.level} className="h-2" />
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={expertise.level}
                      onChange={(e) => updateExpertise(index, "level", Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Certifications & Education</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addCertification}>
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-4">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Certification {index + 1}</h3>
                    {profile.certifications.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Certification Name *</Label>
                    <Input
                      placeholder="e.g., Certified Financial Planner (CFP)"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, "name", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Issuing Organization *</Label>
                      <Input
                        placeholder="e.g., CFP Board"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Year Obtained</Label>
                      <Input
                        type="number"
                        placeholder="2023"
                        value={cert.year}
                        onChange={(e) => updateCertification(index, "year", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Verification Document</Label>
                    <input
                      type="file"
                      id={`cert-upload-${index}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleCertUpload}
                    />
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById(`cert-upload-${index}`)?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Certificate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Industry Focus */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Industry Focus</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Industries You Specialize In *</Label>
                <p className="text-sm text-muted-foreground mb-4">Select the industries where you have the most expertise</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => (
                    <Badge
                      key={industry}
                      variant={profile.industries.includes(industry) ? "default" : "outline"}
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
                <Label htmlFor="stage-preference">Preferred Startup Stage</Label>
                <Select value={profile.preferredStage} onValueChange={(val) => updateField("preferredStage", val)}>
                  <SelectTrigger id="stage-preference" className="mt-2">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="growth">Growth Stage</SelectItem>
                    <SelectItem value="all">All Stages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Service Details */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Service Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engagement-type">Engagement Type</Label>
                  <Select value={profile.engagementType} onValueChange={(val) => updateField("engagementType", val)}>
                    <SelectTrigger id="engagement-type" className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly Consulting</SelectItem>
                      <SelectItem value="retainer">Monthly Retainer</SelectItem>
                      <SelectItem value="project">Project-Based</SelectItem>
                      <SelectItem value="equity">Equity Advisory</SelectItem>
                      <SelectItem value="both">Flexible/Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availability">Current Availability</Label>
                  <Select value={profile.availability} onValueChange={(val) => updateField("availability", val)}>
                    <SelectTrigger id="availability" className="mt-2">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available Now</SelectItem>
                      <SelectItem value="limited">Limited Capacity</SelectItem>
                      <SelectItem value="waitlist">Waitlist Only</SelectItem>
                      <SelectItem value="not-accepting">Not Accepting Clients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="typical-rate">Typical Rate (Optional)</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="typical-rate"
                    value={profile.typicalRate}
                    onChange={(e) => updateField("typicalRate", e.target.value)}
                    placeholder="e.g., $200/hour or $5,000/month"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="services-offered">Services Offered</Label>
                <Textarea
                  id="services-offered"
                  value={profile.servicesOffered}
                  onChange={(e) => updateField("servicesOffered", e.target.value)}
                  placeholder="Describe the specific services you provide to startups..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Group Management & Monetization */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Group Management & Monetization</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Enable Payment Processing
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Set up payment processing to create paid groups and collect subscription fees
                    </div>
                  </div>
                  <Switch
                    checked={profile.enablePaymentProcessing}
                    onCheckedChange={(val) => updateField("enablePaymentProcessing", val)}
                  />
                </div>

                {profile.enablePaymentProcessing && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="payment-email">Payment Email (Stripe/PayPal)</Label>
                      <Input
                        id="payment-email"
                        type="email"
                        value={profile.paymentEmail}
                        onChange={(e) => updateField("paymentEmail", e.target.value)}
                        placeholder="payments@example.com"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-id">Tax ID / Business Registration</Label>
                      <Input
                        id="tax-id"
                        value={profile.taxId}
                        onChange={(e) => updateField("taxId", e.target.value)}
                        placeholder="XX-XXXXXXX"
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Default Group Type</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose the default monetization model for new groups
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("defaultGroupType", "free")}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        profile.defaultGroupType === "free"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-accent" />
                        <span className="font-medium">Free Groups</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Open access for all users</p>
                    </button>
                    <button
                      onClick={() => updateField("defaultGroupType", "paid")}
                      disabled={!profile.enablePaymentProcessing}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        profile.defaultGroupType === "paid"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:bg-muted"
                      } ${!profile.enablePaymentProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5 text-accent" />
                        <span className="font-medium">Paid Groups</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Subscription-based premium content</p>
                      {!profile.enablePaymentProcessing && (
                        <p className="text-xs text-amber-600 mt-2">Enable payment processing first</p>
                      )}
                    </button>
                  </div>
                </div>

                {profile.defaultGroupType === "paid" && profile.enablePaymentProcessing && (
                  <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg space-y-4">
                    <div>
                      <Label>Default One-Time Joining Fee (Optional)</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          value={profile.defaultJoiningFee}
                          onChange={(e) => updateField("defaultJoiningFee", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Default Monthly Subscription Fee</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="49"
                          value={profile.defaultMonthlyFee}
                          onChange={(e) => updateField("defaultMonthlyFee", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Group Management Preferences</h3>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Auto-Approve Members</div>
                    <div className="text-sm text-muted-foreground">Automatically approve join requests for free groups</div>
                  </div>
                  <Switch
                    checked={profile.autoApproveMembers}
                    onCheckedChange={(val) => updateField("autoApproveMembers", val)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Allow Group Discovery</div>
                    <div className="text-sm text-muted-foreground">Let startups and investors discover your groups in search</div>
                  </div>
                  <Switch
                    checked={profile.allowGroupDiscovery}
                    onCheckedChange={(val) => updateField("allowGroupDiscovery", val)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
              <p className="text-sm text-muted-foreground">Control how your profile appears to others</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Public Profile</div>
                  <div className="text-sm text-muted-foreground">Make your profile visible to all startups and investors</div>
                </div>
                <Switch checked={profile.isPublic} onCheckedChange={(val) => updateField("isPublic", val)} />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Contact Information</div>
                  <div className="text-sm text-muted-foreground">Display email and phone on your profile</div>
                </div>
                <Switch checked={profile.showContactInfo} onCheckedChange={(val) => updateField("showContactInfo", val)} />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Allow Connection Requests</div>
                  <div className="text-sm text-muted-foreground">Let startups send you consultation requests</div>
                </div>
                <Switch checked={profile.allowConnectionRequests} onCheckedChange={(val) => updateField("allowConnectionRequests", val)} />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Client Testimonials</div>
                  <div className="text-sm text-muted-foreground">Display reviews and testimonials on your profile</div>
                </div>
                <Switch checked={profile.showTestimonials} onCheckedChange={(val) => updateField("showTestimonials", val)} />
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
