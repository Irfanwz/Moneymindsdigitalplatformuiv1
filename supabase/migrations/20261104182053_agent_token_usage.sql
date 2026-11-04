-- NULL preserves the distinction between historical runs and measured zero usage.
BEGIN;
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS usage jsonb;
COMMENT ON COLUMN public.agent_runs.usage IS
  'Provider-reported AI token counts, request purposes and coverage. NULL means not recorded. No prompts or credentials.';
COMMIT;
