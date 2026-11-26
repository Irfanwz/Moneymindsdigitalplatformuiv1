/**
 * CredibilityScorePage — full-page institutional view for advisor credibility details.
 * Shows: hero score gauge, history chart, interactive fee cap validator, tier table, and point breakdown.
 */
import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import {
  Award,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  RefreshCw,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Clock,
  Calendar,
  XCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getMyCredibility,
  getCredibilityTiers,
  recalculateCredibility,
  checkFeeCap,
  type CredibilityScore,
  type CredibilityTier,
  type FeeCapCheck,
} from "@/app/lib/api";
import { CredibilityHistoryChart } from "@/app/components/credibility/CredibilityHistoryChart";

const TIER_COLORS: Record<string, string> = {
  elite: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
  expert: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  reliable: "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  developing: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  inconsistent: "bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700",
  poor: "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700",
};

export function CredibilityScorePage() {
  const { session, user } = useAuth();
  const token = session?.token ?? "";
  const userName = user?.fullName ?? "Advisor";
  const [data, setData] = useState<CredibilityScore | null>(null);
  const [tiers, setTiers] = useState<CredibilityTier[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Interactive Fee Cap Validator state
  const [joinInput, setJoinInput] = useState("100");
  const [monthlyInput, setMonthlyInput] = useState("50");
  const [checkingFee, setCheckingFee] = useState(false);
  const [feeCheckResult, setFeeCheckResult] = useState<FeeCapCheck | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getMyCredibility(token), getCredibilityTiers(token)])
      .then(([credRes, tierRes]) => {
        if (active) {
          setData(credRes);
          setTiers(tierRes.tiers);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Credibility data could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user?.id, token]);

  async function handleRecalculate() {
    if (!user || recalculating) return;
    setRecalculating(true);
    try {
      const res = await recalculateCredibility(token);
      const fresh = await getMyCredibility(token);
      setData(fresh);
      toast.success(
        res.score !== null && res.score !== undefined
          ? `Credibility recalculated: ${res.score}/100`
          : "Recalculation complete. Five checked predictions are required for a score.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recalculation failed. Check Agent Activity.");
    } finally {
      setRecalculating(false);
    }
  }

  async function handleCheckFee() {
    if (!user || checkingFee) return;
    setCheckingFee(true);
    try {
      const join = Math.max(0, parseFloat(joinInput) || 0);
      const monthly = Math.max(0, parseFloat(monthlyInput) || 0);
      const res = await checkFeeCap(token, join, monthly);
      setFeeCheckResult(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not validate fee cap.");
    } finally {
      setCheckingFee(false);
    }
  }

  const score = data?.score ?? null;
  const tier = data?.tier ?? null;
  const label = data?.label ?? "Unrated";
  const color = tier ?? "developing";

  const outlineBtn =
    "rounded-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30";

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]">
      <Header userRole="advisor" userName={userName} />

      <main className="w-full">
        {/* Institutional Dark Hero Header */}
        <section className="relative isolate overflow-hidden border-b border-cyan-900/60 bg-[#070d1d] text-slate-100">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.32),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_55%)]" />
          <div className="grid gap-8 px-4 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,30%)] lg:items-center xl:px-14">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 rounded-none text-xs font-medium text-cyan-200 hover:bg-cyan-950 hover:text-white">
                  <Link to="/advisor/profile">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Back to profile
                  </Link>
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Audited Credibility Engine
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Credibility <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Score &amp; Tiers</span>
              </h1>
              <p className="max-w-2xl text-sm text-slate-300">
                Transparent trust rating calculated from verified market predictions. Higher scores unlock premium group fee caps.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  onClick={handleRecalculate}
                  disabled={recalculating || loading}
                  className="rounded-none bg-emerald-300 font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-200"
                >
                  <RefreshCw className={`mr-1.5 h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
                  {recalculating ? "Recalculating…" : "Recalculate score"}
                </Button>
                <Button asChild variant="outline" className="rounded-none border-cyan-800 bg-transparent font-medium text-cyan-100 hover:bg-cyan-950 hover:text-white">
                  <Link to="/advisor/groups">Post prediction signal</Link>
                </Button>
              </div>
            </div>

            {/* Hero Live Score Card */}
            <div className="rounded-2xl border border-cyan-800/70 bg-slate-950/60 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Current trust rating</p>
                {score !== null && (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs">
                    {label}
                  </Badge>
                )}
              </div>
              {loading ? (
                <div className="h-14 flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading score…
                </div>
              ) : score !== null ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tabular-nums text-emerald-300">{score}</span>
                    <span className="text-sm text-slate-400">/ 100</span>
                  </div>
                  <Progress
                    value={score}
                    className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-cyan-400"
                  />
                  {data?.updatedAt && (
                    <p className="text-[11px] text-slate-400">
                      Updated {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-2xl font-bold text-slate-200">Pending (0–4 checked)</p>
                  <p className="text-xs text-slate-400">
                    Publish at least 5 market predictions and wait for target dates to unlock your score.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="w-full space-y-6 px-4 py-6 sm:px-8 sm:py-8 xl:px-14">
          {error && (
            <Card role="alert" className="p-4 rounded-2xl border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button asChild size="sm" variant="outline" className={outlineBtn}>
                <Link to="/activity">Open Agent Activity</Link>
              </Button>
            </Card>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse rounded-2xl border-cyan-900/10 bg-card/70 p-6" />
              ))}
            </div>
          ) : (
            <>
              {/* Top 3-Column Row: Fee Caps + Interactive Fee Validator + How It Works */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Fee caps card */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      Your allowed fee caps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Maximum joining fee</div>
                      <div className="text-2xl font-extrabold tabular-nums">
                        {data?.maxJoinFee === Infinity || (data?.maxJoinFee ?? 0) > 9999
                          ? "Unlimited"
                          : data?.maxJoinFee === 0 ? "Free only" : `$${data?.maxJoinFee ?? 0}`}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/70 bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Maximum monthly fee</div>
                      <div className="text-2xl font-extrabold tabular-nums">
                        {data?.maxMonthlyFee === Infinity || (data?.maxMonthlyFee ?? 0) > 9999
                          ? "Unlimited"
                          : data?.maxMonthlyFee === 0 ? "Free only" : `$${data?.maxMonthlyFee ?? 0}`}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Higher prediction accuracy automatically unlocks higher paid group tiers.
                    </p>
                  </CardContent>
                </Card>

                {/* Interactive Fee Cap Validator */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                        <Calculator className="h-4 w-4" />
                      </div>
                      Fee cap simulator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="sim-join-fee" className="text-xs font-medium text-muted-foreground block mb-1">
                          Joining fee ($)
                        </label>
                        <Input
                          id="sim-join-fee"
                          type="number"
                          min="0"
                          value={joinInput}
                          onChange={(e) => setJoinInput(e.target.value)}
                          className="h-9 rounded-xl font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="sim-monthly-fee" className="text-xs font-medium text-muted-foreground block mb-1">
                          Monthly fee ($)
                        </label>
                        <Input
                          id="sim-monthly-fee"
                          type="number"
                          min="0"
                          value={monthlyInput}
                          onChange={(e) => setMonthlyInput(e.target.value)}
                          className="h-9 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleCheckFee}
                      disabled={checkingFee}
                      className="w-full rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm"
                    >
                      {checkingFee ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                      Check eligibility
                    </Button>

                    {feeCheckResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                          feeCheckResult.allowed
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {feeCheckResult.allowed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {feeCheckResult.allowed
                            ? "Permitted! Your current tier allows these group fees."
                            : feeCheckResult.reason || "Exceeds your current tier fee cap."}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* How it works card */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                        <Zap className="h-4 w-4" />
                      </div>
                      How scoring works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Post signals with asset & price predictions",
                      "AI checks predictions against live market prices daily at 9 AM",
                      "Score recalculates automatically at 9:30 AM",
                      "Higher score unlocks higher paid group fee caps",
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* History chart */}
              <CredibilityHistoryChart className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35" />

              {/* Prediction breakdown counts */}
              {data?.breakdown && (
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <span>
                        Prediction breakdown
                        {data.totalPredictions !== null && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({data.totalPredictions} total checked)
                          </span>
                        )}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 dark:text-emerald-400" />
                        <div className="text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                          {data.breakdown.perfect}
                        </div>
                        <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Perfect Match</div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400">+10 pts each</div>
                      </div>
                      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-center space-y-1">
                        <Clock className="h-5 w-5 mx-auto text-cyan-600 dark:text-cyan-400" />
                        <div className="text-3xl font-extrabold tabular-nums text-cyan-700 dark:text-cyan-300">
                          {data.breakdown.late}
                        </div>
                        <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Late Match</div>
                        <div className="text-xs text-cyan-700 dark:text-cyan-400">+6 pts each</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center space-y-1">
                        <Calendar className="h-5 w-5 mx-auto text-amber-600 dark:text-amber-400" />
                        <div className="text-3xl font-extrabold tabular-nums text-amber-700 dark:text-amber-300">
                          {data.breakdown.dateOnly}
                        </div>
                        <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">Date Only</div>
                        <div className="text-xs text-amber-700 dark:text-amber-400">+3 pts each</div>
                      </div>
                      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-center space-y-1">
                        <XCircle className="h-5 w-5 mx-auto text-rose-600 dark:text-rose-400" />
                        <div className="text-3xl font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
                          {data.breakdown.incorrect}
                        </div>
                        <div className="text-sm font-semibold text-rose-900 dark:text-rose-100">Incorrect</div>
                        <div className="text-xs text-rose-700 dark:text-rose-400">-5 pts each</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tier breakdown table & Point system */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                {/* Tier breakdown table */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      All rating tiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 pr-4 font-medium text-muted-foreground">Tier</th>
                            <th className="pb-3 pr-4 font-medium text-muted-foreground">Score range</th>
                            <th className="pb-3 pr-4 font-medium text-muted-foreground">Max join</th>
                            <th className="pb-3 font-medium text-muted-foreground">Max monthly</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tiers.map((t, i) => {
                            const isCurrentTier = tier === t.tier;
                            const nextMin = tiers[i - 1]?.minScore ?? 101;
                            const range = `${t.minScore}–${nextMin - 1}`;

                            return (
                              <tr key={t.tier} className={`border-b last:border-0 ${isCurrentTier ? "bg-cyan-50/70 dark:bg-cyan-950/25" : ""}`}>
                                <td className="py-3 pr-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={`${TIER_COLORS[t.tier] ?? ""} text-xs`}>
                                      {t.label}
                                    </Badge>
                                    {isCurrentTier && (
                                      <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">Current</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 pr-4 font-mono text-xs">{range}</td>
                                <td className="py-3 pr-4 font-medium">{t.maxJoinFee}</td>
                                <td className="py-3 font-medium">{t.maxMonthlyFee}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Scoring rules */}
                <Card className="rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm dark:border-cyan-800/35">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      Point system
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Perfect Match</div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">Right direction + price within 2%</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300 shrink-0">+10 pts</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Late Match</div>
                          <p className="text-xs text-cyan-700 dark:text-cyan-400">Right direction, price within 10%</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold tabular-nums text-cyan-700 dark:text-cyan-300 shrink-0">+6 pts</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">Date Only</div>
                          <p className="text-xs text-amber-700 dark:text-amber-400">Right direction, price way off</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold tabular-nums text-amber-700 dark:text-amber-300 shrink-0">+3 pts</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-rose-900 dark:text-rose-100">Incorrect</div>
                          <p className="text-xs text-rose-700 dark:text-rose-400">Wrong direction entirely</p>
                        </div>
                      </div>
                      <span className="text-base font-extrabold tabular-nums text-rose-700 dark:text-rose-300 shrink-0">-5 pts</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className={`mt-1 w-full ${outlineBtn}`}>
                      <Link to="/advisor/dashboard">
                        Back to advisor dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
