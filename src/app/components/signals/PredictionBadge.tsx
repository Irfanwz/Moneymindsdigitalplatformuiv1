import { Badge } from "@/app/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import type { AdvisorSignal, PredictionResult } from "@/app/types/advisor-groups";

interface PredictionBadgeProps {
  signal: AdvisorSignal;
  compact?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `${days}d`;
}

function scoreConfig(score: number, result: PredictionResult) {
  if (result === "incorrect" || score < 50) {
    return { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Incorrect" };
  }
  if (score >= 90) {
    return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Perfect" };
  }
  if (score >= 70) {
    return { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2, label: "Good" };
  }
  return { color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle, label: "Partial" };
}

function directionIcon(direction: string | null | undefined) {
  if (direction === "up") return <TrendingUp className="h-3 w-3 text-green-600" />;
  if (direction === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PredictionBadge({ signal, compact = false }: PredictionBadgeProps) {
  // No prediction data parsed yet
  if (!signal.predictionDirection && !signal.predictionCheckDate) return null;

  const isChecked = !!signal.predictionCheckedAt;

  // ── Result badge (after check) ──────────────────────────────────────────────
  if (isChecked && signal.predictionAccuracy !== null && signal.predictionResult) {
    const { color, icon: Icon, label } = scoreConfig(signal.predictionAccuracy, signal.predictionResult);

    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={`${color} gap-1 text-xs cursor-default`}>
                <Icon className="h-3 w-3" />
                {signal.predictionAccuracy}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium mb-1">{label} Prediction</p>
              <p className="text-xs text-muted-foreground">{signal.predictionExplanation}</p>
              {signal.baselinePrice && signal.actualPrice && (
                <p className="text-xs mt-1">
                  ${signal.baselinePrice} → ${signal.actualPrice}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className={`rounded-lg border px-3 py-2 text-sm ${color} space-y-1`}>
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <Icon className="h-4 w-4 shrink-0" />
          <span>{signal.predictionAccuracy}% Accurate — {label}</span>
          {directionIcon(signal.predictionDirection)}
          {signal.predictionTargetPrice && (
            <span className="font-normal text-xs">Target ${signal.predictionTargetPrice}</span>
          )}
        </div>
        {signal.predictionExplanation && (
          <p className="text-xs opacity-80 leading-relaxed">{signal.predictionExplanation}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-70">
          {signal.baselinePrice && <span>Entry: ${signal.baselinePrice}</span>}
          {signal.actualPrice && <span>Actual: ${signal.actualPrice}</span>}
          {signal.predictionTimeframe && <span>Timeframe: {signal.predictionTimeframe}</span>}
        </div>
      </div>
    );
  }

  // ── Pending badge (before check date) ──────────────────────────────────────
  const checkDate = signal.predictionCheckDate;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs cursor-default">
              <Clock className="h-3 w-3" />
              {checkDate ? daysUntil(checkDate) : "Pending"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Prediction check: {checkDate ? formatDate(checkDate) : "scheduled"}</p>
            {signal.predictionTargetPrice && <p className="text-xs">Target: ${signal.predictionTargetPrice}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 space-y-1">
      <div className="flex items-center gap-2 font-medium">
        <Clock className="h-4 w-4" />
        <span>Prediction Pending</span>
        {directionIcon(signal.predictionDirection)}
        {signal.predictionDirection && (
          <span className="capitalize font-normal">{signal.predictionDirection}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-80">
        {signal.baselinePrice && <span>Baseline: ${signal.baselinePrice}</span>}
        {signal.predictionTargetPrice && <span>Target: ${signal.predictionTargetPrice}</span>}
        {checkDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Check: {formatDate(checkDate)} ({daysUntil(checkDate)})
          </span>
        )}
        {signal.predictionTimeframe && <span>{signal.predictionTimeframe}</span>}
      </div>
    </div>
  );
}
