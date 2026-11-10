BEGIN;
ALTER TABLE public.ai_provider_config
  ADD COLUMN IF NOT EXISTS gemini_model text NOT NULL DEFAULT 'gemini-3.8-flash',
  ADD COLUMN IF NOT EXISTS gemini_key_enc text,
  ADD COLUMN IF NOT EXISTS gemini_key_set boolean NOT NULL DEFAULT false;
ALTER TABLE public.ai_provider_config DROP CONSTRAINT IF EXISTS ai_provider_config_active_provider_check;
ALTER TABLE public.ai_provider_config ADD CONSTRAINT ai_provider_config_active_provider_check
  CHECK (active_provider IN ('auto','groq','gemini','anthropic','openai'));
COMMENT ON COLUMN public.ai_provider_config.groq_key_enc IS
  'AES-256-GCM encrypted JSON array of Groq keys; legacy encrypted single keys are also supported.';
CREATE INDEX IF NOT EXISTS agent_runs_usage_updated ON public.agent_runs(updated_at);
COMMIT;
