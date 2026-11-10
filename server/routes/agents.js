import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createAuthenticate, requirePermission } from "../middleware/auth.js";
import { config, getGroqApiKeys, shouldSkipRateLimit } from "../config.js";
import { investorAgents, operationalAgents, queueAgent, performAgentWork, processVerificationQueue } from "../services/agentService.js";
import { configuredProviders } from "../services/aiProvider.js";
import { getAiConfig } from "../services/aiConfigStore.js";
import { executeTrackedRun, expireStaleRuns, keepAlive } from "../services/agentRuntime.js";
import { verificationOverview, queueVerificationBatch, requireVerificationSetup } from "../services/verificationBatch.js";
import { adminCan } from "../../shared/adminPermissions.js";

export function createAgentsRouter(store) {
  const router=Router();
  router.use(createAuthenticate(store));
  const requireAdmin = requirePermission('agents');
  router.use((req,res,next)=>req.currentUser.isAdmin ? requireAdmin(req,res,next) : next());
  const limiter=rateLimit({windowMs:60000,limit:12,skip:shouldSkipRateLimit,keyGenerator:req=>req.auth.userId,standardHeaders:true,legacyHeaders:false});
  const processingLimiter=rateLimit({windowMs:60000,limit:20,skip:shouldSkipRateLimit,keyGenerator:req=>req.auth.userId,standardHeaders:true,legacyHeaders:false});
  const approved=(req,res,next)=> req.currentUser.isAdmin || req.currentUser.status==="approved" ? next() : res.status(403).json({message:"An approved account is required."});
  router.get("/catalog",approved,async(req,res,next)=>{
    try {res.json({agents:investorAgents,follows:await store.listAgentFollows(req.auth.userId),operationalAgents});}catch(e){next(e);}
  });
  router.put("/follows/:id",approved,async(req,res,next)=>{
    try {
      if(!investorAgents.some(a=>a.id===req.params.id)) return res.status(404).json({message:"Agent not found."});
      if(typeof req.body.enabled!=="boolean") return res.status(400).json({message:"enabled must be true or false."});
      await store.setAgentFollow(req.auth.userId,req.params.id,req.body.enabled);
      res.json({follows:await store.listAgentFollows(req.auth.userId)});
    }catch(e){next(e);}
  });
  router.get("/runs",approved,async(req,res,next)=>{
    try {
      await expireStaleRuns(store);
      const runs=await store.listAgentRuns({userId:req.currentUser.isAdmin ? undefined : req.auth.userId,agentKey:typeof req.query.agentKey==="string" ? req.query.agentKey : undefined,targetId:typeof req.query.targetId==="string" ? req.query.targetId : undefined,limit:100});
      res.json({runs: req.currentUser.isAdmin && !adminCan(req.currentUser,"reviews") ? runs.filter(run=>run.agentKey!=="due-diligence") : runs});
    }catch(e){next(e);}
  });
  router.get("/readiness",requireAdmin,async(_req,res,next)=>{
    try {
      const schema=await store.checkAgentSchema();
      const settings=await getAiConfig();
      res.json({storage:store.mode,schema,ready:schema.every(s=>s.ok),providers:configuredProviders(settings),groqKeyCount:getGroqApiKeys(settings).length,searchConfigured:!!config.tavilyApiKey,stockPricesConfigured:!!config.alphaVantageKey || !!config.finnhubApiKey,documentImagesConfigured:configuredProviders(settings).length>0});
    }catch(e){next(e);}
  });
  router.get("/verification-batch",requireAdmin,async(req,res,next)=>{
    try {
      const mode=req.query.mode ?? "missing";
      if(!["missing","all"].includes(mode)) return res.status(400).json({message:"Choose missing or all checks."});
      res.json(await verificationOverview(store,mode));
    }catch(e){next(e);}
  });
  router.post("/verification-batch",requireAdmin,limiter,async(req,res,next)=>{
    try {
      const mode=req.body?.mode ?? "missing";
      if(!["missing","all"].includes(mode)) return res.status(400).json({message:"Choose missing or all checks."});
      const result=await queueVerificationBatch(store,mode);
      res.status(result.partial ? 503 : 202).json(result);
    }catch(e){next(e);}
  });
  router.post("/verification-batch/process",requireAdmin,processingLimiter,async(_req,res,next)=>{
    try {
      await requireVerificationSetup(store);
      keepAlive(processVerificationQueue(store));
      res.status(202).json({message:"Saved background checks are being processed."});
    }catch(e){next(e);}
  });
  router.post("/runs",approved,limiter,async(req,res,next)=>{
    try {
      const {agentKey}=req.body;
      let targetId=typeof req.body.targetId==="string" ? req.body.targetId : "self";
      let userId=req.auth.userId;
      if(typeof agentKey!=="string") return res.status(400).json({message:"An agent key is required."});
      if(/^investor-[1-6]$/.test(agentKey)) {
        if(!req.currentUser.isAdmin && !req.currentUser.approvedRoles.includes("investor")) return res.status(403).json({message:"Investor access is required."});
        targetId="self";
      } else if(["signal-sentiment","signal-prediction"].includes(agentKey)) {
        const signal=await store.findSignalById(targetId);
        if(!signal || (!req.currentUser.isAdmin && signal.advisorId!==userId)) return res.status(404).json({message:"Signal not found."});
        userId=signal.advisorId;
      } else if(agentKey==="verification") {
        if(!req.currentUser.isAdmin) return res.status(403).json({message:"Admin access is required."});
        const user=await store.findUserById(targetId);
        if(!user || user.isAdmin) return res.status(404).json({message:"Applicant not found."});
        userId=user.id;
      } else if(["prediction-check","credibility"].includes(agentKey)) {
        if(!req.currentUser.isAdmin) return res.status(403).json({message:"Admin access is required."});
        targetId="all";
      } else if(["due-diligence","profile-quality"].includes(agentKey)) {
        if(agentKey==="due-diligence" && req.currentUser.isAdmin && !adminCan(req.currentUser,"reviews")) return res.status(403).json({message:"Application review access is required."});
        if(targetId==="self") targetId=userId;
        if(!req.currentUser.isAdmin && targetId!==userId) return res.status(403).json({message:"You can analyze only your own profile."});
        const target=await store.findUserById(targetId);
        if(!target || (agentKey==="due-diligence" && target.isAdmin)) return res.status(404).json({message:"Profile not found."});
        userId=targetId;
      } else return res.status(400).json({message:"Unknown agent."});
      const run=await queueAgent(store,{userId,agentKey,targetId});
      res.status(202).json({run});
    }catch(e){next(e);}
  });
  // A queued run can be resumed from the UI even after a server restart.
  router.post("/runs/:id/execute",approved,limiter,async(req,res,next)=>{
    try {
      const run=await store.getAgentRun(req.params.id);
      if(!run || (!req.currentUser.isAdmin && run.userId!==req.auth.userId)) return res.status(404).json({message:"Run not found."});
      if(run.agentKey==="due-diligence" && req.currentUser.isAdmin && !adminCan(req.currentUser,"reviews")) return res.status(403).json({message:"Application review access is required."});
      if(["verification","prediction-check","credibility","document"].includes(run.agentKey) && !req.currentUser.isAdmin) return res.status(403).json({message:"Admin access is required."});
      if(run.agentKey==="document") return res.status(400).json({message:"Please upload the document again to retry verification."});
      if(run.agentKey==="verification") {
        await requireVerificationSetup(store);
        keepAlive(processVerificationQueue(store));
        return res.status(202).json({run:await store.getAgentRun(run.id)});
      }
      const result=await executeTrackedRun(store,run,p=>performAgentWork(store,run,p));
      res.json({run:result});
    }catch(e){next(e);}
  });
  router.get("/backlog",requireAdmin,async(_req,res,next)=>{
    try {
      const [signals,users]=await Promise.all([store.listAllSignals(),store.listUsers({})]);
      const tasks=[];
      for(const signal of signals) {
        if(!signal.analyzedAt) tasks.push({agentKey:"signal-sentiment",targetId:signal.id,label:signal.title});
        if(!signal.predictionDirection || (!signal.predictionTicker && !signal.predictionCheckedAt)) tasks.push({agentKey:"signal-prediction",targetId:signal.id,label:signal.title});
      }
      for(const user of users.filter(u=>!u.isAdmin && u.status!=="rejected")) {
        const report=await store.findVerification(user.id);
        if(!report || ["failed","skipped"].includes(report.status)) tasks.push({agentKey:"verification",targetId:user.id,label:user.fullName});
      }
      res.json({tasks});
    }catch(e){next(e);}
  });
  return router;
}
