/**
 * Filtered Agent Page — shows runs for a specific category of agents.
 * Used as sub-pages under /admin/agents/*
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Loader2, RefreshCw, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers } from "@/app/lib/api";
import type { AuthUser } from "@/app/types/auth";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  useAgentRuns,
  agentName,
  startAgent,
  resumeAgent,
  type AgentRun,
} from "@/app/lib/agents";
import { AgentRunCard } from "./AgentRunCard";
import { BulkBackgroundChecks } from "./BulkBackgroundChecks";

interface AgentFilteredPageProps {
  title: string;
  description: string;
  agentKeys: string[];
  showBulkChecks?: boolean;
}

const statuses = ["queued", "running", "completed", "failed", "skipped"];

export function AgentFilteredPage({
  title,
  description,
  agentKeys,
  showBulkChecks = false,
}: AgentFilteredPageProps) {
  const { runs: allRuns, error, loading, refresh } = useAgentRuns();
  const [filter, setFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [users, setUsers] = useState<AuthUser[]>([]);

  useEffect(() => {
    getAdminUsers("").then((d) => setUsers(d.users)).catch(() => {});
  }, []);

  // Filter runs by the agent keys for this page
  const runs = allRuns.filter((r) => agentKeys.includes(r.agentKey));
  const shown = runs.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (ownerFilter === "all" || r.userId === ownerFilter || r.targetId === ownerFilter),
  );

  async function retry(run: AgentRun) {
    try {
      await startAgent(run.agentKey, run.targetId);
      await refresh();
      toast.success("Agent queued.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the agent.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/agents"
              className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> AI Operations
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7" /> {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {agentKeys.map((k) => (
              <Badge key={k} variant="outline" className="text-xs">
                {agentName(k)}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={() => void refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Bulk checks for background verification page */}
      {showBulkChecks && <BulkBackgroundChecks ready onQueued={() => void refresh()} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Filter by user"
          className="rounded border p-2 bg-background text-sm min-w-48"
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        >
          <option value="all">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          onClick={() => {
            setOwnerFilter("all");
            setFilter("all");
          }}
        >
          Clear filters
        </Button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-xl border p-4 text-left ${
              filter === s ? "border-accent bg-accent/5" : "bg-card"
            }`}
          >
            <p className="capitalize text-sm text-muted-foreground">{s}</p>
            <p className="text-3xl font-semibold mt-1">
              {loading || error ? "--" : runs.filter((r) => r.status === s).length}
            </p>
          </button>
        ))}
      </div>

      {/* Runs list */}
      <section className="space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-xl font-semibold">
            {filter === "all" ? "Recent runs" : `${filter[0].toUpperCase() + filter.slice(1)} runs`}
          </h2>
          <span className="text-xs text-muted-foreground">
            {shown.length} of {runs.length} runs shown
          </span>
        </div>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : !shown.length ? (
          <Card className="p-8 text-center text-muted-foreground">
            <ShieldCheck className="h-8 w-8 mx-auto mb-3" />
            No {title.toLowerCase()} runs in this view.
          </Card>
        ) : (
          shown.map((r) => (
            <div key={r.id}>
              <AgentRunCard
                run={r}
                showOwner
                ownerName={users.find((u) => u.id === r.userId)?.fullName}
                onRetry={retry}
              />
              {r.status === "queued" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void resumeAgent(r.id)
                      .then(refresh)
                      .catch((e) => toast.error(e.message))
                  }
                >
                  Resume queued run
                </Button>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
