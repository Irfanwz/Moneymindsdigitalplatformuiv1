-- Migration: Profile Verifications Table
-- AI-Verified Profiles feature — users upload credential docs, AI cross-checks with profile

CREATE TABLE IF NOT EXISTS profile_verifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  doc_type         TEXT        NOT NULL
                               CHECK (doc_type IN ('certificate', 'degree', 'business_reg', 'linkedin', 'other')),
  doc_url          TEXT        NOT NULL,
  claim_to_verify  TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'analyzing', 'verified', 'rejected', 'manual_review')),
  ai_confidence    INTEGER     CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_reasoning     TEXT,
  ai_extracted     JSONB,
  reviewed_by      UUID        REFERENCES platform_users(id),
  reviewed_at      TIMESTAMPTZ,
  admin_note       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_verifications_user   ON profile_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_verifications_status ON profile_verifications(status);

-- Add isVerified flag to all profile tables
ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_id UUID        REFERENCES profile_verifications(id);

ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_id UUID        REFERENCES profile_verifications(id);

ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_id UUID        REFERENCES profile_verifications(id);

-- RLS: users can read their own verifications; service role has full access
ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own verifications" ON profile_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON profile_verifications
  USING (true) WITH CHECK (true);
