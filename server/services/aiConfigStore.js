import { config, getGroqApiKeys } from "../config.js";
import { encryptKey, decryptKey, maskKey } from "./aiEncryption.js";

let client = null;
let cache = null;
let revision = 0;
export function setAiConfigClient(value) { client = value; invalidateAiConfig(); }
export function invalidateAiConfig() { cache = null; revision++; }

function baseline() {
  return {...config, activeProvider:config.aiProvider, groqApiKeys:getGroqApiKeys(),
    openaiModel:process.env.OPENAI_MODEL || "gpt-4o-mini",
    dailyTokenLimit:null, monthlyTokenLimit:null, agentTokenLimits:{},
    keySources:{groq:"environment",gemini:"environment",anthropic:"environment",openai:"environment"}};
}

// Cache only database settings; never cache environment-only configuration.
export async function getAiConfig() {
  if (!client) return baseline();
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  const version = revision;
  const {data, error} = await client.from("ai_provider_config").select("*").eq("singleton",true).maybeSingle();
  if (error) throw Object.assign(new Error("AI settings could not be loaded. Check database access and apply the AI settings migrations."),{code:"AI_CONFIG_UNAVAILABLE",status:503});
  const value = baseline();
  if (data) {
    value.aiProvider = value.activeProvider = data.active_provider || value.aiProvider;
    for (const provider of ["groq","gemini","anthropic","openai"]) {
      value[provider+"Model"] = data[provider+"_model"] || value[provider+"Model"];
      if (!data[provider+"_key_enc"]) continue;
      const plain = decryptKey(data[provider+"_key_enc"]);
      if (!plain) throw Object.assign(new Error("A saved AI key could not be decrypted. Restore the server encryption secret."),{code:"AI_CONFIG_UNAVAILABLE",status:503});
      value.keySources[provider] = "saved settings";
      if (provider === "groq") {
        // Existing encrypted single-key rows remain readable.
        const keys = plain.startsWith("[") ? JSON.parse(plain) : [plain];
        value.groqApiKeys = getGroqApiKeys({groqApiKeys:keys});
        value.groqApiKey = value.groqApiKeys[0] || "";
      } else value[provider+"ApiKey"] = plain;
    }
    value.dailyTokenLimit = data.daily_token_limit ?? null;
    value.monthlyTokenLimit = data.monthly_token_limit ?? null;
    value.agentTokenLimits = data.agent_token_limits ?? {};
  }
  if (version === revision) cache = {value,expiresAt:Date.now()+60_000};
  return value;
}

export async function getAiConfigForAdmin() {
  const settings = await getAiConfig();
  const safe = {activeProvider:settings.aiProvider, memoryMode:!client,
    dailyTokenLimit:settings.dailyTokenLimit, monthlyTokenLimit:settings.monthlyTokenLimit,
    agentTokenLimits:settings.agentTokenLimits, keySources:settings.keySources};
  for (const provider of ["groq","gemini","anthropic","openai"]) {
    safe[provider+"Model"] = settings[provider+"Model"];
    const keys = provider === "groq" ? getGroqApiKeys(settings) : [settings[provider+"ApiKey"]].filter(Boolean);
    safe[provider+"KeySet"] = keys.length > 0;
    safe[provider+"KeyHint"] = maskKey(keys[0]);
    safe[provider+"Keys"] = keys.map((key,index) => ({slot:index+1,hint:maskKey(key)}));
  }
  return safe;
}

export async function saveAiConfig(updates, adminId) {
  if (!client) throw Object.assign(new Error("AI settings are read-only without database storage. Configure them in .env and restart."),{status:501});
  // Seed a first row from effective settings so a key-only save preserves policy.
  const current = await getAiConfig();
  const patch = {singleton:true,updated_by:adminId,updated_at:new Date().toISOString()};
  const fields = {activeProvider:"active_provider",groqModel:"groq_model",geminiModel:"gemini_model",
    anthropicModel:"anthropic_model",openaiModel:"openai_model",dailyTokenLimit:"daily_token_limit",
    monthlyTokenLimit:"monthly_token_limit",agentTokenLimits:"agent_token_limits"};
  for (const [name,column] of Object.entries(fields)) patch[column] = updates[name] !== undefined ? updates[name] : current[name];
  for (const provider of ["groq","gemini","anthropic","openai"]) {
    const input = provider === "groq" ? updates.groqKeys ?? updates.groqKey : updates[provider+"Key"];
    if (input === undefined || input === "") continue;
    const clear = input === "__CLEAR__";
    const value = provider === "groq" && !clear ? JSON.stringify(getGroqApiKeys({groqApiKeys:Array.isArray(input) ? input : [input]})) : input;
    patch[provider+"_key_enc"] = clear ? null : encryptKey(value);
    patch[provider+"_key_set"] = !clear;
  }
  const {error} = await client.from("ai_provider_config").upsert(patch,{onConflict:"singleton"});
  if (error) throw Object.assign(new Error("AI settings could not be saved. Check database access and apply the latest migrations."),{status:503});
  invalidateAiConfig();
  return getAiConfigForAdmin();
}
