import { randomUUID } from "node:crypto";

export const agentSchema = {
  ai_verifications: "id,user_id,status,recommendation,confidence,credibility_score,summary,findings,report_markdown,sources,red_flags,search_queries_run,created_at,completed_at",
  profile_verifications: "id,user_id,doc_type,doc_url,claim_to_verify,status,ai_confidence,ai_reasoning,ai_extracted,reviewed_by,reviewed_at,admin_note,created_at,updated_at",
  advisor_signals: "id,advisor_id,group_id,sentiment,sentiment_confidence,sentiment_reasoning,risk_level,risk_reasoning,actionability,actionability_reasoning,entities,sectors,key_points,analyzed_at,prediction_ticker,prediction_direction,prediction_target_price,prediction_timeframe,prediction_timeframe_days,prediction_check_date,baseline_price,baseline_fetched_at,actual_price,prediction_accuracy,prediction_result,prediction_checked_at,prediction_explanation",
  advisor_profiles: "user_id,is_verified,verified_at,verification_id,credibility_score,credibility_tier,credibility_updated_at",
  startup_profiles: "user_id,is_verified,verified_at,verification_id",
  investor_profiles: "user_id,is_verified,verified_at,verification_id",
  credibility_scores_history: "id,advisor_id,score,tier,total_predictions,breakdown,recorded_at",
  agent_runs: "id,user_id,agent_key,target_id,status,stage,progress,result,error,events,usage,created_at,started_at,completed_at,updated_at",
  agent_follows: "user_id,agent_key,created_at",
};
const camel = row => row && Object.fromEntries(Object.entries(row).map(([k,v]) => [k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),v]));
const snake = row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k.replace(/[A-Z]/g,c=>`_${c.toLowerCase()}`),v]));
function databaseError(error) {
  const missing = ["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code);
  const result = new Error(missing ? "Agent database setup is incomplete. Ask an administrator to apply the pending database migrations." : "Agent data could not be saved or loaded. Please try again.");
  result.code = missing ? "AGENT_SCHEMA_MISSING" : "AGENT_STORAGE_ERROR";
  result.status = 503;
  return result;
}

// Both stores expose the same contract; production never silently falls back to memory.
export function createAgentStore(client = null) {
  const rows = new Map();
  const follows = new Map();
  async function unwrap(query, single = false) {
    const {data,error} = await query;
    if (error) throw databaseError(error);
    return single ? camel(data) : (data || []).map(camel);
  }
  return {
    async checkAgentSchema() {
      if (!client) return Object.keys(agentSchema).map(table=>({table,ok:true}));
      return Promise.all(Object.entries(agentSchema).map(async ([table,columns])=> {
        const {error} = await client.from(table).select(columns).limit(0);
        return {table,ok:!error,...(error ? {code:error.code,message:error.message} : {})};
      }));
    },
    async createAgentRun({userId,agentKey,targetId = "self"}) {
      const existing = client
        ? await unwrap(client.from("agent_runs").select("*").eq("user_id",userId).eq("agent_key",agentKey).eq("target_id",targetId).in("status",["queued","running"]).maybeSingle(),true)
        : [...rows.values()].find(r=>r.userId===userId && r.agentKey===agentKey && r.targetId===targetId && ["queued","running"].includes(r.status));
      if (existing) return {...existing};
      const now = new Date().toISOString();
      const run = {id:randomUUID(),userId,agentKey,targetId,status:"queued",stage:"Waiting to start",progress:0,events:[{stage:"Queued",at:now}],result:null,usage:null,error:null,createdAt:now,startedAt:null,completedAt:null,updatedAt:now};
      if (!client) {rows.set(run.id,run); return structuredClone(run);}
      const {data,error} = await client.from("agent_runs").insert(snake(run)).select("*").single();
      if (error?.code === "23505") return unwrap(client.from("agent_runs").select("*").eq("user_id",userId).eq("agent_key",agentKey).eq("target_id",targetId).in("status",["queued","running"]).single(),true);
      if (error) throw databaseError(error);
      return camel(data);
    },
    async getAgentRun(id) {
      return client ? unwrap(client.from("agent_runs").select("*").eq("id",id).maybeSingle(),true) : structuredClone(rows.get(id) || null);
    },
    async listAgentRuns({userId,agentKey,targetId,limit=50,status,offset=0,oldestFirst=false} = {}) {
      if (client) {
        let q = client.from("agent_runs").select("*").order("created_at",{ascending:oldestFirst}).order("id",{ascending:oldestFirst}).range(offset,offset+Math.min(limit,200)-1);
        if(userId) q=q.eq("user_id",userId);
        if(agentKey) q=q.eq("agent_key",agentKey);
        if(targetId) q=q.eq("target_id",targetId);
        if(status) q=q.eq("status",status);
        return unwrap(q);
      }
      return structuredClone([...rows.values()].filter(r=>(!userId || r.userId===userId)&&(!agentKey || r.agentKey===agentKey)&&(!targetId || r.targetId===targetId)&&(!status || r.status===status)).sort((a,b)=>(oldestFirst ? 1 : -1)*(a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))).slice(offset,offset+limit));
    },
    async updateAgentRun(id,patch,expectedStatus) {
      const changes={...patch,updatedAt:new Date().toISOString()};
      if(client) {
        let q=client.from("agent_runs").update(snake(changes)).eq("id",id);
        if(expectedStatus) q=q.eq("status",expectedStatus);
        return unwrap(q.select("*").maybeSingle(),true);
      }
      const row=rows.get(id);
      if(!row || (expectedStatus && row.status!==expectedStatus)) return null;
      Object.assign(row,changes);
      return structuredClone(row);
    },
    async listAgentFollows(userId) {
      if(client) return (await unwrap(client.from("agent_follows").select("*").eq("user_id",userId))).map(r=>r.agentKey);
      return [...(follows.get(userId) || [])];
    },
    async setAgentFollow(userId,agentKey,enabled) {
      if(client) {
        const {error}=await (enabled ? client.from("agent_follows").upsert({user_id:userId,agent_key:agentKey},{onConflict:"user_id,agent_key"}) : client.from("agent_follows").delete().eq("user_id",userId).eq("agent_key",agentKey));
        if(error) throw databaseError(error);
      } else {
        const set=follows.get(userId) || new Set();
        enabled ? set.add(agentKey) : set.delete(agentKey);
        follows.set(userId,set);
      }
    },
  };
}
