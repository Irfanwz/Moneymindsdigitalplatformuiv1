/**
 * CredibilityScoreCard — sidebar card showing advisor's credibility score + tier.
 * Drop into AdvisorProfile sidebar or PublicAdvisorProfile.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Award, TrendingUp, RefreshCw, Loader2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getMyCredibility, recalculateCredibility, type CredibilityScore } from "@/app/lib/api";

const TIER_COLORS: Record<string, string> = {
  elite: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  expert: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  reliable: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  developing: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
  inconsistent: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  poor: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
};

const PROGRESS_COLORS: Record<string, string> = {
  elite: "[&>div]:bg-purple-500",
  expert: "[&>div]:bg-green-500",
  reliable: "[&>div]:bg-blue-500",
  developing: "[&>div]:bg-yellow-500",
  inconsistent: "[&>div]:bg-orange-500",
  poor: "[&>div]:bg-red-500",
};

interface CredibilityScoreCardProps {
  /** If provided, shows static data (public profile). Otherwise fetches own score. */
  score?: number | null;
  tier?: string | null;
  updatedAt?: string | null;
  /** Show recalculate button (only for own profile) */
  showActions?: boolean;
  className?: string;
}

export function CredibilityScoreCard({ score: propScore, tier: propTier, updatedAt: propUpdatedAt, showActions = false, className }: CredibilityScoreCardProps) {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const [data, setData] = useState<CredibilityScore | null>(null);
  const [loading, setLoading] = useState(!propScore && propScore !== 0);
  const [recalculating, setRecalculating] = useState(false);

  const score = propScore !== undefined ? propScore : data?.score ?? null;
  const tier = propTier !== undefined ? propTier : data?.tier ?? null;
  const label = data?.label ?? tierLabel(tier);
  const color = tier ?? "developing";
  const updatedAt = propUpdatedAt !== undefined ? propUpdatedAt : data?.updatedAt ?? null;
  const maxJoinFee = data?.maxJoinFee ?? null;
  const maxMonthlyFee = data?.maxMonthlyFee ?? null;

  useEffect(() => {
    if (propScore !== undefined || !token) return;
    let active = true;
    getMyCredibility(token)
      .then((res) => { if (active) setData(res); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, propScore]);

  async function handleRecalculate() {
    if (!token || recalculating) return;
    setRecalculating(true);
    try {
      await recalculateCredibility(token);
      const fresh = await getMyCredibility(token);
      setData(fresh);
    } catch { /* ignore */ }
    setRecalculating(false);
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Award className="h-5 w-5 text-emerald-500" />
          Credibility Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score !== null ? (
          <>
            {/* Score display */}
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 dark:text-white mb-1">{score}</div>
              <div className="text-sm text-muted-foreground mb-2">out of 100</div>
              <Badge variant="outline" className={`${TIER_COLORS[color] ?? TIER_COLORS.developing} text-sm px-3 py-1`}>
                {label}
              </Badge>
            </div>

            {/* Progress bar */}
            <Progress value={score} className={`h-3 ${PROGRESS_COLORS[color] ?? ""}`} />

            {/* Fee caps */}
            {maxJoinFee !== null && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-muted-foreground mb-1">Max Join Fee</div>
                  <div className="font-semibold text-sm">
                    {maxJoinFee === Infinity || maxJoinFee > 9999 ? "Unlimited" : maxJoinFee === 0 ? "Free" : `$${maxJoinFee}`}
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-muted-foreground mb-1">Max Monthly</div>
                  <div className="font-semibold text-sm">
                    {maxMonthlyFee === Infinity || (maxMonthlyFee ?? 0) > 9999 ? "Unlimited" : maxMonthlyFee === 0 ? "Free" : `$${maxMonthlyFee}`}
                  </div>
                </div>
              </div>
            )}

            {updatedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Updated {new Date(updatedAt).toLocaleDateString()}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 text-muted-foreground mb-2">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">Not enough data</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">At least 5 checked predictions are required</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground">Post signals with predictions to build your score</p>
          </div>
        )}

        {showActions && (
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/advisor/credibility">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <TrendingUp className="h-4 w-4" />
                View Details
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
              {recalculating ? "Recalculating..." : "Recalculate"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function tierLabel(tier: string | null): string {
  const labels: Record<string, string> = {
    elite: "Elite Advisor",
    expert: "Expert",
    reliable: "Reliable",
    developing: "Developing",
    inconsistent: "Inconsistent",
    poor: "Poor Track Record",
  };
  return tier ? labels[tier] ?? tier : "Unrated";
}
