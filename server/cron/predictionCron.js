import cron from "node-cron";
import { queueAgent } from "../services/agentService.js";

export function startPredictionCron(store) {
  let checking = false;
  const run=async()=>{
    if (checking) return;
    checking = true;
    try {
      if (!(await store.listSignalsDueForCheck()).length) return;
      const active = await store.listAgentRuns({agentKey:"prediction-check",targetId:"all",limit:200});
      if (active.some(run => ["queued", "running"].includes(run.status))) return;
      const users=await store.listUsers({includeAdmins:true});
      const admin=users.find(u=>u.isAdmin);
      if(admin) await queueAgent(store,{userId:admin.id,agentKey:"prediction-check",targetId:"all"});
    } catch(error) {console.error("[Agent schedule]",error.message);}
    finally { checking = false; }
  };
  void run();
  return cron.schedule("* * * * *",run,{timezone:process.env.AGENT_TIMEZONE || "Asia/Karachi"});
}
