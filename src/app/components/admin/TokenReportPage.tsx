/**
 * Token Burn Report Page — /admin/token-report
 *
 * Shows a full audit trail of AI token consumption:
 *  - Summary cards (all-time / monthly / today)
 *  - Per-agent breakdown table
 *  - Per-user breakdown table
 *  - Daily timeline bar chart (last 30 days)
 *  - CSV export for each table
 */

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { BarChart3, Download, RefreshCw, Zap, Calendar, Clock } from "lucide-react";
import { request } from "@/app/lib/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }
function fmtCost(n: number) { return n < 0.001 ? "<$0.001" : `$${n.toFixed(3)}`; }
function fmtDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

function downloadCsv(filename: string, rows: Record<string, any>[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => c.label).join(",");
  const body = rows.map((r) =>
    columns.map((c) => JSON.stringify(r[c.key] ?? "")).join(",")
  ).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface TokenBlock { input: number; output: number; total: number; cost: number; runs: number; }
interface Summary { allTime: TokenBlock; monthly: TokenBlock; today: TokenBlock; }
interface AgentRow { agentKey: string; runs: number; input: number; output: number; total: number; cost: number; }
interface UserRow  { userId: string; name: string; email: string; runs: number; input: number; output: number; total: number; cost: number; }
interface DayRow   { date: string; input: number; output: number; total: number; cost: number; runs: number; }

// ─── Summary card ────────────────────────────────────────────────────────────

function SummaryCard({ title, block, icon: Icon }: { title: string; block: TokenBlock; icon: any }) {
  return (
    <Card className="p-5 shadow-none space-y-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm font-medium">{title}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">{fmt(block.total)}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between"><span>Input tokens</span><span>{fmt(block.input)}</span></div>
        <div className="flex justify-between"><span>Output tokens</span><span>{fmt(block.output)}</span></div>
        <div className="flex justify-between"><span>Agent runs</span><span>{fmt(block.runs)}</span></div>
        <div className="flex justify-between font-medium text-foreground"><span>Est. cost</span><span>{fmtCost(block.cost)}</span></div>
      </div>
    </Card>
  );
}

// ─── Agent label formatter ────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  "verification":         "Background Verification",
  "due-diligence":        "Due Diligence",
  "sentiment-analysis":   "Sentiment Analysis",
  "credibility":          "Credibility Scoring",
  "prediction-check":     "Prediction Checker",
  "profile-verification": "Profile Doc Verification",
};
function agentLabel(key: string) { return AGENT_LABELS[key] || key.replace(/-/g, " "); }

// ─── Main component ───────────────────────────────────────────────────────────

export function TokenReportPage() {
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [byAgent,  setByAgent]  = useState<AgentRow[]>([]);
  const [byUser,   setByUser]   = useState<UserRow[]>([]);
  const [timeline, setTimeline] = useState<DayRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [s, a, u, t] = await Promise.all([
        request<{ summary: Summary }>("/api/admin/token-report/summary"),
        request<{ byAgent: AgentRow[] }>("/api/admin/token-report/by-agent"),
        request<{ byUser: UserRow[] }>("/api/admin/token-report/by-user"),
        request<{ timeline: DayRow[] }>("/api/admin/token-report/timeline?days=30"),
      ]);
      setSummary(s.summary);
      setByAgent(a.byAgent);
      setByUser(u.byUser);
      setTimeline(t.timeline);
    } catch (e: any) {
      setError(e.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const agentCsvCols = [
    { key: "agentKey", label: "Agent" },
    { key: "runs",     label: "Runs" },
    { key: "input",    label: "Input Tokens" },
    { key: "output",   label: "Output Tokens" },
    { key: "total",    label: "Total Tokens" },
    { key: "cost",     label: "Est. Cost (USD)" },
  ];
  const userCsvCols = [
    { key: "name",   label: "Name" },
    { key: "email",  label: "Email" },
    { key: "runs",   label: "Runs" },
    { key: "input",  label: "Input Tokens" },
    { key: "output", label: "Output Tokens" },
    { key: "total",  label: "Total Tokens" },
    { key: "cost",   label: "Est. Cost (USD)" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-2">
            MoneyMinds / Admin
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7" /> Token Burn Report
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Full audit trail of AI token consumption — per agent, per user, and over time.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid sm:grid-cols-3 gap-4">
          <SummaryCard title="All Time"    block={summary.allTime} icon={Zap} />
          <SummaryCard title="This Month"  block={summary.monthly} icon={Calendar} />
          <SummaryCard title="Today"       block={summary.today}   icon={Clock} />
        </div>
      )}

      {/* Timeline Chart */}
      <Card className="p-6 shadow-none">
        <h2 className="font-semibold mb-4">Tokens Per Day — Last 30 Days</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading chart…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeline} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => [fmt(value), name === "input" ? "Input Tokens" : "Output Tokens"]}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Legend formatter={(v) => v === "input" ? "Input Tokens" : "Output Tokens"} />
              <Bar dataKey="input"  fill="#6366f1" name="input"  radius={[3,3,0,0]} />
              <Bar dataKey="output" fill="#a5b4fc" name="output" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Per-Agent Table */}
      <Card className="shadow-none overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Token Usage by Agent</h2>
          <Button variant="outline" size="sm" onClick={() => downloadCsv("tokens-by-agent.csv", byAgent, agentCsvCols)}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground p-5">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !byAgent.length ? (
          <p className="p-5 text-sm text-muted-foreground">No agent runs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Agent", "Runs", "Input Tokens", "Output Tokens", "Total Tokens", "Est. Cost"].map((h) => (
                    <th key={h} className="p-4 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {byAgent.map((row) => (
                  <tr key={row.agentKey} className="hover:bg-muted/20">
                    <td className="p-4 font-medium capitalize">{agentLabel(row.agentKey)}</td>
                    <td className="p-4">{fmt(row.runs)}</td>
                    <td className="p-4">{fmt(row.input)}</td>
                    <td className="p-4">{fmt(row.output)}</td>
                    <td className="p-4 font-semibold">{fmt(row.total)}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-muted border-transparent font-mono">{fmtCost(row.cost)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Per-User Table */}
      <Card className="shadow-none overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Token Usage by User</h2>
          <Button variant="outline" size="sm" onClick={() => downloadCsv("tokens-by-user.csv", byUser, userCsvCols)}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground p-5">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !byUser.length ? (
          <p className="p-5 text-sm text-muted-foreground">No agent runs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["User", "Email", "Runs", "Input Tokens", "Output Tokens", "Total Tokens", "Est. Cost"].map((h) => (
                    <th key={h} className="p-4 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {byUser.map((row) => (
                  <tr key={row.userId} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{row.name}</td>
                    <td className="p-4 text-muted-foreground">{row.email}</td>
                    <td className="p-4">{fmt(row.runs)}</td>
                    <td className="p-4">{fmt(row.input)}</td>
                    <td className="p-4">{fmt(row.output)}</td>
                    <td className="p-4 font-semibold">{fmt(row.total)}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-muted border-transparent font-mono">{fmtCost(row.cost)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
