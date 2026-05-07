import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  DollarSign,
  Globe,
  Linkedin,
  Plus,
  Save,
  Trash2,
  Twitter,
  Upload,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { getStartupProfile, updateStartupProfile, uploadFile } from "@/app/lib/api";
import {
  createEmptyStartupProfile,
  parseCategories,
  stringifyCategories,
} from "@/app/lib/startup-profile";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { CredibilityBadge } from "@/app/components/CredibilityBadge";
import { Header } from "@/app/components/Header";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import type { StartupProfile, StartupTeamMember } from "@/app/types/startup-profile";

type ProfileField = Exclude<keyof StartupProfile, "teamMembers" | "categories" | "id" | "userId" | "createdAt" | "updatedAt">;
type TeamMemberField = keyof StartupTeamMember;

const industryOptions = [
  { value: "FinTech", label: "FinTech" },
  { value: "HealthTech", label: "HealthTech" },
  { value: "CleanTech", label: "CleanTech" },
  { value: "EdTech", label: "EdTech" },
  { value: "AI/ML", label: "AI/ML" },
  { value: "SaaS", label: "SaaS" },
  { value: "E-Commerce", label: "E-Commerce" },
  { value: "Other", label: "Other" },
];

const stageOptions = [
  { value: "Pre-Seed", label: "Pre-Seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C+", label: "Series C+" },
];

export function StartupEditProfile() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile>(() => createEmptyStartupProfile(user));
  const [categoriesInput, setCategoriesInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      setErrorMessage("Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getStartupProfile(session.token);

        if (!isActive) {
          return;
        }

        setProfile(response.profile);
        setCategoriesInput(stringifyCategories(response.profile.categories));
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : "Could not load your startup profile.";
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [session?.token, user?.id]);

  const updateField = (field: ProfileField, value: string | boolean) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };

  const addTeamMember = () => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      teamMembers: [
        ...currentProfile.teamMembers,
        { name: "", role: "", linkedin: "" },
      ],
    }));
  };

  const removeTeamMember = (index: number) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      teamMembers: currentProfile.teamMembers.filter((_, memberIndex) => memberIndex !== index),
    }));
  };

  const updateTeamMember = (index: number, field: TeamMemberField, value: string) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      teamMembers: currentProfile.teamMembers.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, [field]: value }
          : member,
      ),
    }));
  };

  const handleSave = async () => {
    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateStartupProfile(session.token, {
        ...profile,
        categories: parseCategories(categoriesInput),
      });

      setProfile(response.profile);
      setCategoriesInput(stringifyCategories(response.profile.categories));
      setSuccessMessage(response.message);
      navigate("/startup/profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save your startup profile.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="startup" userName={profile.companyName || user?.fullName} />
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <Card className="p-8">Loading startup profile...</Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="startup" userName={profile.companyName || user?.fullName} />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Edit Startup Profile</h1>
          <p className="text-muted-foreground">
            Save your startup details to Supabase and use them across the platform.
          </p>
        </div>

        {errorMessage ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Could not save profile</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="mb-6">
            <AlertTitle>Profile saved</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>
              <CredibilityBadge type="verified" label="Startup Profile" />
            </div>

            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <Label htmlFor="photo">Company Logo / Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-medium">
                        {(profile.companyName || user?.fullName || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="startup-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("startup-photo-upload")?.click()} disabled={photoUploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {photoUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    className="mt-2"
                    value={profile.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    placeholder="TechVenture Inc"
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    className="mt-2"
                    value={profile.tagline}
                    onChange={(event) => updateField("tagline", event.target.value)}
                    placeholder="What your startup is building"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={profile.industry || undefined} onValueChange={(value) => updateField("industry", value)}>
                    <SelectTrigger id="industry" className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categories">Categories</Label>
                  <Input
                    id="categories"
                    className="mt-2"
                    value={categoriesInput}
                    onChange={(event) => setCategoriesInput(event.target.value)}
                    placeholder="AI/ML, SaaS, B2B"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    className="mt-2"
                    type="number"
                    value={profile.foundedYear}
                    onChange={(event) => updateField("foundedYear", event.target.value)}
                    placeholder="2024"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    className="mt-2"
                    value={profile.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  className="mt-2"
                  rows={5}
                  value={profile.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe your company, mission, and traction."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-10"
                      value={profile.website}
                      onChange={(event) => updateField("website", event.target.value)}
                      placeholder="https://yourstartup.com"
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
                        className="pl-10"
                        value={profile.linkedin}
                        onChange={(event) => updateField("linkedin", event.target.value)}
                        placeholder="https://linkedin.com/company/yourstartup"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <div className="relative mt-2">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="twitter"
                        className="pl-10"
                        value={profile.twitter}
                        onChange={(event) => updateField("twitter", event.target.value)}
                        placeholder="@yourstartup"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    className="mt-2"
                    type="email"
                    value={profile.contactEmail}
                    onChange={(event) => updateField("contactEmail", event.target.value)}
                    placeholder="founder@yourstartup.com"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Funding Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage">Funding Stage *</Label>
                  <Select value={profile.stage || undefined} onValueChange={(value) => updateField("stage", value)}>
                    <SelectTrigger id="stage" className="mt-2">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="raised">Total Raised</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="raised"
                      className="pl-10"
                      value={profile.totalRaised}
                      onChange={(event) => updateField("totalRaised", event.target.value)}
                      placeholder="500,000"
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
                      className="pl-10"
                      value={profile.fundingGoal}
                      onChange={(event) => updateField("fundingGoal", event.target.value)}
                      placeholder="2,000,000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="valuation">Estimated Valuation</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="valuation"
                      className="pl-10"
                      value={profile.valuation}
                      onChange={(event) => updateField("valuation", event.target.value)}
                      placeholder="15,000,000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pitch">Investment Pitch</Label>
                <Textarea
                  id="pitch"
                  className="mt-2"
                  rows={5}
                  value={profile.pitch}
                  onChange={(event) => updateField("pitch", event.target.value)}
                  placeholder="Explain the opportunity, traction, and why investors should care."
                />
              </div>
            </div>
          </Card>

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
              {profile.teamMembers.map((member, index) => (
                <div key={`${member.name}-${index}`} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Team Member {index + 1}</h3>
                    {profile.teamMembers.length > 1 ? (
                      <Button variant="ghost" size="sm" onClick={() => removeTeamMember(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`member-name-${index}`}>Name</Label>
                      <Input
                        id={`member-name-${index}`}
                        className="mt-2"
                        value={member.name}
                        onChange={(event) => updateTeamMember(index, "name", event.target.value)}
                        placeholder="Full Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`member-role-${index}`}>Role</Label>
                      <Input
                        id={`member-role-${index}`}
                        className="mt-2"
                        value={member.role}
                        onChange={(event) => updateTeamMember(index, "role", event.target.value)}
                        placeholder="CEO, CTO, COO"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`member-linkedin-${index}`}>LinkedIn Profile</Label>
                    <div className="relative mt-2">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`member-linkedin-${index}`}
                        className="pl-10"
                        value={member.linkedin}
                        onChange={(event) => updateTeamMember(index, "linkedin", event.target.value)}
                        placeholder="https://linkedin.com/in/member"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
              <p className="text-sm text-muted-foreground">
                Control how your startup profile appears to investors and advisors.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Public Profile</div>
                  <div className="text-sm text-muted-foreground">
                    Allow approved users to discover your startup profile.
                  </div>
                </div>
                <Switch checked={profile.isPublic} onCheckedChange={(value) => updateField("isPublic", value)} />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Show Contact Information</div>
                  <div className="text-sm text-muted-foreground">
                    Display your website and email on the startup profile page.
                  </div>
                </div>
                <Switch
                  checked={profile.showContactInfo}
                  onCheckedChange={(value) => updateField("showContactInfo", value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Allow Advisor Invitations</div>
                  <div className="text-sm text-muted-foreground">
                    Let advisors reach out for direct collaboration.
                  </div>
                </div>
                <Switch
                  checked={profile.allowAdvisorInvitations}
                  onCheckedChange={(value) => updateField("allowAdvisorInvitations", value)}
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate("/startup/profile")}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
