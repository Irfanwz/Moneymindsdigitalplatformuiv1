import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAgentCatalog, startAgent, useAgentRuns, type ResearchAgent } from "@/app/lib/agents";
import { AgentRunCard } from "@/app/components/agents/AgentRunCard";

export function AgentInsightsPage() {
  const { agentId } = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState<ResearchAgent | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = `investor-${agentId}`;
  const { runs, loading, error, refresh } = useAgentRuns(key);
  useEffect(() => { let active = true; getAgentCatalog().then(data => { if (active) { const found = data.agents.find(a => a.id === agentId); setAgent(found || null); setCatalogError(found ? "" : "Agent not found."); } }).catch(e => { if (active) setCatalogError(e.message); }); return () => { active = false; }; }, [agentId]);
  const running = runs.some(r => ["queued", "running"].includes(r.status));
  async function run() {
    setBusy(true);
    try { await startAgent(key); await refresh(); toast.success("Research started. Follow its progress below."); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not start research."); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]"><Header userRole="investor" userName={user?.fullName}/><main className="w-full px-4 py-6 sm:px-8 sm:py-8 xl:px-14 space-y-6">
    <Button variant="ghost" className="rounded-none text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40" asChild><Link to="/investor/ai-agents"><ArrowLeft className="h-4 w-4 mr-2"/>All agents</Link></Button>
    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-border/70 pb-5"><div><h1 className="text-3xl font-extrabold tracking-tight">{agent?.name || "Agent insights"}</h1><p className="text-muted-foreground mt-1.5">{agent?.description}</p></div><Button className="rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm" disabled={!agent || busy || running || !!error} onClick={() => void run()}>{busy || running ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>}{running ? "Research in progress" : "Run research"}</Button></div>
    {(error || catalogError) && <Card role="alert" className="p-4 rounded-2xl text-destructive">{error || catalogError}</Card>}
    <Card className="p-4 rounded-2xl border-cyan-900/10 dark:border-cyan-800/35 text-sm text-muted-foreground">Reports are generated on demand from available source material. Review source dates and evidence before acting. Signal confidence is a model estimate, not measured investment performance.</Card>
    <div className="flex justify-between items-center"><h2 className="text-xl font-semibold">Run history and reports</h2><Button variant="outline" size="sm" className="rounded-none border-slate-200 dark:border-slate-700" onClick={() => void refresh()}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button></div>
    <p className="text-xs text-muted-foreground">Activity refreshes every 3 seconds.</p>
    {loading ? <Loader2 className="animate-spin"/> : !runs.length ? <Card className="p-10 text-center"><h3 className="font-semibold">No research has run yet</h3><p className="text-sm text-muted-foreground mt-2">Select Run research to collect sources and generate your first report.</p></Card> : runs.map(r => <AgentRunCard key={r.id} run={r} onRetry={!running && !busy ? () => void run() : undefined}/>)}
  </main></div>;
}
