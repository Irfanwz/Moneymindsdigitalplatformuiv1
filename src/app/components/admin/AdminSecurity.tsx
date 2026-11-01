import { useEffect, useState } from "react";
import { toast } from "sonner";
import { request } from "@/app/lib/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AdminSecurity() {
  const [enabled, setEnabled] = useState<boolean | null>(null),
    [setup, setSetup] = useState<{ qrCode: string; secret: string } | null>(
      null,
    ),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request<{ enabled: boolean }>("/api/2fa/status")
      .then((r) => {
        if (active) setEnabled(r.enabled);
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
  return (
    <Card className="p-6 max-w-2xl mt-6 gap-4 shadow-none">
      <h2 className="text-lg font-semibold">Two-factor authentication</h2>
      <p className="text-sm text-muted-foreground">
        {enabled
          ? "Your authenticator code is required at sign-in."
          : "Add an authenticator app to protect your administrator sign-in."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {enabled === null && !error && (
        <p className="text-sm">Loading security settings…</p>
      )}
      {enabled === false && !setup && (
        <Button
          className="w-fit"
          variant="outline"
          disabled={busy}
          onClick={() => act("setup")}
        >
          Set up authenticator
        </Button>
      )}
      {setup && (
        <div className="space-y-3">
          <img
            src={setup.qrCode}
            alt="Scan this QR code with your authenticator app"
            width="190"
            height="190"
          />
          <p className="text-sm">
            Scan this code in your authenticator, then enter its six-digit code
            below.
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer">
              Enter a setup key manually
            </summary>
            <code className="block mt-2 break-all">{setup.secret}</code>
          </details>
        </div>
      )}
      {(enabled || setup) && (
        <>
          <div className="space-y-2">
            <Label htmlFor="security-code">Current authenticator code</Label>
            <Input
              id="security-code"
              autoComplete="one-time-code"
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Six-digit code"
              className="max-w-xs"
            />
          </div>
          <Button
            className="w-fit"
            variant={enabled ? "outline" : "default"}
            disabled={busy || code.length !== 6}
            onClick={() => act(enabled ? "disable" : "verify")}
          >
            {enabled ? "Disable authenticator" : "Confirm and enable"}
          </Button>
        </>
      )}
    </Card>
  );
}
