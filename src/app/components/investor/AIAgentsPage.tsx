import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Search, Info, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAgentCatalog, followAgent, useAgentRuns, type ResearchAgent } from "@/app/lib/agents";

export function AIAgentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState<ResearchAgent[]>([]);
  const [follows, setFollows] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<ResearchAgent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { runs, error: activityError } = useAgentRuns();
  const researchRuns = runs.filter(r => r.agentKey.startsWith("investor-"));
  async function load() {
    setLoading(true);
    try { const data = await getAgentCatalog(); setAgents(data.agents); setFollows(data.follows); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Agents could not be loaded."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function toggleFollow(agent: ResearchAgent) {
    setBusy(true);
    const nextFollow = !follows.includes(agent.id);
    try {
      setFollows((await followAgent(agent.id, nextFollow)).follows);
      toast.success(nextFollow ? `Following ${agent.name}.` : `Unfollowed ${agent.name}.`);
    }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not save your selection."); }
    finally { setBusy(false); }
  }
  const viewInsights = (id: string) => navigate(`/investor/ai-agents/${id}/insights`);
  const filtered = agents.filter(a => `${a.name} ${a.industry} ${a.description}`.toLowerCase().includes(search.toLowerCase()));
  function renderAgent(agent: ResearchAgent) {
    const latest = researchRuns.find(r => r.agentKey === `investor-${agent.id}`);
    return <Card key={agent.id} className="p-5 gap-3 rounded-2xl border-cyan-900/10 bg-card/90 shadow-sm hover:border-cyan-500/40 transition-all dark:border-cyan-800/35">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 flex-wrap items-center">
            <h3 className="font-semibold text-base">{agent.name}</h3>
            {follows.includes(agent.id) && <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Following</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">{agent.description}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="border-cyan-500/30 text-cyan-700 dark:text-cyan-300">{agent.industry}</Badge>
        <Badge variant="outline">On demand</Badge>
        <Badge variant="outline">{latest ? `Latest run: ${latest.status}` : "No runs yet"}</Badge>
      </div>
      {latest && <p className="text-xs text-muted-foreground">{latest.stage} &middot; {new Date(latest.createdAt).toLocaleString()}</p>}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button className="rounded-none bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold shadow-sm" onClick={() => viewInsights(agent.id)}>
          <Eye className="mr-2 h-4 w-4"/>View Insights
        </Button>
        <Button variant="outline" className="rounded-none border-slate-200 dark:border-slate-700 hover:border-cyan-500/50" onClick={() => { setSelectedAgent(agent); setIsDetailOpen(true); }}>
          <Info className="mr-2 h-4 w-4"/>Details
        </Button>
        <Button disabled={busy} variant="ghost" className="rounded-none text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40" onClick={() => void toggleFollow(agent)}>
          {follows.includes(agent.id) ? "Unfollow" : "Follow"}
        </Button>
      </div>
    </Card>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-background to-background dark:from-[#0b1728]"><Header userRole="investor" userName={user?.fullName}/><main className="w-full px-4 py-6 sm:px-8 sm:py-8 xl:px-14 space-y-6">
    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-border/70 pb-5"><div><h1 className="text-3xl font-extrabold tracking-tight flex gap-3 items-center"><Bot className="h-8 w-8 text-cyan-600 dark:text-cyan-400"/>AI Intelligence Agents</h1><p className="text-muted-foreground mt-1.5">Run industry research, follow its progress, and inspect the sources behind each report.</p></div><Button variant="outline" className="rounded-none border-slate-200 dark:border-slate-700" asChild><Link to="/activity">All agent activity</Link></Button></div>
    {(error || activityError) && <Card role="alert" className="p-4 text-destructive">{error || activityError}<Button className="ml-3" variant="outline" onClick={() => void load()}>Retry</Button></Card>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[["Available agents", agents.length], ["Following", follows.length], ["Running now", researchRuns.filter(r => ["queued", "running"].includes(r.status)).length], ["Reports in recent history", researchRuns.filter(r => r.status === "completed").length]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-semibold mt-2">{loading || error || activityError ? "--" : value}</p></Card>)}</div>
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input aria-label="Search agents" className="pl-10" placeholder="Search by industry or expertise" value={search} onChange={e => setSearch(e.target.value)}/></div>
    <Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All agents</TabsTrigger><TabsTrigger value="following">Following ({follows.length})</TabsTrigger></TabsList><TabsContent value="all" className="grid md:grid-cols-2 gap-4 mt-4">{loading ? <Loader2 className="animate-spin"/> : filtered.length ? filtered.map(renderAgent) : <p>No agents match this search.</p>}</TabsContent><TabsContent value="following" className="grid md:grid-cols-2 gap-4 mt-4">{filtered.filter(a => follows.includes(a.id)).map(renderAgent)}{!filtered.some(a => follows.includes(a.id)) && <p className="text-muted-foreground">Follow an agent to keep it in this list.</p>}</TabsContent></Tabs>
    <p className="text-sm text-muted-foreground">Following saves your selection. Reports run when you request them. Research includes source links and timestamps; no accuracy or return is guaranteed.</p>
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}><DialogContent><DialogHeader><DialogTitle>{selectedAgent?.name}</DialogTitle><DialogDescription>{selectedAgent?.description}</DialogDescription></DialogHeader><div className="space-y-3 text-sm"><p>Each run collects available current sources, analyzes opportunities and risks, then saves a report to your account.</p><p>You can watch the actual stage, inspect the resulting sources, and retry a failed run from its Insights page.</p><p className="text-muted-foreground">Provider or database errors appear in the run history. Following an agent does not schedule reports or create a paid subscription.</p></div><DialogFooter>{selectedAgent && <><Button variant="outline" disabled={busy} onClick={() => void toggleFollow(selectedAgent)}>{follows.includes(selectedAgent.id) ? "Unfollow" : "Follow"}</Button><Button onClick={() => viewInsights(selectedAgent.id)}>View Insights</Button></>}</DialogFooter></DialogContent></Dialog>
  </main></div>;
}
