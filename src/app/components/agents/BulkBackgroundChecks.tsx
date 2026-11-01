import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { getUserVerification, type AIVerification } from "@/app/lib/api";
import { getVerificationOverview, queueAllBackgroundChecks, processBackgroundQueue, type VerificationOverview } from "@/app/lib/agents";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { AIVerificationReport } from "@/app/components/admin/AIVerificationReport";

export function BulkBackgroundChecks({ready,onQueued}:{ready:boolean;onQueued:()=>void}) {
  const [mode,setMode]=useState<"missing"|"all">("missing");
  const [overview,setOverview]=useState<VerificationOverview|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [reload,setReload]=useState(0);
  const [report,setReport]=useState<{name:string;data:AIVerification}|null>(null);
  const [loadingReport,setLoadingReport]=useState("");

  useEffect(()=>{
    let active=true;
    let timer:ReturnType<typeof setTimeout>;
    const controller=new AbortController();
    setOverview(null);
    async function poll() {
      try {
        const data=await getVerificationOverview(mode,controller.signal);
        if(!active) return;
        setOverview(data);setError("");
        // Keeps saved work moving on serverless hosting; the persistent server
        // also has its own worker and does not depend on this page staying open.
        if(ready && data.counts.queued>0 && data.counts.running===0) await processBackgroundQueue();
      } catch(e) {
        if(active) setError(e instanceof Error ? e.message : "Could not load background checks.");
      } finally {
        if(active) timer=setTimeout(poll,5000);
      }
    }
    void poll();
    return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[mode,ready,reload]);

  async function start() {
    setBusy(true);
    try {
      const result=await queueAllBackgroundChecks(mode);
      toast.success(result.message);
      onQueued();
    } catch(e) {toast.error(e instanceof Error ? e.message : "Could not queue the checks.");}
    finally {setBusy(false);setReload(v=>v+1);}
  }
  async function viewReport(userId:string,name:string) {
    setLoadingReport(userId);
    try {setReport({name,data:(await getUserVerification("",userId)).verification});}
    catch(e){toast.error(e instanceof Error ? e.message : "Could not load the report.");}
    finally {setLoadingReport("");}
  }
  const counts=overview?.counts;
  const active=!!counts && counts.queued+counts.running>0;
  return <Card className="p-5 gap-4">
    <div><h2 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5"/>Background checks for all users</h2>
      <p className="text-sm text-muted-foreground mt-1">Pending, approved and rejected registered accounts are included. Admin accounts are excluded. Each user gets a separate report; account approval stays under admin control.</p></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2 text-sm" aria-live="polite">
      <Badge variant="outline">Users: {counts?.total ?? "—"}</Badge>
      <Badge variant="outline">Queued: {counts?.queued ?? "—"}</Badge>
      <Badge variant="outline">Running: {counts?.running ?? "—"}</Badge>
      <Badge variant="outline">Reports completed: {counts?.complete ?? "—"}</Badge>
      <Badge variant="outline">Failed / skipped: {counts ? counts.failed+counts.skipped : "—"}</Badge>
      <Badge variant="outline">Not started: {counts?.not_started ?? "—"}</Badge>
    </div>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={mode==="all"} disabled={busy || active} onChange={e=>setMode(e.target.checked ? "all" : "missing")}/>Include users with completed reports (run fresh checks)</label>
    <div className="flex items-center gap-3 flex-wrap">
      <Button disabled={!ready || !!error || !counts?.eligible || busy || active} onClick={()=>void start()}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
        {busy ? "Saving queue…" : active ? "Checks in progress" : `Start ${counts?.eligible ?? 0} background checks`}
      </Button>
      <Button variant="ghost" size="sm" onClick={()=>setReload(v=>v+1)}>Refresh checks</Button>
    </div>
    {!ready && <p className="text-sm text-amber-700">Configure the database, an AI provider and web search before starting background checks.</p>}
    <p className="text-xs text-muted-foreground">Checks are queued and processed one at a time per server. Each check uses AI and web-search credits. {overview?.workerMode==="request" ? "Keep this page open to process the queue on serverless hosting; reopening resumes saved work. Hosting execution limits still apply." : "On the persistent server, saved checks continue when you close this page and resume after a restart."}</p>
    {overview && <details open><summary className="cursor-pointer text-sm font-medium">Users and results ({counts?.total})</summary>
      <div className="max-h-96 overflow-auto mt-3"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">User</th><th className="p-2">Account</th><th className="p-2">Background check</th><th className="p-2">Recommendation</th><th className="p-2">Report</th></tr></thead>
        <tbody>{overview.users.map(u=><tr key={u.userId} className="border-b"><td className="p-2">{u.name}</td><td className="p-2 capitalize">{u.accountStatus}</td><td className="p-2 capitalize">{u.status.replaceAll("_"," ")}</td><td className="p-2 capitalize">{u.status==="complete" ? u.recommendation || "—" : "—"}</td><td className="p-2"><Button size="sm" variant="ghost" disabled={u.status!=="complete" || !!loadingReport} onClick={()=>void viewReport(u.userId,u.name)}>{loadingReport===u.userId ? "Loading…" : "View report"}</Button></td></tr>)}</tbody></table></div>
    </details>}
    <Dialog open={!!report} onOpenChange={open=>{if(!open)setReport(null);}}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Background check — {report?.name}</DialogTitle><DialogDescription>Review source evidence and identity before deciding on the account.</DialogDescription></DialogHeader>{report && <AIVerificationReport verification={report.data} token="" onRetryComplete={()=>{setReport(null);setReload(v=>v+1);onQueued();}}/>}</DialogContent></Dialog>
  </Card>;
}
