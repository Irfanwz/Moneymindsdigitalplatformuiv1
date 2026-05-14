import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LockKeyhole, ArrowLeft, CheckCircle2 } from "lucide-react";

import { resetPassword, ApiError } from "@/app/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
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

  const topBar = (
    <div className="border-b px-6 py-4">
      <Link to="/" className="flex items-center gap-2 w-fit">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
          <span className="font-bold text-white text-sm">MM</span>
        </div>
        <span className="font-semibold text-lg">MoneyMinds</span>
      </Link>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {topBar}
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <LockKeyhole className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h1 className="text-2xl font-semibold mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is missing or invalid. Please request a new one.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/forgot-password">
                <Button className="w-full">Request new reset link</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {topBar}
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">MoneyMinds</div>
                <h1 className="text-2xl font-semibold">Set new password</h1>
              </div>
            </div>
            <p className="text-muted-foreground">
              Enter your new password below. It must be at least 8 characters.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Password reset successful</AlertTitle>
                <AlertDescription>
                  Your password has been updated. You can now sign in with your new password.
                </AlertDescription>
              </Alert>
              <Link to="/login">
                <Button className="w-full">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength={8}
                />
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Resetting..." : "Reset password"}
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
