/**
 * CredibilityHistoryChart — line chart showing score over time using recharts.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAuth } from "@/app/contexts/AuthContext";
import { getCredibilityHistory, type CredibilityHistoryEntry } from "@/app/lib/api";

interface CredibilityHistoryChartProps {
  className?: string;
}

const TIER_LINES = [
  { y: 90, label: "Elite", color: "#8b5cf6" },
  { y: 75, label: "Expert", color: "#22c55e" },
  { y: 60, label: "Reliable", color: "#3b82f6" },
  { y: 40, label: "Developing", color: "#eab308" },
  { y: 20, label: "Inconsistent", color: "#f97316" },
];

export function CredibilityHistoryChart({ className }: CredibilityHistoryChartProps) {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const [history, setHistory] = useState<CredibilityHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getCredibilityHistory(token, 90)
      .then((res) => { if (active) setHistory(res.history.reverse()); }) // oldest first for chart
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = history.map((entry) => ({
    date: new Date(entry.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: entry.score,
    tier: entry.tier,
    predictions: entry.totalPredictions,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Score History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Score history will appear here after daily recalculations.</p>
            <p className="text-xs mt-1">The system recalculates scores every day at 9:30 AM.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  formatter={(value: number, _name: string, props: { payload: { tier: string; predictions: number } }) => [
                    `${value} (${props.payload.tier}) — ${props.payload.predictions} predictions`,
                    "Score",
                  ]}
                />
                {TIER_LINES.map((line) => (
                  <ReferenceLine
                    key={line.label}
                    y={line.y}
                    stroke={line.color}
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                    label={{ value: line.label, position: "right", fontSize: 10, fill: line.color }}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
