-- Migration: AI Verifications Table
-- Run this in your Supabase SQL editor before deploying the AI Due Diligence Agent.

CREATE TABLE IF NOT EXISTS ai_verifications (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  status             TEXT        NOT NULL DEFAULT 'running'
                                 CHECK (status IN ('running', 'complete', 'failed', 'skipped')),
  recommendation     TEXT        CHECK (recommendation IN ('accept', 'review', 'reject')),
  confidence         INTEGER     CHECK (confidence >= 0 AND confidence <= 100),
  credibility_score  INTEGER     CHECK (credibility_score >= 0 AND credibility_score <= 100),
  summary            TEXT,
  findings           JSONB,
  report_markdown    TEXT,
  sources            JSONB       NOT NULL DEFAULT '[]',
  red_flags          JSONB       NOT NULL DEFAULT '[]',
  search_queries_run INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ,
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_verifications_user        ON ai_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_status      ON ai_verifications(status);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_recommendation ON ai_verifications(recommendation);

-- Row-level security: only service role can read/write
ALTER TABLE ai_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON ai_verifications
  USING (true)
  WITH CHECK (true);
