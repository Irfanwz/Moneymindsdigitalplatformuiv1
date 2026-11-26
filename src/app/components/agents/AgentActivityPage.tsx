import { AgentHealthPanel } from "./AgentHealthPanel";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BackgroundCheckCriteria } from "./BackgroundCheckCriteria";
import { BulkBackgroundChecks } from "./BulkBackgroundChecks";
import {
  Activity,
  RefreshCw,
  Play,
  Loader2,
  Database,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Zap,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers } from "@/app/lib/api";
import type { AuthUser } from "@/app/types/auth";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getAgentReadiness,
  getAgentBacklog,
  startAgent,
  resumeAgent,
  useAgentRuns,
  agentName,
  type AgentReadiness,
  type AgentRun,
} from "@/app/lib/agents";
import { AgentRunCard } from "./AgentRunCard";

export function AgentActivityPage({
  admin = false,
  embedded = false,
}: {
  admin?: boolean;
  embedded?: boolean;
}) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { runs, error, loading, refresh } = useAgentRuns();
  const [readiness, setReadiness] = useState<AgentReadiness | null>(null);
  const [setupError, setSetupError] = useState("");
  const [tasks, setTasks] = useState<
    { agentKey: string; targetId: string; label: string }[]
  >([]);
  const [busy, setBusy] = useState("");
  const [filter, setFilter] = useState(() => searchParams.get("status") || "all");
  const [ownerFilter, setOwnerFilter] = useState(
    () => searchParams.get("user") || "all",
  );
  const [agentFilter, setAgentFilter] = useState("all");
  const [since, setSince] = useState("");
  const [targetUser, setTargetUser] = useState(
    () => searchParams.get("user") || "",
  );
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [research, setResearch] = useState("1");

  async function loadSetup() {
    if (!admin) return;
    try {
      const ready = await getAgentReadiness();
      setReadiness(ready);
      setSetupError("");
      if (ready.ready) setTasks((await getAgentBacklog()).tasks);
      setUsers((await getAdminUsers("")).users);
    } catch (e) {
      setSetupError(
        e instanceof Error ? e.message : "Setup could not be checked.",
      );
    }
  }

  useEffect(() => {
    void loadSetup();
  }, [admin]);

  async function run(agentKey: string, targetId = "self") {
    if (
      agentKey === "verification" &&
      (!readiness?.providers.length || !readiness.searchConfigured)
    ) {
      toast.error(
        "Configure an AI provider and TAVILY_API_KEY on the server before starting background checks.",
      );
      return;
    }
    setBusy(`${agentKey}:${targetId}`);
    try {
      await startAgent(agentKey, targetId);
      await refresh();
      toast.success("Agent queued. Progress appears below.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not start the agent.",
      );
    } finally {
      setBusy("");
    }
  }

  const statuses = [
    { id: "queued", label: "Queued", color: "text-blue-400" },
    { id: "running", label: "Running", color: "text-cyan-400" },
    { id: "completed", label: "Completed", color: "text-emerald-400" },
    { id: "failed", label: "Failed", color: "text-rose-400" },
    { id: "skipped", label: "Skipped", color: "text-slate-400" },
  ];

  const shown = useMemo(() => {
    return runs.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (ownerFilter === "all" ||
          r.userId === ownerFilter ||
          r.targetId === ownerFilter) &&
        (agentFilter === "all" || r.agentKey === agentFilter) &&
        (!since || r.createdAt.slice(0, 10) >= since),
    );
  }, [runs, filter, ownerFilter, agentFilter, since]);

  const role = admin
    ? "admin"
    : user?.currentRole || user?.approvedRoles[0] || "investor";

  return (
    <div className={embedded ? "" : "min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100"}>
      {!embedded && <Header userRole={role} userName={user?.fullName} />}
      <div
        className={
          embedded
            ? "space-y-6"
            : "w-full px-4 py-6 sm:px-8 sm:py-8 xl:px-14 space-y-6"
        }
      >
        {/* Main Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Cpu className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              AI Diligence Mesh &amp; Agent Operations
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {admin
                ? "Autonomous multi-agent execution pipeline, telemetry inspection, and automated retry watchdog."
                : "Track your AI diligence workflows and research outputs."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refresh();
              void loadSetup();
            }}
            className="text-xs font-medium border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Refresh Pipeline
          </Button>
        </div>

        {/* Readiness and Mesh Infrastructure Card */}
        {admin && (
          <Card className="p-5 rounded-2xl border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> AI Provider &amp; Storage Health
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                readiness?.ready
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
              }`}>
                {readiness?.ready ? "Operational Mesh Ready" : "Setup Needs Attention"}
              </span>
            </div>

            {setupError && (
              <p role="alert" className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                {setupError}
              </p>
            )}

            {readiness ? (
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1">
                  Storage: <span className="text-cyan-700 dark:text-cyan-400 font-semibold ml-1">{readiness.storage}</span>
                </Badge>
                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1">
                  Providers: <span className="text-emerald-700 dark:text-emerald-400 font-semibold ml-1">{readiness.providers.join(", ") || "None"}</span>
                </Badge>
                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1">
                  Search: <span className={readiness.searchConfigured ? "text-emerald-700 dark:text-emerald-400 font-semibold ml-1" : "text-amber-700 dark:text-amber-400 font-semibold ml-1"}>{readiness.searchConfigured ? "Tavily Ready ✓" : "Missing"}</span>
                </Badge>
                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1">
                  Vision / OCR: <span className={readiness.documentImagesConfigured ? "text-emerald-700 dark:text-emerald-400 font-semibold ml-1" : "text-slate-500 dark:text-slate-400 font-semibold ml-1"}>{readiness.documentImagesConfigured ? "Enabled" : "Disabled"}</span>
                </Badge>
              </div>
            ) : (
              !setupError && <p className="text-xs text-slate-500">Evaluating telemetry connectivity…</p>
            )}
          </Card>
        )}

        {admin && !loading && !error && (
          <AgentHealthPanel
            runs={runs}
            onInspect={(key) => {
              setAgentFilter(key);
              setFilter("all");
              setOwnerFilter("all");
              setSince("");
            }}
          />
        )}

        {(error || setupError) && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive"
          >
            {error || setupError}
          </div>
        )}

        {admin && !embedded && <BackgroundCheckCriteria />}
        {admin && !embedded && (
          <BulkBackgroundChecks
            ready={
              !!readiness?.ready &&
              !!readiness.providers.length &&
              readiness.searchConfigured
            }
            onQueued={() => {
              void refresh();
              void loadSetup();
            }}
          />
        )}

        {/* Status Filter Tab Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === "all"
                ? "border-cyan-500 bg-cyan-50/80 dark:bg-cyan-500/10 shadow-sm ring-1 ring-cyan-500/30"
                : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070d1a] hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">All Runs</span>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
              {loading ? "…" : runs.length}
            </p>
          </button>

          {statuses.map((s) => {
            const count = runs.filter((r) => r.status === s.id).length;
            const isActive = filter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFilter(filter === s.id ? "all" : s.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-cyan-500 bg-cyan-50/80 dark:bg-cyan-500/10 shadow-sm ring-1 ring-cyan-500/30"
                    : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070d1a] hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</span>
                  {s.id === "running" && count > 0 && (
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                  )}
                </div>
                <p className={`text-2xl font-bold tabular-nums mt-1 ${s.color}`}>
                  {loading ? "…" : count}
                </p>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar */}
        {admin && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070d1a] shadow-xs">
            <select
              aria-label="Filter runs by user"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 min-w-48"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="all">All Member Accounts</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>

            <select
              aria-label="Filter runs by agent"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <option value="all">All Diligence Agents</option>
              {[...new Set(runs.map((r) => r.agentKey))].map((k) => (
                <option key={k} value={k}>
                  {agentName(k)}
                </option>
              ))}
            </select>

            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              From (UTC)
              <input
                aria-label="Runs from date"
                type="date"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
            </label>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOwnerFilter("all");
                setAgentFilter("all");
                setSince("");
                setFilter("all");
              }}
              className="text-xs font-medium ml-auto text-slate-600 dark:text-slate-300"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Operational Dispatcher Console */}
        <Card className="p-5 rounded-2xl border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Play className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Dispatch Agent Execution
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              On-Demand Orchestration
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {admin ? (
              <>
                <Button
                  size="sm"
                  disabled={!!busy || !readiness?.ready}
                  onClick={() => run("prediction-check", "all")}
                  className="text-xs font-medium bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white"
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  Evaluate Due Predictions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!busy || !readiness?.ready}
                  onClick={() => run("credibility", "all")}
                  className="text-xs font-medium border-slate-200 dark:border-slate-700"
                >
                  Recalculate Credibility
                </Button>
              </>
            ) : (
              <>
                <Button disabled={!!busy} onClick={() => run("profile-quality")}>
                  Review Profile
                </Button>
                <Button variant="outline" disabled={!!busy} onClick={() => run("due-diligence")}>
                  Run Venture Due Diligence
                </Button>
              </>
            )}
          </div>

          {admin && (
            <div className="flex gap-2.5 flex-wrap pt-1">
              <select
                aria-label="Choose a user to review"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 flex-1 min-w-48"
              >
                <option value="">Select an account for targeted diligence...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={
                  !!busy ||
                  !targetUser.trim() ||
                  !readiness?.ready ||
                  !readiness?.providers.length ||
                  !readiness.searchConfigured
                }
                onClick={() => run("verification", targetUser.trim())}
                className="text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Launch Background Check
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!!busy || !targetUser.trim() || !readiness?.ready}
                onClick={() => run("due-diligence", targetUser.trim())}
                className="text-xs font-medium border-slate-200 dark:border-slate-700"
              >
                Venture Diligence
              </Button>
            </div>
          )}
        </Card>

        {/* Live Runs Feed */}
        <section className="space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">
              {filter === "all" ? "Pipeline Execution Stream" : `${filter.toUpperCase()} Runs`}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-sans">
                Latest 100 runs • Polling every 3s
              </span>
              {filter !== "all" && (
                <Button size="sm" variant="ghost" onClick={() => setFilter("all")} className="h-7 text-xs">
                  Show all
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyan-400" />
              <p className="text-xs text-slate-500 mt-2">Loading agent executions…</p>
            </div>
          ) : !shown.length ? (
            <Card className="p-8 text-center text-slate-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070d1a]">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-40 text-cyan-500" />
              <p className="text-sm font-medium">No runs match this view</p>
              <p className="text-xs text-slate-400 mt-0.5">Start an agent above to monitor execution steps.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {shown.map((r) => (
                <div key={r.id}>
                  <AgentRunCard
                    run={r}
                    showOwner={admin}
                    ownerName={users.find((u) => u.id === r.userId)?.fullName}
                    onRetry={
                      admin ||
                      !["verification", "prediction-check", "credibility", "document"].includes(
                        r.agentKey,
                      )
                        ? (run: AgentRun) =>
                            void startAgent(run.agentKey, run.targetId)
                              .then(refresh)
                              .catch((e) => toast.error(e.message))
                        : undefined
                    }
                  />
                  {r.status === "queued" &&
                    r.agentKey !== "document" &&
                    (admin ||
                      r.agentKey.startsWith("investor-") ||
                      [
                        "profile-quality",
                        "due-diligence",
                        "signal-sentiment",
                        "signal-prediction",
                      ].includes(r.agentKey)) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void resumeAgent(r.id)
                            .then(refresh)
                            .catch((e) => toast.error(e.message))
                        }
                        className="text-xs mt-1 text-cyan-400"
                      >
                        Resume Queued Run →
                      </Button>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Backlog Tasks */}
        {admin && (
          <Card className="p-5 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-sm">Awaiting Processing Tasks</h2>
              <Button size="sm" variant="ghost" onClick={() => void loadSetup()} className="h-7 text-xs">
                Reload Backlog
              </Button>
            </div>
            {!readiness?.ready ? (
              <p className="text-xs text-slate-500">
                Complete database setup to inspect backlog tasks.
              </p>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-slate-500">
                Zero backlog tasks awaiting execution. All records processed.
              </p>
            ) : (
              <div className="max-h-80 overflow-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {tasks.map((t) => (
                  <div
                    key={`${t.agentKey}:${t.targetId}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.label}</p>
                      <p className="text-[10px] text-slate-500 font-sans">{agentName(t.agentKey)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        !!busy ||
                        runs.some(
                          (r) =>
                            r.agentKey === t.agentKey &&
                            r.targetId === t.targetId &&
                            ["queued", "running"].includes(r.status),
                        )
                      }
                      onClick={() => run(t.agentKey, t.targetId)}
                      className="h-7 text-xs"
                    >
                      Run Now
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
