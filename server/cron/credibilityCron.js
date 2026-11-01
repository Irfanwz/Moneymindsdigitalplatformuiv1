import cron from "node-cron";
import { queueAgent } from "../services/agentService.js";

export function startCredibilityCron(store) {
  const run=async()=>{
    try {
      const users=await store.listUsers({includeAdmins:true});
      const admin=users.find(u=>u.isAdmin);
      if(admin) await queueAgent(store,{userId:admin.id,agentKey:"credibility",targetId:"all"});
    } catch(error) {console.error("[Agent schedule]",error.message);}
  };
  void run();
  return cron.schedule("30 9 * * *",run,{timezone:process.env.AGENT_TIMEZONE || "Asia/Karachi"});
}
