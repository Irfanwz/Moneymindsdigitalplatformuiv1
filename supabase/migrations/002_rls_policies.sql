-- MoneyMinds Row Level Security Policies
-- Migration: 002_rls_policies
-- IMPORTANT: Supabase auth.uid() refers to the authenticated user's UUID from Supabase Auth.
-- The app uses its own JWT (not Supabase Auth), so these policies use the service role key
-- for all backend operations (bypasses RLS). Enable RLS as a second layer of defence.

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

alter table users enable row level security;
alter table password_reset_tokens enable row level security;
alter table two_fa_secrets enable row level security;
alter table startup_profiles enable row level security;
alter table investor_profiles enable row level security;
alter table advisor_profiles enable row level security;
alter table advisor_groups enable row level security;
alter table advisor_group_members enable row level security;
alter table advisor_signals enable row level security;
alter table signal_comments enable row level security;
alter table signal_reactions enable row level security;
alter table trainings enable row level security;
alter table training_enrollments enable row level security;
alter table connections enable row level security;
alter table notifications enable row level security;
alter table payments enable row level security;

-- ============================================================
-- SERVICE ROLE BYPASS
-- All backend API calls use the Supabase service role key which bypasses RLS.
-- The policies below apply when using the anon key (e.g. direct client access).
-- ============================================================

-- Users: can only read their own record via anon key
create policy "Users can read own record" on users
  for select using (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Profiles: users can only read/write their own profiles
create policy "Own startup profile" on startup_profiles
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Own investor profile" on investor_profiles
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Own advisor profile" on advisor_profiles
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Advisor groups: public read for non-private groups; write only by owner
create policy "Public groups are readable" on advisor_groups
  for select using (is_private = false);

create policy "Advisors can manage own groups" on advisor_groups
  for all using (advisor_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Group members: visible to group advisor and member themselves
create policy "Own group memberships" on advisor_group_members
  for select using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Trainings: all authenticated users can read; advisors can manage own
create policy "Trainings are publicly readable" on trainings
  for select using (true);

create policy "Advisors manage own trainings" on trainings
  for all using (advisor_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Enrollments: users see only their own
create policy "Own enrollments" on training_enrollments
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Connections: users see connections they are part of
create policy "Own connections" on connections
  for select using (
    from_user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    or to_user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Notifications: users only see their own
create policy "Own notifications" on notifications
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Payments: users only see their own
create policy "Own payments" on payments
  for select using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- 2FA secrets: users only see/manage their own
create policy "Own 2FA secret" on two_fa_secrets
  for all using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Password reset tokens: deny all direct access (service role only)
create policy "No direct access to reset tokens" on password_reset_tokens
  for all using (false);
