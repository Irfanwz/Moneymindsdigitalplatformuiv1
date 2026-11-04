import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  Users,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  RegistrationField,
  RoleRegistrationFields,
} from "./registration/RegistrationFields";
import { RegistrationSummary } from "./registration/RegistrationSummary";
import {
  commonRegistrationFields,
  registrationRoles,
  registrationSections,
  registrationDocumentSlots,
  isRegistrationFieldVisible,
} from "../../../shared/registrationFields.js";
import type { AppRole } from "@/app/types/auth";

const steps = ["Account", "Profile details", "Documents", "Review"];
const icons = { startup: Building2, investor: TrendingUp, advisor: Users };
const emptyCommon = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  country: "",
};

export function ProfileApplicationPage() {
  const { submitProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [common, setCommon] = useState(emptyCommon);
  const [requestedRoles, setRequestedRoles] = useState<AppRole[]>([]);
  const [profiles, setProfiles] = useState<
    Record<AppRole, Record<string, any>>
  >({ startup: {}, investor: {}, advisor: {} });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function activeProfiles() {
    return Object.fromEntries(
      requestedRoles.map((role) => {
        const values = profiles[role],
          section = registrationSections[role];
        return [
          role,
          Object.fromEntries([
            ...section.fields
              .filter((f: any) => isRegistrationFieldVisible(f, values))
              .map((f: any) => [f.key, values[f.key] || ""]),
            ...section.collections
              .filter((g: any) => isRegistrationFieldVisible(g, values))
              .map((g: any) => [g.key, values[g.key] || []]),
          ]),
        ];
      }),
    );
  }
  const selectedProfiles = activeProfiles();
  const slots = registrationDocumentSlots(selectedProfiles);
  const selectedFiles = slots.filter((slot) => files[slot.key]);

  function move(next: number) {
    setStep(next);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!requestedRoles.length) {
      setError("Select at least one profile role.");
      return;
    }
    if (step === 0) {
      const digits = common.phone.replace(/\D/g, "");
      if (
        !/^[+\d\s().-]+$/.test(common.phone) ||
        digits.length < 7 ||
        digits.length > 15
      ) {
        setError("Enter a valid phone number with 7-15 digits.");
        return;
      }
      if (
        ![common.fullName, common.city, common.country].every((v) => v.trim())
      ) {
        setError("Full name, city and country are required.");
        return;
      }
    }
    if (step === 2 || step === 3) {
      const missing = slots.find((slot) => slot.required && !files[slot.key]);
      if (missing) {
        setError(`Upload ${missing.label}.`);
        return;
      }
      if (
        selectedFiles.length > 10 ||
        selectedFiles.reduce((sum, slot) => sum + files[slot.key].size, 0) >
          20 * 1024 * 1024
      ) {
        setError("Attach at most 10 documents, totalling 20 MB or less.");
        return;
      }
    }
    if (step < 3) {
      move(step + 1);
      return;
    }
    setBusy(true);
    try {
      const result = await submitProfile({
        ...common,
        requestedRoles,
        profiles: selectedProfiles,
        attachments: selectedFiles.map((slot) => ({ key: slot.key })),
        files: selectedFiles.map((slot) => files[slot.key]),
      });
      setSuccess(result.message);
      setCommon(emptyCommon);
      setFiles({});
      setProfiles({ startup: {}, investor: {}, advisor: {} });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not submit your application.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-sm text-white">
            MM
          </span>
          MoneyMinds
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle color theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-2 text-sm text-cyan-700 dark:text-cyan-300">
            <ShieldCheck className="h-4 w-4" />
            Reviewed by our team
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Apply to MoneyMinds
          </h1>
          <p className="mt-3 text-muted-foreground">
            Choose your profile roles and tell us about yourself. Admin approval
            is required before you can sign in.
          </p>
        </div>
        {success ? (
          <Card className="p-8 space-y-4" role="status">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
            <h2 className="text-2xl font-semibold">Application submitted</h2>
            <p>{success}</p>
            <p className="text-muted-foreground">
              Your profile information and supporting documents have been
              submitted for review.
            </p>
            <Button asChild>
              <Link to="/login">Go to sign in</Link>
            </Button>
          </Card>
        ) : (
          <>
            <ol
              aria-label="Registration progress"
              className="grid grid-cols-4 gap-2 mb-6"
            >
              {steps.map((label, index) => (
                <li
                  key={label}
                  aria-current={index === step ? "step" : undefined}
                  className={`border-t-2 pt-3 ${index <= step ? "border-primary" : "border-border text-muted-foreground"}`}
                >
                  <span className="text-xs uppercase tracking-wide">
                    Step {index + 1}
                  </span>
                  <div className="text-xs sm:text-sm font-medium mt-1 flex gap-1 items-center">
                    {index < step && <Check className="h-3 w-3 shrink-0" />}
                    {label}
                  </div>
                </li>
              ))}
            </ol>
            <Card className="p-5 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset disabled={busy} className="space-y-8 min-w-0">
                  <div>
                    <h2 className="text-xl font-semibold">{steps[step]}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fields marked <span className="text-destructive">*</span>{" "}
                      are required.
                    </p>
                  </div>
                  {step === 0 && (
                    <>
                      <fieldset>
                        <legend className="font-medium mb-3">
                          Requested profile roles *
                        </legend>
                        <div className="grid md:grid-cols-3 gap-3">
                          {registrationRoles.map((item) => {
                            const role = item.id as AppRole,
                              Icon = icons[role],
                              selected = requestedRoles.includes(role);
                            return (
                              <label
                                key={role}
                                className={`relative cursor-pointer rounded-xl border p-4 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                                  <input
                                    type="checkbox"
                                    aria-label={item.label}
                                    checked={selected}
                                    onChange={(event) =>
                                      setRequestedRoles((current) =>
                                        event.target.checked
                                          ? [...current, role]
                                          : current.filter((r) => r !== role),
                                      )
                                    }
                                    className="h-4 w-4 accent-primary"
                                  />
                                </div>
                                <span className="font-medium">
                                  {item.label}
                                </span>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </label>
                            );
                          })}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          You can request more than one role. Your personal
                          details are shared across all selected roles.
                        </p>
                      </fieldset>
                      <div className="grid md:grid-cols-2 gap-5">
                        {commonRegistrationFields.map((field) => (
                          <RegistrationField
                            key={field.key}
                            field={field}
                            value={common[field.key as keyof typeof common]}
                            onChange={(value) =>
                              setCommon((current) => ({
                                ...current,
                                [field.key]: value,
                              }))
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {step === 1 &&
                    registrationRoles
                      .filter((item) =>
                        requestedRoles.includes(item.id as AppRole),
                      )
                      .map((item) => (
                        <section
                          key={item.id}
                          className="space-y-5 border-t pt-6"
                        >
                          <h3 className="text-lg font-semibold">
                            {item.label} profile
                          </h3>
                          <RoleRegistrationFields
                            role={item.id as AppRole}
                            values={profiles[item.id as AppRole]}
                            onChange={(value) =>
                              setProfiles((current) => ({
                                ...current,
                                [item.id]: value,
                              }))
                            }
                          />
                        </section>
                      ))}
                  {step === 2 && (
                    <div className="space-y-5">
                      <p className="text-sm text-muted-foreground">
                        PDF, JPG or PNG. Up to 5 MB per file, 10 files and 20 MB
                        in total. Documents are private and available to you
                        after approval and to authorized reviewers.
                      </p>
                      {!slots.length && (
                        <p className="rounded-xl bg-muted/40 p-5">
                          No supporting documents are required for your selected
                          profile details. Continue to review your application.
                        </p>
                      )}
                      {slots.map((slot) => (
                        <div
                          key={slot.key}
                          className="space-y-2 rounded-xl border p-4"
                        >
                          <Label htmlFor={slot.key}>
                            {slot.label} {slot.required ? "*" : "(optional)"}
                          </Label>
                          <Input
                            id={slot.key}
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            required={slot.required && !files[slot.key]}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (
                                ![
                                  "application/pdf",
                                  "image/jpeg",
                                  "image/png",
                                ].includes(file.type) ||
                                file.size > 5 * 1024 * 1024 ||
                                !file.size
                              ) {
                                setError(
                                  "Choose a non-empty PDF, JPG or PNG file up to 5 MB.",
                                );
                                event.target.value = "";
                                return;
                              }
                              setError("");
                              setFiles((current) => ({
                                ...current,
                                [slot.key]: file,
                              }));
                            }}
                          />
                          {files[slot.key] && (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground break-all">
                                {files[slot.key].name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFiles((current) => {
                                    const next = { ...current };
                                    delete next[slot.key];
                                    return next;
                                  });
                                  const input = document.getElementById(
                                    slot.key,
                                  ) as HTMLInputElement;
                                  if (input) input.value = "";
                                }}
                              >
                                Remove file
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-7">
                      <p className="text-sm text-muted-foreground">
                        Check your details and documents before submitting. Use
                        Back to make changes.
                      </p>
                      <dl className="grid sm:grid-cols-2 gap-4 rounded-xl bg-muted/40 p-5">
                        {commonRegistrationFields
                          .filter((f) => f.key !== "password")
                          .map((field) => (
                            <div key={field.key} className="min-w-0">
                              <dt className="text-xs text-muted-foreground">
                                {field.label}
                              </dt>
                              <dd className="mt-1 text-sm break-words">
                                {common[field.key as keyof typeof common]}
                              </dd>
                            </div>
                          ))}
                      </dl>
                      <RegistrationSummary
                        application={{
                          profiles: selectedProfiles,
                          documents: selectedFiles.map((slot) => ({
                            key: slot.key,
                            label: slot.label,
                            name: files[slot.key].name,
                          })),
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Submitted credentials and reviews remain subject to
                        admin assessment.
                      </p>
                    </div>
                  )}
                </fieldset>
                {error && (
                  <Alert variant="destructive" role="alert">
                    <AlertTitle>Please check your application</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                  {step ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => move(step - 1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <Link
                      to="/login"
                      className="text-sm text-muted-foreground underline underline-offset-4"
                    >
                      Already registered? Sign in
                    </Link>
                  )}
                  <Button type="submit" disabled={busy}>
                    {busy
                      ? "Submitting application..."
                      : step === 3
                        ? "Submit for admin approval"
                        : "Continue"}
                    {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
