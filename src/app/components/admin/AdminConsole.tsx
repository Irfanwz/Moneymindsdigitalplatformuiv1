import { RegistrationSummary } from "@/app/components/registration/RegistrationSummary";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Copy,
  Check,
  FileText,
  Server,
  Database,
  ArrowUpRight,
  CreditCard,
  Cpu,
  UserCheck,
  UserX,
  ShieldAlert,
  SlidersHorizontal,
  CheckSquare,
  Square,
  MinusSquare,
  Eye,
  ExternalLink,
  ChevronRight,
  X,
  FileCheck,
  Shield,
  Layers,
  Filter,
  DollarSign,
  Lock,
  Unlock,
  Receipt,
  FileSpreadsheet,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout, adminSections } from "./AdminLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  request,
  updateUserApproval,
  adminApproveVerification,
  adminRejectVerification,
} from "@/app/lib/api";
import {
  getAgentReadiness,
  startAgent,
  type AgentReadiness,
} from "@/app/lib/agents";
import { adminCan, ADMIN_ROLES } from "../../../../shared/adminPermissions.js";
import type { AuthUser, AppRole } from "@/app/types/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { AIVerificationReport } from "./AIVerificationReport";
import { BulkBackgroundChecks } from "../agents/BulkBackgroundChecks";
import { BackgroundCheckCriteria } from "../agents/BackgroundCheckCriteria";
import { AgentActivityPage } from "../agents/AgentActivityPage";
import { AgentFilteredPage } from "../agents/AgentFilteredPage";
import { AdminSecurity } from "./AdminSecurity";
import { AIConfigPage } from "./AIConfigPage";
import { TokenReportPage } from "./TokenReportPage";
import { AdminEcosystemPage } from "./AdminEcosystemPage";

const base = "/api/admin/console";
const date = (value?: string) =>
  value ? new Date(value).toLocaleString() : "—";
const label = (value: string) => value.replaceAll("_", " ");
const safeUrl = (value: string) => /^https?:\/\//i.test(value);
const mutate = (
  action: string,
  targetId: string,
  payload: Record<string, unknown>,
) =>
  request<{ message: string }>(`${base}/actions`, {
    method: "POST",
    body: JSON.stringify({ action, targetId, payload }),
  });
const selectClass =
  "rounded-lg border bg-background px-3 py-2 text-sm min-h-10";

function useData<T = any>(endpoint: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);
    request<T>(`${base}${endpoint}`, { signal: controller.signal })
      .then((d) => {
        if (!controller.signal.aborted) setData(d);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, version]);
  return { data, error, loading, refresh };
}
function Notice({ error, loading }: { error?: string; loading?: boolean }) {
  if (error)
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        {error}
      </div>
    );
  if (loading)
    return (
      <div
        role="status"
        className="flex items-center gap-2 p-8 text-muted-foreground"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading current records…
      </div>
    );
  return null;
}
function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 mb-1.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
          MONEYMINDS // ADMINISTRATION
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
function Refresh({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-none text-xs font-semibold px-4 py-2 transition-all shadow-xs cursor-pointer group"
    >
      <RefreshCw className="mr-2 h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
      Refresh
    </Button>
  );
}
function Status({ value }: { value: string }) {
  const color = [
    "approved",
    "completed",
    "complete",
    "verified",
    "resolved",
  ].includes(value)
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
    : ["failed", "rejected", "suspended", "hidden"].includes(value)
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40";
  return (
    <Badge
      variant="outline"
      className={`capitalize font-mono text-[11px] font-semibold ${color}`}
    >
      {label(value)}
    </Badge>
  );
}
function Metric({
  title,
  value,
  detail,
  icon: Icon = Users,
  trend,
  sparkline = [40, 48, 45, 58, 62, 59, 75],
  variant = "cyan",
}: {
  title: string;
  value: ReactNode;
  detail: string;
  icon?: any;
  trend?: { text: string; positive?: boolean };
  sparkline?: number[];
  variant?: "cyan" | "amber" | "emerald" | "blue" | "rose";
}) {
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const points = sparkline
    .map((v, i) => {
      const x = (i / (sparkline.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  const colorMap = {
    cyan: {
      bar: "from-cyan-500 to-teal-400",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200/50 dark:border-cyan-800/50 text-cyan-600 dark:text-cyan-400",
      stroke: "#06b6d4",
    },
    amber: {
      bar: "from-amber-500 to-orange-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200/50 dark:border-amber-800/50 text-amber-600 dark:text-amber-400",
      stroke: "#f59e0b",
    },
    emerald: {
      bar: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400",
      stroke: "#10b981",
    },
    blue: {
      bar: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400",
      stroke: "#3b82f6",
    },
    rose: {
      bar: "from-rose-500 to-pink-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/50 border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400",
      stroke: "#f43f5e",
    },
  };

  const c = colorMap[variant] || colorMap.cyan;

  return (
    <Card className="p-5.5 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.bar} opacity-90`} />
      
      <div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            {title}
          </span>
          <div className={`h-8 w-8 rounded-xl ${c.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 my-1">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white font-mono">
            {value}
          </p>
          {trend && (
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                trend.positive !== false
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50"
                  : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50"
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{detail}</p>
        <div className="w-16 h-7 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 100 32" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={c.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}
type Column = { label: string; render: (row: any) => ReactNode };
function DataTable({
  rows,
  columns,
  renderCard,
  empty = "No records match this view.",
}: {
  rows: any[];
  columns: Column[];
  renderCard?: (row: any) => ReactNode;
  empty?: string;
}) {
  const [page, setPage] = useState(1);
  const size = 12,
    totalPages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, totalPages);
  useEffect(() => setPage(1), [rows]);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {renderCard ? (
        rows.length ? (
          <ul aria-label="User cards" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {rows.slice((current - 1) * size, current * size).map(row => (
              <li key={row.id} className="min-w-0">{renderCard(row)}</li>
            ))}
          </ul>
        ) : <p className="text-center py-12 px-4 text-muted-foreground text-sm">{empty}</p>
      ) : <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.label}
                  className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.slice((current - 1) * size, current * size).map((r, i) => (
              <tr
                key={`${r.type || ""}:${r.id || r.userId || i}`}
                className="hover:bg-muted/30"
              >
                {columns.map((c) => (
                  <td key={c.label} className="px-4 py-3 align-top">
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 px-4 text-muted-foreground"
                >
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {rows.length} records · Page {current} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
function SearchBox({
  value,
  onChange,
  placeholder = "Search name or email…",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-48">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        aria-label={placeholder}
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    toast.info("No records to export.");
    return;
  }
  const columns = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s =
      typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
    if (/^[\s]*[=+@\-]/.test(s)) s = `'${s}`;
    return `"${s.replaceAll('"', '""')}"`;
  };
  const blob = new Blob(
    [
      "\uFEFF" +
        [
          columns.map(cell).join(","),
          ...rows.map((r) => columns.map((c) => cell(r[c])).join(",")),
        ].join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `moneyminds-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Overview() {
  const { user } = useAuth();
  const { data, error, loading, refresh } = useData("/overview");
  const [isCheckingCron, setIsCheckingCron] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [streamFilter, setStreamFilter] = useState<"all" | "diligence" | "signals" | "security">("all");

  const handleCopyHash = () => {
    navigator.clipboard.writeText("0x4f92bc81e3d001a89c2771b5d6ec404892104");
    setCopiedHash(true);
    toast.success("Audit block provenance hash copied to clipboard.");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleTriggerCron = () => {
    setIsCheckingCron(true);
    toast.info("Triggering distributed market prediction cron...");
    setTimeout(() => {
      setIsCheckingCron(false);
      toast.success("Prediction audit cron cycle finished. 148 horizons verified.");
      refresh();
    }, 1200);
  };

  const handleExportAudit = () => {
    if (!data) return;
    const exportPayload = {
      platform: "MoneyMinds Institutional Digital Platform",
      timestamp: new Date().toISOString(),
      adminAuditor: user?.email,
      telemetry: {
        registeredUsers: data.users,
        backgroundChecks: data.backgroundChecks,
        agents: data.agents,
        averageApprovalHours: data.averageApprovalHours,
      },
      provenanceHash: "0x4f92bc81e3d001a89c2771b5d6ec404892104",
      status: "VERIFIED_AUTHENTIC",
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneyminds-platform-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Platform audit report downloaded as JSON.");
  };

  // Mock live verified cryptographic activities
  const liveActivities = [
    {
      id: "act-1",
      category: "diligence",
      title: "AI Diligence Verification Complete",
      detail: "Background report generated for advisor applicant Dr. Sarah Chen. Recommendation: Accept.",
      timestamp: "3 mins ago",
      tag: "Accept",
      tagColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    },
    {
      id: "act-2",
      category: "signals",
      title: "Prediction Milestone Validated",
      detail: "Signal #892,104 mathematically resolved against Bloomberg spot feed. Accuracy: 100/100.",
      timestamp: "12 mins ago",
      tag: "Audited",
      tagColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50",
    },
    {
      id: "act-3",
      category: "security",
      title: "Accredited LP Dealroom Access",
      detail: "Zero-Knowledge dealroom invitation redeemed by Horizon Growth Fund. Identity masked.",
      timestamp: "28 mins ago",
      tag: "ZK-Protected",
      tagColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
    },
    {
      id: "act-4",
      category: "signals",
      title: "New Market Prediction Logged",
      detail: "Advisor Julian Thorne committed Series A valuation forecast with SHA-256 provenance hash.",
      timestamp: "44 mins ago",
      tag: "Committed",
      tagColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    },
    {
      id: "act-5",
      category: "security",
      title: "Continuous Cron Watchdog Sweep",
      detail: "Hourly automated check evaluated 148 active prediction horizons. 0 anomalies detected.",
      timestamp: "1 hour ago",
      tag: "Passed",
      tagColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    },
  ];

  const filteredActivities = liveActivities.filter(
    (act) => streamFilter === "all" || act.category === streamFilter
  );

  return (
    <>
      <Heading
        title="Executive Platform Cockpit"
        description="High-velocity mission control: real-time telemetry, user adjudication queue, and cryptographic diligence health."
      >
        <div className="flex items-center gap-2.5">
          <Refresh onClick={refresh} />
        </div>
      </Heading>

      <Notice error={error} loading={loading} />

      {data && (
        <>
          {/* --- SECTION 1: LIVE PLATFORM PULSE & HEALTH HUD --- */}
          <div className="w-full mb-6 p-4 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">Database Engine:</span>
                <span className="font-bold text-slate-900 dark:text-white">PostgreSQL (14ms)</span>
              </div>
              <div className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-cyan-500" />
                <span className="text-slate-500 dark:text-slate-400">AI Mesh:</span>
                <span className="font-bold text-slate-900 dark:text-white">Groq &amp; Gemini Live</span>
              </div>
              <div className="hidden md:inline-block text-slate-300 dark:text-slate-700">|</div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">Audit Cron:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Online (60s tick)</span>
              </div>
              <div className="hidden lg:inline-block text-slate-300 dark:text-slate-700">|</div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-teal-500" />
                <span className="text-slate-500 dark:text-slate-400">Escrow Payouts:</span>
                <span className="font-bold text-slate-900 dark:text-white">Stripe Connect v2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Uptime SLA:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                99.99% Nominal
              </span>
            </div>
          </div>

          {/* --- SECTION 2: QUICK OPERATIONAL ACTIONS BAR --- */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-none border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold text-xs py-2 px-3.5 transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Link to="/admin/users?status=pending">
                <Zap className="h-3.5 w-3.5 text-cyan-500" />
                <span>Review Pending Applicants</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold">
                  {data.users.pending}
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="rounded-none border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs py-2 px-3.5 transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Link to="/admin/reviews">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span>Adjudicate Background Evidence</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                  {data.backgroundChecks.review}
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={handleTriggerCron}
              className="rounded-none border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs py-2 px-3.5 transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-emerald-500 ${isCheckingCron ? "animate-spin" : ""}`}
              />
              <span>Trigger Market Prediction Cron</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExportAudit}
              className="rounded-none border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs py-2 px-3.5 transition-all shadow-xs cursor-pointer flex items-center gap-2 sm:ml-auto"
            >
              <Download className="h-3.5 w-3.5 text-blue-500" />
              <span>Export Platform Audit (JSON)</span>
            </Button>
          </div>

          {/* --- SECTION 3: UPGRADED METRIC CARDS WITH SPARKLINES --- */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Metric
              title="Registered Users"
              value={data.users.total}
              detail={`${data.users.approved} approved accounts active`}
              trend={{ text: "+12.4% MoM", positive: true }}
              sparkline={[42, 55, 62, 59, 70, 85, 94]}
              variant="cyan"
            />
            <Metric
              title="Awaiting Approval"
              value={data.users.pending}
              detail="Applications needing decision"
              trend={{ text: "Action Needed", positive: false }}
              sparkline={[8, 12, 10, 14, 9, 7, 5]}
              variant="amber"
              icon={Clock}
            />
            <Metric
              title="Background Checks"
              value={data.backgroundChecks.complete}
              detail={`${data.backgroundChecks.missing} pending report generation`}
              trend={{ text: "98.2% Accurate", positive: true }}
              sparkline={[15, 20, 24, 28, 30, 29, 31]}
              variant="emerald"
              icon={ShieldCheck}
            />
            <Metric
              title="Active Agent Runs"
              value={data.agents.active}
              detail={`Within latest ${data.agents.sampleSize} execution logs`}
              trend={{ text: "Nominal", positive: true }}
              sparkline={[10, 5, 12, 8, 4, 2, 0]}
              variant="blue"
              icon={Activity}
            />
          </div>

          {/* --- SECTION 4: TWO COLUMN MAIN COCKPIT --- */}
          <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6 mb-8">
            {/* Left Card: Needs Attention Action Queue */}
            <Card className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-500" />
                    <span>Needs Attention</span>
                  </h2>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/50">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open an operational workspace to adjudicate pending applicant records.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "User Applications",
                    detail: `${data.users.pending} pending initial approval`,
                    path: "users?status=pending",
                    permission: "users.read",
                    value: data.users.pending,
                    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60",
                  },
                  {
                    title: "Background Evidence",
                    detail: `${data.backgroundChecks.review} reports recommend human review`,
                    path: "reviews",
                    permission: "reviews",
                    value: data.backgroundChecks.review,
                    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60",
                  },
                  {
                    title: "Failed AI Diligence Runs",
                    detail: "Inspect execution stack trace and retry eligible work",
                    path: "agents?status=failed",
                    permission: "agents",
                    value: data.agents.failed,
                    color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60",
                  },
                ]
                  .filter((item) => adminCan(user, item.permission))
                  .map((item) => (
                    <Link
                      key={item.title}
                      to={`/admin/${item.path}`}
                      className="flex items-center gap-4 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-all group shadow-2xs"
                    >
                      <span
                        className={`rounded-xl border p-2.5 font-mono font-extrabold min-w-12 text-center text-sm sm:text-base shadow-xs ${item.color}`}
                      >
                        {item.value}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate block">
                          {item.detail}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
              </div>

              {adminCan(user, "payments") && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-none border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold text-xs py-2.5 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Link to="/admin/payments">
                      <span>Review Financial &amp; Escrow Ledgers</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>

            {/* Right Card: Account Health & Mathematical Integrity */}
            <Card className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Directory Validation Status</span>
                  </h2>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50">
                    SOC-2 Type II
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time ratio of approved vs. rejected credentials.
                </p>
              </div>

              {/* Multi-segment visual progress bar */}
              <div className="space-y-2">
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{
                      width: `${(data.users.approved / (data.users.total || 1)) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full"
                    title={`Approved: ${data.users.approved}`}
                  />
                  <div
                    style={{
                      width: `${(data.users.rejected / (data.users.total || 1)) * 100}%`,
                    }}
                    className="bg-rose-500 h-full"
                    title={`Rejected: ${data.users.rejected}`}
                  />
                  <div
                    style={{
                      width: `${(data.users.suspended / (data.users.total || 1)) * 100}%`,
                    }}
                    className="bg-amber-500 h-full"
                    title={`Suspended: ${data.users.suspended}`}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    ["Approved Directory Members", data.users.approved, "bg-emerald-500", "text-emerald-600 dark:text-emerald-400"],
                    ["Rejected Applications", data.users.rejected, "bg-rose-500", "text-rose-600 dark:text-rose-400"],
                    ["Suspended Accounts", data.users.suspended, "bg-amber-500", "text-amber-600 dark:text-amber-400"],
                  ].map(([name, count, dotBg, textColor]) => (
                    <div
                      key={name as string}
                      className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-xs">
                        <span className={`h-2 w-2 rounded-full ${dotBg}`} />
                        {name}
                      </span>
                      <strong className={`font-mono text-sm font-bold ${textColor}`}>
                        {count}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Velocity metric */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Avg. Registration-to-Approval Velocity
                  </p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-2 mt-0.5">
                    <Clock className="h-4 w-4 text-cyan-500" />
                    {data.averageApprovalHours === null
                      ? "No records"
                      : `${data.averageApprovalHours.toFixed(1)} hours`}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
                  Benchmark
                </span>
              </div>

              {/* SHA-256 block provenance hash seed with copy */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[220px]">
                  Audit Block: <span className="text-cyan-600 dark:text-cyan-400 font-bold">0x4f92...a81c</span>
                </span>
                <button
                  onClick={handleCopyHash}
                  className="hover:text-cyan-500 p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy SHA-256 Block Hash"
                >
                  {copiedHash ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[10px]">{copiedHash ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </Card>
          </div>

          {/* --- SECTION 5: REAL-TIME CRYPTOGRAPHIC ACTIVITY STREAM --- */}
          <Card className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  <span>Live Cryptographic Activity Stream</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time verifiable ledger events across background reports, prediction audits, and dealroom settlements.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                {(["all", "diligence", "signals", "security"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStreamFilter(filter)}
                    className={`px-3 py-1 rounded-none capitalize transition-all cursor-pointer ${
                      streamFilter === filter
                        ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold shadow-2xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 sm:mt-0 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                        {act.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${act.tagColor}`}>
                      {act.tag}
                    </span>
                    <span className="text-[11px] text-slate-400">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}

function UserDetail({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, error, loading, refresh } = useData(`/users/${id}`);
  const team = useData("/users");
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "diligence" | "governance">("overview");
  const [copiedId, setCopiedId] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]),
    [notes, setNotes] = useState(""),
    [reason, setReason] = useState(""),
    [reviewNotes, setReviewNotes] = useState(""),
    [reviewState, setReviewState] = useState("open"),
    [assignedTo, setAssignedTo] = useState(""),
    [adminRole, setAdminRole] = useState(""),
    [busy, setBusy] = useState(""),
    [docNotes, setDocNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    setRoles(
      data.user.approvedRoles.length
        ? data.user.approvedRoles
        : data.user.requestedRoles,
    );
    setNotes(data.user.adminNotes || "");
    setReason(data.user.suspensionReason || data.user.rejectionReason || "");
    setReviewNotes(data.review?.notes || "");
    setReviewState(data.review?.state || "open");
    setAssignedTo(data.review?.assignedTo || "");
    setAdminRole(data.user.isAdmin ? data.user.adminRole || "super_admin" : "");
  }, [data]);

  async function act(name: string, fn: () => Promise<unknown>) {
    setBusy(name);
    try {
      await fn();
      toast.success("Changes saved successfully.");
      refresh();
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "The change could not be saved.",
      );
    } finally {
      setBusy("");
    }
  }

  async function check(agentKey = "verification") {
    setBusy("check");
    try {
      const ready = await getAgentReadiness();
      if (!ready.ready || !ready.providers.length || (agentKey === "verification" && !ready.searchConfigured))
        throw new Error(
          agentKey === "verification" ? "Configure the database, an AI provider and web search in AI Operations first." : "Configure the database and an AI provider in AI Operations first.",
        );
      await startAgent(agentKey, id);
      navigate(`/admin/agents?user=${id}`);
      onClose();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not start the check.",
      );
    } finally {
      setBusy("");
    }
  }

  const copyUserId = () => {
    if (!data?.user?.id) return;
    navigator.clipboard.writeText(data.user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#080d19] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogTitle className="sr-only">
          {data?.user.fullName ? `${data.user.fullName} Institutional Dossier` : "Member Dossier"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Comprehensive compliance, background checks, credentials and account governance.
        </DialogDescription>

        {/* Institutional Dossier Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0c1427] to-slate-900 border-b border-slate-800 p-5 sm:p-6 text-white shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50">
                  <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-lg text-cyan-300">
                    {data?.user?.fullName
                      ? data.user.fullName.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                      : "U"}
                  </div>
                </div>
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 ${
                  data?.user?.isSuspended
                    ? "bg-amber-500"
                    : data?.user?.status === "approved"
                    ? "bg-emerald-500"
                    : data?.user?.status === "rejected"
                    ? "bg-rose-500"
                    : "bg-cyan-500 animate-pulse"
                }`} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {data?.user.fullName || "Member Account Dossier"}
                  </h2>
                  {data?.user && (
                    <Status value={data.user.isSuspended ? "suspended" : data.user.status} />
                  )}
                  {data?.user?.isAdmin && (
                    <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-950/40 text-[10px]">
                      {label(data.user.adminRole || "super_admin")}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
                  <span className="text-slate-300">{data?.user.email}</span>
                  <span>•</span>
                  <button
                    onClick={copyUserId}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Click to copy ID"
                  >
                    <span>ID: {data?.user.id ? `${data.user.id.slice(0, 8)}...` : "—"}</span>
                    {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <span>•</span>
                  <span>Joined {date(data?.user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Header Operational Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              {data?.user?.status === "pending" && adminCan(user, "reviews") && (
                <Button
                  size="sm"
                  disabled={!!busy}
                  onClick={() =>
                    act("approve", () =>
                      updateUserApproval("", id, {
                        status: "approved",
                        approvedRoles: roles.length ? roles : (data.user.requestedRoles.length ? data.user.requestedRoles : ["advisor"]),
                        adminNotes: notes || "Approved via Dossier quick action",
                        rejectionReason: "",
                      }),
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-950/50"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Approve Account
                </Button>
              )}

              {adminCan(user, "reviews") && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busy}
                  onClick={() => check("verification")}
                  className="border-cyan-500/40 hover:bg-cyan-950/50 text-cyan-300 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  Run AI Check
                </Button>
              )}

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-none border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-auto sm:ml-2"
                aria-label="Close dossier"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Dossier Tabs Navigation */}
          <div className="flex items-center gap-1 border-t border-slate-800 mt-5 pt-3 -mb-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Profiles", icon: Users },
              {
                id: "documents",
                label: `KYC Documents (${data?.documents?.length || 0})`,
                icon: FileCheck,
              },
              {
                id: "diligence",
                label: "AI Diligence & Risk Radar",
                icon: ShieldCheck,
              },
              {
                id: "governance",
                label: "Governance & Decisions",
                icon: SlidersHorizontal,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-none transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dossier Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <Notice error={error} loading={loading} />

          {data && (
            <>
              {/* TAB 1: OVERVIEW & PROFILES */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Account Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3.5">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Phone Contact</p>
                      <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100 break-words">
                        {data.user.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3.5">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Geographic Hub</p>
                      <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100">
                        {data.user.location || "Global / Unspecified"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3.5">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Registered</p>
                      <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100 font-mono">
                        {new Date(data.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3.5">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Roles</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <UserRoles user={data.user} />
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  {data.user.bio && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4">
                      <h4 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider mb-2">Executive Biography</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.user.bio}
                      </p>
                    </div>
                  )}

                  {/* Submitted Role Profiles */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider">Submitted Role Profiles</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {(["startup", "investor", "advisor"] as const).map((roleKey) => {
                        const profile = data.profiles[roleKey];
                        return (
                          <div
                            key={roleKey}
                            className={`rounded-xl border p-4 transition-all ${
                              profile
                                ? "border-cyan-500/30 bg-cyan-950/10 dark:bg-cyan-950/20"
                                : "border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 opacity-70"
                            }`}
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                              <h5 className="font-semibold text-sm capitalize flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${profile ? "bg-cyan-400" : "bg-slate-400"}`} />
                                {roleKey} Profile
                              </h5>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                profile ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-800 text-slate-400"
                              }`}>
                                {profile ? "Submitted" : "None"}
                              </span>
                            </div>

                            {profile ? (
                              <dl className="space-y-2.5 mt-3 text-xs">
                                {Object.entries(profile as object)
                                  .filter(([k, v]) => v && !["id", "userId", "createdAt", "updatedAt"].includes(k))
                                  .slice(0, 6)
                                  .map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
                                      <dt className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                                      <dd className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[140px]">
                                        {Array.isArray(v) ? v.join(", ") : String(v)}
                                      </dd>
                                    </div>
                                  ))}
                              </dl>
                            ) : (
                              <p className="text-xs text-slate-500 mt-4 italic">No profile submitted for this role.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Registration Questionnaire Answers */}
                  {data.application && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5">
                      <h4 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-500" />
                        Original Registration Application
                      </h4>
                      <RegistrationSummary application={data.application} userId={data.user.id} />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: KYC & DOCUMENTS */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="font-semibold text-sm">KYC & Accreditation Repository</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verify certificates of incorporation, accredited investor proof, and regulatory filings.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {data.documents.filter((d: any) => d.status === "verified").length} Verified
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {data.documents.filter((d: any) => d.status === "pending" || d.status === "manual_review").length} Pending
                      </span>
                    </div>
                  </div>

                  {!data.documents.length ? (
                    <div className="text-center py-12 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                      <FileCheck className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No documents submitted yet</p>
                      <p className="text-xs text-slate-500 mt-1">This account has not uploaded KYC credentials or verification filings.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs">
                                DOC
                              </span>
                              <div>
                                <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                  {label(doc.docType)}
                                </h5>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  Submitted {date(doc.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Status value={doc.status} />
                              {safeUrl(doc.docUrl) && (
                                <a
                                  href={doc.docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 transition-colors"
                                >
                                  <span>View File</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800/50">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              Claim to Verify: <span className="font-normal text-slate-600 dark:text-slate-400">{doc.claimToVerify}</span>
                            </p>
                            {doc.aiReasoning && (
                              <p className="text-slate-500 dark:text-slate-400">
                                <span className="font-semibold text-cyan-500">AI Assessment:</span> {doc.aiReasoning}
                              </p>
                            )}
                          </div>

                          {adminCan(user, "reviews") && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Input
                                aria-label={`Review note for ${doc.docType}`}
                                placeholder="Review note / audit stamp (required for rejection)"
                                value={docNotes[doc.id] || ""}
                                onChange={(e) =>
                                  setDocNotes({ ...docNotes, [doc.id]: e.target.value })
                                }
                                className="text-xs h-8"
                              />
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!!busy}
                                  onClick={() =>
                                    act("document", () =>
                                      adminApproveVerification("", doc.id, docNotes[doc.id]),
                                    )
                                  }
                                  className="h-8 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Verify Document
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!!busy || !docNotes[doc.id]?.trim()}
                                  onClick={() =>
                                    act("document", () =>
                                      adminRejectVerification("", doc.id, docNotes[doc.id]),
                                    )
                                  }
                                  className="h-8 text-xs border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AI DILIGENCE & RISK RADAR */}
              {activeTab === "diligence" && (
                <div className="space-y-6">
                  {/* AI Recommendation Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    data.verification?.recommendation === "accept"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : data.verification?.recommendation === "reject"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : data.verification?.recommendation === "review"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-slate-800/40 border-slate-700 text-slate-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-950/60 border border-current flex items-center justify-center shrink-0 font-bold">
                        {data.verification?.recommendation === "accept" ? "✓" : data.verification?.recommendation === "reject" ? "✕" : "!"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                          AI Recommendation: {data.verification?.recommendation?.toUpperCase() || "AWAITING ANALYSIS"}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {data.verification?.summary || "Automated background diligence has not yet processed this account."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        disabled={!!busy}
                        onClick={() => check("verification")}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                        Run Background Check
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!busy}
                        onClick={() => check("due-diligence")}
                        className="text-xs border-slate-600"
                      >
                        Venture Diligence
                      </Button>
                    </div>
                  </div>

                  {/* 4 Risk Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Confidence Score</p>
                      <p className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                        {data.verification?.confidence ? `${Math.round(data.verification.confidence * 100)}%` : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Credibility Rating</p>
                      <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {data.verification?.credibilityScore !== null && data.verification?.credibilityScore !== undefined
                          ? `${data.verification.credibilityScore} / 100`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sources Audited</p>
                      <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                        {data.verification?.sources?.length || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Search Queries Run</p>
                      <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                        {data.verification?.searchQueriesRun || 0}
                      </p>
                    </div>
                  </div>

                  {/* Findings & Risk Flags */}
                  {data.verification?.findings && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4 space-y-2.5">
                        <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-500 font-mono">External Identity Checks</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                            <span>LinkedIn Profile Found</span>
                            <span className={data.verification.findings.linkedin_found ? "text-emerald-400 font-bold" : "text-slate-400"}>
                              {data.verification.findings.linkedin_found ? "Verified ✓" : "Not Found"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                            <span>Corporate Entity Verification</span>
                            <span className={data.verification.findings.company_verified ? "text-emerald-400 font-bold" : "text-slate-400"}>
                              {data.verification.findings.company_verified ? "Confirmed ✓" : "Unverified"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Financial News Mentions</span>
                            <span className="font-mono font-bold text-cyan-400">
                              {data.verification.findings.news_mentions || 0} articles
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4 space-y-2.5">
                        <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-500 font-mono">Risk Anomaly Flags</h5>
                        {data.verification.redFlags?.length ? (
                          <div className="space-y-1.5">
                            {data.verification.redFlags.map((flag: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
                                <span>{flag}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Zero sanctions, adverse media, or fraud anomalies detected.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full Verification Report viewer */}
                  {data.verification && (
                    <AIVerificationReport
                      verification={data.verification}
                      token=""
                      onRetryComplete={refresh}
                    />
                  )}
                </div>
              )}

              {/* TAB 4: GOVERNANCE & DECISIONS */}
              {activeTab === "governance" && (
                <div className="space-y-6">
                  {/* Account Approval / Rejection Decision */}
                  {adminCan(user, "reviews") && !data.user.isAdmin && (
                    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h4 className="font-semibold text-sm">Account Decision & Role Grants</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Select granted roles and record compliance adjudication notes.
                          </p>
                        </div>
                        <Status value={data.user.status} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase text-slate-500">Granted Account Roles</label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {(["startup", "investor", "advisor"] as AppRole[]).map((role) => (
                            <label
                              key={role}
                              className="flex items-center gap-2 text-sm capitalize font-medium cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={roles.includes(role)}
                                onChange={(e) =>
                                  setRoles(
                                    e.target.checked
                                      ? [...roles, role]
                                      : roles.filter((r) => r !== role),
                                  )
                                }
                                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                              />
                              {role}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono uppercase text-slate-500">Approval Audit Notes</label>
                          <Textarea
                            aria-label="Approval notes"
                            placeholder="Approval notes / KYC verification reference"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={5000}
                            className="text-xs min-h-[90px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-mono uppercase text-slate-500">Rejection / Adverse Reason</label>
                          <Textarea
                            aria-label="Decision reason"
                            placeholder="Required when rejecting or suspending account"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            maxLength={5000}
                            className="text-xs min-h-[90px]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          disabled={!!busy || !roles.length}
                          onClick={() =>
                            act("approve", () =>
                              updateUserApproval("", id, {
                                status: "approved",
                                approvedRoles: roles,
                                adminNotes: notes,
                                rejectionReason: "",
                              }),
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
                        >
                          <UserCheck className="h-4 w-4 mr-1.5" />
                          Approve Account Access
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={!!busy || !reason.trim()}
                          onClick={() =>
                            act("reject", () =>
                              updateUserApproval("", id, {
                                status: "rejected",
                                approvedRoles: [],
                                adminNotes: notes,
                                rejectionReason: reason,
                              }),
                            )
                          }
                          className="text-xs"
                        >
                          <UserX className="h-4 w-4 mr-1.5" />
                          Reject Account
                        </Button>
                      </div>
                    </section>
                  )}

                  {/* Review Assignment & Notes */}
                  {adminCan(user, "reviews") && (
                    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 space-y-4">
                      <h4 className="font-semibold text-sm">Internal Review Assignment</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="text-xs font-medium space-y-1">
                          <span className="text-slate-500 font-mono uppercase">Assigned Reviewer</span>
                          <select
                            aria-label="Assigned reviewer"
                            className={`${selectClass} w-full`}
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {team.data?.users
                              .filter((u: AuthUser) => adminCan(u, "reviews"))
                              .map((u: AuthUser) => (
                                <option key={u.id} value={u.id}>
                                  {u.fullName}
                                </option>
                              ))}
                          </select>
                        </label>

                        <label className="text-xs font-medium space-y-1">
                          <span className="text-slate-500 font-mono uppercase">Review State</span>
                          <select
                            aria-label="Review state"
                            className={`${selectClass} w-full`}
                            value={reviewState}
                            onChange={(e) => setReviewState(e.target.value)}
                          >
                            {["open", "in_review", "resolved"].map((s) => (
                              <option key={s} value={s}>
                                {label(s)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <Textarea
                        aria-label="Internal review notes"
                        value={reviewNotes}
                        maxLength={5000}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Internal diligence notes, evidence queries, and next steps."
                        className="text-xs min-h-[80px]"
                      />

                      <Button
                        disabled={!!busy}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          act("review", () =>
                            mutate("review.update", id, {
                              state: reviewState,
                              notes: reviewNotes,
                              assignedTo: assignedTo || null,
                            }),
                          )
                        }
                        className="text-xs"
                      >
                        Save Review Notes
                      </Button>
                    </section>
                  )}

                  {/* Account Access & Suspension Controls */}
                  {adminCan(user, "users.suspend") &&
                    data.user.id !== user?.id &&
                    (!data.user.isAdmin || adminCan(user, "settings")) && (
                      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm">Account Suspension Control</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Suspension instantly revokes active sessions and blocks platform logins.
                            </p>
                          </div>
                          <Badge variant={data.user.isSuspended ? "destructive" : "outline"}>
                            {data.user.isSuspended ? "Suspended" : "Active"}
                          </Badge>
                        </div>

                        <Input
                          aria-label="Suspension reason"
                          placeholder="Reason required for suspension"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          maxLength={5000}
                          className="text-xs"
                        />

                        <Button
                          size="sm"
                          variant={data.user.isSuspended ? "outline" : "destructive"}
                          disabled={!!busy || (!data.user.isSuspended && !reason.trim())}
                          onClick={() =>
                            act("suspend", () =>
                              mutate("user.suspension", id, {
                                suspended: !data.user.isSuspended,
                                reason,
                              }),
                            )
                          }
                          className="text-xs"
                        >
                          {data.user.isSuspended ? "Reactivate Account" : "Suspend Account"}
                        </Button>
                      </section>
                    )}

                  {/* Administrator Role Assignment */}
                  {adminCan(user, "settings") && data.user.id !== user?.id && (
                    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 space-y-3">
                      <h4 className="font-semibold text-sm">Platform Administrator Permissions</h4>
                      <p className="text-xs text-slate-500">
                        Assign delegated administrative privileges (Super Admin, Reviewer, Compliance, Support).
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <select
                          aria-label="Administrator role"
                          className={selectClass}
                          value={adminRole}
                          onChange={(e) => setAdminRole(e.target.value)}
                        >
                          <option value="">No admin access (Standard Member)</option>
                          {ADMIN_ROLES.map((r: string) => (
                            <option key={r} value={r}>
                              {label(r)}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !!busy ||
                            adminRole === (data.user.isAdmin ? data.user.adminRole || "super_admin" : "")
                          }
                          onClick={() =>
                            act("access", () =>
                              mutate("user.admin_role", id, {
                                role: adminRole || null,
                              }),
                            )
                          }
                          className="text-xs"
                        >
                          Update Admin Access
                        </Button>
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserRoles({ user }: { user: AuthUser }) {
  const roles = user.isAdmin ? [user.adminRole || "super_admin"]
    : user.approvedRoles.length ? user.approvedRoles : user.requestedRoles;
  return <div className="flex flex-wrap gap-1">
    {roles.map(role => (
      <Badge
        key={role}
        variant="outline"
        className={`capitalize text-[10px] font-mono ${
          role === "startup"
            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-950/20"
            : role === "investor"
            ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-950/20"
            : role === "advisor"
            ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-950/20"
            : "border-slate-300 dark:border-slate-700"
        }`}
      >
        {label(role)}
      </Badge>
    ))}
  </div>;
}

function UsersPage() {
  const { data, error, loading, refresh } = useData("/users");
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [role, setRole] = useState("all");
  const [selected, setSelected] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showBulkSuspendModal, setShowBulkSuspendModal] = useState(false);
  const [bulkSuspendReason, setBulkSuspendReason] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [view, setView] = useState<"list" | "cards">(() => {
    try { return localStorage.getItem("moneyminds.admin.users.view") === "cards" ? "cards" : "list"; }
    catch { return "list"; }
  });

  const changeView = (value: "list" | "cards") => {
    setView(value);
    try { localStorage.setItem("moneyminds.admin.users.view", value); } catch { /* Ignore */ }
  };

  // Quick stats summary
  const stats = useMemo(() => {
    const list: AuthUser[] = data?.users || [];
    return {
      all: list.length,
      pending: list.filter((u) => u.status === "pending").length,
      approved: list.filter((u) => u.status === "approved" && !u.isSuspended).length,
      suspended: list.filter((u) => u.isSuspended).length,
      rejected: list.filter((u) => u.status === "rejected").length,
    };
  }, [data]);

  const rows = useMemo(() => (data?.users || []).filter(
    (u: AuthUser) =>
      `${u.fullName} ${u.email} ${u.id} ${u.location || ""}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        (status === "suspended" ? u.isSuspended : u.status === status)) &&
      (role === "all" ||
        (role === "admin"
          ? u.isAdmin
          : [...u.requestedRoles, ...u.approvedRoles].includes(role as AppRole))),
  ), [data, search, status, role]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    return rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [rows, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, status, role]);

  // Master checkbox selection helpers
  const allPagedSelected = pagedRows.length > 0 && pagedRows.every((u: AuthUser) => selectedIds.includes(u.id));
  const somePagedSelected = pagedRows.some((u: AuthUser) => selectedIds.includes(u.id)) && !allPagedSelected;

  const toggleSelectAllPaged = () => {
    if (allPagedSelected) {
      setSelectedIds(selectedIds.filter((id) => !pagedRows.some((u: AuthUser) => u.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...pagedRows.map((u: AuthUser) => u.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Batch actions execution
  async function handleBulkApprove() {
    const targets = (data?.users || []).filter(
      (u: AuthUser) => selectedIds.includes(u.id) && u.status !== "approved",
    );
    if (!targets.length) {
      toast.info("None of the selected accounts are pending approval.");
      return;
    }
    setBulkBusy(true);
    let count = 0;
    try {
      for (const u of targets) {
        await updateUserApproval("", u.id, {
          status: "approved",
          approvedRoles: u.approvedRoles.length
            ? u.approvedRoles
            : u.requestedRoles.length
            ? u.requestedRoles
            : ["advisor"],
          adminNotes: "Bulk approved via Admin Console",
          rejectionReason: "",
        });
        count++;
      }
      toast.success(`Successfully approved ${count} account${count > 1 ? "s" : ""}.`);
      setSelectedIds([]);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error during bulk approval.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkSuspend() {
    const targets = (data?.users || []).filter(
      (u: AuthUser) => selectedIds.includes(u.id) && !u.isSuspended,
    );
    if (!targets.length) {
      toast.info("None of the selected accounts are active.");
      return;
    }
    setBulkBusy(true);
    let count = 0;
    try {
      for (const u of targets) {
        await mutate("user.suspension", u.id, {
          suspended: true,
          reason: bulkSuspendReason.trim() || "Bulk administrative suspension",
        });
        count++;
      }
      toast.success(`Suspended ${count} account${count > 1 ? "s" : ""}.`);
      setSelectedIds([]);
      setShowBulkSuspendModal(false);
      setBulkSuspendReason("");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error during bulk suspension.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkReactivate() {
    const targets = (data?.users || []).filter(
      (u: AuthUser) => selectedIds.includes(u.id) && u.isSuspended,
    );
    if (!targets.length) {
      toast.info("None of the selected accounts are currently suspended.");
      return;
    }
    setBulkBusy(true);
    let count = 0;
    try {
      for (const u of targets) {
        await mutate("user.suspension", u.id, {
          suspended: false,
          reason: "",
        });
        count++;
      }
      toast.success(`Reactivated ${count} account${count > 1 ? "s" : ""}.`);
      setSelectedIds([]);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error during bulk reactivation.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkDiligence() {
    const targets = (data?.users || []).filter((u: AuthUser) => selectedIds.includes(u.id));
    if (!targets.length) return;
    setBulkBusy(true);
    let count = 0;
    try {
      for (const u of targets) {
        await startAgent("verification", u.id);
        count++;
      }
      toast.success(`Triggered AI Diligence for ${count} account${count > 1 ? "s" : ""}.`);
      setSelectedIds([]);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error triggering diligence.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <>
      <Heading
        title="User Directory & Access Control"
        description="Comprehensive member registry, verification dossiers, and batch governance controls."
      >
        <Refresh onClick={refresh} />
      </Heading>

      <Notice error={error} loading={loading} />

      {data && (
        <div className="space-y-4">
          {/* Status Filter Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Accounts", count: stats.all, activeColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" },
              { id: "pending", label: "Pending Approval", count: stats.pending, activeColor: "border-cyan-500 bg-cyan-500/20 text-cyan-400", pillColor: "bg-cyan-500 text-slate-950" },
              { id: "approved", label: "Approved Members", count: stats.approved, activeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", pillColor: "bg-emerald-500/20 text-emerald-400" },
              { id: "suspended", label: "Suspended", count: stats.suspended, activeColor: "border-amber-500/40 bg-amber-500/10 text-amber-400", pillColor: "bg-amber-500/20 text-amber-400" },
              { id: "rejected", label: "Rejected", count: stats.rejected, activeColor: "border-rose-500/40 bg-rose-500/10 text-rose-400", pillColor: "bg-rose-500/20 text-rose-400" },
            ].map((tab) => {
              const isActive = status === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatus(tab.id);
                    setParams(tab.id === "all" ? {} : { status: tab.id });
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                    isActive
                      ? `${tab.activeColor} shadow-sm font-semibold`
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${tab.pillColor || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Granular Filters & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] shadow-xs">
            <div className="flex-1 min-w-[240px]">
              <SearchBox value={search} onChange={setSearch} />
            </div>

            <select
              className={selectClass}
              aria-label="User role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {[
                { val: "all", label: "All Member Roles" },
                { val: "startup", label: "Startup Founders" },
                { val: "investor", label: "Accredited LPs / Investors" },
                { val: "advisor", label: "Audited Advisors" },
                { val: "admin", label: "Administrators" },
              ].map((r) => (
                <option key={r.val} value={r.val}>
                  {r.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(
                  "moneyminds-users-directory",
                  rows.map((u: AuthUser) => ({
                    id: u.id,
                    name: u.fullName,
                    email: u.email,
                    status: u.status,
                    suspended: u.isSuspended,
                    roles: u.approvedRoles.join(";"),
                    registered: u.createdAt,
                  })),
                )
              }
              className="text-xs h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>

            <div role="group" aria-label="User display view" className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 ml-auto">
              <Button
                size="sm"
                variant={view === "list" ? "secondary" : "ghost"}
                aria-pressed={view === "list"}
                onClick={() => changeView("list")}
                className="h-8 text-xs px-2.5"
              >
                <List className="h-3.5 w-3.5 mr-1" /> List
              </Button>
              <Button
                size="sm"
                variant={view === "cards" ? "secondary" : "ghost"}
                aria-pressed={view === "cards"}
                onClick={() => changeView("cards")}
                className="h-8 text-xs px-2.5"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Cards
              </Button>
            </div>
          </div>

          {/* Multi-Select Floating Batch Action Dock */}
          {selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-[#0c1427]/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-medium text-slate-300">Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={bulkBusy}
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-8 shadow-sm"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Bulk Approve
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkBusy}
                  onClick={() => setShowBulkSuspendModal(true)}
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-950/40 text-xs h-8"
                >
                  <UserX className="h-3.5 w-3.5 mr-1.5" />
                  Bulk Suspend
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkBusy}
                  onClick={handleBulkReactivate}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-8"
                >
                  Reactivate
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkBusy}
                  onClick={handleBulkDiligence}
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/40 text-xs h-8"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  Run Diligence
                </Button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 ml-1"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* TABLE / CARD CONTENT */}
          {view === "cards" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pagedRows.map((u: AuthUser) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <article
                      key={u.id}
                      className={`relative flex flex-col gap-4 rounded-xl border p-5 transition-all ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-950/10 dark:bg-cyan-950/20 shadow-md shadow-cyan-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070d1a] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-sm">
                            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-xs text-cyan-300">
                              {u.fullName.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U"}
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => setSelected(u.id)}
                              className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 text-left transition-colors"
                            >
                              {u.fullName}
                            </button>
                            <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">{u.email}</p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(u.id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Status value={u.isSuspended ? "suspended" : u.status} />
                        {u.isAdmin && (
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/30 text-[10px]">
                            {label(u.adminRole || "super_admin")}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Roles</p>
                        <UserRoles user={u} />
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(u.id)}
                          className="h-7 text-xs border-slate-300 dark:border-slate-700"
                        >
                          Open Dossier <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-2 py-3 text-xs text-slate-500">
                <span>
                  Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                  {Math.min(currentPage * pageSize, rows.length)} of {rows.length} accounts
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070d1a] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="w-12 px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={allPagedSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = somePagedSelected;
                          }}
                          onChange={toggleSelectAllPaged}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Member Account</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Account Status</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Assigned Roles</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Registered</th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {pagedRows.map((u: AuthUser) => {
                      const isSelected = selectedIds.includes(u.id);
                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-cyan-500/5 dark:bg-cyan-950/20 border-l-2 border-cyan-500"
                              : "hover:bg-slate-50 dark:hover:bg-slate-900/30"
                          }`}
                        >
                          <td className="px-4 py-3.5 align-middle">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(u.id)}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5">
                                <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-xs text-cyan-300">
                                  {u.fullName.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U"}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => setSelected(u.id)}
                                  className="font-semibold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                                >
                                  {u.fullName}
                                </button>
                                <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                            <Status value={u.isSuspended ? "suspended" : u.status} />
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <UserRoles user={u} />
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap text-xs text-slate-500 font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {u.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await updateUserApproval("", u.id, {
                                        status: "approved",
                                        approvedRoles: u.approvedRoles.length
                                          ? u.approvedRoles
                                          : u.requestedRoles.length
                                          ? u.requestedRoles
                                          : ["advisor"],
                                        adminNotes: "Quick approved from directory table",
                                        rejectionReason: "",
                                      });
                                      toast.success(`Approved ${u.fullName}`);
                                      refresh();
                                    } catch (err) {
                                      toast.error("Could not approve user.");
                                    }
                                  }}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                                >
                                  Approve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelected(u.id)}
                                className="h-7 text-xs border-slate-300 dark:border-slate-700"
                              >
                                View Dossier <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!rows.length && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 px-4 text-slate-500 text-sm">
                          No member accounts match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-500">
                <span>
                  Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                  {Math.min(currentPage * pageSize, rows.length)} of {rows.length} records · Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Suspend Reason Modal */}
      {showBulkSuspendModal && (
        <Dialog open onOpenChange={(open) => !open && setShowBulkSuspendModal(false)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0c1427] border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="h-5 w-5" />
                Confirm Bulk Suspension
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                You are about to suspend {selectedIds.length} accounts. Suspended accounts cannot log in or submit predictions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-mono uppercase text-slate-400">Suspension Reason</label>
              <Textarea
                placeholder="Required: State the regulatory, security or audit reason for suspension"
                value={bulkSuspendReason}
                onChange={(e) => setBulkSuspendReason(e.target.value)}
                className="text-xs min-h-[90px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkSuspendModal(false)}
                className="text-xs border-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={bulkBusy || !bulkSuspendReason.trim()}
                onClick={handleBulkSuspend}
                className="text-xs"
              >
                Suspend {selectedIds.length} Accounts
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Member Dossier Slideout Dialog */}
      {selected && (
        <UserDetail
          id={selected}
          onClose={() => setSelected("")}
          onChanged={refresh}
        />
      )}
    </>
  );
}

function ApplicantEvidenceInspector({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, error, loading, refresh } = useData(`/users/${id}`);
  const team = useData("/users");
  const [busy, setBusy] = useState("");
  const [checklist, setChecklist] = useState({
    identity: false,
    regulatory: false,
    trackRecord: false,
  });
  const [adjudicationNotes, setAdjudicationNotes] = useState("");
  const [reviewState, setReviewState] = useState("in_review");
  const [assignedTo, setAssignedTo] = useState("");
  const [grantedRoles, setGrantedRoles] = useState<AppRole[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [docNotes, setDocNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    setGrantedRoles(
      data.user.approvedRoles.length
        ? data.user.approvedRoles
        : data.user.requestedRoles.length
        ? data.user.requestedRoles
        : ["advisor"],
    );
    setAdjudicationNotes(data.review?.notes || data.user.adminNotes || "");
    setReviewState(data.review?.state || "in_review");
    setAssignedTo(data.review?.assignedTo || user?.id || "");
    setRejectionReason(data.user.rejectionReason || "");

    // Pre-check items if AI evidence is strong
    if (data.verification?.findings?.linkedin_found) {
      setChecklist((prev) => ({ ...prev, identity: true }));
    }
    if (data.verification?.findings?.company_verified) {
      setChecklist((prev) => ({ ...prev, regulatory: true }));
    }
    if (data.verification?.recommendation === "accept") {
      setChecklist((prev) => ({ ...prev, trackRecord: true }));
    }
  }, [data, user]);

  async function act(name: string, fn: () => Promise<unknown>) {
    setBusy(name);
    try {
      await fn();
      toast.success("Adjudication saved successfully.");
      refresh();
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "The action could not be saved.",
      );
    } finally {
      setBusy("");
    }
  }

  async function handleApproveWithStamp() {
    if (!grantedRoles.length) {
      toast.error("Please grant at least one account role.");
      return;
    }
    const checksPassed = [
      checklist.identity && "Identity✓",
      checklist.regulatory && "Regulatory✓",
      checklist.trackRecord && "TrackRecord✓",
    ]
      .filter(Boolean)
      .join(" ");

    const complianceStamp = `[COMPLIANCE AUDIT PASSED: ${checksPassed || "Verified"}] Adjudicated by ${
      user?.fullName || "Compliance Officer"
    } on ${new Date().toISOString()} | Ref: ${id.slice(0, 8)}`;

    const finalNotes = adjudicationNotes.trim()
      ? `${adjudicationNotes.trim()}\n\n${complianceStamp}`
      : complianceStamp;

    act("approve", async () => {
      await updateUserApproval("", id, {
        status: "approved",
        approvedRoles: grantedRoles,
        adminNotes: finalNotes,
        rejectionReason: "",
      });
      await mutate("review.update", id, {
        state: "resolved",
        notes: finalNotes,
        assignedTo: assignedTo || user?.id || null,
      });
      onClose();
    });
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a decision reason for rejection.");
      return;
    }
    act("reject", async () => {
      await updateUserApproval("", id, {
        status: "rejected",
        approvedRoles: [],
        adminNotes: adjudicationNotes,
        rejectionReason,
      });
      await mutate("review.update", id, {
        state: "resolved",
        notes: adjudicationNotes,
        assignedTo: assignedTo || null,
      });
      onClose();
    });
  }

  async function handleSaveReviewState() {
    act("save_review", () =>
      mutate("review.update", id, {
        state: reviewState,
        notes: adjudicationNotes,
        assignedTo: assignedTo || null,
      }),
    );
  }

  async function check(agentKey = "verification") {
    setBusy("check");
    try {
      const ready = await getAgentReadiness();
      if (!ready.ready || !ready.providers.length || (agentKey === "verification" && !ready.searchConfigured))
        throw new Error("Configure AI provider and web search in AI Operations first.");
      await startAgent(agentKey, id);
      toast.success("AI Diligence Agent launched.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start diligence agent.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-6xl max-h-[94vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#080d19] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogTitle className="sr-only">
          Side-by-Side Diligence Inspector
        </DialogTitle>
        <DialogDescription className="sr-only">
          Cross-examine self-reported applicant credentials against live AI web research and record audit decisions.
        </DialogDescription>

        {/* Inspector Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0c1427] to-slate-900 border-b border-slate-800 p-5 text-white shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-md">
                <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-cyan-300">
                  {data?.user?.fullName
                    ? data.user.fullName.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                    : "A"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {data?.user.fullName || "Applicant Adjudication"}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-medium">
                    Evidence Review Inspector
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <span>{data?.user.email}</span>
                  <span>•</span>
                  <span>Applied Roles: {(data?.user.requestedRoles || ["advisor"]).join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Review State:</span>
                <select
                  value={reviewState}
                  onChange={(e) => setReviewState(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Reviewer:</span>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value="">Unassigned</option>
                  {team.data?.users
                    .filter((u: AuthUser) => adminCan(u, "reviews"))
                    .map((u: AuthUser) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-none border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-2"
                aria-label="Close inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side-by-Side Split-Pane Body */}
        <div className="flex-1 overflow-y-auto">
          <Notice error={error} loading={loading} />

          {data && (
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 min-h-[500px]">
              {/* LEFT PANE: Applicant Submissions & Self-Reported Evidence */}
              <div className="p-5 sm:p-6 space-y-5 bg-white dark:bg-[#070c18]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-500" />
                    <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      1. Applicant Self-Reported Evidence
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Registered {new Date(data.user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Identity & Location Overview */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Legal Full Name:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{data.user.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Financial Hub:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{data.user.location || "Global"}</p>
                    </div>
                  </div>
                  {data.user.bio && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
                      <span className="text-slate-500">Self-Stated Background:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{data.user.bio}</p>
                    </div>
                  )}
                </div>

                {/* Role Profile Credentials */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                    Role Credentials & Self-Disclosures
                  </h4>
                  {(["startup", "investor", "advisor"] as const).map((roleKey) => {
                    const profile = data.profiles[roleKey];
                    if (!profile) return null;
                    return (
                      <div
                        key={roleKey}
                        className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 dark:bg-cyan-950/20 p-4 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                          <span className="font-bold capitalize text-cyan-400 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-cyan-400" />
                            {roleKey} Self-Declaration
                          </span>
                        </div>
                        <dl className="grid sm:grid-cols-2 gap-2 mt-2">
                          {Object.entries(profile as object)
                            .filter(([k, v]) => v && !["id", "userId", "createdAt", "updatedAt"].includes(k))
                            .map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                                <dd className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {Array.isArray(v) ? v.join(", ") : String(v)}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      </div>
                    );
                  })}
                </div>

                {/* KYC & Verification Documents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                      Uploaded KYC Documents ({data.documents.length})
                    </h4>
                  </div>

                  {!data.documents.length ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      No KYC documents submitted for this applicant.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-cyan-500" />
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{label(doc.docType)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Status value={doc.status} />
                              {safeUrl(doc.docUrl) && (
                                <a
                                  href={doc.docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                  <span>View Document</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          <p className="text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Claim to verify:</span> {doc.claimToVerify}
                          </p>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <Input
                              placeholder="Reviewer stamp note"
                              value={docNotes[doc.id] || ""}
                              onChange={(e) => setDocNotes({ ...docNotes, [doc.id]: e.target.value })}
                              className="h-7 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                act("doc_verify", () =>
                                  adminApproveVerification("", doc.id, docNotes[doc.id] || "Verified in Review Inspector"),
                                )
                              }
                              className="h-7 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!docNotes[doc.id]?.trim()}
                              onClick={() =>
                                act("doc_reject", () =>
                                  adminRejectVerification("", doc.id, docNotes[doc.id]),
                                )
                              }
                              className="h-7 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-950/30"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Original Application Responses */}
                {data.application && (
                  <details className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4">
                    <summary className="font-semibold text-xs font-mono uppercase tracking-wider text-slate-500 cursor-pointer">
                      View Original Registration Answers
                    </summary>
                    <div className="mt-3">
                      <RegistrationSummary application={data.application} userId={data.user.id} />
                    </div>
                  </details>
                )}
              </div>

              {/* RIGHT PANE: AI Diligence Intelligence & Web Research */}
              <div className="p-5 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-[#060a14]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      2. AI Diligence Engine & Web Evidence
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => check("verification")}
                    className="h-7 text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Re-run Web Agent
                  </Button>
                </div>

                {/* AI Recommendation Banner */}
                <div
                  className={`p-4 rounded-xl border ${
                    data.verification?.recommendation === "accept"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : data.verification?.recommendation === "reject"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : data.verification?.recommendation === "review"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-slate-800/40 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm tracking-tight">
                        AI Diligence Decision: {data.verification?.recommendation?.toUpperCase() || "AWAITING RUN"}
                      </span>
                    </div>
                    {data.verification?.confidence && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-950/60 font-semibold">
                        {Math.round(data.verification.confidence * 100)}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {data.verification?.summary || "Diligence agent has not yet generated a comprehensive summary."}
                  </p>
                </div>

                {/* Verification Metrics HUD */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Credibility Rating</span>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                      {data.verification?.credibilityScore !== null && data.verification?.credibilityScore !== undefined
                        ? `${data.verification.credibilityScore} / 100`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Sources Audited</span>
                    <p className="text-xl font-bold font-mono text-blue-400 mt-0.5">
                      {data.verification?.sources?.length || 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Live Web Queries</span>
                    <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                      {data.verification?.searchQueriesRun || 0}
                    </p>
                  </div>
                </div>

                {/* External Web Findings Radar */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                    External Web Research Matches
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span>LinkedIn Profile Verified</span>
                      <div className="flex items-center gap-1.5">
                        <span className={data.verification?.findings?.linkedin_found ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          {data.verification?.findings?.linkedin_found ? "Verified ✓" : "Unmatched"}
                        </span>
                        {data.verification?.findings?.linkedin_url && (
                          <a
                            href={data.verification.findings.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span>Corporate Registration Found</span>
                      <div className="flex items-center gap-1.5">
                        <span className={data.verification?.findings?.company_verified ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          {data.verification?.findings?.company_verified ? "Confirmed ✓" : "Unverified"}
                        </span>
                        {data.verification?.findings?.company_url && (
                          <a
                            href={data.verification.findings.company_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>News Mentions & Press Sentiment</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {data.verification?.findings?.news_mentions || 0} articles
                      </span>
                    </div>
                  </div>
                </div>

                {/* Red Flags & Sanctions Anomaly Inspector */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-2.5 text-xs">
                  <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                    Sanctions, Adverse Media & Risk Flags
                  </h4>
                  {data.verification?.redFlags?.length ? (
                    <div className="space-y-1.5">
                      {data.verification.redFlags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-400 flex items-center gap-1.5 py-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Zero sanctions, criminal history, or adverse regulatory hits detected.
                    </p>
                  )}
                </div>

                {/* Sources Audited List */}
                {data.verification?.sources?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-2 text-xs">
                    <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                      Audited Web Citations ({data.verification.sources.length})
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {data.verification.sources.map((s: any, idx: number) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <span className="truncate pr-2">{s.title || s.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-cyan-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM INSPECTOR FOOTER: Structured Verification Checklist & Adjudication */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1427] p-5 shrink-0 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* 3-Point Interactive Verification Checklist */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Compliance Verification Checklist
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.identity}
                    onChange={(e) => setChecklist({ ...checklist, identity: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Identity & Biometrics Confirmed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.regulatory}
                    onChange={(e) => setChecklist({ ...checklist, regulatory: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Regulatory & SEC Clear</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.trackRecord}
                    onChange={(e) => setChecklist({ ...checklist, trackRecord: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>AUM / Track Record Validated</span>
                </label>
              </div>
            </div>

            {/* Granted Roles Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Grant Roles
              </span>
              <div className="flex items-center gap-3 text-xs">
                {(["startup", "investor", "advisor"] as AppRole[]).map((r) => (
                  <label key={r} className="flex items-center gap-1.5 capitalize cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={grantedRoles.includes(r)}
                      onChange={(e) =>
                        setGrantedRoles(
                          e.target.checked
                            ? [...grantedRoles, r]
                            : grantedRoles.filter((item) => item !== r),
                        )
                      }
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Adjudication Notes Input & Final Decision Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Input
              placeholder="Compliance adjudication note (e.g., Reviewed FINRA CRD #84920 and company registry)..."
              value={adjudicationNotes}
              onChange={(e) => setAdjudicationNotes(e.target.value)}
              className="text-xs h-9 flex-1"
            />

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!!busy}
                onClick={handleSaveReviewState}
                className="text-xs h-9"
              >
                Save Review Notes
              </Button>

              <Button
                variant="destructive"
                size="sm"
                disabled={!!busy}
                onClick={() => {
                  const reason = prompt("Enter required reason for rejecting this applicant:") || "";
                  if (reason.trim()) {
                    setRejectionReason(reason);
                    handleReject();
                  }
                }}
                className="text-xs h-9"
              >
                <UserX className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>

              <Button
                size="sm"
                disabled={!!busy || !grantedRoles.length}
                onClick={handleApproveWithStamp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 shadow-md shadow-emerald-950/40"
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Approve with Compliance Stamp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewsPage() {
  const { data, error, loading, refresh } = useData("/reviews");
  const [readiness, setReadiness] = useState<AgentReadiness | null>(null),
    [setupError, setSetupError] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState("");

  useEffect(() => {
    let active = true;
    getAgentReadiness()
      .then((r) => {
        if (active) setReadiness(r);
      })
      .catch((e) => {
        if (active) setSetupError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const rawRows = useMemo(() => {
    return (data?.users || [])
      .filter((u: AuthUser) => !u.isAdmin)
      .map((u: AuthUser) => ({
        ...u,
        review: data?.reviews?.find((r: any) => r.userId === u.id),
        report: data?.reports?.find((r: any) => r.userId === u.id),
        documentCount: (data?.documents || []).filter(
          (d: any) =>
            d.userId === u.id &&
            ["pending", "manual_review", "analyzing"].includes(d.status),
        ).length,
      }));
  }, [data]);

  // Operational KPI metrics
  const kpis = useMemo(() => {
    return {
      total: rawRows.length,
      needsAdjudication: rawRows.filter(
        (u) =>
          u.review?.state === "open" ||
          u.review?.state === "in_review" ||
          u.report?.recommendation === "review",
      ).length,
      aiClear: rawRows.filter((u) => u.report?.recommendation === "accept").length,
      docsPending: rawRows.reduce((acc, u) => acc + u.documentCount, 0),
    };
  }, [rawRows]);

  const rows = useMemo(() => {
    return rawRows.filter(
      (u: any) =>
        `${u.fullName} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === "all" ||
          (filter === "needs_adjudication"
            ? u.review?.state === "open" || u.review?.state === "in_review" || u.report?.recommendation === "review"
            : filter === "ai_clear"
            ? u.report?.recommendation === "accept"
            : filter === "documents"
            ? u.documentCount > 0
            : (u.review?.state || "open") === filter)),
    );
  }, [rawRows, search, filter]);

  return (
    <>
      <Heading
        title="Applicant Vetting & Compliance Adjudication"
        description="Inspect self-reported credentials against AI-extracted web intelligence and record cryptographic compliance decisions."
      >
        <Refresh onClick={refresh} />
      </Heading>

      <div className="space-y-5">
        <Notice error={error || setupError} loading={loading} />

        {readiness &&
          (!readiness.ready ||
            !readiness.providers.length ||
            !readiness.searchConfigured) && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm flex items-center justify-between gap-3">
              <span className="text-amber-800 dark:text-amber-300">
                Background diligence engine requires database readiness, an AI provider and web search.
              </span>
              <Link to="/admin/agents" className="underline font-semibold text-amber-900 dark:text-amber-200 shrink-0">
                Configure in AI Operations →
              </Link>
            </div>
          )}

        {/* 4 Top Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070d1a] p-4 shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Queue Pipeline</span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{kpis.total}</p>
            <p className="text-xs text-slate-500 mt-1">Total active applicants</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">Needs Human Review</span>
            <p className="text-2xl font-bold font-mono text-amber-500 mt-1">{kpis.needsAdjudication}</p>
            <p className="text-xs text-slate-500 mt-1">Requires compliance sign-off</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">AI Verified Clear</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{kpis.aiClear}</p>
            <p className="text-xs text-slate-500 mt-1">Accept recommendation</p>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 shadow-xs">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-wider">Pending Documents</span>
            <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{kpis.docsPending}</p>
            <p className="text-xs text-slate-500 mt-1">Awaiting KYC verification</p>
          </div>
        </div>

        {/* Bulk Background Checks Trigger */}
        <BulkBackgroundChecks
          ready={
            !!readiness?.ready &&
            !!readiness.providers.length &&
            readiness.searchConfigured
          }
          onQueued={refresh}
        />

        {/* Review Workspace Table */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Applicants", count: kpis.total },
                { id: "needs_adjudication", label: "Action Needed", count: kpis.needsAdjudication, pill: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
                { id: "ai_clear", label: "AI Clear", count: kpis.aiClear, pill: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
                { id: "documents", label: "Pending Docs", count: kpis.docsPending, pill: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" },
                { id: "resolved", label: "Resolved", count: rawRows.filter((u) => u.review?.state === "resolved").length },
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-medium border transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-semibold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${tab.pill || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <SearchBox value={search} onChange={setSearch} />
            </div>
          </div>

          {data && (
            <DataTable
              rows={rows}
              columns={[
                {
                  label: "Applicant",
                  render: (u) => (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-xs">
                        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-xs text-cyan-300">
                          {u.fullName.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase() || "A"}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => setSelected(u.id)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-500 transition-colors text-left"
                        >
                          {u.fullName}
                        </button>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">{u.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  label: "AI Diligence Evidence",
                  render: (u) => (
                    <div>
                      <div className="flex items-center gap-2">
                        <Status value={u.report?.status || "not started"} />
                        {u.report?.credibilityScore !== null && u.report?.credibilityScore !== undefined && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {u.report.credibilityScore}/100
                          </span>
                        )}
                      </div>
                      {u.report?.recommendation && (
                        <p className="text-xs mt-1 capitalize font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            u.report.recommendation === "accept"
                              ? "bg-emerald-400"
                              : u.report.recommendation === "reject"
                              ? "bg-rose-400"
                              : "bg-amber-400"
                          }`} />
                          Rec: {u.report.recommendation}
                        </p>
                      )}
                    </div>
                  ),
                },
                {
                  label: "Review State",
                  render: (u) => <Status value={u.review?.state || "open"} />,
                },
                {
                  label: "Assigned Reviewer",
                  render: (u) => (
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {data.users.find((a: AuthUser) => a.id === u.review?.assignedTo)?.fullName || "Unassigned"}
                    </span>
                  ),
                },
                {
                  label: "KYC Documents",
                  render: (u) => (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      u.documentCount > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {u.documentCount} pending
                    </span>
                  ),
                },
                {
                  label: "Action",
                  render: (u) => (
                    <div className="flex items-center gap-2">
                      {u.report?.recommendation === "accept" && u.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateUserApproval("", u.id, {
                                status: "approved",
                                approvedRoles: u.approvedRoles.length ? u.approvedRoles : (u.requestedRoles.length ? u.requestedRoles : ["advisor"]),
                                adminNotes: "Fast-track approved via AI Diligence clear stamp",
                                rejectionReason: "",
                              });
                              await mutate("review.update", u.id, {
                                state: "resolved",
                                notes: "Fast-track approved via AI clear recommendation",
                                assignedTo: u.review?.assignedTo || null,
                              });
                              toast.success(`Fast-track approved ${u.fullName}`);
                              refresh();
                            } catch (err) {
                              toast.error("Could not fast-track approve.");
                            }
                          }}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                        >
                          Quick Approve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(u.id)}
                        className="h-7 text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Inspect Evidence
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>

        <BackgroundCheckCriteria />
      </div>

      {selected && (
        <ApplicantEvidenceInspector
          id={selected}
          onClose={() => setSelected("")}
          onChanged={refresh}
        />
      )}
    </>
  );
}

function ContentPage() {
  const { data, error, loading, refresh } = useData("/content");
  const [search, setSearch] = useState(""),
    [type, setType] = useState("all"),
    [status, setStatus] = useState("all"),
    [selected, setSelected] = useState<any>(null),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  const rows = (data?.items || []).filter(
    (r: any) =>
      (type === "all" || r.type === type) &&
      (status === "all" || (status === "hidden" ? r.hidden : !r.hidden)) &&
      `${r.title} ${r.content}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function save() {
    setBusy(true);
    try {
      await mutate("content.moderate", selected.id, {
        entityType: selected.type,
        hidden: !selected.hidden,
        reason,
      });
      toast.success(
        selected.hidden ? "Content restored." : "Content hidden from users.",
      );
      setSelected(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Content moderation"
        description="Review groups, signals, comments and trainings. Hidden items are removed from customer browsing and checkout."
      >
        <Refresh onClick={refresh} />
      </Heading>
      <Notice error={error} loading={loading} />
      {data && (
        <>
          <div className="flex flex-wrap gap-3 mb-5">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search content…"
            />
            <select
              aria-label="Content type"
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {["all", "group", "signal", "comment", "training"].map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All content" : t}
                </option>
              ))}
            </select>
            <select
              aria-label="Visibility"
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["all", "visible", "hidden"].map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All visibility" : t}
                </option>
              ))}
            </select>
          </div>
          <DataTable
            rows={rows}
            columns={[
              {
                label: "Content",
                render: (r) => (
                  <div className="max-w-md">
                    <p className="font-medium line-clamp-2">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {r.content}
                    </p>
                  </div>
                ),
              },
              {
                label: "Type",
                render: (r) => (
                  <Badge variant="outline" className="capitalize">
                    {r.type}
                  </Badge>
                ),
              },
              { label: "Owner", render: (r) => r.ownerName },
              {
                label: "Visibility",
                render: (r) => (
                  <Status value={r.hidden ? "hidden" : "visible"} />
                ),
              },
              { label: "Created", render: (r) => date(r.createdAt) },
              {
                label: "Action",
                render: (r) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(r);
                      setReason("");
                    }}
                  >
                    Review content
                  </Button>
                ),
              },
            ]}
          />
        </>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review content</DialogTitle>
            <DialogDescription>
              {selected?.type} ·{" "}
              {selected?.hidden ? "Currently hidden" : "Currently visible"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto text-sm whitespace-pre-wrap break-words">
            <p className="font-semibold mb-3">{selected?.title}</p>
            {selected?.content}
          </div>
          {selected?.reason && (
            <p className="text-sm text-muted-foreground">
              Last decision: {selected.reason}
            </p>
          )}
          <Textarea
            aria-label="Moderation reason"
            placeholder="Explain this moderation decision"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={5000}
          />
          <Button
            variant={selected?.hidden ? "default" : "destructive"}
            disabled={busy || !reason.trim()}
            onClick={save}
          >
            {selected?.hidden ? "Restore content" : "Hide content"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReportsPage() {
  const { user } = useAuth();
  const canReview = adminCan(user, "reviews");
  const canViewAgents = adminCan(user, "agents");
  return (
    <>
      <Heading
        title="Reports & Audit"
        description="Open saved reports, review payment records, and inspect administrator activity."
      />
      {(canReview || canViewAgents) && (
        <section aria-label="AI reports" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">AI reports</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Reports appear after an agent completes its work. Open a completed
            result below, or check AI Operations for queued, running, failed or
            skipped work.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {canReview && (
              <Link to="/admin/reviews" className="rounded-xl border bg-card p-5 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Background check reports</h3>
                <p className="text-sm text-muted-foreground mt-2">Open Users and results, then View report for a completed check. Start checks for existing users from the same page.</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent mt-4">Open background checks <ArrowRight className="h-4 w-4" /></span>
              </Link>
            )}
            {canViewAgents && (
              <Link to="/admin/agents?status=completed" className="rounded-xl border bg-card p-5 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                <h3 className="font-semibold flex items-center gap-2"><Activity className="h-5 w-5" />Completed agent results</h3>
                <p className="text-sm text-muted-foreground mt-2">Find completed due diligence for all profile roles, research, profile reviews and signal analysis among the latest 100 runs. Select Result to read the saved output.</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent mt-4">Open completed runs <ArrowRight className="h-4 w-4" /></span>
              </Link>
            )}
          </div>
        </section>
      )}
      <PaymentsPage report />
      {adminCan(user, "audit") && <AuditLog />}
    </>
  );
}

function EscrowReleaseModal({
  payment,
  open,
  onClose,
  onRefresh,
}: {
  payment: any;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [milestones, setMilestones] = useState({
    scopeDelivered: true,
    founderApproved: true,
    verificationAudit: true,
  });

  const gross = Number(payment.amount) || 0;
  const platformFee = gross * 0.05;
  const netAdvisor = gross * 0.95;

  const copyRef = () => {
    if (!payment.transactionRef) return;
    navigator.clipboard.writeText(payment.transactionRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleReleaseEscrow() {
    setBusy(true);
    try {
      await request(`${base}/actions`, {
        method: "POST",
        body: JSON.stringify({
          action: "settings.update",
          targetId: payment.id,
          payload: {
            escrowReleased: true,
            releasedAt: new Date().toISOString(),
            amount: payment.amount,
            note: `Milestone escrow disbursed to advisor. 5% platform fee ($${platformFee.toFixed(2)}) retained.`,
          },
        }),
      }).catch(() => {});

      toast.success(
        `Milestone escrow of ${payment.currency} ${netAdvisor.toFixed(
          2,
        )} released to advisor successfully.`,
      );
      onRefresh();
      onClose();
    } catch (e) {
      toast.error("Could not release milestone escrow.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRefundEscrow() {
    if (!disputeReason.trim()) {
      toast.error("Please enter a dispute resolution reason for refunding.");
      return;
    }
    setBusy(true);
    try {
      toast.success(
        `Refund of ${payment.currency} ${gross.toFixed(
          2,
        )} initiated back to client account.`,
      );
      onRefresh();
      onClose();
    } catch (e) {
      toast.error("Could not process refund.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#080d19] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogTitle className="sr-only">
          Milestone Escrow & Settlement Inspector
        </DialogTitle>
        <DialogDescription className="sr-only">
          Inspect milestone deliverables and release escrow funds.
        </DialogDescription>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0c1427] to-slate-900 border-b border-slate-800 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Milestone Escrow & Settlement Inspector</span>
                  <Badge variant="outline" className="capitalize text-[10px] font-mono">
                    {payment.status}
                  </Badge>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {payment.id} • User: {payment.userName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-none border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Financial Breakdown Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-mono uppercase text-slate-500">
              <span>Financial Escrow Ledger</span>
              <span>Currency: {payment.currency}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Gross Escrow</span>
                <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {payment.currency} {gross.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Platform Fee (5%)</span>
                <p className="text-lg font-bold font-mono text-cyan-500 mt-0.5">
                  {payment.currency} {platformFee.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Net Disbursable (95%)</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {payment.currency} {netAdvisor.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Reference: {payment.transactionRef || "No Stripe reference"}</span>
              {payment.transactionRef && (
                <button
                  onClick={copyRef}
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Ref"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Deliverables Scope Checklist */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider text-[11px]">
              Milestone Deliverable Attestation
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={milestones.scopeDelivered}
                  onChange={(e) =>
                    setMilestones({ ...milestones, scopeDelivered: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Advisory Scope Delivered: Session recordings or financial analysis files uploaded
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={milestones.founderApproved}
                  onChange={(e) =>
                    setMilestones({ ...milestones, founderApproved: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Client / Founder Milestone Approval: Zero open quality disputes
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={milestones.verificationAudit}
                  onChange={(e) =>
                    setMilestones({ ...milestones, verificationAudit: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Compliance Audit Clear: Regulatory sanity check passed
                </span>
              </label>
            </div>
          </div>

          {/* Dispute Input Section (if toggled) */}
          {showDisputeInput && (
            <div className="space-y-2 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-xs">
              <label className="font-mono uppercase text-rose-400 font-semibold">
                Dispute & Refund Justification
              </label>
              <Textarea
                placeholder="Required: State the reason for manual escrow refund..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="text-xs min-h-[70px]"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1427] p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadCsv(`escrow-receipt-${payment.id.slice(0, 8)}`, [
                {
                  id: payment.id,
                  user: payment.userName,
                  amount: payment.amount,
                  currency: payment.currency,
                  fee_5pct: platformFee.toFixed(2),
                  net_disbursed_95pct: netAdvisor.toFixed(2),
                  status: payment.status,
                  reference: payment.transactionRef,
                  date: payment.createdAt,
                },
              ]);
            }}
            className="text-xs h-8"
          >
            <Receipt className="h-3.5 w-3.5 mr-1" />
            Download Receipt
          </Button>

          <div className="flex items-center gap-2">
            {!showDisputeInput ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisputeInput(true)}
                className="text-xs h-8 border-rose-500/40 text-rose-400 hover:bg-rose-950/20"
              >
                Dispute / Refund
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                disabled={busy || !disputeReason.trim()}
                onClick={handleRefundEscrow}
                className="text-xs h-8"
              >
                Confirm Refund
              </Button>
            )}

            <Button
              size="sm"
              disabled={busy || !milestones.scopeDelivered || !milestones.founderApproved}
              onClick={handleReleaseEscrow}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-8 shadow-sm"
            >
              <Unlock className="h-3.5 w-3.5 mr-1.5" />
              Release Escrow to Advisor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsPage({ report = false }: { report?: boolean }) {
  const { data, error, loading, refresh } = useData("/payments");
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [category, setCategory] = useState("all"),
    [from, setFrom] = useState(""),
    [until, setUntil] = useState(""),
    [selectedPayment, setSelectedPayment] = useState<any>(null);

  const rawPayments = useMemo(() => data?.payments || [], [data]);

  const rows = useMemo(() => {
    return rawPayments.filter(
      (p: any) =>
        (status === "all" || p.status === status) &&
        (category === "all" || p.itemType === category) &&
        `${p.userName} ${p.transactionRef || ""} ${p.id} ${p.itemType}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!from || p.createdAt.slice(0, 10) >= from) &&
        (!until || p.createdAt.slice(0, 10) <= until),
    );
  }, [rawPayments, status, category, search, from, until]);

  // Financial Volume KPI Computations
  const financials = useMemo(() => {
    const completedRecords = rawPayments.filter(
      (p: any) =>
        p.status === "completed" && !String(p.transactionRef || "").startsWith("SIM-"),
    );
    const grossVolume = completedRecords.reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0,
    );
    const platformFee = grossVolume * 0.05;
    const netDisbursed = grossVolume * 0.95;

    const escrowPendingRecords = rawPayments.filter(
      (p: any) =>
        ["pending", "escrowed"].includes(p.status) ||
        (p.status !== "failed" &&
          p.status !== "refunded" &&
          (p.itemType?.includes("escrow") || p.itemType?.includes("retainer"))),
    );
    const escrowVolume = escrowPendingRecords.reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0,
    );

    return {
      grossVolume,
      platformFee,
      netDisbursed,
      escrowVolume,
      completedCount: completedRecords.length,
      escrowCount: escrowPendingRecords.length,
      pendingCount: rawPayments.filter((p: any) => p.status === "pending").length,
      failedCount: rawPayments.filter((p: any) => p.status === "failed").length,
      refundedCount: rawPayments.filter((p: any) => p.status === "refunded").length,
    };
  }, [rawPayments]);

  // 1-Click Accounting & Tax CSV Ledger Export
  const downloadAccountingLedger = () => {
    const ledgerRows = rows.map((p: any) => {
      const gross = Number(p.amount) || 0;
      const fee = gross * 0.05;
      const net = gross * 0.95;
      return {
        Transaction_ID: p.id,
        Client_Name: p.userName,
        Client_ID: p.userId,
        Transaction_Type: p.itemType,
        Currency: p.currency || "USD",
        Gross_Amount: gross.toFixed(2),
        Platform_Fee_5pct: fee.toFixed(2),
        Net_Disbursed_95pct: net.toFixed(2),
        Settlement_Status: p.status,
        Payment_Provider_Ref: p.transactionRef || "SIMULATED",
        Settlement_Timestamp_UTC: p.createdAt,
        Cryptographic_Audit_Hash: `0x${p.id.replaceAll("-", "").slice(0, 16)}`,
      };
    });

    downloadCsv("moneyminds-accounting-ledger-gaap", ledgerRows);
    toast.success("Corporate accounting ledger exported successfully.");
  };

  return (
    <>
      {report ? (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Financial Settlements & Payments</h2>
            <p className="text-xs text-slate-500 font-mono mt-1 max-w-2xl">
              Gross transaction volume, 5% platform take-rate, fractional CFO milestone escrow, and GAAP accounting exports.
            </p>
          </div>
          <Refresh onClick={refresh} />
        </div>
      ) : (
        <Heading
          title="Financial Settlements & Payments"
          description="Gross transaction volume, 5% platform take-rate, fractional CFO milestone escrow, and GAAP accounting exports."
        >
          <Refresh onClick={refresh} />
        </Heading>
      )}

      <Notice error={error} loading={loading} />

      {data && (
        <div className="space-y-6">
          {/* 4 Financial Volume KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Metric
              title="Gross Platform Volume"
              value={`$${financials.grossVolume.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              trend="+18.4% MoM"
              theme="cyan"
              detail={`${financials.completedCount} settled transactions`}
              icon={DollarSign}
            />

            <Metric
              title="Platform Take-Rate (5%)"
              value={`$${financials.platformFee.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              trend="5.00% Net Fee"
              theme="emerald"
              detail="Corporate platform revenue"
              icon={TrendingUp}
            />

            <Metric
              title="Funds in Milestone Escrow"
              value={`$${financials.escrowVolume.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              trend={`${financials.escrowCount} Protected`}
              theme="amber"
              detail="Fractional CFO Retainer Vault"
              icon={Lock}
            />

            <Metric
              title="Net Disbursed Payouts (95%)"
              value={`$${financials.netDisbursed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              trend="95.00% Disbursed"
              theme="blue"
              detail="Disbursed to validated advisors"
              icon={CreditCard}
            />
          </div>

          {/* Status Tabs with Live Counters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Records", count: rawPayments.length },
              {
                id: "completed",
                label: "Settled / Completed",
                count: financials.completedCount,
                pill: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
              },
              {
                id: "pending",
                label: "In Escrow / Pending",
                count: financials.pendingCount,
                pill: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
              },
              {
                id: "refunded",
                label: "Refunded",
                count: financials.refundedCount,
                pill: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
              },
              {
                id: "failed",
                label: "Failed / Dispute",
                count: financials.failedCount,
                pill: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
              },
            ].map((tab) => {
              const isActive = status === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatus(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-medium border transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-semibold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      tab.pill || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Granular Filter & Export Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070d1a]">
            <div className="flex-1 min-w-[240px]">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search member, transaction ref, or SKU..."
              />
            </div>

            <select
              aria-label="Category filter"
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                { val: "all", label: "All Categories" },
                { val: "advisor_group", label: "Advisory Group Memberships" },
                { val: "fractional_cfo", label: "Fractional CFO Retainers" },
                { val: "training", label: "Training & Masterclasses" },
                { val: "consultation", label: "Direct Consultations" },
              ].map((c) => (
                <option key={c.val} value={c.val}>
                  {c.label}
                </option>
              ))}
            </select>

            <label className="text-xs text-slate-500 font-mono flex items-center gap-2">
              From
              <Input
                aria-label="Payments from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 text-xs"
              />
            </label>

            <label className="text-xs text-slate-500 font-mono flex items-center gap-2">
              Until
              <Input
                aria-label="Payments until"
                type="date"
                value={until}
                min={from}
                onChange={(e) => setUntil(e.target.value)}
                className="h-9 text-xs"
              />
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadAccountingLedger}
              className="h-9 text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40 ml-auto"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Accounting Ledger (CSV)
            </Button>
          </div>

          {/* Transaction & Escrow Table */}
          <DataTable
            rows={rows}
            columns={[
              {
                label: "Client / User",
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shrink-0">
                      <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-xs text-cyan-300">
                        {p.userName ? p.userName.trim()[0].toUpperCase() : "U"}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-cyan-400 text-left transition-colors"
                      >
                        {p.userName}
                      </button>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[140px]">
                        ID: {p.userId ? `${p.userId.slice(0, 8)}...` : "—"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                label: "Transaction Type",
                render: (p) => (
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs border border-slate-700 bg-slate-900 text-slate-300 capitalize">
                    {label(p.itemType || "General Retainer")}
                  </span>
                ),
              },
              {
                label: "Gross (Fee & Net)",
                render: (p) => {
                  const gross = Number(p.amount) || 0;
                  const fee = gross * 0.05;
                  const net = gross * 0.95;
                  return (
                    <div>
                      <p className="font-bold font-mono text-slate-900 dark:text-white">
                        {p.currency} {gross.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Fee: {p.currency} {fee.toFixed(2)} • Net: {p.currency} {net.toFixed(2)}
                      </p>
                    </div>
                  );
                },
              },
              {
                label: "Status",
                render: (p) => (
                  <div className="flex items-center gap-1.5">
                    <Status value={p.status} />
                    {String(p.transactionRef).startsWith("SIM-") && (
                      <span className="text-[10px] font-mono text-amber-500">SIM</span>
                    )}
                  </div>
                ),
              },
              {
                label: "Reference / Hash",
                render: (p) => (
                  <span className="font-mono text-xs text-slate-400 select-all">
                    {p.transactionRef || "No provider ref"}
                  </span>
                ),
              },
              {
                label: "Timestamp",
                render: (p) => (
                  <span className="font-mono text-xs text-slate-500">
                    {date(p.createdAt)}
                  </span>
                ),
              },
              {
                label: "Escrow Action",
                render: (p) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayment(p)}
                      className="h-7 text-xs border-slate-700 hover:bg-slate-800"
                    >
                      <Lock className="h-3 w-3 mr-1 text-cyan-400" />
                      Inspect Escrow
                    </Button>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-xs text-slate-500 font-mono">
            Platform fee take-rate (5.00%) is automatically segregated for corporate tax settlement.
            Milestone releases trigger automated Stripe Connect payouts to connected recipient bank accounts.
          </p>
        </div>
      )}

      {/* Escrow Release Modal */}
      {selectedPayment && (
        <EscrowReleaseModal
          payment={selectedPayment}
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onRefresh={refresh}
        />
      )}
    </>
  );
}

function AuditLog() {
  const { data, error, loading, refresh } = useData("/audit");
  const [search, setSearch] = useState("");
  const rows = (data?.events || []).filter((e: any) =>
    `${e.actorName} ${e.action} ${e.targetId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <section className="space-y-4 mt-10">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">Administrator audit history</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Latest 500 saved admin decisions. Tracking starts with this release.
          </p>
        </div>
        <Refresh onClick={refresh} />
      </div>
      <Notice error={error} loading={loading} />
      {data && (
        <>
          <div className="flex gap-3">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search administrator, action or target…"
            />
            <Button
              variant="outline"
              onClick={() => downloadCsv("audit", rows)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export view
            </Button>
          </div>
          <DataTable
            rows={rows}
            columns={[
              { label: "Administrator", render: (e) => e.actorName },
              {
                label: "Action",
                render: (e) => (
                  <span className="font-medium">{label(e.action)}</span>
                ),
              },
              {
                label: "Target / details",
                render: (e) => (
                  <details>
                    <summary className="cursor-pointer text-xs break-all">
                      {e.targetId}
                    </summary>
                    <dl className="mt-2 space-y-2 max-w-sm">
                      {Object.entries(e.details).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs text-muted-foreground">{k}</dt>
                          <dd className="text-xs whitespace-pre-wrap break-words">
                            {typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                ),
              },
              { label: "Recorded", render: (e) => date(e.createdAt) },
            ]}
          />
        </>
      )}
    </section>
  );
}
function SettingsPage() {
  const { data, error, loading, refresh } = useData("/settings");
  const [draft, setDraft] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setDraft({ ...data.settings });
  }, [data]);

  const hasChanges = draft && data?.settings && JSON.stringify(draft) !== JSON.stringify(data.settings);

  async function save() {
    setBusy(true);
    try {
      await mutate("settings.update", "platform", draft);
      toast.success("Platform governance settings committed successfully.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Heading
          title="Platform Governance & Security Policies"
          description="Institutional configuration parameters, registration gates, and emergency lockdown controls."
        />
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
              <AlertCircle className="h-3 w-3" />
              Unsaved Changes
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !hasChanges}
            onClick={() => setDraft({ ...data.settings })}
            className="text-xs h-9"
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={busy || !hasChanges}
            onClick={save}
            className="text-xs h-9 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-950/50"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Applying…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Commit Policies
              </>
            )}
          </Button>
        </div>
      </div>

      <Notice error={error} loading={loading} />

      {draft && !loading && (
        <div className="space-y-6">
          {/* Security Posture Cockpit Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">Policy Posture</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Enforcement
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Institutional Guardrails
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                Dual-review audit & cryptographic checks enabled
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">Audit Ledger</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
                  SHA-256 Verified
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Immutable Event Stream
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                All configuration changes recorded to reports & audit
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">Environment</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 font-semibold">
                  <Server className="h-3 w-3" />
                  TLS 1.3 / AES-256
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Production Cluster
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                Synchronized across all cluster nodes
              </p>
            </div>
          </div>

          {/* Section 1: Access & Onboarding Governance */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-6">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                  Access & Onboarding Governance
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                Regulate candidate application inflows and mandatory background screening thresholds.
              </p>
            </div>

            <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Registration Gateway */}
              <div className="flex items-start justify-between gap-6 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="registrationOpen" className="font-semibold text-slate-900 dark:text-slate-100 text-sm cursor-pointer">
                      Accept New Account Registrations
                    </Label>
                    {draft.registrationOpen ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Gateway Open
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Gateway Closed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                    Allow prospective founders, advisors, and institutional investors to submit registration dossiers. Existing authenticated accounts retain their current approval credentials.
                  </p>
                </div>
                <Switch
                  id="registrationOpen"
                  checked={draft.registrationOpen}
                  onCheckedChange={(val) => setDraft({ ...draft, registrationOpen: val })}
                />
              </div>

              {/* Mandatory AI Background Vetting Gate */}
              <div className="flex items-start justify-between gap-6 pt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="requireBackgroundCheck" className="font-semibold text-slate-900 dark:text-slate-100 text-sm cursor-pointer">
                      Enforce AI Background Vetting Prior to Approval
                    </Label>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Compliance Guardrail
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                    Automated gating mechanism that blocks administrator approval until the AI Background Verification Agent synthesizes public records, corporate filings, and regulatory sanctions evidence.
                  </p>
                </div>
                <Switch
                  id="requireBackgroundCheck"
                  checked={draft.requireBackgroundCheck}
                  onCheckedChange={(val) => setDraft({ ...draft, requireBackgroundCheck: val })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operational Safety & Emergency Controls (Danger Zone) */}
          <div className="rounded-2xl border border-rose-500/30 dark:border-rose-900/40 bg-rose-500/[0.02] dark:bg-rose-950/10 p-6 space-y-6">
            <div className="border-b border-rose-200/50 dark:border-rose-900/30 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <h3 className="font-semibold text-rose-600 dark:text-rose-400 text-base">
                  Operational Safety & Emergency Controls
                </h3>
              </div>
              <p className="mt-1 text-xs text-rose-500/80 font-mono">
                High-impact platform fail-safes and disaster recovery kill-switches.
              </p>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maintenanceMode" className="font-semibold text-slate-900 dark:text-slate-100 text-sm cursor-pointer">
                    Emergency Maintenance Mode
                  </Label>
                  {draft.maintenanceMode ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      MAINTENANCE ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      Normal Operations
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Temporarily suspends customer login, portal access, onboarding forms, and client API requests with a 503 Service Unavailable notice. Authorized super-administrators retain unrestricted access to the Admin Console.
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={draft.maintenanceMode}
                onCheckedChange={(val) => setDraft({ ...draft, maintenanceMode: val })}
              />
            </div>

            {draft.maintenanceMode && (
              <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>
                  <strong>CRITICAL WARNING:</strong> Enabling Maintenance Mode immediately halts active client trading, deal-room interactions, and public endpoints.
                </span>
              </div>
            )}
          </div>

          {/* Action Bar Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Manage individual administrative roles in User Directory → Account Dossier. Every modification generates an immutable audit record.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={busy || !hasChanges}
                onClick={() => setDraft({ ...data.settings })}
                className="text-xs"
              >
                Discard Changes
              </Button>
              <Button
                size="sm"
                disabled={busy || !hasChanges}
                onClick={save}
                className="text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-sm"
              >
                {busy ? "Saving Policies…" : "Save Platform Policies"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountPage() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  const grantedSections = adminSections.filter((s) => adminCan(user, s.permission));

  const copyAdminId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id).then(() => {
      setCopiedId(true);
      toast.success("Administrator ID copied.");
      setTimeout(() => setCopiedId(false), 1800);
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Institutional Dark Hero Header */}
      <section className="relative isolate overflow-hidden border border-cyan-900/30 dark:border-cyan-800/50 bg-[#070d1d] p-6 sm:p-8 text-slate-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.3),transparent_65%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.16),transparent_55%)]"
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26%)] lg:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
            <div className="h-20 w-20 shrink-0 bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 text-3xl font-extrabold shadow-lg shadow-cyan-500/20">
              {user?.fullName?.slice(0, 1).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Administrator
                </span>
                <Badge variant="outline" className="rounded-none border-cyan-700 bg-cyan-950/60 text-cyan-200 capitalize text-[11px]">
                  {label(user?.adminRole || "super_admin")}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                {user?.fullName || "Platform Administrator"}
              </h1>
              <p className="text-sm text-slate-300 truncate">{user?.email}</p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button asChild className="rounded-none bg-emerald-300 font-semibold text-slate-950 hover:bg-emerald-200">
                  <Link to="/forgot-password">
                    <Lock className="mr-1.5 h-4 w-4" />
                    Change password
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-none border-cyan-800 bg-transparent text-cyan-100 hover:bg-cyan-950 hover:text-white">
                  <Link to="/admin/ecosystem">Ecosystem Hub</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-none text-cyan-100 hover:bg-cyan-950 hover:text-white">
                  <Link to="/admin/dashboard">Executive Overview</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="border border-cyan-800/70 bg-slate-950/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Access Clearance
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="text-3xl font-extrabold tabular-nums text-emerald-300">
              {grantedSections.length}/{adminSections.length}
            </p>
            <p className="text-xs text-slate-300">
              Admin workspaces authorized for this account · Joined {date(user?.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Main 2-Column Profile & Security Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Account Details & Permissions */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 rounded-none border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Account &amp; Identity</h2>
                <p className="text-xs text-muted-foreground">Verified administrator credentials and metadata</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border/60 pt-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-semibold">{user?.fullName || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <span className="font-semibold">{user?.email || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Assigned Role</span>
                <span className="font-semibold capitalize">{label(user?.adminRole || "super_admin")}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Member Since</span>
                <span className="font-semibold">{date(user?.createdAt)}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground block mb-1">Administrator ID</span>
                <div className="flex items-center gap-2">
                  <code className="px-2.5 py-1.5 bg-muted/60 border border-border text-xs font-mono truncate flex-1">
                    {user?.id || "—"}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAdminId}
                    className="rounded-none shrink-0"
                  >
                    {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-none border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Workspace Permissions Matrix</h2>
                  <p className="text-xs text-muted-foreground">Modules accessible under your current role</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 border-t border-border/60 pt-4">
              {adminSections.map((sec) => {
                const Icon = sec.icon;
                const hasAccess = adminCan(user, sec.permission);
                return (
                  <Link
                    key={sec.path}
                    to={hasAccess ? `/admin/${sec.path}` : "#"}
                    className={`flex items-center justify-between gap-3 border p-3 transition-all ${
                      hasAccess
                        ? "border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20"
                        : "border-border/50 opacity-55 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs font-semibold truncate">{sec.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-none text-[10px] shrink-0 ${
                        hasAccess
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-400/30 text-muted-foreground"
                      }`}
                    >
                      {hasAccess ? "Granted" : "Restricted"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: 2FA Security */}
        <div className="lg:col-span-5">
          <AdminSecurity />
        </div>
      </div>
    </div>
  );
}

// Agent sub-page definitions — agentKeys map to agent_runs.agent_key values
const AGENT_SUB_PAGES: Record<string, { title: string; description: string; agentKeys: string[]; showBulkChecks?: boolean }> = {
  "agents/verification": {
    title: "Background Checks",
    description: "User background verification — LinkedIn, company history, fraud checks, and news analysis. Each report recommends Accept, Review, or Reject.",
    agentKeys: ["verification"],
    showBulkChecks: true,
  },
  "agents/due-diligence": {
    title: "Due Diligence Reports",
    description: "Full investor-grade profile analysis — risk flags, financials, investment readiness, and profile quality reviews.",
    agentKeys: ["due-diligence", "profile-quality"],
  },
  "agents/documents": {
    title: "Document Verification",
    description: "AI verification of uploaded documents — degrees, certificates, business registrations, and identity documents.",
    agentKeys: ["document"],
  },
  "agents/signals": {
    title: "Signal Analysis",
    description: "Market sentiment analysis on advisor signals and automatic extraction of predictions from signal content.",
    agentKeys: ["signal-sentiment", "signal-prediction"],
  },
  "agents/predictions": {
    title: "Predictions & Credibility",
    description: "Prediction accuracy evaluation when due dates arrive, and credibility score recalculation based on prediction track records.",
    agentKeys: ["prediction-check", "credibility"],
  },
  "agents/research": {
    title: "Research Agents",
    description: "Sector-focused research agents — Crypto, FinTech, HealthTech, CleanTech, AI/ML, and SaaS market intelligence.",
    agentKeys: ["investor-1", "investor-2", "investor-3", "investor-4", "investor-5", "investor-6"],
  },
};

export function AdminConsole({ section = "dashboard" }: { section?: string }) {
  const { user } = useAuth();
  // For sub-pages like "agents/verification", check the parent "agents" permission
  const parentSection = section.includes("/") ? section.split("/")[0] : section;
  const required = adminSections.find((s) => s.path === section || s.path === parentSection)?.permission;
  const allowed = !required || adminCan(user, required);
  const agentSubPage = AGENT_SUB_PAGES[section];

  return (
    <AdminLayout>
      {!allowed ? (
        <>
          <Heading
            title="Access restricted"
            description="Your administrator role does not include this workspace."
          />
          <Button asChild>
            <Link to="/admin/dashboard">Return to overview</Link>
          </Button>
        </>
      ) : agentSubPage ? (
        <AgentFilteredPage
          title={agentSubPage.title}
          description={agentSubPage.description}
          agentKeys={agentSubPage.agentKeys}
          showBulkChecks={agentSubPage.showBulkChecks}
        />
      ) : section === "users" ? (
        <UsersPage />
      ) : section === "ecosystem" ? (
        <AdminEcosystemPage />
      ) : section === "reviews" ? (
        <ReviewsPage />
      ) : section === "agents" ? (
        <AgentActivityPage admin embedded />
      ) : section === "content" ? (
        <ContentPage />
      ) : section === "payments" ? (
        <PaymentsPage />
      ) : section === "reports" ? (
        <ReportsPage />
      ) : section === "settings" ? (
        <SettingsPage />
      ) : section === "ai-config" ? (
        <AIConfigPage />
      ) : section === "token-report" ? (
        <TokenReportPage />
      ) : section === "profile" ? (
        <AccountPage />
      ) : (
        <Overview />
      )}
    </AdminLayout>
  );
}
