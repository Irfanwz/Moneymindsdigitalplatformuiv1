import { config } from "../config.js";
import { configuredProviders } from "./aiProvider.js";
import { processVerificationQueue } from "./agentService.js";
import { keepAlive, safeAgentError } from "./agentRuntime.js";

async function activeRuns(store,status) {
  const rows=[];
  for(let offset=0;;offset+=200) {
    const page=await store.listAgentRuns({agentKey:"verification",status,offset,limit:200});
    rows.push(...page);
    if(page.length<200) return rows;
  }
}

export async function verificationOverview(store,mode="missing") {
  const [users,reports,queued,running]=await Promise.all([
    store.listUsers({}),store.listVerificationStatuses(),activeRuns(store,"queued"),activeRuns(store,"running"),
  ]);
  const reportMap=new Map(reports.map(r=>[r.userId,r]));
  const activeMap=new Map([...queued,...running].map(r=>[r.userId,r]));
  const rows=users.filter(u=>!u.isAdmin).map(u=>{
    const report=reportMap.get(u.id),run=activeMap.get(u.id);
    return {
      userId:u.id,name:u.fullName,accountStatus:u.status,
      status:run?.status || report?.status || "not_started",
      recommendation:report?.recommendation || null,
      completedAt:report?.completedAt || null,
      eligible:!run && (mode==="all" || report?.status!=="complete"),
    };
  });
  const counts={total:rows.length,eligible:rows.filter(r=>r.eligible).length};
  for(const status of ["queued","running","complete","failed","skipped","not_started"]) counts[status]=rows.filter(r=>r.status===status).length;
  return {mode,users:rows,counts,workerMode:process.env.VERCEL ? "request" : "persistent"};
}

export async function requireVerificationSetup(store) {
  if(!configuredProviders().length || !config.tavilyApiKey) throw Object.assign(new Error("Background checks need GROQ_API_KEY or ANTHROPIC_API_KEY, plus TAVILY_API_KEY, on the server."),{status:503});
  if(!(await store.checkAgentSchema()).every(s=>s.ok)) throw Object.assign(new Error("Agent database setup is incomplete. Open Agent Activity to inspect the missing tables or columns."),{status:503});
}

// Concurrent clicks in this process share one enqueue operation. The database's
// unique active-run index also protects each user from duplicate queued jobs.
const batches=new WeakMap();
export function queueVerificationBatch(store,mode="missing") {
  if(batches.has(store)) return batches.get(store);
  const task=(async()=>{
    await requireVerificationSetup(store);
    const preview=await verificationOverview(store,mode);
    if(preview.counts.queued || preview.counts.running) return {queued:0,total:preview.counts.total,partial:false,message:"Background checks are already queued or running. Wait for them to finish before starting another batch."};
    let queued=0;
    for(const user of preview.users.filter(u=>u.eligible)) {
      try {
        // A different worker may have completed the previous check since preview.
        if(mode==="missing" && (await store.findVerification(user.userId))?.status==="complete") continue;
        await store.createAgentRun({userId:user.userId,agentKey:"verification",targetId:user.userId});
        queued++;
      } catch(error) {
        if(queued) keepAlive(processVerificationQueue(store));
        return {queued,total:preview.counts.total,partial:true,message:`${queued} checks were saved before a storage error. Reload the list and retry the remaining users. ${safeAgentError(error)}`};
      }
    }
    keepAlive(processVerificationQueue(store));
    return {queued,total:preview.counts.total,partial:false,message:`${queued} user checks queued. Existing active checks are reused.`};
  })().finally(()=>batches.delete(store));
  batches.set(store,task);
  return task;
}
