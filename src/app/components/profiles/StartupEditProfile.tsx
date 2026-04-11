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
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import {
  Building2,
  Users,
  FileText,
  Globe,
  Linkedin,
  Twitter,
  DollarSign,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StartupEditProfile() {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);

  // Team member structure
  const [teamMembers, setTeamMembers] = useState([
    { name: "John Doe", role: "CEO", linkedin: "" },
    { name: "Jane Smith", role: "CTO", linkedin: "" },
  ]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "", linkedin: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Handle save logic here
    navigate("/startup/dashboard");
  };

  const handleCancel = () => {
    navigate("/startup/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="startup" userName="TechVenture Inc" />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your startup information and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Company Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>
              <CredibilityBadge type="verified" label="Verified" />
            </div>

            <div className="space-y-6">
              {/* Company Logo */}
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>

              {/* Company Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    placeholder="TechVenture Inc"
                    defaultValue="TechVenture Inc"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select defaultValue="fintech">
                    <SelectTrigger id="industry" className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="cleantech">CleanTech</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="ai-ml">AI/ML</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Founded & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded">Founded Year *</Label>
                  <Input
                    id="founded"
                    type="number"
                    placeholder="2023"
                    defaultValue="2023"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    defaultValue="San Francisco, CA"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Company Description */}
              <div>
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your company, mission, and what problem you're solving..."
                  defaultValue="AI-powered financial analytics platform helping businesses make data-driven decisions."
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  300 characters recommended
                </p>
              </div>

              {/* Website & Social Links */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://techventure.com"
                      defaultValue="https://techventure.com"
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
                        placeholder="linkedin.com/company/techventure"
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
                        placeholder="@techventure"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Funding Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Funding Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage">Funding Stage *</Label>
                  <Select defaultValue="series-a">
                    <SelectTrigger id="stage" className="mt-2">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="series-c">Series C+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="raised">Total Raised</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="raised"
                      type="text"
                      placeholder="2,500,000"
                      defaultValue="2,500,000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seeking">Currently Seeking</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seeking"
                      type="text"
                      placeholder="5,000,000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="valuation">Estimated Valuation</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="valuation"
                      type="text"
                      placeholder="15,000,000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pitch">Investment Pitch</Label>
                <Textarea
                  id="pitch"
                  placeholder="Describe your investment opportunity, traction, and why investors should be interested..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Team Members</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addTeamMember}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Team Member {index + 1}</h3>
                    {teamMembers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`member-name-${index}`}>Name *</Label>
                      <Input
                        id={`member-name-${index}`}
                        placeholder="Full Name"
                        defaultValue={member.name}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`member-role-${index}`}>Role *</Label>
                      <Input
                        id={`member-role-${index}`}
                        placeholder="e.g., CEO, CTO, CFO"
                        defaultValue={member.role}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`member-linkedin-${index}`}>
                      LinkedIn Profile
                    </Label>
                    <div className="relative mt-2">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`member-linkedin-${index}`}
                        placeholder="linkedin.com/in/username"
                        defaultValue={member.linkedin}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Documents & Verification */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">
                  Documents & Verification
                </h2>
              </div>
              <CredibilityBadge type="ai-verified" />
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">Pitch Deck</div>
                    <div className="text-sm text-muted-foreground">
                      Upload your latest pitch deck
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">Financial Statements</div>
                    <div className="text-sm text-muted-foreground">
                      Last 12 months financials (optional)
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">Cap Table</div>
                    <div className="text-sm text-muted-foreground">
                      Current capitalization table
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
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
                    Make your profile visible to all investors and advisors
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
                  <div className="font-medium">Allow Advisor Invitations</div>
                  <div className="text-sm text-muted-foreground">
                    Let advisors send you connection requests
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
