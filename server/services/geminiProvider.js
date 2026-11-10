import { trackAIRequest } from "./aiUsage.js";

/** Native Gemini REST API. Credentials stay in headers, never URLs or errors. */
export async function requestGemini(settings, {system,parts,maxTokens=1800,json=false}, usage={}) {
  const response = await trackAIRequest({provider:"gemini",model:settings.geminiModel,...usage},async()=>{
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(settings.geminiModel)}:generateContent`,{
      method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":settings.geminiApiKey},
      signal:AbortSignal.timeout(45000),
      body:JSON.stringify({...(system ? {systemInstruction:{parts:[{text:system}]}} : {}),
        contents:[{role:"user",parts}],generationConfig:{maxOutputTokens:maxTokens+2500,...(json ? {responseMimeType:"application/json"} : {})}}),
    });
    if (!result.ok) throw Object.assign(new Error(`Gemini request failed (HTTP ${result.status}). Check the provider key, model and quota.`),{status:result.status,headers:new Headers({"retry-after":result.headers.get("retry-after") || "30"})});
    const data = await result.json();
    return {...data,usage:data.usageMetadata,model:data.modelVersion || settings.geminiModel};
  });
  const candidate = response.candidates?.[0];
  if (candidate?.finishReason !== "STOP") throw new Error("Gemini returned a blocked or incomplete response. Please retry or check the model settings.");
  const text = (candidate.content?.parts || []).filter(part=>!part.thought && typeof part.text==="string").map(part=>part.text).join("").trim();
  if (!text) throw new Error("Gemini returned no usable text.");
  return text;
}
