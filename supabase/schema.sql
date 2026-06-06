create extension if not exists "pgcrypto";

create table if not exists public.platform_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  location text,
  bio text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_roles text[] not null default '{}',
  approved_roles text[] not null default '{}',
  is_admin boolean not null default false,
  admin_notes text,
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid references public.platform_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_platform_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_platform_users_updated_at on public.platform_users;

create trigger set_platform_users_updated_at
before update on public.platform_users
for each row
execute function public.set_platform_users_updated_at();

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

create or replace function public.set_startup_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_startup_profiles_updated_at on public.startup_profiles;

create trigger set_startup_profiles_updated_at
before update on public.startup_profiles
for each row
execute function public.set_startup_profiles_updated_at();

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

create or replace function public.set_investor_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_investor_profiles_updated_at on public.investor_profiles;

create trigger set_investor_profiles_updated_at
before update on public.investor_profiles
for each row
execute function public.set_investor_profiles_updated_at();

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

create or replace function public.set_advisor_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_advisor_profiles_updated_at on public.advisor_profiles;

create trigger set_advisor_profiles_updated_at
before update on public.advisor_profiles
for each row
execute function public.set_advisor_profiles_updated_at();

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

create or replace function public.set_advisor_groups_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_advisor_groups_updated_at on public.advisor_groups;
create trigger set_advisor_groups_updated_at
before update on public.advisor_groups
for each row execute function public.set_advisor_groups_updated_at();

create table if not exists public.advisor_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.advisor_groups(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique(group_id, user_id)
);

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

create or replace function public.set_advisor_signals_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_advisor_signals_updated_at on public.advisor_signals;
create trigger set_advisor_signals_updated_at
before update on public.advisor_signals
for each row execute function public.set_advisor_signals_updated_at();

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

create or replace function public.set_trainings_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_trainings_updated_at on public.trainings;
create trigger set_trainings_updated_at
before update on public.trainings
for each row execute function public.set_trainings_updated_at();

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  progress integer not null default 0,
  enrolled_at timestamptz not null default timezone('utc', now()),
  unique(training_id, user_id)
);

-- ============================================================
-- Password Reset Tokens
-- ============================================================

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_password_reset_tokens_token on public.password_reset_tokens(token);

-- ============================================================
-- Signal Comments & Reactions
-- ============================================================

create table if not exists public.signal_comments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.advisor_signals(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_signal_comments_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_signal_comments_updated_at on public.signal_comments;
create trigger set_signal_comments_updated_at
before update on public.signal_comments
for each row execute function public.set_signal_comments_updated_at();

create index if not exists idx_signal_comments_signal_id on public.signal_comments(signal_id);

create table if not exists public.signal_reactions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.advisor_signals(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like', 'insightful', 'bearish', 'bullish')),
  created_at timestamptz not null default timezone('utc', now()),
  unique(signal_id, user_id, reaction)
);

create index if not exists idx_signal_reactions_signal_id on public.signal_reactions(signal_id);

-- ============================================================
-- Notifications
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info' check (type in ('info', 'success', 'warning')),
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read);

-- ============================================================
-- Connections
-- ============================================================

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

create or replace function public.set_connections_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_connections_updated_at on public.connections;
create trigger set_connections_updated_at
before update on public.connections
for each row execute function public.set_connections_updated_at();

create index if not exists idx_connections_from_user on public.connections(from_user_id);
create index if not exists idx_connections_to_user on public.connections(to_user_id);

-- ============================================================
-- Platform Settings (admin-configurable)
-- ============================================================

create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  updated_by uuid references public.platform_users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Seed default settings
insert into public.platform_settings (key, value) values
  ('public_registration', 'true'),
  ('auto_approve_users', 'false'),
  ('require_verification', 'true'),
  ('email_notifications', 'true'),
  ('maintenance_mode', 'false')
on conflict (key) do nothing;
