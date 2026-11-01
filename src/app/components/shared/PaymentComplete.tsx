import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { request } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Header } from "../Header";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PaymentComplete() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const cancelled = params.has("cancelled");
  const [payment, setPayment] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (cancelled) return;
    let active = true;
    setBusy(true);
    setError("");
    request<{ payment: any }>("/api/payments/checkout-session/confirm", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => {
        if (active) setPayment(r.payment);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId, cancelled, retry]);
  const role = user?.currentRole || user?.approvedRoles[0] || "investor";
  return (
    <div className="min-h-screen bg-background">
      <Header userRole={role} userName={user?.fullName} />
      <main className="p-6 max-w-xl mx-auto py-12">
        <Card className="p-7 gap-5">
          {payment && <CheckCircle2 className="h-12 w-12 text-emerald-600" />}
          <h1 className="text-2xl font-semibold">
            {cancelled
              ? "Checkout cancelled"
              : payment
                ? "Payment confirmed"
                : "Confirming your payment"}
          </h1>
          {busy && (
            <p className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking the payment provider…
            </p>
          )}
          {cancelled && (
            <p className="text-sm text-muted-foreground">
              Checkout was closed before confirmation. You can return to the
              item and try again.
            </p>
          )}
          {payment && (
            <>
              <p>You now have access to your purchase.</p>
              <p className="text-sm text-muted-foreground">
                {payment.currency} {Number(payment.amount).toFixed(2)} ·
                Reference {payment.transactionRef}
              </p>
            </>
          )}
          {error && (
            <>
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setRetry((v) => v + 1)}
              >
                Check again
              </Button>
            </>
          )}
          <Button asChild>
            <Link to={`/${role}/dashboard`}>Return to dashboard</Link>
          </Button>
        </Card>
      </main>
    </div>
  );
}
