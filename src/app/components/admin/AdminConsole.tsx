import { RegistrationSummary } from "@/app/components/registration/RegistrationSummary";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  AlertCircle,
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
import { AdminSecurity } from "./AdminSecurity";

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
    <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-2">
          MoneyMinds / Admin
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
function Refresh({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <RefreshCw className="mr-2 h-4 w-4" />
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
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
    : ["failed", "rejected", "suspended", "hidden"].includes(value)
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
      : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300";
  return (
    <Badge
      variant="outline"
      className={`capitalize border-transparent ${color}`}
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
}: {
  title: string;
  value: ReactNode;
  detail: string;
  icon?: any;
}) {
  return (
    <Card className="p-5 gap-2 shadow-none">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{title}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}
type Column = { label: string; render: (row: any) => ReactNode };
function DataTable({
  rows,
  columns,
  empty = "No records match this view.",
}: {
  rows: any[];
  columns: Column[];
  empty?: string;
}) {
  const [page, setPage] = useState(1);
  const size = 12,
    totalPages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, totalPages);
  useEffect(() => setPage(1), [rows]);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.label}
                  className="p-4 font-medium text-muted-foreground whitespace-nowrap"
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
                  <td key={c.label} className="p-4 align-top">
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
      </div>
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
  return (
    <>
      <Heading
        title="Platform overview"
        description="The work that needs your attention, with current account and agent activity."
      >
        <Refresh onClick={refresh} />
      </Heading>
      <Notice error={error} loading={loading} />
      {data && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Metric
              title="Registered users"
              value={data.users.total}
              detail={`${data.users.approved} approved · administrators excluded`}
            />
            <Metric
              title="Awaiting approval"
              value={data.users.pending}
              detail="Applications needing a decision"
              icon={Clock}
            />
            <Metric
              title="Background checks"
              value={data.backgroundChecks.complete}
              detail={`${data.backgroundChecks.missing} without a completed report`}
              icon={ShieldCheck}
            />
            <Metric
              title="Active agent runs"
              value={data.agents.active}
              detail={`Within the latest ${data.agents.sampleSize} runs`}
              icon={Activity}
            />
          </div>
          <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
            <Card className="p-6 shadow-none gap-4">
              <h2 className="text-lg font-semibold">Needs attention</h2>
              <p className="text-sm text-muted-foreground">
                Open a workspace to review the underlying records.
              </p>
              {[
                {
                  title: "User applications",
                  detail: `${data.users.pending} pending approval`,
                  path: "users?status=pending",
                  permission: "users.read",
                  value: data.users.pending,
                },
                {
                  title: "Background evidence",
                  detail: `${data.backgroundChecks.review} reports recommend human review`,
                  path: "reviews",
                  permission: "reviews",
                  value: data.backgroundChecks.review,
                },
                {
                  title: "Failed AI runs",
                  detail: "Inspect the failure reason and retry eligible work",
                  path: "agents?status=failed",
                  permission: "agents",
                  value: data.agents.failed,
                },
              ]
                .filter((item) => adminCan(user, item.permission))
                .map((item) => (
                  <Link
                    key={item.title}
                    to={`/admin/${item.path}`}
                    className="flex items-center gap-4 border rounded-xl p-4 hover:bg-muted/40"
                  >
                    <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 p-3 font-semibold min-w-12 text-center">
                      {item.value}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium text-sm">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              {adminCan(user, "payments") && (
                <Button variant="outline" asChild>
                  <Link to="/admin/payments">
                    Review payment records{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </Card>
            <Card className="p-6 shadow-none gap-5">
              <h2 className="text-lg font-semibold">Account health</h2>
              <div className="space-y-4">
                {[
                  ["Approved", data.users.approved],
                  ["Rejected", data.users.rejected],
                  ["Suspended", data.users.suspended],
                ].map(([name, count]) => (
                  <div
                    key={name}
                    className="flex justify-between border-b pb-3 text-sm"
                  >
                    <span className="text-muted-foreground">{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Average time from registration to approval
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {data.averageApprovalHours === null
                    ? "No approvals yet"
                    : `${data.averageApprovalHours.toFixed(1)} hours`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {date(data.generatedAt)}. Refresh to load the latest
                records.
              </p>
            </Card>
          </div>
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
      toast.success("Changes saved.");
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
  async function check() {
    setBusy("check");
    try {
      const ready = await getAgentReadiness();
      if (!ready.ready || !ready.providers.length || !ready.searchConfigured)
        throw new Error(
          "Configure the database, an AI provider and web search in AI Operations first.",
        );
      await startAgent("verification", id);
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
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.user.fullName || "User details"}</DialogTitle>
          <DialogDescription>
            Review the submitted profile, evidence and account controls.
          </DialogDescription>
        </DialogHeader>
        <Notice error={error} loading={loading} />
        {data && (
          <div className="space-y-6">
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Status
                  value={data.user.isSuspended ? "suspended" : data.user.status}
                />
                {data.user.isAdmin && (
                  <Badge variant="outline">
                    {label(data.user.adminRole || "super_admin")}
                  </Badge>
                )}
              </div>
              <p className="text-sm break-all">{data.user.email}</p>
              <p className="text-sm mt-1">{data.user.phone || "No phone supplied"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.user.location || "No location supplied"} · Joined{" "}
                {date(data.user.createdAt)}
              </p>
              <p className="text-sm mt-3 whitespace-pre-wrap">
                {data.user.bio || "No biography supplied."}
              </p>
            </div>
            {data.application && <details open className="rounded-xl border p-4"><summary className="font-medium cursor-pointer">Registration application</summary><div className="mt-4"><RegistrationSummary application={data.application} userId={data.user.id} /></div></details>}
            <details className="rounded-xl border p-4">
              <summary className="font-medium cursor-pointer">
                Submitted role profiles
              </summary>
              <div className="mt-4 space-y-4">
                {Object.entries(data.profiles).map(([role, profile]) => (
                  <div key={role}>
                    <h3 className="font-semibold capitalize">{role}</h3>
                    {profile ? (
                      <dl className="grid sm:grid-cols-2 gap-3 mt-2">
                        {Object.entries(profile as object)
                          .filter(
                            ([k, v]) =>
                              v &&
                              ![
                                "id",
                                "userId",
                                "createdAt",
                                "updatedAt",
                              ].includes(k),
                          )
                          .map(([k, v]) => (
                            <div key={k} className="min-w-0">
                              <dt className="text-xs text-muted-foreground capitalize">
                                {k.replace(/([A-Z])/g, " $1")}
                              </dt>
                              <dd className="text-sm break-words">
                                {Array.isArray(v)
                                  ? v
                                      .map((x) =>
                                        typeof x === "object"
                                          ? JSON.stringify(x)
                                          : String(x),
                                      )
                                      .join(", ")
                                  : typeof v === "object"
                                    ? JSON.stringify(v)
                                    : String(v)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No {role} profile submitted.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
            {adminCan(user, "reviews") && !data.user.isAdmin && (
              <>
                <section className="space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="font-semibold">Background evidence</h3>
                    <Button disabled={!!busy} onClick={check}>
                      Run background check
                    </Button>
                  </div>
                  <AIVerificationReport
                    verification={data.verification}
                    token=""
                    onRetryComplete={refresh}
                  />
                </section>
                <section className="rounded-xl border p-4 space-y-4">
                  <h3 className="font-semibold">Review assignment & notes</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      Assigned reviewer
                      <select
                        aria-label="Assigned reviewer"
                        className={`${selectClass} w-full mt-2`}
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
                    <label className="text-sm">
                      Review state
                      <select
                        aria-label="Review state"
                        className={`${selectClass} w-full mt-2`}
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
                    placeholder="Evidence, questions and next steps. Visible to reviewers."
                  />
                  <Button
                    disabled={!!busy}
                    variant="outline"
                    onClick={() =>
                      act("review", () =>
                        mutate("review.update", id, {
                          state: reviewState,
                          notes: reviewNotes,
                          assignedTo: assignedTo || null,
                        }),
                      )
                    }
                  >
                    Save review
                  </Button>
                </section>
                <section className="rounded-xl border p-4 space-y-4">
                  <h3 className="font-semibold">Account decision</h3>
                  <p className="text-xs text-muted-foreground">
                    AI provides evidence and a recommendation. You make the
                    approval decision.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {(["startup", "investor", "advisor"] as AppRole[]).map(
                      (role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 text-sm capitalize"
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
                          />
                          {role}
                        </label>
                      ),
                    )}
                  </div>
                  <Textarea
                    aria-label="Approval notes"
                    placeholder="Approval notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={5000}
                  />
                  <Textarea
                    aria-label="Decision reason"
                    placeholder="Reason required when rejecting or suspending"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={5000}
                  />
                  <div className="flex gap-2">
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
                    >
                      Approve account
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
                    >
                      Reject account
                    </Button>
                  </div>
                </section>
                <section className="space-y-3">
                  <h3 className="font-semibold">
                    Submitted documents ({data.documents.length})
                  </h3>
                  {!data.documents.length && (
                    <p className="text-sm text-muted-foreground">
                      This user has not submitted a document.
                    </p>
                  )}
                  {data.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex justify-between gap-3">
                        <p className="font-medium text-sm">
                          {label(doc.docType)}
                        </p>
                        <Status value={doc.status} />
                      </div>
                      <p className="text-sm">{doc.claimToVerify}</p>
                      {doc.aiReasoning && (
                        <p className="text-sm text-muted-foreground">
                          {doc.aiReasoning}
                        </p>
                      )}
                      {safeUrl(doc.docUrl) && (
                        <a
                          href={doc.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-300 underline"
                        >
                          Open submitted document
                        </a>
                      )}
                      <Input
                        aria-label={`Review note for ${doc.docType}`}
                        placeholder="Review note (required for rejection)"
                        value={docNotes[doc.id] || ""}
                        onChange={(e) =>
                          setDocNotes({ ...docNotes, [doc.id]: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busy}
                          onClick={() =>
                            act("document", () =>
                              adminApproveVerification(
                                "",
                                doc.id,
                                docNotes[doc.id],
                              ),
                            )
                          }
                        >
                          Verify document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busy || !docNotes[doc.id]?.trim()}
                          onClick={() =>
                            act("document", () =>
                              adminRejectVerification(
                                "",
                                doc.id,
                                docNotes[doc.id],
                              ),
                            )
                          }
                        >
                          Reject document
                        </Button>
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
            {adminCan(user, "users.suspend") &&
              data.user.id !== user?.id &&
              (!data.user.isAdmin || adminCan(user, "settings")) && (
                <section className="rounded-xl border p-4 space-y-3">
                  <h3 className="font-semibold">Account access</h3>
                  <p className="text-sm text-muted-foreground">
                    Suspension blocks new logins and existing sessions.
                    Reactivation preserves the account's approval status.
                  </p>
                  <Input
                    aria-label="Suspension reason"
                    placeholder="Reason for suspension"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={5000}
                  />
                  <Button
                    variant={data.user.isSuspended ? "outline" : "destructive"}
                    disabled={
                      !!busy || (!data.user.isSuspended && !reason.trim())
                    }
                    onClick={() =>
                      act("suspend", () =>
                        mutate("user.suspension", id, {
                          suspended: !data.user.isSuspended,
                          reason,
                        }),
                      )
                    }
                  >
                    {data.user.isSuspended
                      ? "Reactivate account"
                      : "Suspend account"}
                  </Button>
                </section>
              )}
            {adminCan(user, "settings") && data.user.id !== user?.id && (
              <section className="rounded-xl border p-4 space-y-3">
                <h3 className="font-semibold">Administrator permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Only approved, active users can receive admin access.
                  Reviewers handle evidence; support handles users and content;
                  finance sees payments and reports.
                </p>
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label="Administrator role"
                    className={selectClass}
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                  >
                    <option value="">No admin access</option>
                    {ADMIN_ROLES.map((r: string) => (
                      <option key={r} value={r}>
                        {label(r)}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    disabled={
                      !!busy ||
                      adminRole ===
                        (data.user.isAdmin
                          ? data.user.adminRole || "super_admin"
                          : "")
                    }
                    onClick={() =>
                      act("access", () =>
                        mutate("user.admin_role", id, {
                          role: adminRole || null,
                        }),
                      )
                    }
                  >
                    Update admin access
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UsersPage() {
  const { data, error, loading, refresh } = useData("/users");
  const [params] = useSearchParams();
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(params.get("status") || "all"),
    [role, setRole] = useState("all"),
    [selected, setSelected] = useState("");
  const rows = (data?.users || []).filter(
    (u: AuthUser) =>
      `${u.fullName} ${u.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        (status === "suspended" ? u.isSuspended : u.status === status)) &&
      (role === "all" ||
        (role === "admin"
          ? u.isAdmin
          : [...u.requestedRoles, ...u.approvedRoles].includes(
              role as AppRole,
            ))),
  );
  return (
    <>
      <Heading
        title="Users"
        description="Find accounts, review their complete profile and control access."
      >
        <Refresh onClick={refresh} />
      </Heading>
      <Notice error={error} loading={loading} />
      {data && (
        <>
          <div className="flex flex-wrap gap-3 mb-5">
            <SearchBox value={search} onChange={setSearch} />
            <select
              className={selectClass}
              aria-label="Account status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["all", "pending", "approved", "rejected", "suspended"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All statuses" : label(s)}
                  </option>
                ),
              )}
            </select>
            <select
              className={selectClass}
              aria-label="User role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {["all", "startup", "investor", "advisor", "admin"].map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "All roles" : label(r)}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "users",
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
            >
              <Download className="h-4 w-4 mr-2" />
              Export view
            </Button>
          </div>
          <DataTable
            rows={rows}
            columns={[
              {
                label: "User",
                render: (u) => (
                  <div>
                    <button
                      className="font-medium text-indigo-600 dark:text-indigo-300 hover:underline text-left"
                      onClick={() => setSelected(u.id)}
                    >
                      {u.fullName}
                    </button>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {u.email}
                    </p>
                  </div>
                ),
              },
              {
                label: "Account",
                render: (u) => (
                  <Status value={u.isSuspended ? "suspended" : u.status} />
                ),
              },
              {
                label: "Roles",
                render: (u) => (
                  <div className="flex flex-wrap gap-1">
                    {(u.isAdmin
                      ? [u.adminRole || "super_admin"]
                      : u.approvedRoles.length
                        ? u.approvedRoles
                        : u.requestedRoles
                    ).map((r: string) => (
                      <Badge key={r} variant="outline" className="capitalize">
                        {label(r)}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                label: "Registered",
                render: (u) => new Date(u.createdAt).toLocaleDateString(),
              },
              {
                label: "Action",
                render: (u) => (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(u.id)}
                  >
                    View details
                  </Button>
                ),
              },
            ]}
          />
        </>
      )}
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
  const rows = (data?.users || [])
    .filter((u: AuthUser) => !u.isAdmin)
    .map((u: AuthUser) => ({
      ...u,
      review: data.reviews.find((r: any) => r.userId === u.id),
      report: data.reports.find((r: any) => r.userId === u.id),
      documentCount: data.documents.filter(
        (d: any) =>
          d.userId === u.id &&
          ["pending", "manual_review", "analyzing"].includes(d.status),
      ).length,
    }))
    .filter(
      (u: any) =>
        `${u.fullName} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === "all" ||
          (filter === "documents"
            ? u.documentCount > 0
            : (u.review?.state || "open") === filter)),
    );
  return (
    <>
      <Heading
        title="Due diligence"
        description="Run background checks, inspect sources and record a human review for every applicant."
      >
        <Refresh onClick={refresh} />
      </Heading>
      <div className="space-y-5">
        <Notice error={error || setupError} loading={loading} />
        {readiness &&
          (!readiness.ready ||
            !readiness.providers.length ||
            !readiness.searchConfigured) && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
              Background checks need database readiness, an AI provider and web
              search.{" "}
              <Link to="/admin/agents" className="underline font-medium">
                Open AI Operations for setup status.
              </Link>
            </div>
          )}
        <BulkBackgroundChecks
          ready={
            !!readiness?.ready &&
            !!readiness.providers.length &&
            readiness.searchConfigured
          }
          onQueued={refresh}
        />
        <div>
          <h2 className="text-lg font-semibold mb-3">Review workspace</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <SearchBox value={search} onChange={setSearch} />
            <select
              aria-label="Review filter"
              className={selectClass}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["all", "open", "in_review", "resolved", "documents"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All reviews" : label(s)}
                  </option>
                ),
              )}
            </select>
          </div>
          {data && (
            <DataTable
              rows={rows}
              columns={[
                {
                  label: "Applicant",
                  render: (u) => (
                    <div>
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {u.email}
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Evidence",
                  render: (u) => (
                    <>
                      <Status value={u.report?.status || "not started"} />
                      {u.report?.recommendation && (
                        <p className="text-xs mt-1 capitalize">
                          AI recommendation: {u.report.recommendation}
                        </p>
                      )}
                    </>
                  ),
                },
                {
                  label: "Review",
                  render: (u) => <Status value={u.review?.state || "open"} />,
                },
                {
                  label: "Assigned to",
                  render: (u) =>
                    data.users.find(
                      (a: AuthUser) => a.id === u.review?.assignedTo,
                    )?.fullName || "Unassigned",
                },
                { label: "Documents pending", render: (u) => u.documentCount },
                {
                  label: "Action",
                  render: (u) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(u.id)}
                    >
                      Review user
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </div>
        <BackgroundCheckCriteria />
      </div>
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
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent mt-4">Open due diligence <ArrowRight className="h-4 w-4" /></span>
              </Link>
            )}
            {canViewAgents && (
              <Link to="/admin/agents?status=completed" className="rounded-xl border bg-card p-5 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                <h3 className="font-semibold flex items-center gap-2"><Activity className="h-5 w-5" />Completed agent results</h3>
                <p className="text-sm text-muted-foreground mt-2">Find completed research, startup reviews, profile reviews and signal analysis among the latest 100 runs. Select Result to read the saved output.</p>
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

function PaymentsPage({ report = false }: { report?: boolean }) {
  const { data, error, loading, refresh } = useData("/payments");
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [from, setFrom] = useState(""),
    [until, setUntil] = useState("");
  const rows = (data?.payments || []).filter(
    (p: any) =>
      (status === "all" || p.status === status) &&
      `${p.userName} ${p.transactionRef || ""} ${p.id}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!from || p.createdAt.slice(0, 10) >= from) &&
      (!until || p.createdAt.slice(0, 10) <= until),
  );
  const totals = Object.entries(
    rows
      .filter(
        (p: any) =>
          p.status === "completed" &&
          !String(p.transactionRef).startsWith("SIM-"),
      )
      .reduce((acc: any, p: any) => {
        const c = p.currency.toUpperCase();
        acc[c] = (acc[c] || 0) + Number(p.amount);
        return acc;
      }, {}),
  );
  return (
    <>
      {report ? (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <h2 className="text-xl font-semibold">Payment report</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Recorded payments, references and account ownership. Totals keep currencies separate and exclude simulated payments.</p>
          </div>
          <Refresh onClick={refresh} />
        </div>
      ) : (
        <Heading
          title="Payments"
          description="Recorded payments, references and account ownership. Totals keep currencies separate and exclude simulated payments."
        >
          <Refresh onClick={refresh} />
        </Heading>
      )}
      <Notice error={error} loading={loading} />
      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Metric
              title="Recorded payments"
              value={rows.length}
              detail="In the current filtered view"
            />
            <Metric
              title="Completed value"
              value={
                totals.length
                  ? totals
                      .map(([c, v]) => `${c} ${Number(v).toFixed(2)}`)
                      .join(" · ")
                  : "—"
              }
              detail="Completed, non-simulated records"
              icon={CheckCircle2}
            />
            <Metric
              title="Needs investigation"
              value={
                rows.filter((p: any) =>
                  ["pending", "failed"].includes(p.status),
                ).length
              }
              detail="Pending or failed payment records"
              icon={AlertCircle}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search user or transaction…"
            />
            <select
              aria-label="Payment status"
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["all", "completed", "pending", "failed", "refunded"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </option>
                ),
              )}
            </select>
            <label className="text-xs text-muted-foreground">
              From (UTC)
              <Input
                aria-label="Payments from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Until (UTC)
              <Input
                aria-label="Payments until"
                type="date"
                value={until}
                min={from}
                onChange={(e) => setUntil(e.target.value)}
              />
            </label>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "payments",
                  rows.map((p: any) => ({
                    id: p.id,
                    user: p.userName,
                    item: p.itemType,
                    amount: p.amount,
                    currency: p.currency,
                    status: p.status,
                    reference: p.transactionRef,
                    created: p.createdAt,
                  })),
                )
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Export view
            </Button>
          </div>
          <DataTable
            rows={rows}
            columns={[
              {
                label: "User / item",
                render: (p) => (
                  <div>
                    <p className="font-medium">{p.userName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {label(p.itemType)}
                    </p>
                  </div>
                ),
              },
              {
                label: "Amount",
                render: (p) => `${p.currency} ${Number(p.amount).toFixed(2)}`,
              },
              {
                label: "Status",
                render: (p) => (
                  <>
                    <Status value={p.status} />
                    {String(p.transactionRef).startsWith("SIM-") && (
                      <p className="text-xs text-amber-700 mt-1">Simulated</p>
                    )}
                  </>
                ),
              },
              {
                label: "Transaction reference",
                render: (p) => (
                  <span className="text-xs break-all">
                    {p.transactionRef || "No provider reference"}
                  </span>
                ),
              },
              { label: "Date", render: (p) => date(p.createdAt) },
            ]}
          />
          <p className="text-xs text-muted-foreground mt-4">
            These are application records, not a provider settlement statement.
            Process refunds in the payment provider dashboard; this screen does
            not initiate refunds.
          </p>
        </>
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
  const [draft, setDraft] = useState<any>(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data) setDraft({ ...data.settings });
  }, [data]);
  async function save() {
    setBusy(true);
    try {
      await mutate("settings.update", "platform", draft);
      toast.success("Platform settings saved.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Platform settings"
        description="Saved controls apply to the server and remain in effect after refresh or restart."
      />
      <Notice error={error} loading={loading} />
      {draft && !loading && (
        <Card className="p-6 max-w-3xl gap-6 shadow-none">
          {[
            {
              key: "registrationOpen",
              title: "Accept new registrations",
              description:
                "Allow visitors to submit applications. Existing accounts keep their current approval status.",
            },
            {
              key: "requireBackgroundCheck",
              title: "Require a completed background report before approval",
              description:
                "Blocks approval until the AI report is complete. An administrator still reviews the evidence and chooses the outcome.",
            },
            {
              key: "maintenanceMode",
              title: "Maintenance mode",
              description:
                "Temporarily block customer login, registration and authenticated requests. Administrators retain access to turn this off.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-6 border-b pb-6"
            >
              <div>
                <Label htmlFor={item.key} className="font-medium">
                  {item.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {item.description}
                </p>
              </div>
              <Switch
                id={item.key}
                checked={draft[item.key]}
                onCheckedChange={(value) =>
                  setDraft({ ...draft, [item.key]: value })
                }
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={
                busy || JSON.stringify(draft) === JSON.stringify(data?.settings)
              }
              onClick={save}
            >
              {busy ? "Saving…" : "Save settings"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDraft({ ...data.settings })}
            >
              Discard changes
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage administrator roles from Users → View details. Every saved
            change is recorded in Reports & Audit.
          </p>
        </Card>
      )}
    </>
  );
}

function AccountPage() {
  const { user } = useAuth();
  return (
    <>
      <Heading
        title="Administrator profile"
        description="Your signed-in account and access level."
      />
      <Card className="p-6 max-w-2xl gap-4 shadow-none">
        <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xl font-semibold">
          {user?.fullName?.slice(0, 1)}
        </div>
        <h2 className="text-xl font-semibold">{user?.fullName}</h2>
        <p className="text-muted-foreground">{user?.email}</p>
        <Badge variant="outline" className="w-fit capitalize">
          {label(user?.adminRole || "super_admin")}
        </Badge>
        <p className="text-sm text-muted-foreground">
          Joined {date(user?.createdAt)}
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/forgot-password">Change password</Link>
        </Button>
      </Card>
      <AdminSecurity />
    </>
  );
}

export function AdminConsole({ section = "dashboard" }: { section?: string }) {
  const { user } = useAuth();
  const required = adminSections.find((s) => s.path === section)?.permission;
  const allowed = !required || adminCan(user, required);
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
      ) : section === "users" ? (
        <UsersPage />
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
      ) : section === "profile" ? (
        <AccountPage />
      ) : (
        <Overview />
      )}
    </AdminLayout>
  );
}
