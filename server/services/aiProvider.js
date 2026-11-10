import Anthropic from "@anthropic-ai/sdk";
import { config, getGroqApiKeys } from "../config.js";
import { trackAIRequest } from "./aiUsage.js";
import { requestGroqCompletion, retryAfterSeconds } from "./groqKeyPool.js";
import { getAiConfig } from "./aiConfigStore.js";
import { requestGemini } from "./geminiProvider.js";

export function configuredProviders(settings = config) {
  const available = {groq:getGroqApiKeys(settings).length>0,gemini:!!settings.geminiApiKey,anthropic:!!settings.anthropicApiKey};
  return ["groq","gemini","anthropic"].filter(provider=>available[provider] && (settings.aiProvider==="auto" || settings.aiProvider===provider));
}
export async function generateJSON(system,prompt,{maxTokens=1800,validate,onRetry,purpose="Generate a structured AI assessment",usageDetails={}}={}) {
  const settings=await getAiConfig();
  const providers=configuredProviders(settings);
  if(!providers.length) throw new Error("No AI provider is configured. An administrator must configure Groq, Gemini or Anthropic.");
  let lastError;
  let trigger="initial";
  for(const provider of providers) {
    for(let attempt=0;attempt<2;attempt++) {
    try {
      let text;
      if(provider==="groq") {
        const response=await requestGroqCompletion({model:settings.groqModel,messages:[{role:"system",content:system},{role:"user",content:prompt}],response_format:{type:"json_object"},temperature:0.1,max_completion_tokens:maxTokens+2500,...(settings.groqModel.startsWith("openai/gpt-oss") ? {reasoning_effort:"low"} : {})},{purpose,trigger,details:usageDetails,keys:getGroqApiKeys(settings)});
        text=response.choices[0]?.message?.content;
      } else if(provider==="gemini") {
        text=await requestGemini(settings,{system,parts:[{text:prompt}],maxTokens,json:true},{purpose,trigger,details:usageDetails});
      } else {
        const client=new Anthropic({apiKey:settings.anthropicApiKey,timeout:45000,maxRetries:0});
        const response=await trackAIRequest({provider,model:settings.anthropicModel,purpose,trigger,details:usageDetails},()=>client.messages.create({model:settings.anthropicModel,max_tokens:maxTokens,system,messages:[{role:"user",content:prompt}]}));
        text=response.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      }
      const data=JSON.parse((text || "").replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim());
      if(!data || typeof data!=="object" || Array.isArray(data)) throw new Error("The AI provider returned an invalid report. Please retry.");
      return {data:validate ? validate(data) : data,provider};
    } catch(error) {
      if(error?.code?.startsWith("AI_")) throw error;
      lastError=error;
      const seconds=retryAfterSeconds(error);
      if(error?.status===429 && attempt===0 && Number.isFinite(seconds) && seconds<=60) {
        const delay=Math.max(1,Math.ceil(seconds));
        await onRetry?.(delay);
        await new Promise(resolve=>setTimeout(resolve,delay*1000));
        trigger="retry";
        continue;
      }
      break;
    }
    }
    trigger="fallback";
  }
  if(lastError?.status) throw lastError;
  throw new Error("The AI provider returned an invalid or incomplete response. Please retry.");
}
