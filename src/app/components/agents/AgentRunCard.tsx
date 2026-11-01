import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, ChevronDown, ExternalLink } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { agentName, type AgentRun } from "@/app/lib/agents";

export function AgentResult({result}:{result:Record<string,any>}) {
  const summary=result.summary || result.executiveSummary || result.aiReasoning;
  return <div className="space-y-4 text-sm">
    {summary && <p className="leading-relaxed whitespace-pre-wrap">{summary}</p>}
    {result.recommendation && <Badge variant="outline">Recommendation: {result.recommendation}</Badge>}
    {result.sentiment && <Badge variant="outline">{result.sentiment}</Badge>}
    {result.sentimentReasoning && <p>{result.sentimentReasoning}</p>}
    {["strengths","gaps","suggestions","keyPoints","opportunities","risks"].map(key=>Array.isArray(result[key]) && result[key].length>0 && <div key={key}><h4 className="font-medium capitalize mb-2">{key==="keyPoints" ? "Key points" : key}</h4><ul className="space-y-2 list-disc pl-5">{result[key].map((item:any,i:number)=><li key={i}>{typeof item==="string" ? item : <><strong>{item.title}</strong> {item.description}</>}</li>)}</ul></div>)}
    {Array.isArray(result.signals) && result.signals.length>0 && <div><h4 className="font-medium mb-2">Research signals</h4><div className="space-y-2">{result.signals.map((s:any,i:number)=><div key={i} className="rounded border p-3"><div className="flex flex-wrap gap-2 items-center"><strong>{s.asset}</strong><Badge variant="outline">{s.action}</Badge><span className="text-xs text-muted-foreground">Model confidence: {s.confidence}%</span></div><p className="mt-2">{s.reason}</p></div>)}</div></div>}
    {result.riskLevel && <p>Risk assessment: {result.riskLevel} {result.riskReasoning && `- ${result.riskReasoning}`}</p>}
    {result.ticker && <p>Asset: {result.ticker}{result.checkDate && ` | Evaluation due: ${new Date(result.checkDate).toLocaleString()}`}</p>}
    {result.status && <p>Review outcome: {result.status}</p>}
    {result.reportMarkdown && <details><summary className="cursor-pointer font-medium">Full verification report</summary><p className="whitespace-pre-wrap mt-3 leading-relaxed">{result.reportMarkdown}</p></details>}
    {Array.isArray(result.sources) && result.sources.length>0 && <div><h4 className="font-medium mb-2">Sources used</h4><div className="space-y-2">{result.sources.filter((s:any)=>/^https?:\/\//i.test(s.url || "")).map((s:any,i:number)=><a className="flex gap-2 text-blue-600 dark:text-blue-400 underline break-all" key={i} href={s.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 shrink-0"/>{s.title || s.url}</a>)}</div></div>}
    {result.provider && <p className="text-xs text-muted-foreground">Generated with {result.provider}. Review the source evidence before making decisions.</p>}
  </div>;
}

export function AgentRunCard({run,onRetry,showOwner=false,ownerName}:{run:AgentRun;onRetry?:(run:AgentRun)=>void;showOwner?:boolean;ownerName?:string}) {
  const [expanded,setExpanded]=useState(false);
  const active=["queued","running"].includes(run.status);
  const Icon=active ? Loader2 : run.status==="completed" ? CheckCircle2 : run.status==="failed" ? AlertCircle : Clock;
  return <Card className="p-4 sm:p-5 gap-2">
    <div className="flex flex-wrap items-center gap-3">
      <Icon className={`h-5 w-5 shrink-0 ${active ? "animate-spin text-blue-500" : run.status==="completed" ? "text-emerald-600" : "text-amber-600"}`}/>
      <div className="flex-1 min-w-0"><h3 className="font-medium">{agentName(run.agentKey)}</h3><p className="text-sm text-muted-foreground" aria-live="polite">{run.stage}</p></div>
      <Badge variant="outline" className="capitalize">{run.status}</Badge>
      {run.result && <Button variant="ghost" size="sm" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>Result <ChevronDown className="ml-1 h-4 w-4"/></Button>}
    </div>
    {active && <div className="mt-4"><Progress value={run.progress}/><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Queued → Processing → Saved result</span><span>{run.progress}%</span></div></div>}
    {!!run.events?.length && <details className="mt-3 text-sm" open={active}><summary className="cursor-pointer text-muted-foreground">Execution steps</summary><ol className="border-l ml-2 mt-3 space-y-2 pl-4">{run.events.map((event,i)=><li key={i}><span>{event.stage}</span><time className="ml-3 text-xs text-muted-foreground">{new Date(event.at).toLocaleTimeString()}</time></li>)}</ol></details>}
    {run.error && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">{run.error}</p>}
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>Created {new Date(run.createdAt).toLocaleString()}</span>{run.startedAt && <span>Started {new Date(run.startedAt).toLocaleTimeString()}</span>}{run.completedAt && <span>Finished {new Date(run.completedAt).toLocaleTimeString()}</span>}</div>
    {showOwner && <p className="text-xs text-muted-foreground mt-2 break-all">User: {ownerName || run.userId} · Target: {run.targetId}</p>}
    {onRetry && !active && run.agentKey!=="document" && <Button variant="outline" size="sm" className="mt-3" onClick={()=>onRetry(run)}>{run.status==="failed" ? "Retry" : "Run again"}</Button>}
    {expanded && run.result && <div className="mt-4 pt-4 border-t"><AgentResult result={run.result}/></div>}
  </Card>;
}
