import { useEffect, useState } from "react";
import { Lock, ShieldAlert, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/app/lib/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AdminSecurity() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null),
    [setup, setSetup] = useState<{ qrCode: string; secret: string } | null>(
      null,
    ),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request<{ available: boolean; enabled: boolean }>("/api/2fa/status")
      .then((r) => {
        if (active) {
          setAvailable(r.available);
          setEnabled(r.enabled);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function act(action: "setup" | "verify" | "disable") {
    setBusy(true);
    setError("");
    try {
      const result = await request<any>(`/api/2fa/${action}`, {
        method: action === "disable" ? "DELETE" : "POST",
        body: JSON.stringify({ code }),
      });
      if (action === "setup") setSetup(result);
      else {
        setEnabled(action === "verify");
        setSetup(null);
        setCode("");
        toast.success(
          action === "verify"
            ? "Authenticator enabled."
            : "Authenticator disabled.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update account security.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (available === false) return (
    <Card className="p-6 rounded-none border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Two-factor authentication</h2>
            <p className="text-xs text-muted-foreground">Hardware / TOTP security status</p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-none border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
          Policy Off
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Two-factor authentication is temporarily turned off. Sign in using your email and password.
      </p>
    </Card>
  );
  return (
    <Card className="p-6 rounded-none border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center border ${
            enabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          }`}>
            {enabled ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold">Two-factor authentication</h2>
            <p className="text-xs text-muted-foreground">Authenticator app protection</p>
          </div>
        </div>
        {enabled !== null && (
          <Badge
            variant="outline"
            className={`rounded-none ${
              enabled
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            {enabled ? "Active" : "Not Enabled"}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {enabled
          ? "Your 6-digit authenticator code is required at every administrator sign-in."
          : "Add an authenticator app (Google Authenticator, 1Password, Authy) to protect your administrator sign-in."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive border border-rose-500/30 bg-rose-500/10 px-3 py-2">
          {error}
        </p>
      )}
      {enabled === null && !error && (
        <p className="text-sm text-muted-foreground">Loading security settings…</p>
      )}
      {enabled === false && !setup && (
        <Button
          className="w-full sm:w-fit rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold border-0"
          disabled={busy}
          onClick={() => act("setup")}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Set up authenticator
        </Button>
      )}
      {setup && (
        <div className="space-y-3 border border-border/70 bg-muted/30 p-4">
          <div className="bg-white p-2 w-fit border border-slate-200">
            <img
              src={setup.qrCode}
              alt="Scan this QR code with your authenticator app"
              width="180"
              height="180"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Scan this QR code in your authenticator app, then enter its six-digit code below.
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-cyan-700 dark:text-cyan-400">
              Enter setup key manually
            </summary>
            <code className="block mt-2 p-2 bg-background border border-border break-all font-mono">
              {setup.secret}
            </code>
          </details>
        </div>
      )}
      {(enabled || setup) && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <div className="space-y-2">
            <Label htmlFor="security-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current authenticator code
            </Label>
            <Input
              id="security-code"
              autoComplete="one-time-code"
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="max-w-xs rounded-none font-mono tracking-widest"
            />
          </div>
          <Button
            className={`w-full sm:w-fit rounded-none ${
              enabled
                ? "border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                : "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold border-0"
            }`}
            variant={enabled ? "outline" : "default"}
            disabled={busy || code.length !== 6}
            onClick={() => act(enabled ? "disable" : "verify")}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {enabled ? "Disable authenticator" : "Confirm and enable"}
          </Button>
        </div>
      )}
    </Card>
  );
}
