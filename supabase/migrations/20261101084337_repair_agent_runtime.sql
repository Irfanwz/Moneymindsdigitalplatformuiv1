-- MoneyMinds agent repair. Run this entire file in the live project SQL editor.
-- Idempotent: preserves existing rows. Does not run AI or send messages.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $$ BEGIN IF to_regclass('public.platform_users') IS NULL THEN RAISE EXCEPTION 'Wrong or uninitialized database: public.platform_users is required.'; END IF; END $$;

SET LOCAL search_path = public, pg_catalog;

DO $$ BEGIN IF to_regclass('public.startup_profiles') IS NULL THEN
create table if not exists public.startup_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.platform_users(id) on delete cascade,
  company_name text not null,
  tagline text,
  industry text not null,
  founded_year integer,
  location text,
  description text not null,
  website text,
  linkedin text,
  twitter text,
  contact_email text,
  stage text not null,
  total_raised text,
  funding_goal text,
  valuation text,
  pitch text,
  photo_url text,
  categories text[] not null default '{}',
  team_members jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  show_contact_info boolean not null default true,
  allow_advisor_invitations boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.startup_profiles FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.startup_profiles TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.investor_profiles') IS NULL THEN
create table if not exists public.investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.platform_users(id) on delete cascade,
  investor_type text not null default '',
  preferred_stage text not null default '',
  min_investment text not null default '',
  max_investment text not null default '',
  portfolio_size text not null default '',
  investment_thesis text not null default '',
  industries text[] not null default '{}',
  other_interests text not null default '',
  geographic_focus text not null default '',
  firm_name text not null default '',
  title text not null default '',
  website text not null default '',
  linkedin text not null default '',
  twitter text not null default '',
  contact_email text not null default '',
  bio text not null default '',
  photo_url text,
  is_private boolean not null default true,
  anonymous_browsing boolean not null default false,
  show_investment_preferences boolean not null default true,
  allow_connection_requests boolean not null default true,
  show_contact_info boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.investor_profiles FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.investor_profiles TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.advisor_profiles') IS NULL THEN
create table if not exists public.advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.platform_users(id) on delete cascade,
  title text not null default '',
  bio text not null default '',
  website text not null default '',
  linkedin text not null default '',
  twitter text not null default '',
  contact_email text not null default '',
  photo_url text,
  years_experience integer,
  clients_helped integer,
  specialization text not null default '',
  previous_roles text not null default '',
  expertise_areas jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  industries text[] not null default '{}',
  preferred_stage text not null default '',
  engagement_type text not null default '',
  availability text not null default '',
  typical_rate text not null default '',
  services_offered text not null default '',
  default_group_type text not null default 'free',
  default_joining_fee text not null default '',
  default_monthly_fee text not null default '',
  auto_approve_members boolean not null default true,
  allow_group_discovery boolean not null default true,
  enable_payment_processing boolean not null default false,
  payment_email text not null default '',
  tax_id text not null default '',
  is_public boolean not null default true,
  show_contact_info boolean not null default true,
  allow_connection_requests boolean not null default true,
  show_testimonials boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.advisor_profiles FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.advisor_profiles TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.advisor_groups') IS NULL THEN
create table if not exists public.advisor_groups (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.platform_users(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'general',
  is_private boolean not null default false,
  is_paid boolean not null default false,
  joining_fee text not null default '',
  monthly_fee text not null default '',
  member_count integer not null default 0,
  signal_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.advisor_groups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.advisor_groups FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.advisor_groups TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.advisor_group_members') IS NULL THEN
create table if not exists public.advisor_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.advisor_groups(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique(group_id, user_id)
);
ALTER TABLE public.advisor_group_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.advisor_group_members FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.advisor_group_members TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.advisor_signals') IS NULL THEN
create table if not exists public.advisor_signals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.advisor_groups(id) on delete cascade,
  advisor_id uuid not null references public.platform_users(id) on delete cascade,
  post_type text not null default 'signal' check (post_type in ('signal', 'post')),
  title text not null,
  content text not null default '',
  signal_type text not null default '' check (signal_type in ('buy', 'sell', 'hold', 'alert', '')),
  target_price text not null default '',
  time_horizon text not null default '',
  confidence_level text not null default 'medium',
  tags text[] not null default '{}',
  notify_members boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.advisor_signals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.advisor_signals FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.advisor_signals TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.trainings') IS NULL THEN
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.platform_users(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'free' check (type in ('free', 'paid')),
  price integer not null default 0,
  format text not null default 'online' check (format in ('online', 'in-person', 'hybrid')),
  duration text not null default '',
  schedule text not null default '',
  capacity integer not null default 50,
  enrolled integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed')),
  topics text[] not null default '{}',
  location text not null default '',
  target_audience text[] not null default '{}',
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trainings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.trainings TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.training_enrollments') IS NULL THEN
create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  progress integer not null default 0,
  enrolled_at timestamptz not null default timezone('utc', now()),
  unique(training_id, user_id)
);
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.training_enrollments FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.training_enrollments TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.password_reset_tokens') IS NULL THEN
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.password_reset_tokens FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.password_reset_tokens TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.signal_comments') IS NULL THEN
create table if not exists public.signal_comments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.advisor_signals(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.signal_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signal_comments FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.signal_comments TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.signal_reactions') IS NULL THEN
create table if not exists public.signal_reactions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.advisor_signals(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like', 'insightful', 'bearish', 'bullish')),
  created_at timestamptz not null default timezone('utc', now()),
  unique(signal_id, user_id, reaction)
);
ALTER TABLE public.signal_reactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signal_reactions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.signal_reactions TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.notifications') IS NULL THEN
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info' check (type in ('info', 'success', 'warning')),
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.connections') IS NULL THEN
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.platform_users(id) on delete cascade,
  to_user_id uuid not null references public.platform_users(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(from_user_id, to_user_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.connections FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.connections TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.platform_settings') IS NULL THEN
create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  updated_by uuid references public.platform_users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.payments') IS NULL THEN
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id),
  item_type text not null check (item_type in ('group_join', 'group_monthly', 'training')),
  item_id text not null,
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text default 'card',
  transaction_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payments FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payments TO service_role;
END IF; END $$;

CREATE TABLE IF NOT EXISTS public.two_fa_secrets (
 user_id uuid PRIMARY KEY REFERENCES public.platform_users(id) ON DELETE CASCADE,
 secret text NOT NULL, enabled boolean NOT NULL DEFAULT false,
 backup_codes text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.two_fa_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.two_fa_secrets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.two_fa_secrets TO service_role;




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


ALTER TABLE ai_verifications ENABLE ROW LEVEL SECURITY;







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





ALTER TABLE advisor_signals
  
  ADD COLUMN IF NOT EXISTS prediction_direction      TEXT CHECK (prediction_direction IN ('up', 'down', 'neutral')),
  ADD COLUMN IF NOT EXISTS prediction_target_price   DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS prediction_timeframe      TEXT,
  ADD COLUMN IF NOT EXISTS prediction_timeframe_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS prediction_check_date     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS baseline_price            DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS baseline_fetched_at       TIMESTAMPTZ,

  
  ADD COLUMN IF NOT EXISTS actual_price              DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS prediction_accuracy       INTEGER CHECK (prediction_accuracy >= 0 AND prediction_accuracy <= 100),
  ADD COLUMN IF NOT EXISTS prediction_result         TEXT CHECK (prediction_result IN ('correct', 'partial', 'incorrect')),
  ADD COLUMN IF NOT EXISTS prediction_checked_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS prediction_explanation    TEXT;


CREATE INDEX IF NOT EXISTS idx_signals_check_due
  ON advisor_signals (prediction_check_date)
  WHERE prediction_checked_at IS NULL AND prediction_check_date IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_signals_prediction_result
  ON advisor_signals (prediction_result);


CREATE INDEX IF NOT EXISTS idx_signals_advisor_predictions
  ON advisor_signals (advisor_id, prediction_result);


CREATE INDEX IF NOT EXISTS idx_signals_prediction_direction
  ON advisor_signals (prediction_direction);




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


ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;









ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS credibility_score      INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  ADD COLUMN IF NOT EXISTS credibility_tier       TEXT,
  ADD COLUMN IF NOT EXISTS credibility_updated_at TIMESTAMPTZ;


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


ALTER TABLE credibility_scores_history ENABLE ROW LEVEL SECURITY;



ALTER TABLE public.advisor_signals ADD COLUMN IF NOT EXISTS prediction_ticker text;
CREATE TABLE IF NOT EXISTS public.agent_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
 agent_key text NOT NULL, target_id text NOT NULL DEFAULT 'self',
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','completed','failed','skipped')),
 stage text NOT NULL DEFAULT 'Waiting to start', progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 result jsonb, error text, created_at timestamptz NOT NULL DEFAULT now(),
 started_at timestamptz, completed_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS events jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS agent_runs_one_active ON public.agent_runs(user_id,agent_key,target_id) WHERE status IN ('queued','running');
CREATE INDEX IF NOT EXISTS agent_runs_owner_date ON public.agent_runs(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS agent_runs_status ON public.agent_runs(status,updated_at);
CREATE TABLE IF NOT EXISTS public.agent_follows (
 user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
 agent_key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,agent_key)
);
-- Application authentication and ownership checks happen in Express. These tables
-- must be accessible only through the server's service-role connection.
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_follows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.agent_runs, public.agent_follows, public.ai_verifications, public.profile_verifications, public.credibility_scores_history FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.agent_runs, public.agent_follows, public.ai_verifications, public.profile_verifications, public.credibility_scores_history TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
