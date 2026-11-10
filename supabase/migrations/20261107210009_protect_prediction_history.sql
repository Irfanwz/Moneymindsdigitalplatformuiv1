-- Preserve pending and completed prediction evidence, including group cascades.
BEGIN;
ALTER TABLE public.advisor_signals ADD COLUMN IF NOT EXISTS prediction_price_evidence jsonb;
ALTER TABLE public.advisor_signals ADD COLUMN IF NOT EXISTS prediction_asset_type text CHECK (prediction_asset_type IN ('stock','crypto'));

CREATE OR REPLACE FUNCTION public.protect_prediction_history()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  committed boolean := OLD.prediction_check_date IS NOT NULL OR OLD.baseline_price IS NOT NULL OR OLD.prediction_checked_at IS NOT NULL;
  content_keys text[] := ARRAY['advisor_id','group_id','created_at','post_type','title','content','signal_type','target_price','time_horizon','confidence_level','tags'];
  prediction_keys text[] := ARRAY['prediction_ticker','prediction_asset_type','prediction_direction','prediction_target_price','prediction_timeframe','prediction_timeframe_days','prediction_check_date','baseline_price','baseline_fetched_at'];
  outcome_keys text[] := ARRAY['actual_price','prediction_accuracy','prediction_result','prediction_checked_at','prediction_explanation','prediction_price_evidence'];
  key text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF committed THEN RAISE EXCEPTION 'PREDICTION_HISTORY_LOCKED'; END IF;
    RETURN OLD;
  END IF;
  IF committed THEN
    FOREACH key IN ARRAY content_keys || prediction_keys LOOP
      IF to_jsonb(OLD)->key IS DISTINCT FROM to_jsonb(NEW)->key THEN
        RAISE EXCEPTION 'PREDICTION_HISTORY_LOCKED';
      END IF;
    END LOOP;
  END IF;
  IF OLD.prediction_checked_at IS NOT NULL THEN
    FOREACH key IN ARRAY outcome_keys LOOP
      IF to_jsonb(OLD)->key IS DISTINCT FROM to_jsonb(NEW)->key THEN
        RAISE EXCEPTION 'PREDICTION_HISTORY_LOCKED';
      END IF;
    END LOOP;
  END IF;
  -- Only content edits advance this version; independent sentiment writes must
  -- not invalidate an extraction of the same content.
  FOREACH key IN ARRAY content_keys LOOP
    IF to_jsonb(OLD)->key IS DISTINCT FROM to_jsonb(NEW)->key THEN
      NEW.updated_at := greatest(clock_timestamp(), OLD.updated_at + interval '1 microsecond');
      EXIT;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_prediction_history() FROM PUBLIC, anon, authenticated;
-- Older installations update this timestamp for sentiment writes too, racing
-- the parallel prediction extractor. The replacement above versions content.
DROP TRIGGER IF EXISTS set_advisor_signals_updated_at ON public.advisor_signals;
DROP TRIGGER IF EXISTS protect_prediction_history ON public.advisor_signals;
CREATE TRIGGER protect_prediction_history BEFORE UPDATE OR DELETE ON public.advisor_signals
FOR EACH ROW EXECUTE FUNCTION public.protect_prediction_history();
COMMIT;
