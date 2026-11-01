import { useCallback, useEffect, useState, useRef } from "react";
import { request } from "./api";

export type AgentRun = {
  id:string; userId:string; agentKey:string; targetId:string;
  status:"queued"|"running"|"completed"|"failed"|"skipped";
  stage:string; progress:number; error:string|null; events?:{stage:string;at:string}[];
  result:Record<string, any>|null;
  createdAt:string; startedAt:string|null; completedAt:string|null;
};
export type ResearchAgent = {id:string;name:string;industry:string;description:string};
export type AgentCatalog = {agents:ResearchAgent[];follows:string[];operationalAgents:{key:string;name:string;description:string}[]};
export type AgentReadiness = {storage:string;ready:boolean;providers:string[];searchConfigured:boolean;stockPricesConfigured:boolean;documentImagesConfigured:boolean;schema:{table:string;ok:boolean;message?:string}[]};
export const getAgentCatalog=()=>request<AgentCatalog>("/api/agents/catalog");
export const startAgent=(agentKey:string,targetId="self")=>request<{run:AgentRun}>("/api/agents/runs",{method:"POST",body:JSON.stringify({agentKey,targetId})});
export const resumeAgent=(id:string)=>request<{run:AgentRun}>(`/api/agents/runs/${id}/execute`,{method:"POST"});
export const followAgent=(id:string,enabled:boolean)=>request<{follows:string[]}>(`/api/agents/follows/${id}`,{method:"PUT",body:JSON.stringify({enabled})});
export const getAgentReadiness=()=>request<AgentReadiness>("/api/agents/readiness");
export const getAgentBacklog=()=>request<{tasks:{agentKey:string;targetId:string;label:string}[]}>("/api/agents/backlog");
export type VerificationOverview = {
  mode:"missing"|"all";workerMode:"persistent"|"request";
  counts:{total:number;eligible:number;queued:number;running:number;complete:number;failed:number;skipped:number;not_started:number};
  users:{userId:string;name:string;accountStatus:string;status:string;recommendation:string|null;completedAt:string|null;eligible:boolean}[];
};
export const getVerificationOverview=(mode:"missing"|"all",signal?:AbortSignal)=>request<VerificationOverview>(`/api/agents/verification-batch?mode=${mode}`,{signal});
export const queueAllBackgroundChecks=(mode:"missing"|"all")=>request<{queued:number;total:number;message:string}>("/api/agents/verification-batch",{method:"POST",body:JSON.stringify({mode})});
export const processBackgroundQueue=()=>request<{message:string}>("/api/agents/verification-batch/process",{method:"POST"});
export function useAgentRuns(agentKey?:string,targetId?:string) {
  const [runs,setRuns]=useState<AgentRun[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const pending=useRef<AbortController|null>(null);
  const query=new URLSearchParams({...agentKey && {agentKey},...targetId && {targetId}}).toString();
  const refresh=useCallback(async()=>{
    pending.current?.abort();
    const controller=new AbortController();
    pending.current=controller;
    try {
      const data=await request<{runs:AgentRun[]}>(`/api/agents/runs?${query}`,{signal:controller.signal});
      if(controller.signal.aborted) return;
      setRuns(data.runs); setError("");
    }catch(e){if(!controller.signal.aborted) setError(e instanceof Error ? e.message : "Activity could not be loaded.");}
    finally{if(!controller.signal.aborted) setLoading(false);}
  },[query]);
  useEffect(()=>{
    let active=true;
    let timer:ReturnType<typeof setTimeout>;
    const poll=async()=>{
      if(!active) return;
      await refresh();
      if(active) timer=setTimeout(poll,3000);
    };
    setLoading(true);setRuns([]);void poll();
    return()=>{active=false;clearTimeout(timer);pending.current?.abort();};
  },[refresh]);
  return {runs,error,loading,refresh};
}
export function agentName(key:string) {
  return ({verification:"Background verification","signal-sentiment":"Signal sentiment","signal-prediction":"Prediction extraction","prediction-check":"Prediction checker",credibility:"Credibility scoring",document:"Document verification","due-diligence":"Startup due diligence","profile-quality":"Profile quality","investor-1":"Crypto Market Expert","investor-2":"FinTech Intelligence","investor-3":"HealthTech Advisor","investor-4":"CleanTech Analyst","investor-5":"AI/ML Investment Scout","investor-6":"SaaS Metrics Expert"} as Record<string,string>)[key] || key;
}
