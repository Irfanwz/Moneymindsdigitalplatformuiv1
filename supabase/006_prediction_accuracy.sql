-- Migration: Prediction Accuracy Tracker
-- Adds 12 new columns to advisor_signals for automated prediction verification.
-- Run this in your Supabase SQL editor after 005_signal_sentiment.sql.

ALTER TABLE advisor_signals
  -- Input fields (set when signal is created, parsed from signal text by AI)
  ADD COLUMN IF NOT EXISTS prediction_direction      TEXT CHECK (prediction_direction IN ('up', 'down', 'neutral')),
  ADD COLUMN IF NOT EXISTS prediction_target_price   DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS prediction_timeframe      TEXT,
  ADD COLUMN IF NOT EXISTS prediction_timeframe_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS prediction_check_date     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS baseline_price            DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS baseline_fetched_at       TIMESTAMPTZ,

  -- Result fields (set by predictionCheckerService after check_date passes)
  ADD COLUMN IF NOT EXISTS actual_price              DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS prediction_accuracy       INTEGER CHECK (prediction_accuracy >= 0 AND prediction_accuracy <= 100),
  ADD COLUMN IF NOT EXISTS prediction_result         TEXT CHECK (prediction_result IN ('correct', 'partial', 'incorrect')),
  ADD COLUMN IF NOT EXISTS prediction_checked_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS prediction_explanation    TEXT;

-- Index for the cron job: quickly find signals due for checking
CREATE INDEX IF NOT EXISTS idx_signals_check_due
  ON advisor_signals (prediction_check_date)
  WHERE prediction_checked_at IS NULL AND prediction_check_date IS NOT NULL;

-- Index for filtering by result on signal cards / history page
CREATE INDEX IF NOT EXISTS idx_signals_prediction_result
  ON advisor_signals (prediction_result);

-- Index for advisor accuracy stats queries
CREATE INDEX IF NOT EXISTS idx_signals_advisor_predictions
  ON advisor_signals (advisor_id, prediction_result);

-- Index for direction filtering
CREATE INDEX IF NOT EXISTS idx_signals_prediction_direction
  ON advisor_signals (prediction_direction);
