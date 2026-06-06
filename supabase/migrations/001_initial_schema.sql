-- MoneyMinds Database Schema
-- Migration: 001_initial_schema
-- Run this against your Supabase project via the SQL Editor or Supabase CLI

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  phone text default '',
  location text default '',
  bio text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_roles text[] not null default '{}',
  approved_roles text[] not null default '{}',
  is_admin boolean not null default false,
  admin_notes text,
  rejection_reason text,
  approved_by uuid references users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists two_fa_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  secret text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists startup_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  company_name text not null default '',
  industry text not null default '',
  description text not null default '',
  stage text not null default '',
  website text default '',
  team_size integer default 1,
  funding_goal numeric(15,2) default 0,
  linkedin_url text default '',
  pitch_deck_url text default '',
  logo_url text default '',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  investor_type text not null default '',
  industries text[] not null default '{}',
  investment_stages text[] default '{}',
  min_investment numeric(15,2) default 0,
  max_investment numeric(15,2) default 0,
  portfolio text default '',
  linkedin_url text default '',
  avatar_url text default '',
  bio text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  title text not null default '',
  specialization text not null default '',
  industries text[] not null default '{}',
  years_experience integer default 0,
  linkedin_url text default '',
  avatar_url text default '',
  hourly_rate numeric(10,2) default 0,
  availability text default '',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advisor_groups (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text default '',
  category text default '',
  is_private boolean not null default false,
  is_paid boolean not null default false,
  joining_fee text default '0',
  monthly_fee text default '0',
  member_count integer not null default 0,
  signal_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advisor_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references advisor_groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists advisor_signals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references advisor_groups(id) on delete cascade,
  advisor_id uuid not null references users(id) on delete cascade,
  title text not null,
  content text not null default '',
  type text not null default 'general',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signal_comments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references advisor_signals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signal_reactions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references advisor_signals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'insightful', 'bearish', 'bullish')),
  created_at timestamptz not null default now(),
  unique (signal_id, user_id, reaction)
);

create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text default '',
  type text not null default 'free' check (type in ('free', 'paid')),
  price numeric(10,2) default 0,
  capacity integer not null default 100,
  enrolled integer not null default 0,
  duration text default '',
  level text default '',
  tags text[] default '{}',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_enrollments (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'enrolled' check (status in ('enrolled', 'completed', 'dropped')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (training_id, user_id)
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id uuid not null references users(id) on delete cascade,
  message text default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_type text not null check (item_type in ('group_join', 'group_monthly', 'training')),
  item_id uuid not null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text default 'card',
  transaction_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_status on users(status);
create index if not exists idx_advisor_groups_advisor_id on advisor_groups(advisor_id);
create index if not exists idx_advisor_signals_group_id on advisor_signals(group_id);
create index if not exists idx_training_enrollments_user_id on training_enrollments(user_id);
create index if not exists idx_training_enrollments_training_id on training_enrollments(training_id);
create index if not exists idx_connections_from_user on connections(from_user_id);
create index if not exists idx_connections_to_user on connections(to_user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_payments_user_id on payments(user_id);
