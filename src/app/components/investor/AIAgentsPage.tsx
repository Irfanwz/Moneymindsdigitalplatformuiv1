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
    try { setFollows((await followAgent(agent.id, !follows.includes(agent.id))).follows); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not save your selection."); }
    finally { setBusy(false); }
  }
  const viewInsights = (id: string) => navigate(`/investor/ai-agents/${id}/insights`);
  const filtered = agents.filter(a => `${a.name} ${a.industry} ${a.description}`.toLowerCase().includes(search.toLowerCase()));
  function renderAgent(agent: ResearchAgent) {
    const latest = researchRuns.find(r => r.agentKey === `investor-${agent.id}`);
    return <Card key={agent.id} className="p-5 gap-3">
      <div className="flex items-start gap-3"><Bot className="h-7 w-7 text-accent shrink-0"/><div className="flex-1"><div className="flex gap-2 flex-wrap items-center"><h3 className="font-semibold">{agent.name}</h3>{follows.includes(agent.id) && <Badge variant="outline">Following</Badge>}</div><p className="text-sm text-muted-foreground mt-2">{agent.description}</p></div></div>
      <div className="flex gap-2 flex-wrap"><Badge variant="outline">{agent.industry}</Badge><Badge variant="outline">On demand</Badge><Badge variant="outline">{latest ? `Latest run: ${latest.status}` : "No runs yet"}</Badge></div>
      {latest && <p className="text-xs text-muted-foreground">{latest.stage} &middot; {new Date(latest.createdAt).toLocaleString()}</p>}
      <div className="flex flex-wrap gap-2 border-t pt-4"><Button onClick={() => viewInsights(agent.id)}><Eye className="mr-2 h-4 w-4"/>View Insights</Button><Button variant="outline" onClick={() => { setSelectedAgent(agent); setIsDetailOpen(true); }}><Info className="mr-2 h-4 w-4"/>Details</Button><Button disabled={busy} variant="ghost" onClick={() => void toggleFollow(agent)}>{follows.includes(agent.id) ? "Unfollow" : "Follow"}</Button></div>
    </Card>;
  }
  return <div className="min-h-screen bg-background"><Header userRole="investor" userName={user?.fullName}/><main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
    <div className="flex flex-wrap justify-between items-start gap-4"><div><h1 className="text-3xl font-semibold flex gap-3 items-center"><Bot className="h-8 w-8 text-accent"/>AI Intelligence Agents</h1><p className="text-muted-foreground mt-2">Run industry research, follow its progress, and inspect the sources behind each report.</p></div><Button variant="outline" asChild><Link to="/activity">All agent activity</Link></Button></div>
    {(error || activityError) && <Card role="alert" className="p-4 text-destructive">{error || activityError}<Button className="ml-3" variant="outline" onClick={() => void load()}>Retry</Button></Card>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[["Available agents", agents.length], ["Following", follows.length], ["Running now", researchRuns.filter(r => ["queued", "running"].includes(r.status)).length], ["Reports in recent history", researchRuns.filter(r => r.status === "completed").length]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-semibold mt-2">{loading || error || activityError ? "--" : value}</p></Card>)}</div>
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input aria-label="Search agents" className="pl-10" placeholder="Search by industry or expertise" value={search} onChange={e => setSearch(e.target.value)}/></div>
    <Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All agents</TabsTrigger><TabsTrigger value="following">Following ({follows.length})</TabsTrigger></TabsList><TabsContent value="all" className="grid md:grid-cols-2 gap-4 mt-4">{loading ? <Loader2 className="animate-spin"/> : filtered.length ? filtered.map(renderAgent) : <p>No agents match this search.</p>}</TabsContent><TabsContent value="following" className="grid md:grid-cols-2 gap-4 mt-4">{filtered.filter(a => follows.includes(a.id)).map(renderAgent)}{!filtered.some(a => follows.includes(a.id)) && <p className="text-muted-foreground">Follow an agent to keep it in this list.</p>}</TabsContent></Tabs>
    <p className="text-sm text-muted-foreground">Following saves your selection. Reports run when you request them. Research includes source links and timestamps; no accuracy or return is guaranteed.</p>
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}><DialogContent><DialogHeader><DialogTitle>{selectedAgent?.name}</DialogTitle><DialogDescription>{selectedAgent?.description}</DialogDescription></DialogHeader><div className="space-y-3 text-sm"><p>Each run collects available current sources, analyzes opportunities and risks, then saves a report to your account.</p><p>You can watch the actual stage, inspect the resulting sources, and retry a failed run from its Insights page.</p><p className="text-muted-foreground">Provider or database errors appear in the run history. Following an agent does not schedule reports or create a paid subscription.</p></div><DialogFooter>{selectedAgent && <><Button variant="outline" disabled={busy} onClick={() => void toggleFollow(selectedAgent)}>{follows.includes(selectedAgent.id) ? "Unfollow" : "Follow"}</Button><Button onClick={() => viewInsights(selectedAgent.id)}>View Insights</Button></>}</DialogFooter></DialogContent></Dialog>
  </main></div>;
}
