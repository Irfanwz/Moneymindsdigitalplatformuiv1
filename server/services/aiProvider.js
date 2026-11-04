import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { config } from "../config.js";
import { trackAIRequest } from "./aiUsage.js";

export function configuredProviders() {
  const providers=[];
  if(config.groqApiKey && config.aiProvider!=="anthropic") providers.push("groq");
  if(config.anthropicApiKey && config.aiProvider!=="groq") providers.push("anthropic");
  return providers;
}
export async function generateJSON(system,prompt,{maxTokens=1800,validate,onRetry,purpose="Generate a structured AI assessment",usageDetails={}}={}) {
  const providers=configuredProviders();
  if(!providers.length) throw new Error("No AI provider is configured. An administrator must configure Groq or Anthropic.");
  let lastError;
  let trigger="initial";
  for(const provider of providers) {
    for(let attempt=0;attempt<2;attempt++) {
    try {
      let text;
      if(provider==="groq") {
        const client=new Groq({apiKey:config.groqApiKey,timeout:45000,maxRetries:0});
        const response=await trackAIRequest({provider,model:config.groqModel,purpose,trigger,details:usageDetails},()=>client.chat.completions.create({model:config.groqModel,messages:[{role:"system",content:system},{role:"user",content:prompt}],response_format:{type:"json_object"},temperature:0.1,max_completion_tokens:maxTokens+2500,...(config.groqModel.startsWith("openai/gpt-oss") ? {reasoning_effort:"low"} : {})}));
        text=response.choices[0]?.message?.content;
      } else {
        const client=new Anthropic({apiKey:config.anthropicApiKey,timeout:45000,maxRetries:0});
        const response=await trackAIRequest({provider,model:config.anthropicModel,purpose,trigger,details:usageDetails},()=>client.messages.create({model:config.anthropicModel,max_tokens:maxTokens,system,messages:[{role:"user",content:prompt}]}));
        text=response.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      }
      const data=JSON.parse((text || "").replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim());
      if(!data || typeof data!=="object" || Array.isArray(data)) throw new Error("The AI provider returned an invalid report. Please retry.");
      return {data:validate ? validate(data) : data,provider};
    } catch(error) {
      if(error?.code==="AI_USAGE_SAVE_FAILED") throw error;
      lastError=error;
      const retryHeader=error?.headers?.get?.("retry-after");
      const seconds=retryHeader ? Number(retryHeader) : 30;
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
