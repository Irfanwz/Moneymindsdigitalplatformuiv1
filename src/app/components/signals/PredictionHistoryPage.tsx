import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  BarChart2,
} from "lucide-react";
import type { GroupPredictionSummary, PredictionResult } from "@/app/types/advisor-groups";
import { getGroupPredictions } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { PredictionFilters, type FilterState } from "@/app/components/signals/PredictionFilters";

interface PredictionHistoryPageProps {
  groupId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function resultConfig(result: PredictionResult | null) {
  if (result === "correct")   return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2,  label: "Correct" };
  if (result === "partial")   return { color: "bg-amber-50 text-amber-700 border-amber-200",     icon: AlertCircle,   label: "Partial" };
  if (result === "incorrect") return { color: "bg-red-50 text-red-700 border-red-200",           icon: XCircle,       label: "Incorrect" };
  return                             { color: "bg-blue-50 text-blue-700 border-blue-200",        icon: Clock,         label: "Pending" };
}

function DirectionIcon({ dir }: { dir: GroupPredictionSummary["direction"] }) {
  if (dir === "up")   return <TrendingUp   className="h-3.5 w-3.5 text-green-600" />;
  if (dir === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return                     <Minus        className="h-3.5 w-3.5 text-muted-foreground" />;
}

function applyFilters(items: GroupPredictionSummary[], f: FilterState): GroupPredictionSummary[] {
  return items.filter((p) => {
    if (f.result !== "all" && p.result !== f.result && !(f.result === "pending" && !p.result)) return false;
    if (f.timeframe !== "all" && p.timeframe !== f.timeframe) return false;
    if (f.dateFrom && p.checkDate && p.checkDate < f.dateFrom) return false;
    if (f.dateTo   && p.checkDate && p.checkDate > f.dateTo)   return false;
    return true;
  });
}

// ─── Row component ─────────────────────────────────────────────────────────────

function PredictionRow({ p }: { p: GroupPredictionSummary }) {
  const { color, icon: Icon, label } = resultConfig(p.result);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-3 sm:px-4 py-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 hover:bg-muted/40 transition-colors"
      >
        {/* Title + direction */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <DirectionIcon dir={p.direction} />
          <span className="font-medium text-sm truncate">{p.title}</span>
        </div>

        {/* Timeframe */}
        {p.timeframe && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{p.timeframe}</span>
        )}

        {/* Prices */}
        {p.baselinePrice && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ${p.baselinePrice}
            {p.actualPrice ? ` → $${p.actualPrice}` : ""}
          </span>
        )}

        {/* Accuracy + result badge */}
        <Badge variant="outline" className={`gap-1 text-xs ${color} whitespace-nowrap`}>
          <Icon className="h-3 w-3" />
          {p.accuracy !== null ? `${p.accuracy}%` : ""} {label}
        </Badge>

        {/* Date */}
        {p.checkDate && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(p.checkDate)}</span>
        )}
      </button>

      {/* Expanded explanation */}
      {expanded && p.explanation && (
        <>
          <Separator />
          <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/20 leading-relaxed">
            <span className="font-medium text-foreground">AI Explanation: </span>
            {p.explanation}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PredictionHistoryPage({ groupId }: PredictionHistoryPageProps) {
  const { session } = useAuth();
  const token = session?.token;
  const [all, setAll]     = useState<GroupPredictionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ result: "all", timeframe: "all", dateFrom: "", dateTo: "" });

  useEffect(() => {
    if (!token || !groupId) return;
    let cancelled = false;
    setLoading(true);

    getGroupPredictions(token, groupId)
      .then(({ predictions }) => {
        if (!cancelled) {
          // Sort: checked predictions first (desc by checkDate), pending last
          const sorted = [...predictions].sort((a, b) => {
            if (!a.result && b.result) return  1;
            if (a.result && !b.result) return -1;
            const ad = a.checkDate ?? "";
            const bd = b.checkDate ?? "";
            return bd.localeCompare(ad);
          });
          setAll(sorted);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setError("Could not load prediction history"); setLoading(false); } });

    return () => { cancelled = true; };
  }, [token, groupId]);

  // ── Derive available timeframes for filter dropdown ─────────────────────────
  const timeframes = Array.from(new Set(all.map((p) => p.timeframe).filter(Boolean) as string[]));

  const visible = applyFilters(all, filters);
  const checked  = visible.filter((p) => p.result !== null);
  const pending  = visible.filter((p) => p.result === null);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-4 w-4 text-blue-600" />
          Prediction History
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {all.length} total
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <PredictionFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableTimeframes={timeframes}
        />

        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No predictions match the selected filters.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Checked predictions */}
            {checked.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Completed ({checked.length})
                </p>
                {checked.map((p) => <PredictionRow key={p.signalId} p={p} />)}
              </div>
            )}

            {/* Pending predictions */}
            {pending.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pending ({pending.length})
                </p>
                {pending.map((p) => <PredictionRow key={p.signalId} p={p} />)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
