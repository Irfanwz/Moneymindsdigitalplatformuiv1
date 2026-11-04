import { Badge } from "@/app/components/ui/badge";
import type { AgentRun, AgentTokenUsage as Usage } from "@/app/lib/agents";

const number = (value: number | null) =>
  value == null ? "Unavailable" : value.toLocaleString();
const triggerLabels = {
  initial: "Initial request",
  retry: "Rate-limit retry",
  fallback: "Provider fallback",
};

export function AgentTokenUsage({
  usage,
  runStatus,
}: {
  usage?: Usage | null;
  runStatus: AgentRun["status"];
}) {
  const active = ["queued", "running"].includes(runStatus);
  if (!usage)
    return (
      <p className="text-xs text-muted-foreground mt-3">
        Token usage:{" "}
        {active
          ? "waiting for a tracked AI request."
          : "not recorded for this run. New runs record provider usage."}
      </p>
    );
  if (usage.status === "not_used")
    return (
      <p className="text-xs text-muted-foreground mt-3">
        Token usage: 0 —{" "}
        {active
          ? "no AI request has started yet."
          : "this run made no AI model requests."}
      </p>
    );
  const partial = usage.status !== "complete";
  return (
    <section
      className="mt-4 rounded-lg border p-3 sm:p-4 space-y-3"
      aria-label="AI token usage"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-medium">AI token usage</h4>
        <Badge variant="outline">
          {usage.status === "complete"
            ? "Provider reported"
            : usage.status === "partial"
              ? "Partial usage"
              : "Usage unavailable"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {usage.requestCount} AI request{usage.requestCount === 1 ? "" : "s"}
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        {[
          ["Input", usage.inputTokens],
          ["Output", usage.outputTokens],
          [partial ? "Known total" : "Total", usage.totalTokens],
        ].map(([label, value]) => (
          <div key={String(label)} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-semibold break-words" data-token-metric={label}>
              {number(value as number | null)}
            </dd>
          </div>
        ))}
      </dl>
      {partial && (
        <p className="text-xs text-muted-foreground">
          {usage.unreportedRequests} request
          {usage.unreportedRequests === 1 ? " has" : "s have"} incomplete usage.
          These counts cover reported tokens only; missing usage is not counted
          as zero.
          {usage.pendingRequests > 0 &&
            ` ${usage.pendingRequests} request(s) ${active ? "are still waiting for a response" : "were interrupted before a response was recorded"}.`}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">
          Why were these tokens used?
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Input tokens cover instructions and supplied profile, document or
            source text (and images where applicable). Output tokens cover the
            model response, including internal reasoning when reported. Every
            batch, retry or provider fallback is listed separately; repeated
            context can increase input usage.
          </p>
          <p className="text-xs text-muted-foreground">
            PDF text extraction, database work and web search do not themselves
            use these AI model tokens. Retrieved text uses input tokens when
            sent to the model. Search billing is separate. These counts are not
            a cost estimate.
          </p>
          {(usage.cachedInputTokens !== null ||
            usage.cacheWriteTokens !== null ||
            usage.reasoningTokens !== null) && (
            <p className="text-xs text-muted-foreground">
              Reported breakdown: cached input {number(usage.cachedInputTokens)}
              , cache writes {number(usage.cacheWriteTokens)}, reasoning{" "}
              {number(usage.reasoningTokens)}. These are already included in the
              input/output totals, not added again.
            </p>
          )}
          <ol className="space-y-3">
            {usage.calls.map((call, index) => (
              <li
                key={call.id}
                className="rounded border p-3 space-y-2 min-w-0"
              >
                <p className="font-medium break-words">
                  {index + 1}. {call.purpose}
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  {call.provider} · {call.model} · {triggerLabels[call.trigger]}
                </p>
                {(call.details.fieldCount !== undefined ||
                  call.details.sourceCount !== undefined ||
                  call.details.documentCount !== undefined) && (
                  <p className="text-xs text-muted-foreground">
                    {[
                      call.details.fieldCount !== undefined &&
                        `${call.details.fieldCount} fields`,
                      call.details.sourceCount !== undefined &&
                        `${call.details.sourceCount} evidence sources`,
                      call.details.documentCount !== undefined &&
                        `${call.details.documentCount} documents`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="text-xs">
                  Input: {number(call.inputTokens)} · Output:{" "}
                  {number(call.outputTokens)} · Total:{" "}
                  {number(call.totalTokens)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {call.status === "response_received"
                    ? "Response received. Tokens count even if its contents were unusable."
                    : call.status === "running"
                      ? active
                        ? "Awaiting provider response."
                        : "Interrupted before usage was recorded."
                      : "Request failed; the provider did not return usage."}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </section>
  );
}
