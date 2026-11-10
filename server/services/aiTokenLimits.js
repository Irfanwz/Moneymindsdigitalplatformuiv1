import { getAiConfig } from "./aiConfigStore.js";

const finite = value => Number.isSafeInteger(value) && value >= 0;
const exceeded = label => Object.assign(new Error(`${label} token limit reached. A super admin can increase the limit or select No limit in AI settings.`),{code:"AI_TOKEN_LIMIT",status:429});

// These are usage thresholds, not provider billing caps. Requests already in
// flight can exceed a threshold because final token counts arrive afterwards.
export async function assertTokenBudget(state) {
  const settings = await getAiConfig();
  const daily = settings.dailyTokenLimit, monthly = settings.monthlyTokenLimit;
  const agentLimits = settings.agentTokenLimits || {};
  if (!finite(daily) && !finite(monthly) && !Object.values(agentLimits).some(finite)) return;
  if (!state?.store || !state.agentKey) throw Object.assign(new Error("Token limits are enabled. Start this action from Agent Activity so its usage can be tracked."),{code:"AI_TOKEN_LIMIT",status:429});
  const perRun = agentLimits[state.agentKey];
  if (finite(perRun)) {
    const used = state.calls.reduce((sum,call)=>sum+(finite(call.totalTokens) ? call.totalTokens : 0),0);
    if (used >= perRun) throw exceeded("This agent's per-run");
  }
  if (!finite(daily) && !finite(monthly)) return;
  const now = new Date();
  const day = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())).toISOString();
  const month = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)).toISOString();
  let dailyUsed = 0, monthlyUsed = 0;
  // Include failed, skipped and running work: they can consume billable tokens.
  for (let offset=0;;offset+=200) {
    let runs;
    try { runs = await state.store.listAgentRuns({limit:200,offset,oldestFirst:true,updatedSince:month}); }
    catch { throw Object.assign(new Error("Token usage could not be checked. Retry after agent storage is available."),{code:"AI_USAGE_SAVE_FAILED"}); }
    for (const run of runs) {
      const calls = run.usage?.calls?.length ? run.usage.calls : [{totalTokens:run.usage?.totalTokens,startedAt:run.createdAt}];
      for (const call of calls) {
        if (!finite(call.totalTokens)) continue;
        const time = call.startedAt || run.createdAt;
        if (time >= month) monthlyUsed += call.totalTokens;
        if (time >= day) dailyUsed += call.totalTokens;
      }
    }
    if (runs.length < 200) break;
  }
  if (finite(daily) && dailyUsed >= daily) throw exceeded("Daily");
  if (finite(monthly) && monthlyUsed >= monthly) throw exceeded("Monthly");
}
