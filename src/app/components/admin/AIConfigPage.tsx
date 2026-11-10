import { useEffect, useRef, useState } from "react";
import { Cpu, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/app/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

const AGENTS = [
  ["verification","Background verification"],["due-diligence","Profile due diligence"],
  ["document","Document verification"],["signal-sentiment","Signal sentiment"],
  ["signal-prediction","Prediction extraction"],["prediction-check","Prediction checker"],
  ["credibility","Credibility scoring"],["profile-quality","Profile quality"],
  ["investor-1","Crypto research"],["investor-2","FinTech research"],["investor-3","HealthTech research"],
  ["investor-4","CleanTech research"],["investor-5","AI/ML research"],["investor-6","SaaS research"],
];
type Provider = "groq" | "gemini" | "anthropic";
type MaskedKey = {slot:number;hint:string};
interface AiConfig {
  activeProvider:string;
  groqModel:string;geminiModel:string;anthropicModel:string;openaiModel:string;
  groqKeys:MaskedKey[];geminiKeys:MaskedKey[];anthropicKeys:MaskedKey[];openaiKeys:MaskedKey[];
  keySources:Record<string,string>;
  dailyTokenLimit:number|null;monthlyTokenLimit:number|null;agentTokenLimits:Record<string,number>;
  memoryMode:boolean;
}

export function KeyList({name,keys,source}:{name:string;keys:MaskedKey[];source:string}) {
  return <div className="space-y-2">
    <p className="text-sm text-muted-foreground">{keys.length} configured {keys.length===1 ? "key" : "keys"} · {source}</p>
    {keys.map(key=><div key={key.slot} className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
      <span>{name} key {key.slot}</span><code>{key.hint}</code>
    </div>)}
    <p className="text-xs text-muted-foreground">Configured keys have not necessarily passed a live request.</p>
  </div>;
}

export function TokenLimitField({label,value,onChange,defaultLimit=10000}:{label:string;value:number|null;onChange:(value:number|null)=>void;defaultLimit?:number}) {
  const previous = useRef(value ?? defaultLimit);
  if (value !== null) previous.current = value;
  return <div className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" aria-label={label+" — No limit"} checked={value===null}
          onChange={event=>onChange(event.target.checked ? null : previous.current)} className="h-4 w-4 accent-indigo-600" />
        No limit
      </label>
    </div>
    <Input type="number" min="0" step="1" aria-label={label} disabled={value===null}
      value={value ?? ""} placeholder="No limit"
      onChange={event=>onChange(Number(event.target.value))} />
  </div>;
}

export function AIConfigPage() {
  const [cfg,setCfg] = useState<AiConfig|null>(null);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [groqDraft,setGroqDraft] = useState(["","",""]);
  const [draft,setDraft] = useState({gemini:"",anthropic:""});
  const [reset,setReset] = useState<Partial<Record<Provider,boolean>>>({});
  async function load() {
    setLoading(true);setError("");
    try {
      const response = await request<{config:AiConfig}>("/api/admin/ai-config");
      setCfg(response.config);setGroqDraft(["","",""]);setDraft({gemini:"",anthropic:""});setReset({});
    } catch(error:any) {setError(error.message || "Could not load AI settings.");}
    finally {setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  async function save() {
    if (!cfg) return;
    setSaving(true);
    try {
      const payload:Record<string,unknown> = {
        activeProvider:cfg.activeProvider,groqModel:cfg.groqModel,geminiModel:cfg.geminiModel,anthropicModel:cfg.anthropicModel,
        dailyTokenLimit:cfg.dailyTokenLimit,monthlyTokenLimit:cfg.monthlyTokenLimit,agentTokenLimits:cfg.agentTokenLimits,
      };
      const groqKeys = groqDraft.map(key=>key.trim()).filter(Boolean);
      if (reset.groq) payload.groqKeys="__CLEAR__";
      else if (groqKeys.length) payload.groqKeys=groqKeys;
      for (const provider of ["gemini","anthropic"] as const) {
        if (reset[provider]) payload[provider+"Key"]="__CLEAR__";
        else if (draft[provider].trim()) payload[provider+"Key"]=draft[provider].trim();
      }
      const response = await request<{config:AiConfig;message:string}>("/api/admin/ai-config",{method:"PUT",body:JSON.stringify(payload)});
      setCfg(response.config);setGroqDraft(["","",""]);setDraft({gemini:"",anthropic:""});setReset({});
      toast.success(response.message);
    } catch(error:any) {toast.error(error.message || "Could not save settings.");}
    finally {setSaving(false);}
  }
  if (loading) return <div className="p-8 flex gap-2"><RefreshCw className="animate-spin h-5 w-5" /> Loading AI settings…</div>;
  if (error || !cfg) return <div role="alert" className="space-y-3"><p>{error || "Settings unavailable."}</p><Button onClick={load}>Retry</Button></div>;
  return <div className="max-w-3xl space-y-6">
    <div className="flex justify-between gap-4">
      <div><h1 className="text-2xl font-semibold flex gap-2 items-center"><Cpu /> AI Provider Configuration</h1>
        <p className="mt-2 text-sm text-muted-foreground">View configured keys, select automatic switching, and adjust token limits.</p></div>
      <Button variant="outline" onClick={load} disabled={saving}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
    </div>
    {cfg.memoryMode && <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      Environment settings are shown below. Connect database storage to save changes here; environment changes require a server restart.
    </p>}
    <fieldset disabled={cfg.memoryMode || saving} className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Automatic switching</h2>
        <p className="text-sm text-muted-foreground">Auto tries Groq → Gemini → Anthropic, skipping providers without a key. Selecting a provider uses only that provider.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {["auto","groq","gemini","anthropic"].map(provider=><button type="button" key={provider}
            aria-pressed={cfg.activeProvider===provider}
            onClick={()=>setCfg({...cfg,activeProvider:provider})}
            className={"rounded-lg border px-3 py-3 capitalize text-sm "+(cfg.activeProvider===provider ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "hover:bg-muted")}>
            {provider==="auto" ? "Auto" : provider}
          </button>)}
        </div>
        {!["auto","groq","gemini","anthropic"].includes(cfg.activeProvider) && <p role="alert" className="text-sm text-amber-700">The saved provider is unsupported by the agent runtime. Select a supported provider and save.</p>}
        <p className="text-sm">Groq key rotation is automatic: concurrent requests use the least busy keys; ties rotate. Invalid keys are skipped. A Groq rate limit pauses the pool before retry or provider fallback.</p>
      </Card>
      {(["groq","gemini","anthropic"] as const).map(provider=><Card key={provider} className="p-6 space-y-4">
        <h2 className="font-semibold capitalize">{provider}{provider==="groq" ? " key pool" : ""}</h2>
        <KeyList name={provider==="groq" ? "Groq" : provider==="gemini" ? "Gemini" : "Anthropic"} keys={cfg[(provider+"Keys") as "groqKeys"]} source={cfg.keySources[provider]} />
        <label className="block space-y-2 text-sm font-medium">
          <span>Model</span>
          <Input value={cfg[(provider+"Model") as "groqModel"]} aria-label={provider+" model"}
            onChange={event=>setCfg({...cfg,[provider+"Model"]:event.target.value})} />
        </label>
        <p className="text-xs text-muted-foreground">Use a model available to your provider account. Groq image reading uses the server's GROQ_VISION_MODEL.</p>
        {provider==="groq" ? <div className="space-y-2">
          <p className="text-sm font-medium">Replace the Groq pool</p>
          <p className="text-xs text-muted-foreground">Leave all inputs blank to keep existing keys. Enter every key you want in the replacement pool.</p>
          {groqDraft.map((key,index)=><div key={index} className="flex gap-2">
            <Input type="password" autoComplete="new-password" aria-label={"New Groq key "+(index+1)}
              placeholder={"Groq key "+(index+1)} value={key} disabled={!!reset.groq}
              onChange={event=>setGroqDraft(groqDraft.map((current,slot)=>slot===index ? event.target.value : current))} />
            {groqDraft.length>1 && <Button variant="outline" type="button" aria-label={"Remove new Groq key "+(index+1)}
              onClick={()=>setGroqDraft(groqDraft.filter((_,slot)=>slot!==index))}><Trash2 className="h-4 w-4" /></Button>}
          </div>)}
          <Button variant="outline" type="button" disabled={groqDraft.length>=20 || !!reset.groq} onClick={()=>setGroqDraft([...groqDraft,""])}><Plus className="h-4 w-4 mr-1" />Add key</Button>
        </div> : <label className="block space-y-2 text-sm">
          <span>Replacement key (leave blank to keep)</span>
          <Input type="password" autoComplete="new-password" value={draft[provider]} disabled={!!reset[provider]}
            onChange={event=>setDraft({...draft,[provider]:event.target.value})} />
        </label>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!reset[provider]} onChange={event=>setReset({...reset,[provider]:event.target.checked})} />
          Remove saved override and use environment keys after saving
        </label>
      </Card>)}
      {!!cfg.openaiKeys.length && <Card className="p-6 space-y-3">
        <h2 className="font-semibold">OpenAI — stored only</h2>
        <KeyList name="OpenAI" keys={cfg.openaiKeys} source={cfg.keySources.openai} />
        <p className="text-sm text-muted-foreground">This agent runtime does not route requests to OpenAI.</p>
      </Card>}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold">Token limits</h2>
        <p className="text-sm text-muted-foreground">Limits count input and output tokens across providers. New calls stop once recorded usage reaches a limit; calls already running may finish above it. Daily and monthly periods reset at midnight UTC. Select No limit to remove a threshold; 0 pauses new AI calls.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <TokenLimitField label="Daily token limit" value={cfg.dailyTokenLimit} defaultLimit={500000} onChange={value=>setCfg({...cfg,dailyTokenLimit:value})} />
          <TokenLimitField label="Monthly token limit" value={cfg.monthlyTokenLimit} defaultLimit={10000000} onChange={value=>setCfg({...cfg,monthlyTokenLimit:value})} />
        </div>
        <h3 className="font-medium">Per-agent limit for one run</h3>
        <p className="text-xs text-muted-foreground">Per-agent limits apply to AI calls. Credibility calculations themselves use no model tokens. When limits are enabled, AI actions must run through Agent Activity for usage tracking. Provider quotas still apply when No limit is selected.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {AGENTS.map(([key,label])=><TokenLimitField key={key} label={label} value={cfg.agentTokenLimits[key] ?? null}
            onChange={value=>{
              const limits={...cfg.agentTokenLimits};
              if(value===null) delete limits[key]; else limits[key]=value;
              setCfg({...cfg,agentTokenLimits:limits});
            }} />)}
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">Save to apply changes. Saved keys are encrypted and shown masked. Other server instances refresh settings within 60 seconds.</p>
      <div className="flex justify-end"><Button onClick={save} disabled={saving || cfg.memoryMode}><Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save configuration"}</Button></div>
    </fieldset>
  </div>;
}
