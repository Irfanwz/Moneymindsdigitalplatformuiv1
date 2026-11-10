import type { AgentRun } from "@/app/lib/agents";
import { agentName } from "@/app/lib/agents";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const keys=["verification","due-diligence","document","signal-sentiment","signal-prediction","prediction-check","credibility","profile-quality",...Array.from({length:6},(_,index)=>`investor-${index+1}`)];
export function AgentHealthPanel({runs,onInspect}:{runs:AgentRun[];onInspect:(key:string)=>void}) {
  return <Card className="p-5 space-y-4">
    <h2 className="font-semibold">Agent check results</h2>
    <p className="text-sm text-muted-foreground">Based on the latest 100 runs. A completed workflow needs a result review before you rely on it. No recent run means there is no evidence in this view; skipped work is not a passed test.</p>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b text-left"><th className="py-3 pr-3">Agent</th><th className="pr-3">Latest run</th><th className="pr-3">Evidence</th><th>Review</th></tr></thead>
      <tbody>{keys.map(key=>{
        const latest=runs.filter(run=>run.agentKey===key).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
        const received=latest?.usage?.calls?.filter(call=>call.status==="response_received") || [];
        return <tr key={key} className="border-b align-top">
          <td className="py-3 pr-3 font-medium">{agentName(key)}</td>
          <td className="py-3 pr-3"><span className={latest?.status==="failed" ? "text-destructive" : ""}>{!latest ? "No recent run" : latest.status==="completed" ? "Completed — review result" : latest.status==="skipped" ? "Skipped — not tested" : latest.status}</span>
            {latest && <div className="mt-1 text-xs text-muted-foreground">{new Date(latest.completedAt || latest.createdAt).toLocaleString()}</div>}
          </td>
          <td className="py-3 pr-3 max-w-xs break-words">{latest?.error || (!latest ? "Run with a suitable test record." : received.length ? `${received.length} provider response(s): ${[...new Set(received.map(call=>call.provider))].join(", ")}. Inspect output and sources.` : key==="credibility" ? "Rule-based calculation. Inspect checked prediction count and score." : "No provider response recorded. Inspect the saved outcome.")}</td>
          <td className="py-3"><Button size="sm" variant="outline" disabled={!latest} onClick={()=>onInspect(key)}>Show runs</Button></td>
        </tr>;
      })}</tbody>
    </table></div>
    <p className="text-sm text-muted-foreground">Content moderation currently uses manual review controls; no automatic AI moderation agent is implemented.</p>
    <p className="text-xs text-muted-foreground">For a meaningful check: verify a known public profile, compare a document with its claim, analyze an advisor signal, evaluate an eligible due prediction, and recalculate credibility after five checked predictions. Inspect source links, extracted fields, prices and token usage in each result.</p>
  </Card>;
}
