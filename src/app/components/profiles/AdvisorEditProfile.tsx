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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdvisorEditProfile() {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);

  // Certifications structure
  const [certifications, setCertifications] = useState([
    { name: "Certified Financial Planner (CFP)", issuer: "CFP Board", year: "2018" },
    { name: "Chartered Financial Analyst (CFA)", issuer: "CFA Institute", year: "2020" },
  ]);

  // Expertise areas
  const [expertiseAreas, setExpertiseAreas] = useState([
    { area: "Financial Planning", level: 95 },
    { area: "Fundraising Strategy", level: 88 },
    { area: "Cap Table Management", level: 92 },
  ]);

  // Group monetization settings
  const [defaultGroupType, setDefaultGroupType] = useState<"free" | "paid">("free");
  const [defaultJoiningFee, setDefaultJoiningFee] = useState("");
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState("");
  const [autoApproveMembers, setAutoApproveMembers] = useState(true);
  const [allowGroupDiscovery, setAllowGroupDiscovery] = useState(true);
  const [enablePaymentProcessing, setEnablePaymentProcessing] = useState(false);

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

  const [selectedIndustries, setSelectedIndustries] = useState([
    "FinTech",
    "SaaS",
  ]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { name: "", issuer: "", year: "" },
    ]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addExpertise = () => {
    setExpertiseAreas([...expertiseAreas, { area: "", level: 50 }]);
  };

  const removeExpertise = (index: number) => {
    setExpertiseAreas(expertiseAreas.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Handle save logic here
    navigate("/advisor/dashboard");
  };

  const handleCancel = () => {
    navigate("/advisor/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="advisor" userName="Dr. Sarah Chen" />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your advisor profile and credentials
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
              <CredibilityBadge type="verified" label="Expert Verified" />
            </div>

            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl font-medium">SC</span>
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
                    placeholder="Sarah"
                    defaultValue="Sarah"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="last-name">Last Name *</Label>
                  <Input
                    id="last-name"
                    placeholder="Chen"
                    defaultValue="Chen"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Professional Title */}
              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Financial Advisor, CFO Consultant"
                  defaultValue="Senior Financial Advisor & CFO Consultant"
                  className="mt-2"
                />
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah.chen@example.com"
                    defaultValue="sarah.chen@example.com"
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
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  defaultValue="San Francisco, CA"
                  className="mt-2"
                />
              </div>

              {/* Professional Bio */}
              <div>
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, expertise, and how you help startups..."
                  defaultValue="Financial advisor with 15+ years of experience helping startups navigate fundraising, financial planning, and cap table management. Previously served as CFO at two successful FinTech companies."
                  rows={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  500 characters recommended
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">Professional Website</Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative mt-2">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        placeholder="linkedin.com/in/sarahchen"
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
                        placeholder="@sarahchen"
                        className="pl-10"
                      />
                    </div>
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
                    placeholder="15"
                    defaultValue="15"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="clients-helped">
                    Startups/Clients Helped
                  </Label>
                  <Input
                    id="clients-helped"
                    type="number"
                    placeholder="100"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialization">Primary Specialization *</Label>
                <Select defaultValue="financial-planning">
                  <SelectTrigger id="specialization" className="mt-2">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial-planning">
                      Financial Planning
                    </SelectItem>
                    <SelectItem value="fundraising">
                      Fundraising Strategy
                    </SelectItem>
                    <SelectItem value="cfo-services">CFO Services</SelectItem>
                    <SelectItem value="cap-table">
                      Cap Table Management
                    </SelectItem>
                    <SelectItem value="m-and-a">M&A Advisory</SelectItem>
                    <SelectItem value="tax-strategy">Tax Strategy</SelectItem>
                    <SelectItem value="growth-strategy">
                      Growth Strategy
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="previous-roles">
                  Previous Roles & Companies
                </Label>
                <Textarea
                  id="previous-roles"
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
              {expertiseAreas.map((expertise, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      Expertise Area {index + 1}
                    </h3>
                    {expertiseAreas.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpertise(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`expertise-area-${index}`}>
                      Area of Expertise *
                    </Label>
                    <Input
                      id={`expertise-area-${index}`}
                      placeholder="e.g., Financial Planning, Fundraising"
                      defaultValue={expertise.area}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor={`expertise-level-${index}`}>
                        Proficiency Level
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {expertise.level}%
                      </span>
                    </div>
                    <Progress value={expertise.level} className="h-2" />
                    <Input
                      id={`expertise-level-${index}`}
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={expertise.level}
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications & Education */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">
                  Certifications & Education
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={addCertification}>
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Certification {index + 1}</h3>
                    {certifications.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`cert-name-${index}`}>
                      Certification Name *
                    </Label>
                    <Input
                      id={`cert-name-${index}`}
                      placeholder="e.g., Certified Financial Planner (CFP)"
                      defaultValue={cert.name}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`cert-issuer-${index}`}>
                        Issuing Organization *
                      </Label>
                      <Input
                        id={`cert-issuer-${index}`}
                        placeholder="e.g., CFP Board"
                        defaultValue={cert.issuer}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`cert-year-${index}`}>Year Obtained</Label>
                      <Input
                        id={`cert-year-${index}`}
                        type="number"
                        placeholder="2023"
                        defaultValue={cert.year}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`cert-doc-${index}`}>
                      Verification Document
                    </Label>
                    <Button variant="outline" size="sm" className="mt-2">
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
                <p className="text-sm text-muted-foreground mb-4">
                  Select the industries where you have the most expertise
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
                <Label htmlFor="stage-preference">Preferred Startup Stage</Label>
                <Select defaultValue="all">
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
                  <Select defaultValue="both">
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
                  <Select defaultValue="limited">
                    <SelectTrigger id="availability" className="mt-2">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        Available Now
                      </SelectItem>
                      <SelectItem value="limited">Limited Capacity</SelectItem>
                      <SelectItem value="waitlist">Waitlist Only</SelectItem>
                      <SelectItem value="not-accepting">
                        Not Accepting Clients
                      </SelectItem>
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
                    placeholder="e.g., $200/hour or $5,000/month"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This helps startups understand if your services fit their
                  budget
                </p>
              </div>

              <div>
                <Label htmlFor="services-offered">Services Offered</Label>
                <Textarea
                  id="services-offered"
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
              {/* Payment Processing Setup */}
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
                    checked={enablePaymentProcessing}
                    onCheckedChange={setEnablePaymentProcessing}
                  />
                </div>

                {enablePaymentProcessing && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="payment-email">Payment Email (Stripe/PayPal)</Label>
                      <Input
                        id="payment-email"
                        type="email"
                        placeholder="payments@example.com"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Connect your Stripe or PayPal account to receive payments
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tax-id">Tax ID / Business Registration</Label>
                      <Input
                        id="tax-id"
                        placeholder="XX-XXXXXXX"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Required for payment processing compliance
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Default Group Settings */}
              <div className="space-y-4">
                <div>
                  <Label>Default Group Type</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose the default monetization model for new groups (you can customize each group individually)
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setDefaultGroupType("free")}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        defaultGroupType === "free"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-accent" />
                        <span className="font-medium">Free Groups</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Open access for all users to join
                      </p>
                    </button>

                    <button
                      onClick={() => setDefaultGroupType("paid")}
                      disabled={!enablePaymentProcessing}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        defaultGroupType === "paid"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:bg-muted"
                      } ${!enablePaymentProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5 text-accent" />
                        <span className="font-medium">Paid Groups</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Subscription-based premium content
                      </p>
                      {!enablePaymentProcessing && (
                        <p className="text-xs text-amber-600 mt-2">
                          Enable payment processing first
                        </p>
                      )}
                    </button>
                  </div>
                </div>

                {/* Pricing Defaults (shown when paid is selected) */}
                {defaultGroupType === "paid" && enablePaymentProcessing && (
                  <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg space-y-4">
                    <div>
                      <Label htmlFor="default-joining-fee">Default One-Time Joining Fee (Optional)</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="default-joining-fee"
                          type="number"
                          placeholder="0"
                          value={defaultJoiningFee}
                          onChange={(e) => setDefaultJoiningFee(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        One-time fee charged when users join your paid groups
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="default-monthly-fee">Default Monthly Subscription Fee</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="default-monthly-fee"
                          type="number"
                          placeholder="49"
                          value={defaultMonthlyFee}
                          onChange={(e) => setDefaultMonthlyFee(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recurring monthly fee for group membership
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-background rounded border">
                      <div className="text-sm">
                        <span className="font-medium">Pricing Examples:</span>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Premium Signals: $99/month</li>
                          <li>• Basic Advisory: $29/month</li>
                          <li>• Exclusive Insights: $199/month + $50 joining fee</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Group Management Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium">Group Management Preferences</h3>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Auto-Approve Members</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically approve join requests for free groups
                    </div>
                  </div>
                  <Switch
                    checked={autoApproveMembers}
                    onCheckedChange={setAutoApproveMembers}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Allow Group Discovery</div>
                    <div className="text-sm text-muted-foreground">
                      Let startups and investors discover your groups in search
                    </div>
                  </div>
                  <Switch
                    checked={allowGroupDiscovery}
                    onCheckedChange={setAllowGroupDiscovery}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-accent mb-1">
                      Group Features
                    </div>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Create unlimited free or paid groups</li>
                      <li>• Set custom joining and monthly fees for each group</li>
                      <li>• Post investment signals and insights to your members</li>
                      <li>• Build your subscriber base and recurring revenue</li>
                      <li>• Manage member access and approval settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
              <p className="text-sm text-muted-foreground">
                Control how your profile appears to others
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Public Profile</div>
                  <div className="text-sm text-muted-foreground">
                    Make your profile visible to all startups and investors
                  </div>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Contact Information</div>
                  <div className="text-sm text-muted-foreground">
                    Display email and phone on your profile
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Allow Connection Requests</div>
                  <div className="text-sm text-muted-foreground">
                    Let startups send you consultation requests
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Client Testimonials</div>
                  <div className="text-sm text-muted-foreground">
                    Display reviews and testimonials on your profile
                  </div>
                </div>
                <Switch defaultChecked />
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