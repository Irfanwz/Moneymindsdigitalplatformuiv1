/**
 * CredibilityScorePage — full-page view for advisor to see their credibility details.
 * Shows: score card, history chart, tier breakdown table, fee caps.
 */
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Award, TrendingUp, Shield, DollarSign, Target, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { getMyCredibility, getCredibilityTiers, recalculateCredibility, type CredibilityScore, type CredibilityTier } from "@/app/lib/api";
import { CredibilityHistoryChart } from "@/app/components/credibility/CredibilityHistoryChart";

const TIER_COLORS: Record<string, string> = {
  elite: "bg-purple-100 text-purple-700 border-purple-200",
  expert: "bg-green-100 text-green-700 border-green-200",
  reliable: "bg-blue-100 text-blue-700 border-blue-200",
  developing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inconsistent: "bg-orange-100 text-orange-700 border-orange-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

const SCORE_RING_COLORS: Record<string, string> = {
  elite: "text-purple-500",
  expert: "text-green-500",
  reliable: "text-blue-500",
  developing: "text-yellow-500",
  inconsistent: "text-orange-500",
  poor: "text-red-500",
};

export function CredibilityScorePage() {
  const { session, user } = useAuth();
  const token = session?.token ?? "";
  const userName = user?.fullName ?? "";
  const [data, setData] = useState<CredibilityScore | null>(null);
  const [tiers, setTiers] = useState<CredibilityTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([getMyCredibility(token), getCredibilityTiers(token)])
      .then(([credRes, tierRes]) => {
        if (active) {
          setData(credRes);
          setTiers(tierRes.tiers);
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

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
      <DashboardLayout userRole="advisor" userName={userName}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const score = data?.score ?? null;
  const tier = data?.tier ?? null;
  const label = data?.label ?? "Unrated";
  const color = tier ?? "developing";

  return (
    <DashboardLayout userRole="advisor" userName={userName}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/advisor/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Credibility Score</h1>
              <p className="text-sm text-muted-foreground">Your trust rating based on prediction accuracy</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Recalculating..." : "Recalculate Now"}
          </Button>
        </div>

        {/* Main score + stats row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Big score card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6 pb-6 text-center">
              {score !== null ? (
                <>
                  <div className={`text-6xl font-bold mb-2 ${SCORE_RING_COLORS[color] ?? "text-slate-900"}`}>
                    {score}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">out of 100</div>
                  <Badge variant="outline" className={`${TIER_COLORS[color] ?? ""} text-sm px-4 py-1.5`}>
                    {label}
                  </Badge>
                  <Progress value={score} className="h-3 mt-4" />
                  {data?.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Last updated: {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <div className="py-4">
                  <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Not enough predictions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Need at least 5 checked predictions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee caps card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Your Fee Caps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-muted-foreground mb-1">Maximum Joining Fee</div>
                <div className="text-2xl font-bold">
                  {data?.maxJoinFee === Infinity || (data?.maxJoinFee ?? 0) > 9999
                    ? "Unlimited"
                    : data?.maxJoinFee === 0 ? "Free only" : `$${data?.maxJoinFee ?? 0}`}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-muted-foreground mb-1">Maximum Monthly Fee</div>
                <div className="text-2xl font-bold">
                  {data?.maxMonthlyFee === Infinity || (data?.maxMonthlyFee ?? 0) > 9999
                    ? "Unlimited"
                    : data?.maxMonthlyFee === 0 ? "Free only" : `$${data?.maxMonthlyFee ?? 0}`}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Improve your prediction accuracy to unlock higher fee tiers.
              </p>
            </CardContent>
          </Card>

          {/* How it works card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-emerald-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <p className="text-sm text-muted-foreground">Post signals with price predictions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <p className="text-sm text-muted-foreground">System checks predictions against real market prices daily at 9 AM</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <p className="text-sm text-muted-foreground">Score recalculates daily at 9:30 AM based on accuracy</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                <p className="text-sm text-muted-foreground">Higher score = higher fee caps for your groups</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History chart */}
        <CredibilityHistoryChart className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />

        {/* Tier breakdown table */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              All Rating Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Tier</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Score Range</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Max Join Fee</th>
                    <th className="pb-3 font-medium text-muted-foreground">Max Monthly Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => {
                    const isCurrentTier = tier === t.tier;
                    const nextMin = tiers[i - 1]?.minScore ?? 101;
                    const range = `${t.minScore}–${nextMin - 1}`;

                    return (
                      <tr key={t.tier} className={`border-b last:border-0 ${isCurrentTier ? "bg-emerald-50 dark:bg-emerald-900/10" : ""}`}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${TIER_COLORS[t.tier] ?? ""} text-xs`}>
                              {t.label}
                            </Badge>
                            {isCurrentTier && (
                              <span className="text-xs font-medium text-emerald-600">← You</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{range}</td>
                        <td className="py-3 pr-4">{t.maxJoinFee}</td>
                        <td className="py-3">{t.maxMonthlyFee}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scoring breakdown */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Point System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">+10 pts</div>
                <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Perfect Match</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Right direction + price within 2%</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">+6 pts</div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Late Match</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Right direction, price within 10%</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">+3 pts</div>
                <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Date Only</div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Right direction, price way off</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-lg font-bold text-red-700 dark:text-red-300">-5 pts</div>
                <div className="text-sm font-medium text-red-900 dark:text-red-100">Incorrect</div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Wrong direction entirely</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
