import { waitUntil } from "@vercel/functions";
import { createUsageTracker } from "./aiUsage.js";

export class AgentSkipped extends Error {}

export async function executeTrackedRun(store, run, work) {
  const events=[...(run.events || []),{stage:"Starting",at:new Date().toISOString()}];
  const claimed = await store.updateAgentRun(run.id,{status:"running",startedAt:new Date().toISOString(),stage:"Starting",progress:5,events},"queued");
  if (!claimed) return store.getAgentRun(run.id);
  const usage=createUsageTracker(async snapshot=>{
    const saved=await store.updateAgentRun(run.id,{usage:snapshot},"running");
    if(!saved) throw new Error("Run is no longer active.");
  });
  const progress = (stage,value) => {
    events.push({stage,at:new Date().toISOString()});
    return store.updateAgentRun(run.id,{stage,progress:value,events:[...events]},"running");
  };
  try {
    const result = await usage.run(()=>work(progress));
    await usage.settle();
    return await store.updateAgentRun(run.id,{status:"completed",stage:"Complete",progress:100,events:[...events,{stage:"Result saved",at:new Date().toISOString()}],result:result ?? {},usage:usage.snapshot(),completedAt:new Date().toISOString()},"running");
  } catch(error) {
    await usage.settle().catch(()=>{});
    const skipped = error instanceof AgentSkipped;
    return store.updateAgentRun(run.id,{status:skipped ? "skipped" : "failed",stage:skipped ? "No eligible work" : "Needs attention",error:safeAgentError(error),events:[...events,{stage:skipped ? "No eligible work" : "Failed",at:new Date().toISOString()}],usage:usage.snapshot(),completedAt:new Date().toISOString()},"running");
  }
}

export function safeAgentError(error) {
  // Provider errors can include request headers or URLs. Never send those to users.
  if (error?.status===401 || error?.status===403) return "The AI provider rejected the configured credentials. An administrator needs to check the provider key.";
  if (error?.status===429) return "The AI provider rate limit was reached. Please retry shortly.";
  return String(error?.message || "The agent could not finish. Please retry.").replace(/(?:sk-|gsk_|tvly-)[\w-]+/g,"[redacted]").slice(0,500);
}

export function keepAlive(promise) {
  const observed = promise.catch(error=>console.error("[Agent]",safeAgentError(error)));
  if (process.env.VERCEL) waitUntil(observed);
  return observed;
}

export async function expireStaleRuns(store) {
  const runs=await store.listAgentRuns({status:"running",limit:200});
  for(const run of runs) {
    if(Date.now()-Date.parse(run.updatedAt)>10*60*1000) {
      const error="This run was interrupted before it finished. Please retry.";
      if(run.agentKey==="document") await store.updateProfileVerification(run.targetId,{status:"manual_review",aiConfidence:null,aiReasoning:"Processing was interrupted. Please upload the document again, or ask an administrator to review it."});
      if(run.agentKey==="verification") await store.updateVerification(run.targetId,{status:"failed",summary:error});
      await store.updateAgentRun(run.id,{status:"failed",stage:"Interrupted",error,completedAt:new Date().toISOString()},"running");
    }
  }
}
