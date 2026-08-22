import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { CreditCard, Shield, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { checkout } from "@/app/lib/api";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemType: "group_join" | "group_monthly" | "training";
  itemId: string;
  itemName: string;
  amount: number;
}

export function CheckoutDialog({ open, onClose, onSuccess, itemType, itemId, itemName, amount }: CheckoutDialogProps) {
  const { session } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isFree = amount === 0;
  const isFormValid = isFree || (paymentMethod === "card"
    ? cardNumber.replace(/\s/g, "").length >= 13 && expiry.length >= 4 && cvc.length >= 3 && cardName.length >= 2
    : true);

  const handleCheckout = async () => {
    if (!session?.token) return;
    setProcessing(true);
    setError(null);
    try {
      await checkout(session.token, { itemType, itemId, paymentMethod });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message ?? "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const typeLabel = itemType === "training" ? "Training" : itemType === "group_join" ? "Group Joining Fee" : "Group Monthly Fee";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Checkout</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">You now have access to {itemName}</p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Item</span>
                <span className="text-sm font-medium">{itemName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">${amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg">{error}</div>
              )}

              {isFree ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700 dark:text-green-400">No payment required</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">Click below to enroll for free</p>
                </div>
              ) : (
              <>
              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit / Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "card" && (
                <>
                  <div>
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "paypal" && (
                <Card className="p-4 text-center text-sm text-muted-foreground">
                  You will be redirected to PayPal to complete payment
                </Card>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Payments are secure and encrypted</span>
              </div>
              </>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={processing}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCheckout} disabled={processing || !isFormValid}>
                {processing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  <>{isFree ? "Enroll Now" : `Pay $${amount.toFixed(2)}`}</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
