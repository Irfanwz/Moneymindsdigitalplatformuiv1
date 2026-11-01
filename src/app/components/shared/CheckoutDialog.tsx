import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { checkout, request, checkPayment } from "@/app/lib/api";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemType: "group_join" | "group_monthly" | "training";
  itemId: string;
  itemName: string;
  amount: number;
}
export function CheckoutDialog({
  open,
  onClose,
  onSuccess,
  itemType,
  itemId,
  itemName,
  amount,
}: CheckoutDialogProps) {
  const { user, session } = useAuth();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [demo, setDemo] = useState(false);
  useEffect(() => {
    if (open) {
      setError("");
      setDemo(false);
    }
  }, [open, itemId]);
  async function pay() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      if (
        amount > 0 &&
        (await checkPayment(session?.token || "", itemType, itemId)).paid
      ) {
        await request(
          itemType === "training"
            ? `/api/trainings/${itemId}/enroll`
            : `/api/advisor/groups/${itemId}/join`,
          { method: "POST" },
        );
        onSuccess();
        onClose();
        return;
      }
      if (amount === 0) {
        await request(
          itemType === "training"
            ? `/api/trainings/${itemId}/enroll`
            : `/api/advisor/groups/${itemId}/join`,
          { method: "POST" },
        );
        onSuccess();
        onClose();
        return;
      }
      if (demo) {
        await checkout(session?.token || "", {
          itemType,
          itemId,
          paymentMethod: "card",
        });
        onSuccess();
        onClose();
        return;
      }
      const result = await request<{
        url?: string;
        simulated: boolean;
        amount?: number;
      }>("/api/payments/checkout-session", {
        method: "POST",
        body: JSON.stringify({ itemType, itemId }),
      });
      if (result.simulated) {
        setDemo(true);
        return;
      }
      const url = new URL(result.url || "");
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error(
          "The payment provider returned an invalid checkout link.",
        );
      window.location.assign(url.href);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Checkout could not be started.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(value) => !value && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-muted/40 p-4 flex justify-between items-center">
          <span>Total</span>
          <strong className="text-2xl">USD {amount.toFixed(2)}</strong>
        </div>
        <p className="text-sm text-muted-foreground">
          {amount === 0
            ? "This item is free. Confirm to get access."
            : demo
              ? "Development demo only: no money will be charged. A simulated payment will be recorded."
              : "Continue to Stripe to enter your payment details. Access is granted after Stripe confirms payment."}
        </p>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button disabled={busy || !user} onClick={pay}>
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {busy
            ? "Please wait…"
            : amount === 0
              ? "Confirm free access"
              : demo
                ? "Record demo payment"
                : "Continue to secure payment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
