import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

import { forgotPassword, ApiError } from "@/app/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await forgotPassword(email);
      setSuccess(true);
      // In dev mode, the API returns the token directly
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
            <span className="font-bold text-white text-sm">MM</span>
          </div>
          <span className="font-semibold text-lg">MoneyMinds</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">MoneyMinds</div>
                <h1 className="text-2xl font-semibold">Reset your password</h1>
              </div>
            </div>
            <p className="text-muted-foreground">
              Enter your email address and we'll generate a reset link for you.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  If an account with that email exists, a password reset link has been generated.
                </AlertDescription>
              </Alert>

              {resetToken && (
                <Alert>
                  <AlertTitle>Dev Mode: Reset Link</AlertTitle>
                  <AlertDescription>
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="text-primary underline break-all"
                    >
                      Click here to reset your password
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" onClick={() => { setSuccess(false); setEmail(""); setResetToken(null); }}>
                  Send another link
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="w-full" type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </form>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}
