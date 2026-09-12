/**
 * VerificationStatusSection — drop into any profile edit page.
 * Shows current verification status and links to the upload flow.
 */
import { useState, useEffect } from "react";
import { BadgeCheck, Clock, AlertCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useAuth } from "@/app/hooks/useAuth";
import { getMyVerifications, type ProfileVerification } from "@/app/lib/api";
import { VerifiedBadge } from "@/app/components/shared/VerifiedBadge";
import { Link } from "react-router-dom";
import { cn } from "@/app/lib/utils";

interface VerificationStatusSectionProps {
  isVerified?: boolean;
  verifiedAt?: string | null;
}

function statusSummary(records: ProfileVerification[]) {
  if (records.some((r) => r.status === "verified")) return "verified";
  if (records.some((r) => r.status === "analyzing")) return "analyzing";
  if (records.some((r) => r.status === "manual_review")) return "manual_review";
  if (records.some((r) => r.status === "pending")) return "pending";
  return "none";
}

export function VerificationStatusSection({ isVerified, verifiedAt }: VerificationStatusSectionProps) {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const [records, setRecords] = useState<ProfileVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getMyVerifications(token)
      .then((res) => setRecords(res.verifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return null;

  const summary = isVerified ? "verified" : statusSummary(records);
  const latest = records[0];

  return (
    <Card>
      <CardContent className="pt-5 pb-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-blue-500" />
          Profile Verification
        </h3>

        {summary === "verified" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <VerifiedBadge verifiedAt={verifiedAt} size="lg" />
            <div>
              <p className="text-sm font-medium text-blue-900">Profile Verified</p>
              <p className="text-xs text-blue-700">
                Your credentials have been verified. A verified badge is visible on your profile.
              </p>
            </div>
          </div>
        )}

        {summary === "analyzing" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Clock className="h-5 w-5 text-blue-500 shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-900">AI Review in Progress</p>
              <p className="text-xs text-blue-700">Your document is being analyzed. Usually takes under a minute.</p>
            </div>
          </div>
        )}

        {summary === "pending" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Verification Pending</p>
              <p className="text-xs text-yellow-700">Your document is queued for AI review.</p>
            </div>
          </div>
        )}

        {summary === "manual_review" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900">Under Admin Review</p>
              <p className="text-xs text-orange-700">Our team is manually reviewing your document.</p>
            </div>
          </div>
        )}

        {(summary === "none" || summary === undefined) && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Verify your professional credentials to display a verified badge on your profile and build trust with potential clients.
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link to="/verify">
                <ExternalLink className="h-3.5 w-3.5" />
                Get Verified
              </Link>
            </Button>
          </div>
        )}

        {latest && summary !== "verified" && summary !== "none" && (
          <div className="text-xs text-muted-foreground">
            Last submitted: {new Date(latest.createdAt).toLocaleDateString()} —{" "}
            <Link to="/verify" className="text-blue-500 hover:underline">manage submissions</Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
