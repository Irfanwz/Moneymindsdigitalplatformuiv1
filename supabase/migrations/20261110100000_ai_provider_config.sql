BEGIN;

-- AI Provider Configuration table.
-- Single-row design (enforced by singleton unique constraint).
-- API keys are stored AES-256-GCM encrypted; plain text never touches the DB.
CREATE TABLE IF NOT EXISTS public.ai_provider_config (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton            boolean     NOT NULL DEFAULT true UNIQUE CHECK (singleton = true),
  active_provider      text        NOT NULL DEFAULT 'auto'
                                   CHECK (active_provider IN ('groq','anthropic','openai','auto')),
  -- Model selections per provider
  groq_model           text        NOT NULL DEFAULT 'openai/gpt-oss-20b',
  anthropic_model      text        NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  openai_model         text        NOT NULL DEFAULT 'gpt-4o-mini',
  -- Encrypted API keys (NULL = use ENV fallback)
  groq_key_enc         text,
  anthropic_key_enc    text,
  openai_key_enc       text,
  -- Boolean hints for the UI — never expose the full key
  groq_key_set         boolean     NOT NULL DEFAULT false,
  anthropic_key_set    boolean     NOT NULL DEFAULT false,
  openai_key_set       boolean     NOT NULL DEFAULT false,
  -- Global token limits (NULL = unlimited)
  daily_token_limit    bigint,
  monthly_token_limit  bigint,
  -- Per-agent limits: { "verification": 50000, "due-diligence": 80000 }
  agent_token_limits   jsonb       NOT NULL DEFAULT '{}',
  updated_by           uuid        REFERENCES public.platform_users(id) ON DELETE SET NULL,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Only the service role may read/write this table (keys are sensitive)
ALTER TABLE public.ai_provider_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_provider_config FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.ai_provider_config TO service_role;

COMMIT;
