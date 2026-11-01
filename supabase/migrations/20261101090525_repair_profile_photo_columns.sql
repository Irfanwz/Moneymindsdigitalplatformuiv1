-- Follow-up to the live database audit: existing profile tables lack photo_url.
-- Run this entire file in project ievzkvvidsdrlytvitup after the agent repair.
-- Preserves existing profiles and any photo URLs; safe to run again.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER TABLE public.advisor_profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.startup_profiles ADD COLUMN IF NOT EXISTS photo_url text;

NOTIFY pgrst, 'reload schema';
COMMIT;
