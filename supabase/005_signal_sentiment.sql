-- Migration: AI Sentiment Analysis on Advisor Signals
-- Adds 11 new columns to advisor_signals for AI-powered analysis.
-- Run this in your Supabase SQL editor.

ALTER TABLE advisor_signals
  ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  ADD COLUMN IF NOT EXISTS sentiment_confidence INTEGER CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 100),
  ADD COLUMN IF NOT EXISTS sentiment_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS risk_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS actionability TEXT CHECK (actionability IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS actionability_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sectors JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_signals_sentiment ON advisor_signals(sentiment);
CREATE INDEX IF NOT EXISTS idx_signals_risk_level ON advisor_signals(risk_level);
CREATE INDEX IF NOT EXISTS idx_signals_actionability ON advisor_signals(actionability);
CREATE INDEX IF NOT EXISTS idx_signals_analyzed_at ON advisor_signals(analyzed_at);
