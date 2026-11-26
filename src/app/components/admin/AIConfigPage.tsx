import { useEffect, useRef, useState } from "react";
import {
  Cpu,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Lock,
  Server,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";
import { request } from "@/app/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const AGENTS = [
  ["verification", "Background verification"],
  ["due-diligence", "Profile due diligence"],
  ["document", "Document verification"],
  ["signal-sentiment", "Signal sentiment"],
  ["signal-prediction", "Prediction extraction"],
  ["prediction-check", "Prediction checker"],
  ["credibility", "Credibility scoring"],
  ["profile-quality", "Profile quality"],
  ["investor-1", "Crypto research"],
  ["investor-2", "FinTech research"],
  ["investor-3", "HealthTech research"],
  ["investor-4", "CleanTech research"],
  ["investor-5", "AI/ML research"],
  ["investor-6", "SaaS research"],
];

type Provider = "groq" | "gemini" | "anthropic";
type MaskedKey = { slot: number; hint: string };

interface AiConfig {
  activeProvider: string;
  groqModel: string;
  geminiModel: string;
  anthropicModel: string;
  openaiModel: string;
  groqKeys: MaskedKey[];
  geminiKeys: MaskedKey[];
  anthropicKeys: MaskedKey[];
  openaiKeys: MaskedKey[];
  keySources: Record<string, string>;
  dailyTokenLimit: number | null;
  monthlyTokenLimit: number | null;
  agentTokenLimits: Record<string, number>;
  memoryMode: boolean;
}

export function KeyList({
  name,
  keys,
  source,
}: {
  name: string;
  keys: MaskedKey[];
  source: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {keys.length} active {keys.length === 1 ? "key" : "keys"}
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-semibold text-[11px]">
          Source: {source}
        </span>
      </div>
      {keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
          No keys active. Provider will be bypassed during failover.
        </div>
      ) : (
        <div className="space-y-1.5">
          {keys.map((key) => (
            <div
              key={key.slot}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2 text-xs font-mono shadow-2xs"
            >
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Lock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>
                  {name} Slot #{key.slot}
                </span>
              </div>
              <code className="text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/40 font-semibold">
                {key.hint}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TokenLimitField({
  label,
  value,
  onChange,
  defaultLimit = 10000,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  defaultLimit?: number;
}) {
  const previous = useRef(value ?? defaultLimit);
  if (value !== null) previous.current = value;
  return (
    <div className="space-y-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer font-mono">
          <input
            type="checkbox"
            aria-label={label + " — No limit"}
            checked={value === null}
            onChange={(event) =>
              onChange(event.target.checked ? null : previous.current)
            }
            className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-cyan-600 focus:ring-cyan-500"
          />
          Unlimited
        </label>
      </div>
      <Input
        type="number"
        min="0"
        step="1"
        aria-label={label}
        disabled={value === null}
        value={value ?? ""}
        placeholder="Unlimited"
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8.5 text-xs font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
      />
    </div>
  );
}

export function AIConfigPage() {
  const [cfg, setCfg] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groqDraft, setGroqDraft] = useState(["", "", ""]);
  const [draft, setDraft] = useState({ gemini: "", anthropic: "" });
  const [reset, setReset] = useState<Partial<Record<Provider, boolean>>>({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await request<{ config: AiConfig }>("/api/admin/ai-config");
      setCfg(response.config);
      setGroqDraft(["", "", ""]);
      setDraft({ gemini: "", anthropic: "" });
      setReset({});
    } catch (err: any) {
      setError(err.message || "Could not load AI engine settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!cfg) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        activeProvider: "auto",
        groqModel: cfg.groqModel,
        geminiModel: cfg.geminiModel,
        anthropicModel: cfg.anthropicModel,
        dailyTokenLimit: cfg.dailyTokenLimit,
        monthlyTokenLimit: cfg.monthlyTokenLimit,
        agentTokenLimits: cfg.agentTokenLimits,
      };
      const groqKeys = groqDraft.map((k) => k.trim()).filter(Boolean);
      if (reset.groq) payload.groqKeys = "__CLEAR__";
      else if (groqKeys.length) payload.groqKeys = groqKeys;
      for (const provider of ["gemini", "anthropic"] as const) {
        if (reset[provider]) payload[provider + "Key"] = "__CLEAR__";
        else if (draft[provider].trim()) payload[provider + "Key"] = draft[provider].trim();
      }
      const response = await request<{ config: AiConfig; message: string }>(
        "/api/admin/ai-config",
        { method: "PUT", body: JSON.stringify(payload) }
      );
      setCfg(response.config);
      setGroqDraft(["", "", ""]);
      setDraft({ gemini: "", anthropic: "" });
      setReset({});
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.message || "Could not save AI engine configuration.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center gap-3 text-sm font-mono text-cyan-600 dark:text-cyan-400">
        <RefreshCw className="animate-spin h-5 w-5" />
        Syncing AI Provider Telemetry &amp; Keys…
      </div>
    );
  }

  if (error || !cfg) {
    return (
      <div role="alert" className="p-6 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 space-y-3">
        <p className="font-semibold text-sm">Failed to connect to AI engine controller</p>
        <p className="text-xs font-mono">{error || "Settings unavailable."}</p>
        <Button onClick={load} size="sm" variant="outline" className="text-xs bg-white dark:bg-transparent">
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Cockpit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Engine &amp; Multi-Tier Provider Routing
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            Autonomous failover priority, cryptographic key vaults, and per-agent token governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={saving}
            className="text-xs h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-cyan-600 dark:text-cyan-400" />
            Refresh State
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={saving || cfg.memoryMode}
            className="text-xs h-9 bg-cyan-600 hover:bg-cyan-500 text-white dark:text-slate-950 font-semibold shadow-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving Configuration…" : "Commit Engine Settings"}
          </Button>
        </div>
      </div>

      {cfg.memoryMode && (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>ENVIRONMENT SETTINGS ACTIVE:</strong> Current AI provider keys and models are loaded from your server environment (<code className="font-mono bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 rounded">.env</code>). To enable in-database key management and UI saves, run the <code className="font-mono bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 rounded">ai_provider_config</code> migration in Supabase SQL editor.
          </span>
        </div>
      )}

      <fieldset disabled={cfg.memoryMode || saving} className="space-y-6">
        {/* Visual Priority Stepper */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Automatic Multi-Tier Cascading Failover
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Requests automatically cascade through tiers if rate-limits or transient API errors occur.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 w-fit">
              Active Strategy: Auto-Failover
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Tier 1: Groq */}
            <div className="p-5 rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-950/20 space-y-3 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                  PRIORITY 1 · FAST-PATH
                </span>
                <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  ~280ms
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Groq Lightning Engine</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  High-throughput Llama inference for fast sentiment, extraction &amp; scoring.
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyan-900 dark:text-cyan-300/80 bg-white/80 dark:bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-200 dark:border-cyan-900/50 font-medium">
                Key Pool: {cfg.groqKeys.length} active {cfg.groqKeys.length === 1 ? "key" : "keys"} with round-robin rotation
              </div>
            </div>

            {/* Tier 2: Gemini */}
            <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/20 space-y-3 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
                  PRIORITY 2 · FALLBACK
                </span>
                <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  ~850ms
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Google Gemini Pro</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Multimodal vision &amp; long-context document verification synthesis.
                </p>
              </div>
              <div className="text-[11px] font-mono text-indigo-900 dark:text-indigo-300/80 bg-white/80 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 font-medium">
                Active Key: {cfg.geminiKeys.length ? "Configured & Ready" : "Standby (No Key)"}
              </div>
            </div>

            {/* Tier 3: Anthropic */}
            <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/20 space-y-3 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                  PRIORITY 3 · FINAL FALLBACK
                </span>
                <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  ~1,100ms
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Anthropic Claude</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  High-stakes venture diligence audit and institutional compliance review.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-900 dark:text-purple-300/80 bg-white/80 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50 font-medium">
                Active Key: {cfg.anthropicKeys.length ? "Configured & Ready" : "Standby (No Key)"}
              </div>
            </div>
          </div>
        </div>

        {/* Provider Vault Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["groq", "gemini", "anthropic"] as const).map((provider) => {
            const providerName =
              provider === "groq"
                ? "Groq"
                : provider === "gemini"
                ? "Google Gemini"
                : "Anthropic Claude";
            return (
              <div
                key={provider}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-5 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Server className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      {providerName}
                    </h3>
                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                      {provider === "groq" ? "Multi-Key Pool" : "Single Key"}
                    </span>
                  </div>

                  <KeyList
                    name={providerName}
                    keys={cfg[(provider + "Keys") as "groqKeys"]}
                    source={cfg.keySources[provider]}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Target Model Identifier
                    </label>
                    <Input
                      value={cfg[(provider + "Model") as "groqModel"]}
                      aria-label={provider + " model"}
                      onChange={(e) =>
                        setCfg({ ...cfg, [provider + "Model"]: e.target.value })
                      }
                      className="h-8.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {provider === "groq" ? (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Replace Key Pool
                      </p>
                      <div className="space-y-1.5">
                        {groqDraft.map((key, index) => (
                          <div key={index} className="flex gap-1.5">
                            <Input
                              type="password"
                              autoComplete="new-password"
                              aria-label={"New Groq key " + (index + 1)}
                              placeholder={"Groq API Key " + (index + 1)}
                              value={key}
                              disabled={!!reset.groq}
                              onChange={(e) =>
                                setGroqDraft(
                                  groqDraft.map((k, s) =>
                                    s === index ? e.target.value : k
                                  )
                                )
                              }
                              className="h-8.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            {groqDraft.length > 1 && (
                              <Button
                                variant="outline"
                                type="button"
                                size="sm"
                                aria-label={"Remove new Groq key " + (index + 1)}
                                onClick={() =>
                                  setGroqDraft(
                                    groqDraft.filter((_, s) => s !== index)
                                  )
                                }
                                className="h-8.5 px-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        disabled={groqDraft.length >= 20 || !!reset.groq}
                        onClick={() => setGroqDraft([...groqDraft, ""])}
                        className="text-xs h-8 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 w-full font-medium"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Key Slot
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Replacement Key
                      </label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Leave blank to retain current key"
                        value={draft[provider]}
                        disabled={!!reset[provider]}
                        onChange={(e) =>
                          setDraft({ ...draft, [provider]: e.target.value })
                        }
                        className="h-8.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-mono text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!reset[provider]}
                    onChange={(e) =>
                      setReset({ ...reset, [provider]: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Revert to environment keys on save</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Token Limits & Governance */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Token Budget &amp; Execution Safeguards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Strict platform-wide ceilings across all active providers. Reset automatically at 00:00 UTC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenLimitField
              label="Daily Token Budget (Platform-Wide)"
              value={cfg.dailyTokenLimit}
              defaultLimit={500000}
              onChange={(v) => setCfg({ ...cfg, dailyTokenLimit: v })}
            />
            <TokenLimitField
              label="Monthly Token Ceiling (Platform-Wide)"
              value={cfg.monthlyTokenLimit}
              defaultLimit={10000000}
              onChange={(v) => setCfg({ ...cfg, monthlyTokenLimit: v })}
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Per-Agent Single-Run Token Thresholds
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Maximum token allowance per individual autonomous agent dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENTS.map(([key, agentLabel]) => (
                <TokenLimitField
                  key={key}
                  label={agentLabel}
                  value={cfg.agentTokenLimits[key] ?? null}
                  onChange={(val) => {
                    const limits = { ...cfg.agentTokenLimits };
                    if (val === null) delete limits[key];
                    else limits[key] = val;
                    setCfg({ ...cfg, agentTokenLimits: limits });
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Commit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Modifications take immediate effect platform-wide. Keys are encrypted at rest with AES-256-GCM.
          </p>
          <Button
            onClick={save}
            disabled={saving || cfg.memoryMode}
            className="text-xs h-9 bg-cyan-600 hover:bg-cyan-500 text-white dark:text-slate-950 font-semibold shadow-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving…" : "Save AI Configuration"}
          </Button>
        </div>
      </fieldset>
    </div>
  );
}
