import { Router } from "express";
import { z } from "zod";
import { createAuthenticate, requirePermission } from "../middleware/auth.js";
import { getAiConfigForAdmin, saveAiConfig } from "../services/aiConfigStore.js";

const key = z.string().trim().max(2048);
const model = z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9._\/-]+$/);
const limit = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const schema = z.object({
  activeProvider:z.enum(["auto","groq","gemini","anthropic"]).optional(),
  groqModel:model.optional(),geminiModel:model.optional(),anthropicModel:model.optional(),openaiModel:model.optional(),
  groqKeys:z.union([z.array(key.min(1).refine(value=>value!=="__CLEAR__")).min(1).max(20),z.literal("__CLEAR__")]).optional(),
  groqKey:key.optional(),geminiKey:key.optional(),anthropicKey:key.optional(),openaiKey:key.optional(),
  dailyTokenLimit:limit.nullable().optional(),monthlyTokenLimit:limit.nullable().optional(),
  agentTokenLimits:z.record(z.string().min(1).max(80),limit).optional(),
}).strict().refine(value=>!(value.groqKeys !== undefined && value.groqKey !== undefined));

export function createAiConfigRouter(store) {
  const router = Router();
  router.use(createAuthenticate(store),requirePermission("settings"));
  router.use((_req,res,next)=>{res.set("Cache-Control","no-store");next();});
  router.get("/",async(_req,res,next)=>{
    try { res.json({config:await getAiConfigForAdmin()}); } catch(error) { next(error); }
  });
  router.put("/",async(req,res,next)=>{
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({message:"Invalid AI settings. Use valid model names, keys, and nonnegative whole token limits; no limit must be null."});
    try { res.json({message:"AI configuration saved.",config:await saveAiConfig(parsed.data,req.auth.userId)}); }
    catch(error) { next(error); }
  });
  return router;
}
