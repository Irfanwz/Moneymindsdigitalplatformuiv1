import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { ProfileLinkChecks } from "./ProfileLinkChecks";
import type { ProfileLinkCheck } from "@/app/types/profile-links";

const statuses: Record<string, string> = {
  supported: "Supported by evidence",
  inconsistent: "Inconsistency found",
  insufficient_evidence: "Insufficient evidence",
  manual_review: "Manual review required",
  not_provided: "Not provided",
  self_reported: "Self-reported",
};
const roles: Record<string, string> = {
  personal: "Personal information",
  startup: "Startup",
  investor: "Investor",
  advisor: "Financial Advisor",
};
type Evidence = { sourceId: string; quote: string };
type Check = {
  id: string;
  role: string;
  label: string;
  value: unknown;
  required: boolean;
  origin: string;
  status: string;
  reasoning: string;
  evidence: Evidence[];
};
type Source = { id: string; title: string; url?: string; name?: string };
type IdentityCheck = {
  url: string;
  match: "match" | "mismatch" | "inconclusive";
  confidence: number;
  nameMatch?: boolean;
  roleMatch?: boolean;
  companyMatch?: boolean;
  summary: string;
  matchedFields?: { fieldId: string; found: boolean; pageValue: string; claimedValue: string }[];
};
type IdentityVerification = {
  status: "match" | "mismatch" | "inconclusive";
  checks: IdentityCheck[];
  summary: string;
};
type Report = {
  roles: string[];
  fieldChecks: Check[];
  identityVerification?: IdentityVerification | null;
  counts: Record<string, number>;
  limitations: string[];
  sources: Source[];
  profileLinks?: ProfileLinkCheck[];
  documents: {
    id: string;
    title: string;
    name: string;
    status: string;
    reason?: string;
    truncated?: boolean;
  }[];
};

function valueText(value: unknown): string {
  if (Array.isArray(value))
    return value.map(valueText).filter(Boolean).join("; ");
  if (value && typeof value === "object")
    return Object.entries(value)
      .filter(([key]) => key !== "id")
      .map(
        ([key, item]) =>
          `${key.replace(/([a-z])([A-Z])/g, "$1 $2")}: ${valueText(item)}`,
      )
      .join(", ");
  return value == null || value === "" ? "Not supplied" : String(value);
}

export function DueDiligenceReport({ report }: { report: Report }) {
  const [filter, setFilter] = useState("all");
  const identity = report.identityVerification;
  return (
    <div className="space-y-5">
      {/* Identity Verification — shown first and prominently */}
      {identity && (
        <div className={`rounded-xl border-2 p-5 space-y-3 ${
          identity.status === "match" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" :
          identity.status === "mismatch" ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
          "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{identity.status === "match" ? "✓" : identity.status === "mismatch" ? "✗" : "?"}</span>
            <div>
              <h3 className="text-lg font-semibold">
                Identity Verification: {identity.status === "match" ? "MATCH" : identity.status === "mismatch" ? "MISMATCH" : "INCONCLUSIVE"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on {identity.checks.length} provided profile link{identity.checks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {identity.checks.map((check, i) => (
            <div key={i} className="rounded-lg border bg-background p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={check.match === "match" ? "default" : check.match === "mismatch" ? "destructive" : "outline"}>
                  {check.match === "match" ? "✓ Match" : check.match === "mismatch" ? "✗ Mismatch" : "? Inconclusive"}
                  {check.confidence > 0 && ` (${check.confidence}%)`}
                </Badge>
                <a href={check.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline break-all">
                  {check.url}
                </a>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {check.nameMatch !== undefined && <span>{check.nameMatch ? "✓" : "✗"} Name</span>}
                {check.roleMatch !== undefined && <span>{check.roleMatch ? "✓" : "✗"} Role</span>}
                {check.companyMatch !== undefined && <span>{check.companyMatch ? "✓" : "✗"} Company</span>}
              </div>
              <p className="text-sm">{check.summary}</p>
              {check.matchedFields?.length ? (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Field comparisons ({check.matchedFields.length})</summary>
                  <div className="mt-2 space-y-1">
                    {check.matchedFields.map((f, j) => (
                      <div key={j} className="flex gap-2 items-start text-xs">
                        <span>{f.found ? "✓" : "✗"}</span>
                        <span className="font-medium min-w-24">{f.fieldId.split(".").pop()}</span>
                        <span className="text-muted-foreground">Claimed: {f.claimedValue}</span>
                        <span>→</span>
                        <span>{f.pageValue || "Not found on page"}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Review counts">
        {Object.entries(statuses).map(([key, label]) => (
          <Badge key={key} variant="outline">
            {label}: {report.counts[key] || 0}
          </Badge>
        ))}
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h4 className="font-medium">Evidence limits</h4>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          {report.limitations.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </div>
      <ProfileLinkChecks links={report.profileLinks} />
      <label className="flex flex-wrap items-center gap-2">
        Show checks
        <select
          aria-label="Filter due diligence checks"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded border bg-background px-3 py-2 max-w-full"
        >
          <option value="all">All fields</option>
          {Object.entries(statuses).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {["personal", ...report.roles].map((role) => {
        const fields = report.fieldChecks.filter(
          (f) => f.role === role && (filter === "all" || f.status === filter),
        );
        return (
          <details key={role} open className="rounded-lg border p-4 min-w-0">
            <summary className="font-medium cursor-pointer">
              {roles[role] || role} ({fields.length} checks)
            </summary>
            <div className="mt-4 space-y-4">
              {!fields.length && (
                <p className="text-muted-foreground">
                  No checks match this filter.
                </p>
              )}
              {fields.map((field) => (
                <article
                  key={field.id}
                  className="border-t pt-3 space-y-2 min-w-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-medium">{field.label}</h5>
                    <Badge
                      variant={
                        field.status === "inconsistent"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {statuses[field.status] || field.status}
                    </Badge>
                    {field.required && (
                      <span className="text-xs text-muted-foreground">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {field.origin}
                  </p>
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {valueText(field.value)}
                  </p>
                  <p className="text-muted-foreground break-words">
                    {field.reasoning}
                  </p>
                  {field.evidence.map((ref, i) => {
                    const source = report.sources.find(
                      (s) => s.id === ref.sourceId,
                    );
                    return (
                      <blockquote
                        key={i}
                        className="border-l-2 pl-3 space-y-1 break-words"
                      >
                        <p className="whitespace-pre-wrap">“{ref.quote}”</p>
                        {source?.url && /^https?:\/\//i.test(source.url) ? (
                          <a
                            className="underline text-accent"
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                          </a>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {source?.name ||
                              source?.title ||
                              "Supplied evidence"}
                          </p>
                        )}
                      </blockquote>
                    );
                  })}
                </article>
              ))}
            </div>
          </details>
        );
      })}
      {report.documents.length > 0 && (
        <details className="rounded-lg border p-4">
          <summary className="font-medium cursor-pointer">
            Document reading ({report.documents.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {report.documents.map((doc) => (
              <li key={doc.id} className="break-words">
                <strong>{doc.name}</strong>
                <p>
                  {doc.status === "read"
                    ? "Text extracted; authenticity requires separate confirmation."
                    : doc.reason}
                </p>
                {doc.truncated && (
                  <p className="text-muted-foreground">
                    Only the first 20,000 extracted characters were reviewed.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
