import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Building2, TrendingUp, Users, ShieldCheck, Sun, Moon } from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import type { AppRole } from "@/app/types/auth";

const roles: {
  id: AppRole;
  label: string;
  description: string;
  icon: typeof Building2;
  accent: string;
}[] = [
  {
    id: "startup",
    label: "Startup",
    description: "Apply to raise visibility and connect with investors and advisors.",
    icon: Building2,
    accent: "text-cyan-500",
  },
  {
    id: "investor",
    label: "Investor",
    description: "Apply to review verified startups and track opportunities.",
    icon: TrendingUp,
    accent: "text-indigo-500",
  },
  {
    id: "advisor",
    label: "Financial Advisor",
    description: "Apply to share expertise and build your public credibility.",
    icon: Users,
    accent: "text-emerald-500",
  },
];

export function ProfileApplicationPage() {
  const { submitProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [requestedRoles, setRequestedRoles] = useState<AppRole[]>(["startup"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleRole = (role: AppRole, checked: boolean) => {
    setRequestedRoles((currentRoles) => {
      if (checked) {
        return currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
      }

      return currentRoles.filter((entry) => entry !== role);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await submitProfile({
        fullName,
        email,
        password,
        phone,
        location,
        bio,
        requestedRoles,
      });

      setSuccessMessage(response.message);
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setLocation("");
      setBio("");
      setRequestedRoles(["startup"]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit your profile.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
            <span className="font-bold text-white text-sm">MM</span>
          </div>
          <span className="font-semibold text-lg">MoneyMinds</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-8 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-700 dark:text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                Admin approval is required before login
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight">Create your general profile first</h1>
              <p className="mt-4 text-muted-foreground">
                Every user enters through one reviewed profile. After admin approval, the same account can access any approved roles.
              </p>
            </div>

            <Card className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your legal or public name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Short profile summary</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Tell the admin what you do and why you want access."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Requested roles</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Admin can approve one or multiple roles from this request.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const selected = requestedRoles.includes(role.id);

                      return (
                        <label
                          key={role.id}
                          className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors ${
                            selected ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className={`mb-3 inline-flex rounded-xl bg-muted p-3 ${role.accent}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="font-medium">{role.label}</div>
                              <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
                            </div>
                            <Checkbox
                              checked={selected}
                              onCheckedChange={(checked) => toggleRole(role.id, checked === true)}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertTitle>Submission failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {successMessage ? (
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Profile submitted</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for admin approval"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Already registered?{" "}
                    <Link className="font-medium text-primary hover:underline" to="/login">
                      Go to sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold">How access works</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-sm font-medium">1. Submit one general profile</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This becomes the single identity record for your account.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium">2. Admin reviews your details</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Approval decides whether you can sign in and which roles you can access.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium">3. Login and choose your approved role</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    After approval, you can enter as Startup, Investor, Advisor, or any combination granted by admin.
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
