import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BackgroundCheckCriteria } from "./BackgroundCheckCriteria";
import { BulkBackgroundChecks } from "./BulkBackgroundChecks";
import { Activity, RefreshCw, Play, Loader2, Database, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers } from "@/app/lib/api";
import type { AuthUser } from "@/app/types/auth";
import { Header } from "@/app/components/Header";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAgentReadiness,getAgentBacklog,startAgent,resumeAgent,useAgentRuns,agentName,type AgentReadiness,type AgentRun } from "@/app/lib/agents";
import { AgentRunCard } from "./AgentRunCard";

export function AgentActivityPage({admin=false,embedded=false}:{admin?:boolean;embedded?:boolean}) {
  const {user}=useAuth();
  const [searchParams]=useSearchParams();
  const {runs,error,loading,refresh}=useAgentRuns();
  const [readiness,setReadiness]=useState<AgentReadiness|null>(null);
  const [setupError,setSetupError]=useState("");
  const [tasks,setTasks]=useState<{agentKey:string;targetId:string;label:string}[]>([]);
  const [busy,setBusy]=useState("");
  const [filter,setFilter]=useState(()=>searchParams.get('status') || 'all');
  const [ownerFilter,setOwnerFilter]=useState(()=>searchParams.get('user') || 'all');
  const [agentFilter,setAgentFilter]=useState('all');
  const [since,setSince]=useState('');
  const [targetUser,setTargetUser]=useState(()=>searchParams.get("user") || "");
  const [users,setUsers]=useState<AuthUser[]>([]);
  const [research,setResearch]=useState("1");
  async function loadSetup() {
    if(!admin) return;
    try {
      const ready=await getAgentReadiness();setReadiness(ready);setSetupError("");
      if(ready.ready) setTasks((await getAgentBacklog()).tasks);
      setUsers((await getAdminUsers("")).users);
    } catch(e){setSetupError(e instanceof Error ? e.message : "Setup could not be checked.");}
  }
  useEffect(()=>{void loadSetup();},[admin]);
  async function run(agentKey:string,targetId="self") {
    if(agentKey==="verification" && (!readiness?.providers.length || !readiness.searchConfigured)) {
      toast.error("Configure an AI provider and TAVILY_API_KEY on the server before starting background checks.");
      return;
    }
    setBusy(`${agentKey}:${targetId}`);
    try {await startAgent(agentKey,targetId);await refresh();toast.success("Agent queued. Progress appears below.");}
    catch(e){toast.error(e instanceof Error ? e.message : "Could not start the agent.");}
    finally{setBusy("");}
  }
  const statuses=["queued","running","completed","failed","skipped"];
  const shown=runs.filter(r=>(filter==="all" || r.status===filter) && (ownerFilter==='all'||r.userId===ownerFilter||r.targetId===ownerFilter) && (agentFilter==='all'||r.agentKey===agentFilter) && (!since||r.createdAt.slice(0,10)>=since));
  const role=admin ? "admin" : user?.currentRole || user?.approvedRoles[0] || "investor";
  return <div className={embedded?'':'min-h-screen bg-background'}>{!embedded&&<Header userRole={role} userName={user?.fullName}/>}<div className={embedded?'space-y-6':'container mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6'}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-semibold flex gap-3 items-center"><Activity className="h-8 w-8 text-accent"/>Agent Activity</h1><p className="text-muted-foreground mt-2">{admin ? "Monitor platform agents, inspect results, and resolve unfinished work." : "Follow your agents from request to saved result."}</p></div><Button variant="outline" onClick={()=>{void refresh();void loadSetup();}}><RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button></div>
    {admin && <Card className="p-5 gap-3"><h2 className="font-semibold flex gap-2 items-center"><Database className="h-5 w-5"/>Agent readiness</h2>{setupError && <p role="alert" className="text-destructive">{setupError}</p>}{readiness ? <><div className="flex gap-2 flex-wrap"><Badge variant="outline">Storage: {readiness.storage}</Badge><Badge variant="outline">AI: {readiness.providers.join(", ") || "not configured"}</Badge><Badge variant="outline">Search: {readiness.searchConfigured ? "configured" : "missing"}</Badge><Badge variant="outline">Image reading: {readiness.documentImagesConfigured ? "configured" : "missing"}</Badge><Badge variant="outline">Stock prices: {readiness.stockPricesConfigured ? "configured" : "missing"}</Badge></div><p className="text-xs text-muted-foreground">Configuration checks do not validate provider credentials. A completed run confirms a successful provider request.</p>{readiness.storage==="memory" && <p className="text-amber-700 text-sm">This server uses temporary storage. Run history will reset when it restarts.</p>}<details open={!readiness.ready}><summary className="cursor-pointer font-medium">{readiness.ready ? "Required agent tables and columns are available" : "Database setup needs attention"}</summary><div className="grid sm:grid-cols-2 gap-2 mt-3">{readiness.schema.map(s=><div key={s.table} className="rounded border p-3 text-sm"><span className={s.ok ? "text-emerald-600" : "text-destructive"}>{s.ok ? "✓" : "!"} {s.table}</span>{s.message && <p className="text-xs mt-1 break-words">{s.message}</p>}</div>)}</div></details></> : !setupError && <p>Checking configuration…</p>}</Card>}
    {(error || setupError) && <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error || setupError}</div>}
    {admin && readiness && (!readiness.providers.length || !readiness.searchConfigured) && <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">Background checks need both an AI provider and web search. Configure <code>GROQ_API_KEY</code> or <code>ANTHROPIC_API_KEY</code>, plus <code>TAVILY_API_KEY</code>, on the server and restart it. Then refresh this page.</div>}
    {admin && !embedded && <BackgroundCheckCriteria />}
    {admin && !embedded && <BulkBackgroundChecks ready={!!readiness?.ready && !!readiness.providers.length && readiness.searchConfigured} onQueued={()=>{void refresh();void loadSetup();}}/>}
    {admin && <div className="flex flex-wrap gap-3"><select aria-label="Filter runs by user" className="rounded border p-2 bg-background text-sm min-w-48" value={ownerFilter} onChange={e=>setOwnerFilter(e.target.value)}><option value="all">All users</option>{users.map(u=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select><select aria-label="Filter runs by agent" className="rounded border p-2 bg-background text-sm" value={agentFilter} onChange={e=>setAgentFilter(e.target.value)}><option value="all">All agents</option>{[...new Set(runs.map(r=>r.agentKey))].map(k=><option key={k} value={k}>{agentName(k)}</option>)}</select><label className="text-xs text-muted-foreground flex gap-2 items-center">From (UTC)<input aria-label="Runs from date" type="date" value={since} onChange={e=>setSince(e.target.value)} className="rounded border p-2 bg-background text-sm"/></label><Button variant="ghost" onClick={()=>{setOwnerFilter('all');setAgentFilter('all');setSince('');setFilter('all');}}>Clear filters</Button></div>}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{statuses.map(s=><button key={s} onClick={()=>setFilter(filter===s ? "all" : s)} className={`rounded-xl border p-4 text-left ${filter===s ? "border-accent bg-accent/5" : "bg-card"}`}><p className="capitalize text-sm text-muted-foreground">{s}</p><p className="text-3xl font-semibold mt-1">{loading || error ? "--" : runs.filter(r=>r.status===s).length}</p></button>)}</div>
    <Card className="p-5 gap-3"><h2 className="font-semibold flex items-center gap-2"><Play className="h-4 w-4"/>Run an agent</h2><div className="flex flex-wrap gap-2">{admin ? <><Button disabled={!!busy || !readiness?.ready} onClick={()=>run("prediction-check","all")}>Check due predictions</Button><Button variant="outline" disabled={!!busy || !readiness?.ready} onClick={()=>run("credibility","all")}>Recalculate credibility</Button></> : <><Button disabled={!!busy} onClick={()=>run("profile-quality")}>Review my profile</Button>{user?.approvedRoles.includes("startup") && <Button variant="outline" disabled={!!busy} onClick={()=>run("due-diligence")}>Analyze my startup</Button>}</>}</div>{admin && <div className="flex gap-2 flex-wrap"><select aria-label="Choose a user to review" value={targetUser} onChange={e=>setTargetUser(e.target.value)} className="rounded border px-3 py-2 bg-background text-sm flex-1 min-w-48"><option value="">Choose a user to review</option>{users.map(u=><option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}</select><Button disabled={!!busy || !targetUser.trim() || !readiness?.ready || !readiness.providers.length || !readiness.searchConfigured} onClick={()=>run("verification",targetUser.trim())}>Background check</Button><Button variant="outline" disabled={!!busy || !targetUser.trim() || !readiness?.ready} onClick={()=>run("profile-quality",targetUser.trim())}>Profile quality</Button><Button variant="outline" disabled={!!busy || !targetUser.trim() || !readiness?.ready} onClick={()=>run("due-diligence",targetUser.trim())}>Startup due diligence</Button></div>}<div className="flex flex-wrap gap-2">{admin && <><select aria-label="Research agent" value={research} onChange={e=>setResearch(e.target.value)} className="rounded border px-3 py-2 bg-background text-sm">{["Crypto Market Expert","FinTech Intelligence","HealthTech Advisor","CleanTech Analyst","AI/ML Investment Scout","SaaS Metrics Expert"].map((name,i)=><option key={i} value={String(i+1)}>{name}</option>)}</select><Button disabled={!!busy || !readiness?.ready} onClick={()=>run(`investor-${research}`)}>Run research</Button></>}</div><p className="text-xs text-muted-foreground">Predictions are evaluated only when due and when a valid baseline exists. Credibility needs five checked predictions per advisor.</p></Card>
    <section className="space-y-3"><div className="flex flex-wrap justify-between items-center gap-2"><h2 className="text-xl font-semibold">{filter==="all" ? "Recent runs" : `${filter[0].toUpperCase()+filter.slice(1)} runs`}</h2><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">Latest 100 runs · refreshes every 3 seconds</span>{filter!=="all" && <Button size="sm" variant="ghost" onClick={()=>setFilter("all")}>Show all</Button>}</div></div>{loading ? <Loader2 className="h-6 w-6 animate-spin"/> : !shown.length ? <Card className="p-8 text-center text-muted-foreground"><ShieldCheck className="h-8 w-8 mx-auto mb-3"/>No runs in this view. Start an agent to see its progress here.</Card> : shown.map(r=><div key={r.id}><AgentRunCard run={r} showOwner={admin} ownerName={users.find(u=>u.id===r.userId)?.fullName} onRetry={admin || !["verification","prediction-check","credibility","document"].includes(r.agentKey) ? (run:AgentRun)=>void startAgent(run.agentKey,run.targetId).then(refresh).catch(e=>toast.error(e.message)) : undefined}/>{r.status==="queued" && r.agentKey!=="document" && (admin || r.agentKey.startsWith("investor-") || ["profile-quality","due-diligence","signal-sentiment","signal-prediction"].includes(r.agentKey)) && <Button size="sm" variant="ghost" onClick={()=>void resumeAgent(r.id).then(refresh).catch(e=>toast.error(e.message))}>Resume queued run</Button>}</div>)}</section>
    {admin && <Card className="p-5"><div className="flex justify-between items-center mb-3"><h2 className="font-semibold">Existing records awaiting processing</h2><Button size="sm" variant="ghost" onClick={()=>void loadSetup()}>Reload list</Button></div>{!readiness?.ready ? <p className="text-sm text-muted-foreground">Complete the database setup to load pending records.</p> : tasks.length===0 ? <p className="text-sm text-muted-foreground">No unprocessed records found.</p> : <div className="max-h-80 overflow-auto divide-y">{tasks.map(t=><div key={`${t.agentKey}:${t.targetId}`} className="flex items-center gap-3 py-3"><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{t.label}</p><p className="text-xs text-muted-foreground">{agentName(t.agentKey)}</p></div><Button size="sm" variant="outline" disabled={!!busy || runs.some(r=>r.agentKey===t.agentKey && r.targetId===t.targetId && ["queued","running"].includes(r.status))} onClick={()=>run(t.agentKey,t.targetId)}>Run</Button></div>)}</div>}</Card>}

  </div></div>;
}
