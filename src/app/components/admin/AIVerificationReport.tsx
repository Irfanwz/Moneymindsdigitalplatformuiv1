import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Linkedin,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";
import type { AIVerification } from "@/app/lib/api";
import { retryVerification } from "@/app/lib/api";

interface AIVerificationReportProps {
  verification: AIVerification | null;
  token: string;
  onRetryComplete?: () => void;
}

const recommendationConfig = {
  accept: {
    label: "Accept",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  review: {
    label: "Review",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

function CredibilityGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  const progressColor =
    score >= 70
      ? "[&>[data-slot=progress-indicator]]:bg-emerald-500"
      : score >= 40
        ? "[&>[data-slot=progress-indicator]]:bg-amber-500"
        : "[&>[data-slot=progress-indicator]]:bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Credibility Score</span>
        <span className={`text-2xl font-bold ${color}`}>{score}/100</span>
      </div>
      <Progress value={score} className={`h-3 ${progressColor}`} />
    </div>
  );
}

export function AIVerificationReport({ verification, token, onRetryComplete }: AIVerificationReportProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!verification) return;
    setRetrying(true);
    try {
      await retryVerification(token, verification.userId);
      onRetryComplete?.();
    } catch {
      // ignore
    } finally {
      setRetrying(false);
    }
  };

  // No verification data
  if (!verification) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        <ShieldAlert className="mx-auto h-8 w-8 mb-3 opacity-50" />
        <p>No AI verification data available.</p>
      </div>
    );
  }

  // Running state
  if (verification.status === "running") {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-8 w-8 mb-3 animate-spin opacity-50" />
        <p className="font-medium">AI verification in progress...</p>
        <p className="text-sm mt-1">This usually takes 30–60 seconds.</p>
      </div>
    );
  }

  // Failed / Skipped states
  if (verification.status === "failed" || verification.status === "skipped") {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        <ShieldAlert className="mx-auto h-8 w-8 mb-3 opacity-50" />
        <p className="font-medium">
          {verification.status === "failed"
            ? "AI verification failed"
            : "AI verification skipped — not enough data"}
        </p>
        <p className="text-sm mt-1">Admin should review this user manually.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          {retrying ? "Re-running..." : "Retry verification"}
        </Button>
      </div>
    );
  }

  // Complete — show full report
  const rec = verification.recommendation;
  const config = rec ? recommendationConfig[rec] : null;
  const RecIcon = config?.icon ?? ShieldCheck;

  return (
    <div className="space-y-6">
      {/* Recommendation Header */}
      {config && rec && (
        <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RecIcon className={`h-6 w-6 ${config.color}`} />
              <div>
                <div className={`text-lg font-bold ${config.color}`}>
                  AI Recommendation: {config.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {verification.confidence}%
                </div>
              </div>
            </div>
            <Badge variant="outline" className={config.color}>
              {verification.searchQueriesRun} searches run
            </Badge>
          </div>
        </div>
      )}

      {/* Credibility Score */}
      {verification.credibilityScore != null && (
        <CredibilityGauge score={verification.credibilityScore} />
      )}

      {/* Summary */}
      {verification.summary && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{verification.summary}</p>
        </div>
      )}

      <Separator />

      {/* Key Findings */}
      {verification.findings && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Key Findings</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* LinkedIn */}
            <Card className="p-3 flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  LinkedIn {verification.findings.linkedin_found ? "Found" : "Not Found"}
                </div>
                {verification.findings.linkedin_url && (
                  <a
                    href={verification.findings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate block"
                  >
                    {verification.findings.linkedin_url}
                  </a>
                )}
              </div>
              {verification.findings.linkedin_found ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 ml-auto shrink-0" />
              )}
            </Card>

            {/* Company */}
            <Card className="p-3 flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  Company {verification.findings.company_verified ? "Verified" : "Not Verified"}
                </div>
                {verification.findings.company_url && (
                  <a
                    href={verification.findings.company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate block"
                  >
                    {verification.findings.company_url}
                  </a>
                )}
              </div>
              {verification.findings.company_verified ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 ml-auto shrink-0" />
              )}
            </Card>
          </div>

          {/* News mentions */}
          {verification.findings.news_mentions > 0 && (
            <div className="text-sm text-muted-foreground">
              Found in <span className="font-medium text-foreground">{verification.findings.news_mentions}</span> news
              article{verification.findings.news_mentions !== 1 ? "s" : ""}
            </div>
          )}

          {/* Positive Signals */}
          {verification.findings.positive_signals?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Positive Signals</h5>
              <ul className="space-y-1">
                {verification.findings.positive_signals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags */}
          {verification.findings.red_flags?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Red Flags</h5>
              <div className="space-y-2">
                {verification.findings.red_flags.map((flag, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Sources */}
      {verification.sources?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Sources ({verification.sources.length})</h4>
          <div className="space-y-2">
            {verification.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{source.title || source.url}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {Math.round(source.relevance * 100)}%
                </Badge>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Retry button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground italic">
          AI-generated assessment for admin guidance only. Human review is required before final decision.
        </p>
        <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
          {retrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          Re-run
        </Button>
      </div>
    </div>
  );
}
