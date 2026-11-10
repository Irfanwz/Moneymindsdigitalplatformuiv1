import { Badge } from "@/app/components/ui/badge";
import type { ProfileLinkCheck } from "@/app/types/profile-links";

const accessLabels: Record<string,string> = {
  read:"Public page read", login_required:"Login or private access required",
  blocked:"Access blocked", not_found:"Page unavailable", unavailable:"Could not retrieve page",
  invalid_url:"Invalid public URL", not_configured:"Page reader not configured",
  different_url:"Different URL returned", insufficient_content:"Insufficient page content", not_checked:"Not checked",
};
const comparisonLabels: Record<string,string> = {
  supported:"Details supported by page", inconsistent:"Details differ", inconclusive:"Comparison inconclusive",
  insufficient_evidence:"Insufficient evidence", manual_review:"Manual review required",
};

export function ProfileLinkChecks({links}:{links?:ProfileLinkCheck[]}) {
  if (!links?.length) return null;
  return <section className="space-y-3" aria-label="Supplied profile link checks">
    <h4 className="font-semibold">Supplied profile links</h4>
    <p className="text-sm text-muted-foreground">Access and comparisons for the exact links provided. Reading a page does not confirm who owns it.</p>
    {links.map(link => <article key={link.id} className="rounded-lg border p-4 space-y-2 min-w-0">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{accessLabels[link.accessStatus] || "Not checked"}</Badge>
        {link.accessStatus === "read" && <Badge variant={link.comparisonStatus === "inconsistent" ? "destructive" : "outline"}>{comparisonLabels[link.comparisonStatus] || "Comparison inconclusive"}</Badge>}
      </div>
      {link.url && /^https?:\/\//i.test(link.url) ? <a href={link.url} target="_blank" rel="noopener noreferrer" className="block underline break-all text-accent">{link.providedUrl}</a> : <p className="break-all">{link.providedUrl}</p>}
      {link.resolvedUrl && link.resolvedUrl !== link.url && <p className="text-sm break-all">Returned URL: {link.resolvedUrl}</p>}
      <p className="text-xs text-muted-foreground">{link.origins.join(" / ")}{link.checkedAt && ` · Checked ${new Date(link.checkedAt).toLocaleString()}`}</p>
      <p className="text-sm">{link.summary || link.reason}</p>
      {link.truncated && <p className="text-xs text-muted-foreground">Only the first 16,000 extracted characters were reviewed.</p>}
      {!!link.comparisons.length && <details className="text-sm">
        <summary className="cursor-pointer font-medium">Details found and compared ({link.comparisons.length})</summary>
        <div className="mt-3 space-y-4">{link.comparisons.map((comparison,index) => <div key={`${comparison.fieldId}:${index}`} className="space-y-1 border-t pt-3">
          <p className="font-medium">{comparison.label}: {comparisonLabels[comparison.status] || "Needs review"}</p>
          <p className="break-words">Claimed: {typeof comparison.claimed === "object" ? JSON.stringify(comparison.claimed) : String(comparison.claimed ?? "")}</p>
          <p>{comparison.reasoning}</p>
          {comparison.quotes.map((quote,i) => <blockquote key={i} className="border-l-2 pl-3 whitespace-pre-wrap break-words">“{quote}”</blockquote>)}
        </div>)}</div>
      </details>}
    </article>)}
  </section>;
}
