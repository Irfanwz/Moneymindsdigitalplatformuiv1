-- Migration: Credibility Scores
-- Adds credibility fields to advisor_profiles + history tracking table

-- Add credibility columns to advisor_profiles
ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS credibility_score      INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  ADD COLUMN IF NOT EXISTS credibility_tier       TEXT,
  ADD COLUMN IF NOT EXISTS credibility_updated_at TIMESTAMPTZ;

-- History table — one row per daily recalculation per advisor (for score-over-time chart)
CREATE TABLE IF NOT EXISTS credibility_scores_history (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id        UUID        NOT NULL,
  score             INTEGER     NOT NULL CHECK (score >= 0 AND score <= 100),
  tier              TEXT        NOT NULL,
  total_predictions INTEGER     NOT NULL DEFAULT 0,
  breakdown         JSONB       NOT NULL DEFAULT '{}',
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credibility_history_advisor ON credibility_scores_history(advisor_id);
CREATE INDEX IF NOT EXISTS idx_credibility_history_date    ON credibility_scores_history(recorded_at);

-- RLS
ALTER TABLE credibility_scores_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON credibility_scores_history
  USING (true) WITH CHECK (true);
