import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  TrendingUp,
  BarChart2,
  Clock,
} from "lucide-react";
import type { AdvisorAccuracyStats } from "@/app/types/advisor-groups";
import { getAdvisorAccuracy } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

interface AdvisorAccuracyCardProps {
  advisorId: string;
  /** Pre-fetched stats — skips the internal fetch if provided */
  stats?: AdvisorAccuracyStats | null;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AccuracyRing({ value }: { value: number }) {
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const filled = circ * (value / 100);
  const color =
    value >= 80 ? "#10b981" : value >= 60 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>
        {value}%
      </text>
    </svg>
  );
}

function ResultBar({
  label,
  count,
  total,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums text-xs text-muted-foreground">
        {count} <span className="opacity-60">({pct}%)</span>
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvisorAccuracyCard({ advisorId, stats: propStats, className }: AdvisorAccuracyCardProps) {
  const { session } = useAuth();
  const token = session?.token;
  const [stats, setStats] = useState<AdvisorAccuracyStats | null>(propStats ?? null);
  const [loading, setLoading] = useState(!propStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propStats !== undefined) {
      setStats(propStats);
      setLoading(false);
      return;
    }
    if (!token || !advisorId) return;

    let cancelled = false;
    setLoading(true);
    getAdvisorAccuracy(token, advisorId)
      .then((data) => { if (!cancelled) { setStats(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError("Could not load accuracy data"); setLoading(false); } });

    return () => { cancelled = true; };
  }, [token, advisorId, propStats]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Error / empty state ─────────────────────────────────────────────────────
  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <BarChart2 className="h-4 w-4" />
          {error ?? "No prediction data yet"}
        </CardContent>
      </Card>
    );
  }

  const total = stats.totalPredictions;
  const hasData = total > 0;
  const byTimeframeEntries = Object.entries(stats.byTimeframe ?? {});

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Prediction Track Record
          {stats.currentStreak > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-auto gap-1 bg-orange-50 text-orange-700 border-orange-200 cursor-default">
                    <Flame className="h-3 w-3" />
                    {stats.currentStreak} streak
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{stats.currentStreak} correct predictions in a row</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Overall ring + summary ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {hasData && stats.overallAccuracy !== null ? (
            <AccuracyRing value={stats.overallAccuracy} />
          ) : (
            <div className="h-20 w-20 rounded-full border-4 border-dashed border-muted flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium">
              {hasData
                ? `${total} prediction${total === 1 ? "" : "s"} checked`
                : "No predictions checked yet"}
            </p>
            {hasData && (
              <ResultBar label="Correct" count={stats.correct} total={total} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-500" />
            )}
            {hasData && (
              <ResultBar label="Partial" count={stats.partial} total={total} icon={AlertCircle} color="text-amber-500" bg="bg-amber-400" />
            )}
            {hasData && (
              <ResultBar label="Incorrect" count={stats.incorrect} total={total} icon={XCircle} color="text-red-500" bg="bg-red-400" />
            )}
          </div>
        </div>

        {/* ── By timeframe ─────────────────────────────────────────────────── */}
        {byTimeframeEntries.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Timeframe</p>
            {byTimeframeEntries.map(([tf, data]) => {
              const accuracyPct = data.accuracy;
              const badge =
                accuracyPct >= 80
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : accuracyPct >= 60
                  ? "bg-green-50 text-green-700 border-green-200"
                  : accuracyPct >= 40
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200";
              return (
                <div key={tf} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{tf}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{data.total} signals</span>
                    <Badge variant="outline" className={`text-xs ${badge}`}>
                      {accuracyPct}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
