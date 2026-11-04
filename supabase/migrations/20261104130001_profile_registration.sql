BEGIN;

-- Full onboarding submissions and evidence metadata are private to their owner
-- and authorized reviewers through the server. No browser Data API access.
CREATE TABLE public.profile_applications (
  user_id uuid PRIMARY KEY REFERENCES public.platform_users(id) ON DELETE CASCADE,
  details jsonb NOT NULL CHECK (jsonb_typeof(details) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_applications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.profile_applications TO service_role;

-- Invoker rights: only the server's service role can call this transaction.
-- A failure in any role profile or the application rolls back the account too.
CREATE FUNCTION public.create_profile_application(
  p_user jsonb, p_startup jsonb, p_investor jsonb, p_advisor jsonb, p_application jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  saved_user public.platform_users;
BEGIN
  INSERT INTO public.platform_users(id, full_name, email, password_hash, phone, location, bio, requested_roles)
  SELECT u.id, u.full_name, lower(u.email), u.password_hash, u.phone, u.location, u.bio, u.requested_roles
  FROM jsonb_populate_record(NULL::public.platform_users, p_user) u
  RETURNING * INTO saved_user;

  IF p_startup IS NOT NULL THEN
    INSERT INTO public.startup_profiles(user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    SELECT r.user_id, r.company_name, r.tagline, r.industry, r.founded_year, r.location, r.description, r.website, r.linkedin, r.twitter, r.contact_email, r.stage, r.total_raised, r.funding_goal, r.valuation, r.pitch, r.categories, r.team_members, r.is_public, r.show_contact_info, r.allow_advisor_invitations
    FROM jsonb_populate_record(NULL::public.startup_profiles, p_startup || jsonb_build_object('user_id', saved_user.id)) r;
  END IF;

  IF p_investor IS NOT NULL THEN
    INSERT INTO public.investor_profiles(user_id, investor_type, preferred_stage, min_investment, max_investment, portfolio_size, investment_thesis, industries, other_interests, geographic_focus, firm_name, title, website, linkedin, twitter, contact_email, bio, is_private, anonymous_browsing, show_investment_preferences, allow_connection_requests, show_contact_info)
    SELECT r.user_id, r.investor_type, r.preferred_stage, r.min_investment, r.max_investment, r.portfolio_size, r.investment_thesis, r.industries, r.other_interests, r.geographic_focus, r.firm_name, r.title, r.website, r.linkedin, r.twitter, r.contact_email, r.bio, r.is_private, r.anonymous_browsing, r.show_investment_preferences, r.allow_connection_requests, r.show_contact_info
    FROM jsonb_populate_record(NULL::public.investor_profiles, p_investor || jsonb_build_object('user_id', saved_user.id)) r;
  END IF;

  IF p_advisor IS NOT NULL THEN
    INSERT INTO public.advisor_profiles(user_id, title, bio, website, linkedin, twitter, contact_email, years_experience, clients_helped, specialization, previous_roles, expertise_areas, certifications, industries, preferred_stage, engagement_type, availability, typical_rate, services_offered, regulatory_license_no, regulatory_body, license_expiry_date, education_university, education_degree, education_year, previous_firm, previous_role, previous_firm_duration, primary_tickers, languages, conflict_disclosure, performance_claim, default_group_type, default_joining_fee, default_monthly_fee, auto_approve_members, allow_group_discovery, enable_payment_processing, payment_email, tax_id, is_public, show_contact_info, allow_connection_requests, show_testimonials)
    SELECT r.user_id, r.title, r.bio, r.website, r.linkedin, r.twitter, r.contact_email, r.years_experience, r.clients_helped, r.specialization, r.previous_roles, r.expertise_areas, r.certifications, r.industries, r.preferred_stage, r.engagement_type, r.availability, r.typical_rate, r.services_offered, r.regulatory_license_no, r.regulatory_body, r.license_expiry_date, r.education_university, r.education_degree, r.education_year, r.previous_firm, r.previous_role, r.previous_firm_duration, r.primary_tickers, r.languages, r.conflict_disclosure, r.performance_claim, r.default_group_type, r.default_joining_fee, r.default_monthly_fee, r.auto_approve_members, r.allow_group_discovery, r.enable_payment_processing, r.payment_email, r.tax_id, r.is_public, r.show_contact_info, r.allow_connection_requests, r.show_testimonials
    FROM jsonb_populate_record(NULL::public.advisor_profiles, p_advisor || jsonb_build_object('user_id', saved_user.id)) r;
  END IF;

  INSERT INTO public.profile_applications(user_id, details) VALUES (saved_user.id, p_application);
  RETURN to_jsonb(saved_user);
END;
$$;
REVOKE ALL ON FUNCTION public.create_profile_application(jsonb,jsonb,jsonb,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_application(jsonb,jsonb,jsonb,jsonb,jsonb) TO service_role;
COMMIT;
