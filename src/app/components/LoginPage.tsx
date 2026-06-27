import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, ShieldCheck, UserCog } from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/app/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

type LoginMode = "user" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, selectRole } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "user";

  const mode = initialMode; // Fixed to URL parameter, no toggle
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const heading = mode === "admin"
    ? "Admin sign in"
    : "Sign in after approval";

  const helperText = mode === "admin"
    ? "Use the admin account to approve or reject submitted profiles."
    : "Users can only sign in after their general profile has been reviewed and approved.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const session = await login(email, password);
      const nextPath = location.state && typeof location.state === "object" && "from" in location.state
        ? String(location.state.from)
        : null;

      if (session.user.isAdmin) {
        navigate(nextPath || "/admin/dashboard", { replace: true });
        return;
      }

      if (session.user.approvedRoles.length === 1) {
        const [role] = session.user.approvedRoles;
        selectRole(role);
        navigate(nextPath && nextPath.startsWith(`/${role}/`) ? nextPath : `/${role}/dashboard`, {
          replace: true,
        });
        return;
      }

      navigate("/choose-role", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);

        if (error.code === "PENDING_APPROVAL") {
          setStatusMessage("Your profile exists, but admin approval is still pending.");
        }

        if (error.code === "PROFILE_REJECTED") {
          setStatusMessage(error.user?.rejectionReason || "Your profile was rejected. Contact admin for changes.");
        }
      } else {
        setErrorMessage("Could not sign in with those credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
            <span className="font-bold text-white text-sm">MM</span>
          </div>
          <span className="font-semibold text-lg">MoneyMinds</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                {mode === "admin" ? <UserCog className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">MoneyMinds Access</div>
                <h1 className="text-3xl font-semibold">{heading}</h1>
              </div>
            </div>
            <p className="text-muted-foreground">{helperText}</p>
          </div>


          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={mode === "admin" ? "admin@moneyminds.local" : "you@example.com"}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>
                  <p>{errorMessage}</p>
                  {statusMessage ? <p>{statusMessage}</p> : null}
                </AlertDescription>
              </Alert>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              <LockKeyhole className="mr-2 h-4 w-4" />
              {isSubmitting ? "Signing in..." : mode === "admin" ? "Enter admin panel" : "Continue"}
            </Button>
          </form>
        </Card>

        {mode === "admin" ? (
          <Card className="p-8 flex flex-col justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6">
              <UserCog className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold">Admin Control Panel</h2>
            <p className="mt-3 text-muted-foreground">
              As admin you can review and approve submitted profiles, manage platform users, and monitor platform activity.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground">Approve or reject user registrations</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground">Assign roles to approved users</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground">View platform stats and user activity</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <h2 className="text-2xl font-semibold">Required onboarding sequence</h2>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border p-5">
                <div className="text-sm font-medium">Step 1</div>
                <div className="mt-2 text-xl font-semibold">Create a general profile</div>
                <p className="mt-2 text-muted-foreground">
                  Register once with your basic information and request the roles you need.
                </p>
                <Button asChild className="mt-5">
                  <Link to="/apply">Create profile</Link>
                </Button>
              </div>

              <div className="rounded-2xl border p-5">
                <div className="text-sm font-medium">Step 2</div>
                <div className="mt-2 text-xl font-semibold">Wait for admin approval</div>
                <p className="mt-2 text-muted-foreground">
                  Until approval is complete, login stays blocked for normal users.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <div className="text-sm font-medium">Step 3</div>
                <div className="mt-2 text-xl font-semibold">Choose from your approved roles</div>
                <p className="mt-2 text-muted-foreground">
                  After sign in, you will see the role cards that admin granted to your account.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
