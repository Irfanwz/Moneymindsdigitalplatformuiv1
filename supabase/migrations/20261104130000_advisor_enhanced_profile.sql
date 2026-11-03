BEGIN;

ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS regulatory_license_no    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS regulatory_body          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS license_expiry_date      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education_university     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education_degree         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education_year           text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS previous_firm            text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS previous_role            text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS previous_firm_duration   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS primary_tickers          text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages                text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conflict_disclosure      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS performance_claim        text NOT NULL DEFAULT '';

COMMIT;
