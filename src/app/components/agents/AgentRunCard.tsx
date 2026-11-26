import { useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCw,
  Terminal,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Code,
  FileText,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { agentName, type AgentRun } from "@/app/lib/agents";
import { DueDiligenceReport } from "./DueDiligenceReport";
import { AgentTokenUsage } from "./AgentTokenUsage";
import { ProfileLinkChecks } from "./ProfileLinkChecks";

export function AgentResult({ result }: { result: Record<string, any> }) {
  const summary = result.summary || result.executiveSummary || result.aiReasoning;
  return (
    <div className="space-y-4 text-sm">
      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      )}
      {result.reportType === "profile-due-diligence" && <DueDiligenceReport report={result as any} />}
      {result.findings?.profileLinks && <ProfileLinkChecks links={result.findings.profileLinks} />}
      {result.recommendation && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono uppercase">Recommendation:</span>
          <Badge
            variant="outline"
            className={
              result.recommendation === "accept"
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/20"
                : result.recommendation === "reject"
                ? "border-rose-500/40 text-rose-400 bg-rose-950/20"
                : "border-amber-500/40 text-amber-400 bg-amber-950/20"
            }
          >
            {result.recommendation.toUpperCase()}
          </Badge>
        </div>
      )}
      {result.sentiment && <Badge variant="outline">{result.sentiment}</Badge>}
      {result.sentimentReasoning && <p className="text-slate-600 dark:text-slate-400">{result.sentimentReasoning}</p>}
      {["strengths", "gaps", "suggestions", "keyPoints", "opportunities", "risks"].map(
        (key) =>
          Array.isArray(result[key]) &&
          result[key].length > 0 && (
            <div key={key} className="rounded-xl border border-slate-200 dark:border-slate-800/80 p-3.5 bg-slate-50/50 dark:bg-slate-900/20">
              <h4 className="font-semibold text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                {key === "keyPoints" ? "Key Points" : key}
              </h4>
              <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-700 dark:text-slate-300">
                {result[key].map((item: any, i: number) => (
                  <li key={i}>{typeof item === "string" ? item : <><strong>{item.title}</strong> {item.description}</>}</li>
                ))}
              </ul>
            </div>
          ),
      )}
      {Array.isArray(result.signals) && result.signals.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-xs font-mono uppercase tracking-wider text-slate-500">Research Signals</h4>
          <div className="space-y-2">
            {result.signals.map((s: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/40 text-xs">
                <div className="flex flex-wrap gap-2 items-center">
                  <strong className="text-cyan-400 font-mono">{s.asset}</strong>
                  <Badge variant="outline">{s.action}</Badge>
                  <span className="text-slate-500 font-mono">Confidence: {s.confidence}%</span>
                </div>
                <p className="mt-1.5 text-slate-600 dark:text-slate-300">{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.riskLevel && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Risk Assessment:</span> {result.riskLevel}{" "}
          {result.riskReasoning && `— ${result.riskReasoning}`}
        </p>
      )}
      {result.ticker && (
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          Asset: {result.ticker} {result.checkDate && `| Due: ${new Date(result.checkDate).toLocaleString()}`}
        </p>
      )}
      {result.reportMarkdown && (
        <details className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
          <summary className="cursor-pointer font-semibold text-xs font-mono uppercase text-slate-500">
            Full Verification Report
          </summary>
          <p className="whitespace-pre-wrap mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-mono">
            {result.reportMarkdown}
          </p>
        </details>
      )}
      {Array.isArray(result.sources) && result.sources.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-xs font-mono uppercase tracking-wider text-slate-500">
            Audited Sources ({result.sources.length})
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {result.sources
              .filter((s: any) => /^https?:\/\//i.test(s.url || ""))
              .map((s: any, i: number) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-cyan-600 dark:text-cyan-400 transition-colors"
                >
                  <span className="truncate pr-2">{s.title || s.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ))}
          </div>
        </div>
      )}
      {result.provider && (
        <p className="text-[11px] text-slate-500 font-mono">
          Synthesized with {result.provider}. Audited against multi-source evidence.
        </p>
      )}
    </div>
  );
}

// 5-Step Visual Pipeline Stepper
function PipelineStepper({ run }: { run: AgentRun }) {
  const stages = [
    { id: 1, name: "Queue", key: "queue", icon: Clock },
    { id: 2, name: "Data Ingestion", key: "ingestion", icon: FileText },
    { id: 3, name: "Web Search", key: "search", icon: Search },
    { id: 4, name: "LLM Synthesis", key: "synthesis", icon: Sparkles },
    { id: 5, name: "Output & Score", key: "output", icon: ShieldCheck },
  ];

  // Determine stage status
  const currentStep = useMemo(() => {
    if (run.status === "completed") return 6; // All completed
    if (run.status === "queued") return 1;
    if (run.status === "failed") {
      const err = (run.error || "").toLowerCase();
      if (err.includes("tavily") || err.includes("search")) return 3;
      if (err.includes("rate limit") || err.includes("token") || err.includes("model") || err.includes("provider")) return 4;
      if (err.includes("document") || err.includes("profile")) return 2;
      return Math.min(5, Math.max(1, Math.ceil((run.progress || 20) / 20)));
    }
    // Running
    return Math.min(5, Math.max(2, Math.ceil((run.progress || 30) / 20)));
  }, [run]);

  return (
    <div className="w-full pt-3 pb-1">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {stages.map((stage, idx) => {
          const isDone = run.status === "completed" || stage.id < currentStep;
          const isCurrent = stage.id === currentStep && run.status !== "completed";
          const isFailed = isCurrent && run.status === "failed";
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex-1 flex items-center">
              <div
                className={`flex-1 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                  isFailed
                    ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-medium"
                    : isDone
                    ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/15 text-emerald-700 dark:text-emerald-400 font-medium"
                    : isCurrent
                    ? "border-cyan-300 dark:border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300 font-semibold shadow-xs animate-pulse"
                    : "border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    isFailed
                      ? "bg-rose-600 dark:bg-rose-500 text-white dark:text-slate-950"
                      : isDone
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950"
                      : isCurrent
                      ? "bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isDone ? "✓" : isFailed ? "✕" : stage.id}
                </span>
                <span className="truncate text-[11px] hidden sm:inline">{stage.name}</span>
              </div>

              {idx < stages.length - 1 && (
                <span className="text-slate-400 dark:text-slate-700 mx-1 text-xs select-none">
                  ›
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Raw Telemetry & JSON Modal
function AgentTelemetryModal({
  run,
  open,
  onClose,
}: {
  run: AgentRun;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const durationSeconds = useMemo(() => {
    if (!run.startedAt) return null;
    const end = run.completedAt ? new Date(run.completedAt).getTime() : Date.now();
    const start = new Date(run.startedAt).getTime();
    return ((end - start) / 1000).toFixed(2);
  }, [run]);

  const rawJson = useMemo(() => {
    return JSON.stringify(
      {
        id: run.id,
        agentKey: run.agentKey,
        targetId: run.targetId,
        userId: run.userId,
        status: run.status,
        stage: run.stage,
        progress: run.progress,
        error: run.error,
        events: run.events,
        usage: run.usage,
        result: run.result,
        timestamps: {
          created: run.createdAt,
          started: run.startedAt,
          completed: run.completedAt,
        },
      },
      null,
      2,
    );
  }, [run]);

  const copyJson = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#070d1a] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-[#0c1427] to-slate-900 border-b border-slate-800 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <div>
                <DialogTitle className="text-base font-bold text-white tracking-tight">
                  Telemetry & JSON Audit: {agentName(run.agentKey)}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 font-mono mt-0.5">
                  Run ID: {run.id} • Target: {run.targetId}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize text-xs font-mono">
              {run.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Provider / Model</span>
              <p className="text-sm font-semibold font-mono text-cyan-700 dark:text-cyan-400 mt-1 truncate">
                {run.usage?.calls?.[0]?.model || run.result?.provider || "Groq / Gemini AI Mesh"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Latency Duration</span>
              <p className="text-sm font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                {durationSeconds ? `${durationSeconds}s` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Input Tokens</span>
              <p className="text-sm font-semibold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-1">
                {run.usage?.inputTokens?.toLocaleString() || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Output Tokens</span>
              <p className="text-sm font-semibold font-mono tabular-nums text-purple-700 dark:text-purple-400 mt-1">
                {run.usage?.outputTokens?.toLocaleString() || "—"}
              </p>
            </div>
          </div>

          {/* Individual Model Calls Breakdown */}
          {run.usage?.calls && run.usage.calls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                Tracked LLM Invocations ({run.usage.calls.length})
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 font-mono text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Purpose</th>
                      <th className="px-3 py-2">Model</th>
                      <th className="px-3 py-2">Tokens (In / Out)</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {run.usage.calls.map((c, i) => (
                      <tr key={c.id || i}>
                        <td className="px-3 py-2 font-medium capitalize">{c.purpose}</td>
                        <td className="px-3 py-2 text-cyan-400">{c.model}</td>
                        <td className="px-3 py-2 text-slate-400">
                          {c.inputTokens || 0} / {c.outputTokens || 0}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              c.status === "response_received"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : c.status === "failed"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-cyan-500/10 text-cyan-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw JSON Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                Raw Execution Payload & JSON Output
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={copyJson}
                className="h-7 text-xs border-slate-700"
              >
                {copied ? <Check className="h-3 w-3 mr-1 text-emerald-400" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
              {rawJson}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AgentRunCard({
  run,
  onRetry,
  showOwner = false,
  ownerName,
}: {
  run: AgentRun;
  onRetry?: (run: AgentRun) => void;
  showOwner?: boolean;
  ownerName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const active = ["queued", "running"].includes(run.status);
  const Icon = active
    ? Loader2
    : run.status === "completed"
    ? CheckCircle2
    : run.status === "failed"
    ? AlertCircle
    : Clock;

  // Failure cause analysis
  const failureType = useMemo(() => {
    if (!run.error) return null;
    const e = run.error.toLowerCase();
    if (e.includes("429") || e.includes("rate limit")) return { label: "Rate Limit (429)", desc: "AI provider concurrency quota reached. Auto-retry or fallback recommended." };
    if (e.includes("tavily") || e.includes("search")) return { label: "Search API Error", desc: "Tavily web search crawler query was rejected or rate-limited." };
    if (e.includes("timeout")) return { label: "Network Timeout", desc: "Multi-hop verification query took longer than the socket threshold." };
    if (e.includes("parse") || e.includes("json")) return { label: "Schema Validation Error", desc: "LLM output format deviated from structured schema." };
    return { label: "Execution Fault", desc: "Pipeline encountered an unhandled exception during processing." };
  }, [run.error]);

  return (
    <Card className="p-5 gap-3.5 rounded-2xl border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
              active
                ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                : run.status === "completed"
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : run.status === "failed"
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${active ? "animate-spin" : ""}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                {agentName(run.agentKey)}
              </h3>
              <Badge
                variant="outline"
                className={`capitalize text-[11px] font-semibold px-2 py-0.5 ${
                  run.status === "completed"
                    ? "border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                    : run.status === "failed"
                    ? "border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
                    : active
                    ? "border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-transparent"
                }`}
              >
                {run.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" aria-live="polite">
              {run.stage || "Processing"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTelemetryOpen(true)}
            className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5 text-cyan-600 dark:text-cyan-400" />
            Telemetry &amp; JSON
          </Button>

          {run.result && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700"
            >
              Result {expanded ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
            </Button>
          )}

          {onRetry && !active && run.agentKey !== "document" && (
            <Button
              size="sm"
              onClick={() => onRetry(run)}
              className={`h-8 text-xs font-semibold ${
                run.status === "failed"
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                  : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white"
              }`}
            >
              <RotateCw className="h-3 w-3 mr-1" />
              {run.status === "failed" ? "Retry Run" : "Re-run"}
            </Button>
          )}
        </div>
      </div>

      {/* Visual 5-Step Pipeline Stepper */}
      <PipelineStepper run={run} />

      {/* Progress Bar for Active Jobs */}
      {active && (
        <div className="space-y-1.5 pt-1">
          <Progress value={run.progress} className="h-1.5" />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{run.stage}</span>
            <span className="font-mono tabular-nums">{run.progress}%</span>
          </div>
        </div>
      )}

      {/* Failure Breakdown & Error Inspector */}
      {run.status === "failed" && run.error && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/5 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Pipeline Error Detected</span>
            </div>
            {failureType && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 font-semibold">
                {failureType.label}
              </span>
            )}
          </div>
          <p className="font-mono text-rose-900 dark:text-rose-200/90 break-words">{run.error}</p>
          {failureType && (
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-rose-200/70 dark:border-rose-900/30">
              <span className="font-semibold text-cyan-700 dark:text-cyan-400">Diagnostic:</span> {failureType.desc}
            </p>
          )}
        </div>
      )}

      {/* Token Usage Metrics Bar */}
      <AgentTokenUsage usage={run.usage} runStatus={run.status} />

      {/* Meta Footer */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-wrap gap-x-4 tabular-nums">
          <span>Created: {new Date(run.createdAt).toLocaleTimeString()}</span>
          {run.startedAt && <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>}
          {run.completedAt && <span>Finished: {new Date(run.completedAt).toLocaleTimeString()}</span>}
        </div>
        {showOwner && (
          <span className="truncate max-w-xs font-mono text-[11px]">
            User: {ownerName || run.userId.slice(0, 8)} • Target: {run.targetId.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Expanded Result View */}
      {expanded && run.result && (
        <div className="mt-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <AgentResult result={run.result} />
        </div>
      )}

      {/* Raw Telemetry Modal */}
      <AgentTelemetryModal
        run={run}
        open={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
      />
    </Card>
  );
}
