-- ============================================================
-- MoneyMinds: Seed 100 Startup Accounts (Direct SQL)
-- ============================================================
-- Run this in Supabase SQL Editor on your LIVE database.
-- Password for all accounts: MoneyMinds@Test2026
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- ============================================================

BEGIN;

-- 1. LedgerLoop (Lagos, Nigeria)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ngozi Ogunleye', 'ngozi.ogunleye@ledgerloop.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+234 647 3097100', 'Lagos, Nigeria', 'LedgerLoop wants to connect with fintech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'LedgerLoop', 'Chief Executive Officer at LedgerLoop', 'Financial Technology (FinTech)', 2024, 'Lagos, Nigeria', 'LedgerLoop is a cross-border payments platform that lets African SMEs collect and settle invoices in local currencies within minutes. We have a working prototype, 2 signed pilot partners in Nigeria and a waitlist of 1,500 early users. Our edge is bank-grade security and a compliance-first architecture built with local regulators in mind.', 'https://www.ledgerloop.example.com', 'https://www.linkedin.com/company/ledgerloop-sample', '', 'ngozi.ogunleye@ledgerloop.example.com', 'pre-seed', '$260K', '$1M', '', 'LedgerLoop wants to connect with fintech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Financial Technology (FinTech)}', '[{"name":"Emeka Mensah","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/emeka-mensah-sample"},{"name":"Kwame Okafor","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/kwame-okafor-sample"},{"name":"Mei Hasegawa","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/mei-hasegawa-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Lagos","country":"Nigeria","profiles":{"startup":{"companyName":"LedgerLoop","industry":"Financial Technology (FinTech)","stage":"pre-seed","description":"LedgerLoop is a cross-border payments platform that lets African SMEs collect and settle invoices in local currencies within minutes. We have a working prototype, 2 signed pilot partners in Nigeria and a waitlist of 1,500 early users. Our edge is bank-grade security and a compliance-first architecture built with local regulators in mind.","website":"https://www.ledgerloop.example.com","linkedin":"https://www.linkedin.com/company/ledgerloop-sample","foundingYear":"2024","teamSize":"4","fundingRaised":"260000","fundingSought":"1000000","businessRegistration":"Registered","businessRegistrationNumber":"RC 9491796","registrationAuthorityJurisdiction":"Corporate Affairs Commission (CAC), Nigeria","teamMembers":[{"id":"f23d5e08-845f-4fb7-87f2-06248cf92e1d","name":"Emeka Mensah","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/emeka-mensah-sample"},{"id":"6e9d56fa-bc22-4b01-a3d6-60200a5fadb0","name":"Kwame Okafor","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/kwame-okafor-sample"},{"id":"294838d6-0032-4045-9eb1-70629b923109","name":"Mei Hasegawa","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/mei-hasegawa-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 2. Kinetic Credit (Toronto, Canada)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Claire Sullivan', 'claire.sullivan@kineticcredit.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 322 5039989', 'Toronto, Canada', 'We are joining MoneyMinds to meet early-stage investors who understand fintech, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Kinetic Credit', 'Chief Executive Officer at Kinetic Credit', 'Financial Technology (FinTech)', 2024, 'Toronto, Canada', 'Kinetic Credit is an AI underwriting engine that gives thin-file borrowers fair and transparent credit decisions. We have a working prototype, 6 signed pilot partners in Canada and a waitlist of 3,350 early users. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.', 'https://www.kineticcredit.example.com', 'https://www.linkedin.com/company/kineticcredit-sample', '', 'claire.sullivan@kineticcredit.example.com', 'pre-seed', '$265K', '$550K', '', 'We are joining MoneyMinds to meet early-stage investors who understand fintech, validate our roadmap with experienced advisors and close our first institutional round.', '{Financial Technology (FinTech)}', '[{"name":"Andrew Whitaker","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/andrew-whitaker-sample"},{"name":"Sneha Rao","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/sneha-rao-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Toronto","country":"Canada","profiles":{"startup":{"companyName":"Kinetic Credit","industry":"Financial Technology (FinTech)","stage":"pre-seed","description":"Kinetic Credit is an AI underwriting engine that gives thin-file borrowers fair and transparent credit decisions. We have a working prototype, 6 signed pilot partners in Canada and a waitlist of 3,350 early users. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.","website":"https://www.kineticcredit.example.com","linkedin":"https://www.linkedin.com/company/kineticcredit-sample","foundingYear":"2024","teamSize":"4","fundingRaised":"265000","fundingSought":"550000","businessRegistration":"Registered","businessRegistrationNumber":"Corporation No. 9864684-2","registrationAuthorityJurisdiction":"Corporations Canada, Canada","teamMembers":[{"id":"ce24674a-a816-405a-8625-01aae926be8a","name":"Andrew Whitaker","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/andrew-whitaker-sample"},{"id":"5018f9a5-a981-4b11-88a3-305b3864392e","name":"Sneha Rao","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/sneha-rao-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 3. NovaRemit (Dubai, United Arab Emirates)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Layla Idrissi', 'layla.idrissi@novaremit.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+971 310 8681273', 'Dubai, United Arab Emirates', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'NovaRemit', 'Co-Founder & COO at NovaRemit', 'Financial Technology (FinTech)', 2019, 'Dubai, United Arab Emirates', 'NovaRemit is a low-cost remittance app connecting Gulf workers with families across South Asia and Africa. We serve 500 customers across 6 countries and generate $1.8M in annual recurring revenue. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.', 'https://www.novaremit.example.com', 'https://www.linkedin.com/company/novaremit-sample', '', 'layla.idrissi@novaremit.example.com', 'series-a', '$4M', '$26M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Financial Technology (FinTech)}', '[{"name":"Pieter Sithole","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/pieter-sithole-sample"},{"name":"Layla Mansour","role":"Head of Product","linkedin":"https://www.linkedin.com/in/layla-mansour-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Dubai","country":"United Arab Emirates","profiles":{"startup":{"companyName":"NovaRemit","industry":"Financial Technology (FinTech)","stage":"series-a","description":"NovaRemit is a low-cost remittance app connecting Gulf workers with families across South Asia and Africa. We serve 500 customers across 6 countries and generate $1.8M in annual recurring revenue. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.","website":"https://www.novaremit.example.com","linkedin":"https://www.linkedin.com/company/novaremit-sample","foundingYear":"2019","teamSize":"62","fundingRaised":"4000000","fundingSought":"26000000","businessRegistration":"Registered","businessRegistrationNumber":"DED-304942","registrationAuthorityJurisdiction":"Dubai Department of Economy and Tourism, United Arab Emirates","teamMembers":[{"id":"2dd5b6e8-c8fc-476b-83e7-37b816e0f0f4","name":"Pieter Sithole","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/pieter-sithole-sample"},{"id":"43f3c28d-5ae1-4e40-9f66-e6f25f93ad38","name":"Layla Mansour","role":"Head of Product","linkedin":"https://www.linkedin.com/in/layla-mansour-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 4. Paisa Bridge (Karachi, Pakistan)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Faisal Rahman', 'faisal.rahman@paisabridge.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+92 991 4420496', 'Karachi, Pakistan', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Paisa Bridge', 'Founder & Managing Director at Paisa Bridge', 'Financial Technology (FinTech)', 2018, 'Karachi, Pakistan', 'Paisa Bridge is a mobile-first earned-wage-access and micro-savings app for gig and factory workers. We operate in 7 markets with 6,900+ customers and $22.2M in annual recurring revenue. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.', 'https://www.paisabridge.example.com', 'https://www.linkedin.com/company/paisabridge-sample', '', 'faisal.rahman@paisabridge.example.com', 'series-b', '$32M', '$85M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Financial Technology (FinTech)}', '[{"name":"Zain Mirza","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/zain-mirza-sample"},{"name":"Carolina Souza","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/carolina-souza-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Karachi","country":"Pakistan","profiles":{"startup":{"companyName":"Paisa Bridge","industry":"Financial Technology (FinTech)","stage":"series-b","description":"Paisa Bridge is a mobile-first earned-wage-access and micro-savings app for gig and factory workers. We operate in 7 markets with 6,900+ customers and $22.2M in annual recurring revenue. Our proprietary risk models cut onboarding time from days to minutes while keeping losses low.","website":"https://www.paisabridge.example.com","linkedin":"https://www.linkedin.com/company/paisabridge-sample","foundingYear":"2018","teamSize":"204","fundingRaised":"32000000","fundingSought":"85000000","businessRegistration":"Registered","businessRegistrationNumber":"SECP Reg. No. 4874473","registrationAuthorityJurisdiction":"Securities and Exchange Commission of Pakistan (SECP), Pakistan","teamMembers":[{"id":"48d1861f-0883-41ae-831c-f12def1d25cf","name":"Zain Mirza","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/zain-mirza-sample"},{"id":"3d2fff6f-7959-4123-8fe1-796e94b914bc","name":"Carolina Souza","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/carolina-souza-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 5. CareNexa (Bengaluru, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Meera Joshi', 'meera.joshi@carenexa.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 342 2560791', 'Bengaluru, India', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'CareNexa', 'Co-Founder & COO at CareNexa', 'Healthcare Technology (HealthTech)', 2020, 'Bengaluru, India', 'CareNexa is a remote patient-monitoring platform that helps clinics manage chronic diabetes and hypertension at home. We operate in 19 markets with 4,400+ customers and $38.6M in annual recurring revenue. Early pilots show measurable reductions in missed appointments and readmissions.', 'https://www.carenexa.example.com', 'https://www.linkedin.com/company/carenexa-sample', '', 'meera.joshi@carenexa.example.com', 'series-b', '$30M', '$85M', '', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', '{Healthcare Technology (HealthTech)}', '[{"name":"Karan Gupta","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/karan-gupta-sample"},{"name":"Ananya Gupta","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/ananya-gupta-sample"},{"name":"Ananya Chopra","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/ananya-chopra-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Bengaluru","country":"India","profiles":{"startup":{"companyName":"CareNexa","industry":"Healthcare Technology (HealthTech)","stage":"series-b","description":"CareNexa is a remote patient-monitoring platform that helps clinics manage chronic diabetes and hypertension at home. We operate in 19 markets with 4,400+ customers and $38.6M in annual recurring revenue. Early pilots show measurable reductions in missed appointments and readmissions.","website":"https://www.carenexa.example.com","linkedin":"https://www.linkedin.com/company/carenexa-sample","foundingYear":"2020","teamSize":"106","fundingRaised":"30000000","fundingSought":"85000000","businessRegistration":"Registered","businessRegistrationNumber":"U72900KA2020PTC320794","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"f9266a15-c9ca-47c1-9fe3-9c2a0c006236","name":"Karan Gupta","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/karan-gupta-sample"},{"id":"e76b6484-7713-4d7d-8ce7-16891f99f446","name":"Ananya Gupta","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/ananya-gupta-sample"},{"id":"b5c55f49-06be-4586-902c-11161473309a","name":"Ananya Chopra","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/ananya-chopra-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 6. Medivance Labs (Berlin, Germany)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Paul Neumann', 'paul.neumann@medivancelabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+49 869 7152173', 'Berlin, Germany', 'Our goal is to find strategic healthtech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Medivance Labs', 'Co-Founder & CTO at Medivance Labs', 'Healthcare Technology (HealthTech)', 2022, 'Berlin, Germany', 'Medivance Labs is a prescription digital therapeutic that treats chronic insomnia through guided behavioural programmes. The product is live with 26 paying customers and 19% month-over-month revenue growth. Early pilots show measurable reductions in missed appointments and readmissions.', 'https://www.medivancelabs.example.com', 'https://www.linkedin.com/company/medivancelabs-sample', '', 'paul.neumann@medivancelabs.example.com', 'seed', '$1.8M', '$3.2M', '', 'Our goal is to find strategic healthtech investors and expert financial guidance to fund product development and expand into new regions.', '{Healthcare Technology (HealthTech)}', '[{"name":"Anna Kruger","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/anna-kruger-sample"},{"name":"Marie Keller","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/marie-keller-sample"},{"name":"Pieter Nel","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/pieter-nel-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Berlin","country":"Germany","profiles":{"startup":{"companyName":"Medivance Labs","industry":"Healthcare Technology (HealthTech)","stage":"seed","description":"Medivance Labs is a prescription digital therapeutic that treats chronic insomnia through guided behavioural programmes. The product is live with 26 paying customers and 19% month-over-month revenue growth. Early pilots show measurable reductions in missed appointments and readmissions.","website":"https://www.medivancelabs.example.com","linkedin":"https://www.linkedin.com/company/medivancelabs-sample","foundingYear":"2022","teamSize":"17","fundingRaised":"1750000","fundingSought":"3200000","businessRegistration":"Registered","businessRegistrationNumber":"HRB 677318","registrationAuthorityJurisdiction":"Handelsregister (Commercial Register), Germany","teamMembers":[{"id":"bc5d8b58-fbed-4641-9748-ee84b2e0f84d","name":"Anna Kruger","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/anna-kruger-sample"},{"id":"7ebea392-b3ef-4b56-a150-4632699166d7","name":"Marie Keller","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/marie-keller-sample"},{"id":"dfa417b0-46b0-4d9b-931c-90818d2dc11c","name":"Pieter Nel","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/pieter-nel-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 7. Pulsewell (Sao Paulo, Brazil)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Santiago Vargas', 'santiago.vargas@pulsewell.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+55 948 7814681', 'Sao Paulo, Brazil', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Pulsewell', 'Co-Founder & COO at Pulsewell', 'Healthcare Technology (HealthTech)', 2018, 'Sao Paulo, Brazil', 'Pulsewell is a tele-triage service that routes patients to the right level of care within minutes. We operate in 15 markets with 7,550+ customers and $51.6M in annual recurring revenue. Our clinical team validates every workflow, and our platform is built to meet data-protection rules such as HIPAA and GDPR.', 'https://www.pulsewell.example.com', 'https://www.linkedin.com/company/pulsewell-sample', '', 'santiago.vargas@pulsewell.example.com', 'series-b', '$21M', '$65M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Healthcare Technology (HealthTech)}', '[{"name":"Joaquin Herrera","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/joaquin-herrera-sample"},{"name":"Ruben Postma","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/ruben-postma-sample"},{"name":"Fernanda Lopez","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/fernanda-lopez-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Sao Paulo","country":"Brazil","profiles":{"startup":{"companyName":"Pulsewell","industry":"Healthcare Technology (HealthTech)","stage":"series-b","description":"Pulsewell is a tele-triage service that routes patients to the right level of care within minutes. We operate in 15 markets with 7,550+ customers and $51.6M in annual recurring revenue. Our clinical team validates every workflow, and our platform is built to meet data-protection rules such as HIPAA and GDPR.","website":"https://www.pulsewell.example.com","linkedin":"https://www.linkedin.com/company/pulsewell-sample","foundingYear":"2018","teamSize":"173","fundingRaised":"21000000","fundingSought":"65000000","businessRegistration":"Registered","businessRegistrationNumber":"CNPJ 77.622.000/0001-20","registrationAuthorityJurisdiction":"Junta Comercial / Receita Federal, Brazil","teamMembers":[{"id":"6dbec39f-9f9c-4734-9c64-f529ba225460","name":"Joaquin Herrera","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/joaquin-herrera-sample"},{"id":"01dbb820-7f01-4154-a94a-27ae2819f142","name":"Ruben Postma","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/ruben-postma-sample"},{"id":"8cb8ff51-ce32-4711-916d-303bef8b4cd8","name":"Fernanda Lopez","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/fernanda-lopez-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 8. ClinTrack Health (Boston, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('James Foster', 'james.foster@clintrackhealth.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 938 4612018', 'Boston, United States', 'Our goal is to find strategic healthtech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ClinTrack Health', 'Co-Founder & COO at ClinTrack Health', 'Healthcare Technology (HealthTech)', 2022, 'Boston, United States', 'ClinTrack Health is a trial-matching platform that connects patients with clinical studies and cuts recruitment time. The product is live with 41 paying customers and 19% month-over-month revenue growth. Early pilots show measurable reductions in missed appointments and readmissions.', 'https://www.clintrackhealth.example.com', 'https://www.linkedin.com/company/clintrackhealth-sample', '', 'james.foster@clintrackhealth.example.com', 'seed', '$2M', '$6.9M', '', 'Our goal is to find strategic healthtech investors and expert financial guidance to fund product development and expand into new regions.', '{Healthcare Technology (HealthTech)}', '[{"name":"Mei Tan","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/mei-tan-sample"},{"name":"Baris Ozturk","role":"Head of Product","linkedin":"https://www.linkedin.com/in/baris-ozturk-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Boston","country":"United States","profiles":{"startup":{"companyName":"ClinTrack Health","industry":"Healthcare Technology (HealthTech)","stage":"seed","description":"ClinTrack Health is a trial-matching platform that connects patients with clinical studies and cuts recruitment time. The product is live with 41 paying customers and 19% month-over-month revenue growth. Early pilots show measurable reductions in missed appointments and readmissions.","website":"https://www.clintrackhealth.example.com","linkedin":"https://www.linkedin.com/company/clintrackhealth-sample","foundingYear":"2022","teamSize":"20","fundingRaised":"2050000","fundingSought":"6900000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 7214154","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"da6a13b8-f58f-418f-bbb5-e8a8b4194658","name":"Mei Tan","role":"Chief Medical Officer","linkedin":"https://www.linkedin.com/in/mei-tan-sample"},{"id":"46dc4df7-d2b4-4e4d-8a7e-6765a814c9a7","name":"Baris Ozturk","role":"Head of Product","linkedin":"https://www.linkedin.com/in/baris-ozturk-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 9. TerraYield (Nairobi, Kenya)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Patrick Niyonzima', 'patrick.niyonzima@terrayield.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+254 846 4283706', 'Nairobi, Kenya', 'TerraYield wants to connect with agritech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'TerraYield', 'Co-Founder & Chief Product Officer at TerraYield', 'Agriculture Technology (AgriTech)', 2025, 'Nairobi, Kenya', 'TerraYield is an AI crop-disease detection app that diagnoses plant problems from a single smartphone photo. We have a working prototype, 4 signed pilot partners in Kenya and letters of intent from 7 enterprise prospects. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.', 'https://www.terrayield.example.com', 'https://www.linkedin.com/company/terrayield-sample', '', 'patrick.niyonzima@terrayield.example.com', 'pre-seed', '$370K', '$1.2M', '', 'TerraYield wants to connect with agritech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Agriculture Technology (AgriTech)}', '[{"name":"Ingabire Njoroge","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/ingabire-njoroge-sample"},{"name":"Jean Wekesa","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/jean-wekesa-sample"},{"name":"Jean Uwimana","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jean-uwimana-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Nairobi","country":"Kenya","profiles":{"startup":{"companyName":"TerraYield","industry":"Agriculture Technology (AgriTech)","stage":"pre-seed","description":"TerraYield is an AI crop-disease detection app that diagnoses plant problems from a single smartphone photo. We have a working prototype, 4 signed pilot partners in Kenya and letters of intent from 7 enterprise prospects. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.","website":"https://www.terrayield.example.com","linkedin":"https://www.linkedin.com/company/terrayield-sample","foundingYear":"2025","teamSize":"7","fundingRaised":"370000","fundingSought":"1200000","businessRegistration":"Registered","businessRegistrationNumber":"PVT-KRZ3181","registrationAuthorityJurisdiction":"Business Registration Service (BRS), Kenya","teamMembers":[{"id":"be036994-a69d-4185-b24d-938d87ebf5c7","name":"Ingabire Njoroge","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/ingabire-njoroge-sample"},{"id":"7159cc2b-d073-4759-993b-7685bbb4a320","name":"Jean Wekesa","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/jean-wekesa-sample"},{"id":"704dd452-36d2-4e68-b9bd-7ceee5a4e8e3","name":"Jean Uwimana","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jean-uwimana-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 10. Cultiva Cloud (Buenos Aires, Argentina)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Luciana Cardenas', 'luciana.cardenas@cultivacloud.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+54 760 9643829', 'Buenos Aires, Argentina', 'We want to connect with investors and advisors who can help us scale Cultiva Cloud beyond Argentina, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Cultiva Cloud', 'Founder & CEO at Cultiva Cloud', 'Agriculture Technology (AgriTech)', 2023, 'Buenos Aires, Argentina', 'Cultiva Cloud is a precision-irrigation platform that cuts water use for large grain and fruit producers. The product is live with 36 paying customers and 15% month-over-month revenue growth. Our agronomy team works directly with growers, which keeps the product practical and adoption high.', 'https://www.cultivacloud.example.com', 'https://www.linkedin.com/company/cultivacloud-sample', '', 'luciana.cardenas@cultivacloud.example.com', 'seed', '$1.1M', '$1.7M', '', 'We want to connect with investors and advisors who can help us scale Cultiva Cloud beyond Argentina, sharpen our go-to-market and prepare for a Series A.', '{Agriculture Technology (AgriTech)}', '[{"name":"Mariana Ramirez","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/mariana-ramirez-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Buenos Aires","country":"Argentina","profiles":{"startup":{"companyName":"Cultiva Cloud","industry":"Agriculture Technology (AgriTech)","stage":"seed","description":"Cultiva Cloud is a precision-irrigation platform that cuts water use for large grain and fruit producers. The product is live with 36 paying customers and 15% month-over-month revenue growth. Our agronomy team works directly with growers, which keeps the product practical and adoption high.","website":"https://www.cultivacloud.example.com","linkedin":"https://www.linkedin.com/company/cultivacloud-sample","foundingYear":"2023","teamSize":"11","fundingRaised":"1125000","fundingSought":"1700000","businessRegistration":"Registered","businessRegistrationNumber":"CUIT 30-14451307-8","registrationAuthorityJurisdiction":"Inspeccion General de Justicia (IGJ), Argentina","teamMembers":[{"id":"87351e84-cb3d-4dc3-82d5-e722e5cb4363","name":"Mariana Ramirez","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/mariana-ramirez-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 11. Verdant Roots (Rotterdam, Netherlands)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Niels Kok', 'niels.kok@verdantroots.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+31 452 8559026', 'Rotterdam, Netherlands', 'We want to connect with investors and advisors who can help us scale Verdant Roots beyond the Netherlands, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Verdant Roots', 'Founder & CEO at Verdant Roots', 'Agriculture Technology (AgriTech)', 2023, 'Rotterdam, Netherlands', 'Verdant Roots is a modular vertical-farming system that grows leafy greens close to city supermarkets. The product is live with 85 paying customers and 22% month-over-month revenue growth. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.', 'https://www.verdantroots.example.com', 'https://www.linkedin.com/company/verdantroots-sample', '', 'niels.kok@verdantroots.example.com', 'seed', '$2M', '$5M', '', 'We want to connect with investors and advisors who can help us scale Verdant Roots beyond the Netherlands, sharpen our go-to-market and prepare for a Series A.', '{Agriculture Technology (AgriTech)}', '[{"name":"Haruto Fujita","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/haruto-fujita-sample"},{"name":"Rui Sim","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rui-sim-sample"},{"name":"Sanne Smit","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sanne-smit-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Rotterdam","country":"Netherlands","profiles":{"startup":{"companyName":"Verdant Roots","industry":"Agriculture Technology (AgriTech)","stage":"seed","description":"Verdant Roots is a modular vertical-farming system that grows leafy greens close to city supermarkets. The product is live with 85 paying customers and 22% month-over-month revenue growth. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.","website":"https://www.verdantroots.example.com","linkedin":"https://www.linkedin.com/company/verdantroots-sample","foundingYear":"2023","teamSize":"12","fundingRaised":"2050000","fundingSought":"5000000","businessRegistration":"Registered","businessRegistrationNumber":"KVK 27435543","registrationAuthorityJurisdiction":"Kamer van Koophandel (KVK), Netherlands","teamMembers":[{"id":"b50c02f6-f3da-4ca7-8c4b-e2a995755ac3","name":"Haruto Fujita","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/haruto-fujita-sample"},{"id":"c6a0a987-f76a-4587-a720-3b3a57b5d3ba","name":"Rui Sim","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rui-sim-sample"},{"id":"b0c7536c-fda1-4d3b-a5bc-c807062e96f2","name":"Sanne Smit","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sanne-smit-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 12. Harvest Mesh (Ho Chi Minh City, Vietnam)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Budi Aquino', 'budi.aquino@harvestmesh.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+84 616 0893211', 'Ho Chi Minh City, Vietnam', 'We want to connect with investors and advisors who can help us scale Harvest Mesh beyond Vietnam, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Harvest Mesh', 'Founder & Managing Director at Harvest Mesh', 'Agriculture Technology (AgriTech)', 2023, 'Ho Chi Minh City, Vietnam', 'Harvest Mesh is a farm-to-export traceability platform that helps coffee and seafood producers meet buyer standards. The product is live with 45 paying customers and 14% month-over-month revenue growth. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.', 'https://www.harvestmesh.example.com', 'https://www.linkedin.com/company/harvestmesh-sample', '', 'budi.aquino@harvestmesh.example.com', 'seed', '$2M', '$3.2M', '', 'We want to connect with investors and advisors who can help us scale Harvest Mesh beyond Vietnam, sharpen our go-to-market and prepare for a Series A.', '{Agriculture Technology (AgriTech)}', '[{"name":"Mai Hassan","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/mai-hassan-sample"},{"name":"Linh Wijaya","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/linh-wijaya-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Ho Chi Minh City","country":"Vietnam","profiles":{"startup":{"companyName":"Harvest Mesh","industry":"Agriculture Technology (AgriTech)","stage":"seed","description":"Harvest Mesh is a farm-to-export traceability platform that helps coffee and seafood producers meet buyer standards. The product is live with 45 paying customers and 14% month-over-month revenue growth. Field and pilot-farm trials report higher yields and lower input costs compared with standard practice.","website":"https://www.harvestmesh.example.com","linkedin":"https://www.linkedin.com/company/harvestmesh-sample","foundingYear":"2023","teamSize":"6","fundingRaised":"1975000","fundingSought":"3200000","businessRegistration":"Registered","businessRegistrationNumber":"MST 5274001927","registrationAuthorityJurisdiction":"Department of Planning and Investment, Vietnam","teamMembers":[{"id":"9c1b24d5-d2b7-423e-99f8-a04490679b6e","name":"Mai Hassan","role":"Head of Agronomy","linkedin":"https://www.linkedin.com/in/mai-hassan-sample"},{"id":"fb16f626-04de-4f00-9a83-669f1391627b","name":"Linh Wijaya","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/linh-wijaya-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 13. LinguaPath (Barcelona, Spain)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Javier Vidal', 'javier.vidal@linguapath.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+34 606 0655219', 'Barcelona, Spain', 'We want to connect with investors and advisors who can help us scale LinguaPath beyond Spain, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'LinguaPath', 'Co-Founder & COO at LinguaPath', 'Education Technology (EdTech)', 2022, 'Barcelona, Spain', 'LinguaPath is an adaptive language-learning platform that prepares professionals for workplace communication. The product is live with 23 paying customers and 12% month-over-month revenue growth. Our adaptive learning engine personalises every lesson and improves completion rates.', 'https://www.linguapath.example.com', 'https://www.linkedin.com/company/linguapath-sample', '', 'javier.vidal@linguapath.example.com', 'seed', '$1.9M', '$3.9M', '', 'We want to connect with investors and advisors who can help us scale LinguaPath beyond Spain, sharpen our go-to-market and prepare for a Series A.', '{Education Technology (EdTech)}', '[{"name":"Elena Almeida","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/elena-almeida-sample"},{"name":"Lucia Castillo","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/lucia-castillo-sample"},{"name":"Pablo Cardoso","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/pablo-cardoso-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Barcelona","country":"Spain","profiles":{"startup":{"companyName":"LinguaPath","industry":"Education Technology (EdTech)","stage":"seed","description":"LinguaPath is an adaptive language-learning platform that prepares professionals for workplace communication. The product is live with 23 paying customers and 12% month-over-month revenue growth. Our adaptive learning engine personalises every lesson and improves completion rates.","website":"https://www.linguapath.example.com","linkedin":"https://www.linkedin.com/company/linguapath-sample","foundingYear":"2022","teamSize":"10","fundingRaised":"1925000","fundingSought":"3900000","businessRegistration":"Registered","businessRegistrationNumber":"B93912532","registrationAuthorityJurisdiction":"Registro Mercantil, Spain","teamMembers":[{"id":"a5aa8646-573a-4fae-a425-8364635e9826","name":"Elena Almeida","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/elena-almeida-sample"},{"id":"0a5d3f0b-68ce-426f-8c1c-0b4885752d72","name":"Lucia Castillo","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/lucia-castillo-sample"},{"id":"40d8031c-f2d3-48d9-9086-fa71d04e5de7","name":"Pablo Cardoso","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/pablo-cardoso-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 14. Skillbridge Academy (Cairo, Egypt)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Layla Harbi', 'layla.harbi@skillbridgeacademy.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+20 337 1727584', 'Cairo, Egypt', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Skillbridge Academy', 'Co-Founder & CTO at Skillbridge Academy', 'Education Technology (EdTech)', 2019, 'Cairo, Egypt', 'Skillbridge Academy is a vocational upskilling marketplace that links graduates with employer-designed training. We serve 340 customers across 4 countries and generate $5.2M in annual recurring revenue. Employer partnerships turn completed courses into real job placements.', 'https://www.skillbridgeacademy.example.com', 'https://www.linkedin.com/company/skillbridgeacademy-sample', '', 'layla.harbi@skillbridgeacademy.example.com', 'series-a', '$4M', '$11M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Education Technology (EdTech)}', '[{"name":"Mariam Saleh","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/mariam-saleh-sample"},{"name":"Rania Farouk","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/rania-farouk-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Cairo","country":"Egypt","profiles":{"startup":{"companyName":"Skillbridge Academy","industry":"Education Technology (EdTech)","stage":"series-a","description":"Skillbridge Academy is a vocational upskilling marketplace that links graduates with employer-designed training. We serve 340 customers across 4 countries and generate $5.2M in annual recurring revenue. Employer partnerships turn completed courses into real job placements.","website":"https://www.skillbridgeacademy.example.com","linkedin":"https://www.linkedin.com/company/skillbridgeacademy-sample","foundingYear":"2019","teamSize":"34","fundingRaised":"4000000","fundingSought":"11000000","businessRegistration":"Registered","businessRegistrationNumber":"CR 578207","registrationAuthorityJurisdiction":"General Authority for Investment and Free Zones (GAFI), Egypt","teamMembers":[{"id":"3f1aa558-462f-46d0-b3ae-8ef71c333b11","name":"Mariam Saleh","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/mariam-saleh-sample"},{"id":"e3322044-7fde-46b7-8252-b09b03205190","name":"Rania Farouk","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/rania-farouk-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 15. ClassMint (Jakarta, Indonesia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Carlo Abdullah', 'carlo.abdullah@classmint.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+62 737 6652959', 'Jakarta, Indonesia', 'ClassMint is looking for investors with edtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ClassMint', 'Co-Founder & Chief Product Officer at ClassMint', 'Education Technology (EdTech)', 2022, 'Jakarta, Indonesia', 'ClassMint is a mobile learning app that delivers curriculum-aligned lessons to secondary students in low-bandwidth regions. We serve 1,690 customers across 6 countries and generate $7.8M in annual recurring revenue. Our adaptive learning engine personalises every lesson and improves completion rates.', 'https://www.classmint.example.com', 'https://www.linkedin.com/company/classmint-sample', '', 'carlo.abdullah@classmint.example.com', 'series-a', '$12M', '$27M', '', 'ClassMint is looking for investors with edtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Education Technology (EdTech)}', '[{"name":"Carlo Santoso","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/carlo-santoso-sample"},{"name":"Minh Lim","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/minh-lim-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Jakarta","country":"Indonesia","profiles":{"startup":{"companyName":"ClassMint","industry":"Education Technology (EdTech)","stage":"series-a","description":"ClassMint is a mobile learning app that delivers curriculum-aligned lessons to secondary students in low-bandwidth regions. We serve 1,690 customers across 6 countries and generate $7.8M in annual recurring revenue. Our adaptive learning engine personalises every lesson and improves completion rates.","website":"https://www.classmint.example.com","linkedin":"https://www.linkedin.com/company/classmint-sample","foundingYear":"2022","teamSize":"55","fundingRaised":"12000000","fundingSought":"27000000","businessRegistration":"Registered","businessRegistrationNumber":"NIB 4936989172022","registrationAuthorityJurisdiction":"Ministry of Law and Human Rights (AHU Online), Indonesia","teamMembers":[{"id":"6151fd61-defa-431b-8ff3-c59f38881210","name":"Carlo Santoso","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/carlo-santoso-sample"},{"id":"cacda74c-052a-40aa-affd-ed5491f18341","name":"Minh Lim","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/minh-lim-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 16. Mentora Labs (London, United Kingdom)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Claire Hughes', 'claire.hughes@mentoralabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+44 881 6029451', 'London, United Kingdom', 'Our goal is to find strategic edtech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Mentora Labs', 'Co-Founder & CTO at Mentora Labs', 'Education Technology (EdTech)', 2024, 'London, United Kingdom', 'Mentora Labs is an AI tutoring assistant that gives every student personalised homework and exam support. The product is live with 142 paying customers and 13% month-over-month revenue growth. Our adaptive learning engine personalises every lesson and improves completion rates.', 'https://www.mentoralabs.example.com', 'https://www.linkedin.com/company/mentoralabs-sample', '', 'claire.hughes@mentoralabs.example.com', 'seed', '$1.2M', '$3.7M', '', 'Our goal is to find strategic edtech investors and expert financial guidance to fund product development and expand into new regions.', '{Education Technology (EdTech)}', '[{"name":"Kerem Celik","role":"Head of Product","linkedin":"https://www.linkedin.com/in/kerem-celik-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"London","country":"United Kingdom","profiles":{"startup":{"companyName":"Mentora Labs","industry":"Education Technology (EdTech)","stage":"seed","description":"Mentora Labs is an AI tutoring assistant that gives every student personalised homework and exam support. The product is live with 142 paying customers and 13% month-over-month revenue growth. Our adaptive learning engine personalises every lesson and improves completion rates.","website":"https://www.mentoralabs.example.com","linkedin":"https://www.linkedin.com/company/mentoralabs-sample","foundingYear":"2024","teamSize":"19","fundingRaised":"1200000","fundingSought":"3700000","businessRegistration":"Registered","businessRegistrationNumber":"96032047","registrationAuthorityJurisdiction":"Companies House (England and Wales), United Kingdom","teamMembers":[{"id":"0b8de345-2103-43cc-a5cf-5d140ca65ded","name":"Kerem Celik","role":"Head of Product","linkedin":"https://www.linkedin.com/in/kerem-celik-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 17. Sunweave Energy (Accra, Ghana)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ngozi Eze', 'ngozi.eze@sunweaveenergy.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+233 542 4312296', 'Accra, Ghana', 'Sunweave Energy is looking for investors with cleantech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Sunweave Energy', 'Co-Founder & CEO at Sunweave Energy', 'Clean Energy & Climate Tech', 2020, 'Accra, Ghana', 'Sunweave Energy is a pay-as-you-go solar and storage service for off-grid homes and small enterprises. We serve 124 customers across 3 countries and generate $7.5M in annual revenue. Our modular design lowers cost per unit and shortens deployment time.', 'https://www.sunweaveenergy.example.com', 'https://www.linkedin.com/company/sunweaveenergy-sample', '', 'ngozi.eze@sunweaveenergy.example.com', 'series-a', '$16M', '$25M', '', 'Sunweave Energy is looking for investors with cleantech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Clean Energy & Climate Tech}', '[{"name":"Amara Ibekwe","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/amara-ibekwe-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Accra","country":"Ghana","profiles":{"startup":{"companyName":"Sunweave Energy","industry":"Clean Energy & Climate Tech","stage":"series-a","description":"Sunweave Energy is a pay-as-you-go solar and storage service for off-grid homes and small enterprises. We serve 124 customers across 3 countries and generate $7.5M in annual revenue. Our modular design lowers cost per unit and shortens deployment time.","website":"https://www.sunweaveenergy.example.com","linkedin":"https://www.linkedin.com/company/sunweaveenergy-sample","foundingYear":"2020","teamSize":"68","fundingRaised":"16000000","fundingSought":"25000000","businessRegistration":"Registered","businessRegistrationNumber":"CS788477614","registrationAuthorityJurisdiction":"Registrar General''s Department, Ghana","teamMembers":[{"id":"9174bf8b-0d7a-43e1-950d-a7d8d5bcf743","name":"Amara Ibekwe","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/amara-ibekwe-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 18. Voltaic Storage (Melbourne, Australia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Sarah Fletcher', 'sarah.fletcher@voltaicstorage.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+61 430 9232804', 'Melbourne, Australia', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Voltaic Storage', 'Founder & CEO at Voltaic Storage', 'Clean Energy & Climate Tech', 2019, 'Melbourne, Australia', 'Voltaic Storage is a grid-scale battery software and hardware stack that stabilises renewable-heavy networks. We operate in 6 markets with 416+ customers and $43.6M in annual revenue. Every installation is monitored in real time, which gives financiers verified performance data.', 'https://www.voltaicstorage.example.com', 'https://www.linkedin.com/company/voltaicstorage-sample', '', 'sarah.fletcher@voltaicstorage.example.com', 'series-b', '$25M', '$75M', '', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', '{Clean Energy & Climate Tech}', '[{"name":"Louis Chevalier","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/louis-chevalier-sample"},{"name":"Claire Coleman","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/claire-coleman-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Melbourne","country":"Australia","profiles":{"startup":{"companyName":"Voltaic Storage","industry":"Clean Energy & Climate Tech","stage":"series-b","description":"Voltaic Storage is a grid-scale battery software and hardware stack that stabilises renewable-heavy networks. We operate in 6 markets with 416+ customers and $43.6M in annual revenue. Every installation is monitored in real time, which gives financiers verified performance data.","website":"https://www.voltaicstorage.example.com","linkedin":"https://www.linkedin.com/company/voltaicstorage-sample","foundingYear":"2019","teamSize":"184","fundingRaised":"25000000","fundingSought":"75000000","businessRegistration":"Registered","businessRegistrationNumber":"ACN 539 023 165","registrationAuthorityJurisdiction":"Australian Securities and Investments Commission (ASIC), Australia","teamMembers":[{"id":"1ffb4a19-419b-4931-8cc0-dd4e955a2b5d","name":"Louis Chevalier","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/louis-chevalier-sample"},{"id":"23ff4b90-8724-4b8c-a5df-777f528d6941","name":"Claire Coleman","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/claire-coleman-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 19. CarbonLedger (Stockholm, Sweden)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Maja Nyberg', 'maja.nyberg@carbonledger.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+46 220 4346779', 'Stockholm, Sweden', 'We are joining MoneyMinds to meet early-stage investors who understand cleantech, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'CarbonLedger', 'Chief Executive Officer at CarbonLedger', 'Clean Energy & Climate Tech', 2024, 'Stockholm, Sweden', 'CarbonLedger is a carbon-accounting platform that measures supply-chain emissions for mid-size manufacturers. We have a working prototype, 5 signed pilot partners in Sweden and letters of intent from 8 enterprise prospects. Our modular design lowers cost per unit and shortens deployment time.', 'https://www.carbonledger.example.com', 'https://www.linkedin.com/company/carbonledger-sample', '', 'maja.nyberg@carbonledger.example.com', 'pre-seed', '$390K', '$850K', '', 'We are joining MoneyMinds to meet early-stage investors who understand cleantech, validate our roadmap with experienced advisors and close our first institutional round.', '{Clean Energy & Climate Tech}', '[{"name":"Lukas Weber","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/lukas-weber-sample"},{"name":"Oliver Carter","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/oliver-carter-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Stockholm","country":"Sweden","profiles":{"startup":{"companyName":"CarbonLedger","industry":"Clean Energy & Climate Tech","stage":"pre-seed","description":"CarbonLedger is a carbon-accounting platform that measures supply-chain emissions for mid-size manufacturers. We have a working prototype, 5 signed pilot partners in Sweden and letters of intent from 8 enterprise prospects. Our modular design lowers cost per unit and shortens deployment time.","website":"https://www.carbonledger.example.com","linkedin":"https://www.linkedin.com/company/carbonledger-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"390000","fundingSought":"850000","businessRegistration":"Registered","businessRegistrationNumber":"556012-7802","registrationAuthorityJurisdiction":"Bolagsverket (Swedish Companies Registration Office), Sweden","teamMembers":[{"id":"e9cbec62-75d7-402e-aceb-a22da906ece5","name":"Lukas Weber","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/lukas-weber-sample"},{"id":"0a938c50-df79-46b6-9c4d-333a9ffa2623","name":"Oliver Carter","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/oliver-carter-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 20. HydroPulse Energy (Santiago, Chile)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Andres Gutierrez', 'andres.gutierrez@hydropulseenergy.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+56 849 6047019', 'Santiago, Chile', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'HydroPulse Energy', 'Founder & CEO at HydroPulse Energy', 'Clean Energy & Climate Tech', 2019, 'Santiago, Chile', 'HydroPulse Energy is a compact green-hydrogen electrolyser designed for mining and industrial sites. We serve 16 customers across 3 countries and generate $8.1M in annual revenue. Every installation is monitored in real time, which gives financiers verified performance data.', 'https://www.hydropulseenergy.example.com', 'https://www.linkedin.com/company/hydropulseenergy-sample', '', 'andres.gutierrez@hydropulseenergy.example.com', 'series-a', '$5M', '$26M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Clean Energy & Climate Tech}', '[{"name":"Haeun Lee","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/haeun-lee-sample"},{"name":"Antoine Dubois","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/antoine-dubois-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Santiago","country":"Chile","profiles":{"startup":{"companyName":"HydroPulse Energy","industry":"Clean Energy & Climate Tech","stage":"series-a","description":"HydroPulse Energy is a compact green-hydrogen electrolyser designed for mining and industrial sites. We serve 16 customers across 3 countries and generate $8.1M in annual revenue. Every installation is monitored in real time, which gives financiers verified performance data.","website":"https://www.hydropulseenergy.example.com","linkedin":"https://www.linkedin.com/company/hydropulseenergy-sample","foundingYear":"2019","teamSize":"70","fundingRaised":"5000000","fundingSought":"26000000","businessRegistration":"Registered","businessRegistrationNumber":"RUT 76.836.445-8","registrationAuthorityJurisdiction":"Servicio de Impuestos Internos / Registro de Comercio, Chile","teamMembers":[{"id":"e39f7780-9a06-43db-99bb-f0c1184fedee","name":"Haeun Lee","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/haeun-lee-sample"},{"id":"9eb820d2-fa85-4af3-ba81-75de643c65de","name":"Antoine Dubois","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/antoine-dubois-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 21. Bazaarly (Mumbai, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ishita Nair', 'ishita.nair@bazaarly.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 388 1152055', 'Mumbai, India', 'We want to connect with investors and advisors who can help us scale Bazaarly beyond India, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Bazaarly', 'Co-Founder & CTO at Bazaarly', 'E-commerce & Retail', 2023, 'Mumbai, India', 'Bazaarly is a social-commerce platform that helps neighbourhood sellers reach shoppers through video and messaging. The product is live with 54 paying customers and 21% month-over-month revenue growth. Strong merchant retention shows the platform delivers lasting value.', 'https://www.bazaarly.example.com', 'https://www.linkedin.com/company/bazaarly-sample', '', 'ishita.nair@bazaarly.example.com', 'seed', '$1.7M', '$4.4M', '', 'We want to connect with investors and advisors who can help us scale Bazaarly beyond India, sharpen our go-to-market and prepare for a Series A.', '{E-commerce & Retail}', '[{"name":"Siddharth Iyer","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/siddharth-iyer-sample"},{"name":"Rahul Rao","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/rahul-rao-sample"},{"name":"Megan Morgan","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/megan-morgan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Mumbai","country":"India","profiles":{"startup":{"companyName":"Bazaarly","industry":"E-commerce & Retail","stage":"seed","description":"Bazaarly is a social-commerce platform that helps neighbourhood sellers reach shoppers through video and messaging. The product is live with 54 paying customers and 21% month-over-month revenue growth. Strong merchant retention shows the platform delivers lasting value.","website":"https://www.bazaarly.example.com","linkedin":"https://www.linkedin.com/company/bazaarly-sample","foundingYear":"2023","teamSize":"15","fundingRaised":"1700000","fundingSought":"4400000","businessRegistration":"Registered","businessRegistrationNumber":"U72900MH2023PTC545445","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"8229e36d-1734-440d-acf6-70416d303fc0","name":"Siddharth Iyer","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/siddharth-iyer-sample"},{"id":"806ea5cb-4c0d-4a2c-bcc1-83823462b72f","name":"Rahul Rao","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/rahul-rao-sample"},{"id":"ee5737e3-b454-46f4-b7e2-1bfcc1d2da45","name":"Megan Morgan","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/megan-morgan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 22. CartWhisper (Austin, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Daniel Sullivan', 'daniel.sullivan@cartwhisper.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 497 0809589', 'Austin, United States', 'We want to connect with investors and advisors who can help us scale CartWhisper beyond the United States, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'CartWhisper', 'Co-Founder & Chief Product Officer at CartWhisper', 'E-commerce & Retail', 2024, 'Austin, United States', 'CartWhisper is an AI conversion layer that personalises online storefronts for direct-to-consumer brands. The product is live with 43 paying customers and 20% month-over-month revenue growth. Our recommendation engine lifts conversion while keeping return rates low.', 'https://www.cartwhisper.example.com', 'https://www.linkedin.com/company/cartwhisper-sample', '', 'daniel.sullivan@cartwhisper.example.com', 'seed', '$1.3M', '$4.2M', '', 'We want to connect with investors and advisors who can help us scale CartWhisper beyond the United States, sharpen our go-to-market and prepare for a Series A.', '{E-commerce & Retail}', '[{"name":"Paul Lindner","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/paul-lindner-sample"},{"name":"Olivia Fletcher","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/olivia-fletcher-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Austin","country":"United States","profiles":{"startup":{"companyName":"CartWhisper","industry":"E-commerce & Retail","stage":"seed","description":"CartWhisper is an AI conversion layer that personalises online storefronts for direct-to-consumer brands. The product is live with 43 paying customers and 20% month-over-month revenue growth. Our recommendation engine lifts conversion while keeping return rates low.","website":"https://www.cartwhisper.example.com","linkedin":"https://www.linkedin.com/company/cartwhisper-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"1275000","fundingSought":"4200000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 3771885","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"3fd22c53-e8cb-46e8-887d-02f4ab5477b5","name":"Paul Lindner","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/paul-lindner-sample"},{"id":"9f94aded-5592-4935-8f2a-9877a8df5837","name":"Olivia Fletcher","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/olivia-fletcher-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 23. Urban Thread (Istanbul, Turkey)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Zeynep Koc', 'zeynep.koc@urbanthread.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+90 425 7430172', 'Istanbul, Turkey', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Urban Thread', 'Founder & Managing Director at Urban Thread', 'E-commerce & Retail', 2022, 'Istanbul, Turkey', 'Urban Thread is a marketplace for sustainable and independent fashion labels serving Europe and the Middle East. We serve 1,070 customers across 8 countries and generate $6.8M in annual recurring revenue. Our recommendation engine lifts conversion while keeping return rates low.', 'https://www.urbanthread.example.com', 'https://www.linkedin.com/company/urbanthread-sample', '', 'zeynep.koc@urbanthread.example.com', 'series-a', '$10M', '$15M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{E-commerce & Retail}', '[{"name":"Defne Kurt","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/defne-kurt-sample"},{"name":"Defne Ozturk","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/defne-ozturk-sample"},{"name":"Selin Demir","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/selin-demir-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Istanbul","country":"Turkey","profiles":{"startup":{"companyName":"Urban Thread","industry":"E-commerce & Retail","stage":"series-a","description":"Urban Thread is a marketplace for sustainable and independent fashion labels serving Europe and the Middle East. We serve 1,070 customers across 8 countries and generate $6.8M in annual recurring revenue. Our recommendation engine lifts conversion while keeping return rates low.","website":"https://www.urbanthread.example.com","linkedin":"https://www.linkedin.com/company/urbanthread-sample","foundingYear":"2022","teamSize":"66","fundingRaised":"10000000","fundingSought":"15000000","businessRegistration":"Registered","businessRegistrationNumber":"Sicil No. 644872","registrationAuthorityJurisdiction":"Trade Registry Office (Ticaret Sicil), Turkey","teamMembers":[{"id":"5e462175-4096-443f-96e2-813fa4c91277","name":"Defne Kurt","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/defne-kurt-sample"},{"id":"368efeb6-0b1e-46ac-8b94-3c7b972ec1db","name":"Defne Ozturk","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/defne-ozturk-sample"},{"id":"c3019f27-f6f5-4f63-9fcf-ea6c91d0f208","name":"Selin Demir","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/selin-demir-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 24. Mercado Nube (Mexico City, Mexico)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Luciana Duarte', 'luciana.duarte@mercadonube.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+52 852 8800114', 'Mexico City, Mexico', 'Mercado Nube is looking for investors with e-commerce expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Mercado Nube', 'Co-Founder & CTO at Mercado Nube', 'E-commerce & Retail', 2022, 'Mexico City, Mexico', 'Mercado Nube is a B2B wholesale ordering app that digitises supply for small grocery and pharmacy stores. We serve 1,480 customers across 3 countries and generate $5.0M in annual recurring revenue. Our recommendation engine lifts conversion while keeping return rates low.', 'https://www.mercadonube.example.com', 'https://www.linkedin.com/company/mercadonube-sample', '', 'luciana.duarte@mercadonube.example.com', 'series-a', '$6M', '$12M', '', 'Mercado Nube is looking for investors with e-commerce expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{E-commerce & Retail}', '[{"name":"Rohan Patel","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/rohan-patel-sample"},{"name":"Camila Cardenas","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/camila-cardenas-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Mexico City","country":"Mexico","profiles":{"startup":{"companyName":"Mercado Nube","industry":"E-commerce & Retail","stage":"series-a","description":"Mercado Nube is a B2B wholesale ordering app that digitises supply for small grocery and pharmacy stores. We serve 1,480 customers across 3 countries and generate $5.0M in annual recurring revenue. Our recommendation engine lifts conversion while keeping return rates low.","website":"https://www.mercadonube.example.com","linkedin":"https://www.linkedin.com/company/mercadonube-sample","foundingYear":"2022","teamSize":"34","fundingRaised":"6000000","fundingSought":"12000000","businessRegistration":"Registered","businessRegistrationNumber":"Folio Mercantil 191123","registrationAuthorityJurisdiction":"Registro Publico de Comercio, Mexico","teamMembers":[{"id":"ba72e18a-e20d-41f4-a5cf-fed5c41f5986","name":"Rohan Patel","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/rohan-patel-sample"},{"id":"a39fa224-820f-4a06-ac35-f3799b3d17b6","name":"Camila Cardenas","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/camila-cardenas-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 25. Freightly Labs (Singapore, Singapore)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ming Ng', 'ming.ng@freightlylabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+65 814 0823746', 'Singapore, Singapore', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Freightly Labs', 'Co-Founder & Chief Product Officer at Freightly Labs', 'Logistics & Supply Chain', 2022, 'Singapore, Singapore', 'Freightly Labs is a digital freight-forwarding platform that quotes, books and tracks sea and air cargo in one place. We serve 1,180 customers across 5 countries and generate $2.4M in annual recurring revenue. Open APIs let customers connect existing warehouse and transport systems in days.', 'https://www.freightlylabs.example.com', 'https://www.linkedin.com/company/freightlylabs-sample', '', 'ming.ng@freightlylabs.example.com', 'series-a', '$10M', '$15M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Logistics & Supply Chain}', '[{"name":"Thijs Bos","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/thijs-bos-sample"},{"name":"Hao Chan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/hao-chan-sample"},{"name":"Rafiq Chowdhury","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rafiq-chowdhury-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Singapore","country":"Singapore","profiles":{"startup":{"companyName":"Freightly Labs","industry":"Logistics & Supply Chain","stage":"series-a","description":"Freightly Labs is a digital freight-forwarding platform that quotes, books and tracks sea and air cargo in one place. We serve 1,180 customers across 5 countries and generate $2.4M in annual recurring revenue. Open APIs let customers connect existing warehouse and transport systems in days.","website":"https://www.freightlylabs.example.com","linkedin":"https://www.linkedin.com/company/freightlylabs-sample","foundingYear":"2022","teamSize":"65","fundingRaised":"10000000","fundingSought":"15000000","businessRegistration":"Registered","businessRegistrationNumber":"UEN 202259842Y","registrationAuthorityJurisdiction":"Accounting and Corporate Regulatory Authority (ACRA), Singapore","teamMembers":[{"id":"0db3d73e-6dcf-4038-b012-e5191c20b30d","name":"Thijs Bos","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/thijs-bos-sample"},{"id":"d8603cd7-8f5b-451b-bda4-fcd0f7293c80","name":"Hao Chan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/hao-chan-sample"},{"id":"8d8b7574-ff6b-48b5-adf6-61a379db9675","name":"Rafiq Chowdhury","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rafiq-chowdhury-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 26. RouteWise (Warsaw, Poland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Joanna Zielinski', 'joanna.zielinski@routewise.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+48 312 2082692', 'Warsaw, Poland', 'RouteWise is looking for investors with logistics expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'RouteWise', 'Founder & Managing Director at RouteWise', 'Logistics & Supply Chain', 2022, 'Warsaw, Poland', 'RouteWise is a last-mile routing engine that reduces delivery cost for e-commerce carriers and retailers. We serve 1,770 customers across 8 countries and generate $8.2M in annual recurring revenue. Open APIs let customers connect existing warehouse and transport systems in days.', 'https://www.routewise.example.com', 'https://www.linkedin.com/company/routewise-sample', '', 'joanna.zielinski@routewise.example.com', 'series-a', '$16M', '$37M', '', 'RouteWise is looking for investors with logistics expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Logistics & Supply Chain}', '[{"name":"Anna Lepik","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/anna-lepik-sample"},{"name":"Fatima Akhtar","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/fatima-akhtar-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Warsaw","country":"Poland","profiles":{"startup":{"companyName":"RouteWise","industry":"Logistics & Supply Chain","stage":"series-a","description":"RouteWise is a last-mile routing engine that reduces delivery cost for e-commerce carriers and retailers. We serve 1,770 customers across 8 countries and generate $8.2M in annual recurring revenue. Open APIs let customers connect existing warehouse and transport systems in days.","website":"https://www.routewise.example.com","linkedin":"https://www.linkedin.com/company/routewise-sample","foundingYear":"2022","teamSize":"66","fundingRaised":"16000000","fundingSought":"37000000","businessRegistration":"Registered","businessRegistrationNumber":"KRS 1879170164","registrationAuthorityJurisdiction":"Krajowy Rejestr Sadowy (KRS), Poland","teamMembers":[{"id":"aed1c710-12de-4467-953e-b2512e6afee5","name":"Anna Lepik","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/anna-lepik-sample"},{"id":"7040eaad-7f79-467f-91e8-ee0588ebf0b2","name":"Fatima Akhtar","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/fatima-akhtar-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 27. Cargo Compass (Johannesburg, South Africa)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Nomsa Pillay', 'nomsa.pillay@cargocompass.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+27 280 5980476', 'Johannesburg, South Africa', 'Our goal is to find strategic logistics investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Cargo Compass', 'Co-Founder & CTO at Cargo Compass', 'Logistics & Supply Chain', 2023, 'Johannesburg, South Africa', 'Cargo Compass is a load-matching marketplace that cuts empty return trips for regional road hauliers. The product is live with 102 paying customers and 10% month-over-month revenue growth. Open APIs let customers connect existing warehouse and transport systems in days.', 'https://www.cargocompass.example.com', 'https://www.linkedin.com/company/cargocompass-sample', '', 'nomsa.pillay@cargocompass.example.com', 'seed', '$550K', '$5M', '', 'Our goal is to find strategic logistics investors and expert financial guidance to fund product development and expand into new regions.', '{Logistics & Supply Chain}', '[{"name":"Sipho Mokoena","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sipho-mokoena-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Johannesburg","country":"South Africa","profiles":{"startup":{"companyName":"Cargo Compass","industry":"Logistics & Supply Chain","stage":"seed","description":"Cargo Compass is a load-matching marketplace that cuts empty return trips for regional road hauliers. The product is live with 102 paying customers and 10% month-over-month revenue growth. Open APIs let customers connect existing warehouse and transport systems in days.","website":"https://www.cargocompass.example.com","linkedin":"https://www.linkedin.com/company/cargocompass-sample","foundingYear":"2023","teamSize":"8","fundingRaised":"550000","fundingSought":"5000000","businessRegistration":"Registered","businessRegistrationNumber":"2023/917431/07","registrationAuthorityJurisdiction":"Companies and Intellectual Property Commission (CIPC), South Africa","teamMembers":[{"id":"8232250b-312b-4d6e-9885-06dabc1300c5","name":"Sipho Mokoena","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sipho-mokoena-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 28. ColdChain Connect (Riyadh, Saudi Arabia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Hassan Harbi', 'hassan.harbi@coldchainconnect.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+966 730 8657493', 'Riyadh, Saudi Arabia', 'ColdChain Connect wants to connect with logistics investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ColdChain Connect', 'Founder & CEO at ColdChain Connect', 'Logistics & Supply Chain', 2025, 'Riyadh, Saudi Arabia', 'ColdChain Connect is a temperature-monitoring and routing system for pharmaceutical and fresh-food transport. We have a working prototype, 6 signed pilot partners in Saudi Arabia and letters of intent from 9 enterprise prospects. Open APIs let customers connect existing warehouse and transport systems in days.', 'https://www.coldchainconnect.example.com', 'https://www.linkedin.com/company/coldchainconnect-sample', '', 'hassan.harbi@coldchainconnect.example.com', 'pre-seed', '$380K', '$1.1M', '', 'ColdChain Connect wants to connect with logistics investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Logistics & Supply Chain}', '[{"name":"Layla Amrani","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/layla-amrani-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Riyadh","country":"Saudi Arabia","profiles":{"startup":{"companyName":"ColdChain Connect","industry":"Logistics & Supply Chain","stage":"pre-seed","description":"ColdChain Connect is a temperature-monitoring and routing system for pharmaceutical and fresh-food transport. We have a working prototype, 6 signed pilot partners in Saudi Arabia and letters of intent from 9 enterprise prospects. Open APIs let customers connect existing warehouse and transport systems in days.","website":"https://www.coldchainconnect.example.com","linkedin":"https://www.linkedin.com/company/coldchainconnect-sample","foundingYear":"2025","teamSize":"4","fundingRaised":"380000","fundingSought":"1150000","businessRegistration":"Registered","businessRegistrationNumber":"CR 4612977970","registrationAuthorityJurisdiction":"Ministry of Commerce (Commercial Registration), Saudi Arabia","teamMembers":[{"id":"75a3e120-47ad-4cd6-9a7c-bdca12d33905","name":"Layla Amrani","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/layla-amrani-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 29. OpsPilot Cloud (Dublin, Ireland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Olivia Coleman', 'olivia.coleman@opspilotcloud.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+353 627 9483405', 'Dublin, Ireland', 'OpsPilot Cloud wants to connect with SaaS investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'OpsPilot Cloud', 'Co-Founder & CTO at OpsPilot Cloud', 'Enterprise Software (SaaS)', 2024, 'Dublin, Ireland', 'OpsPilot Cloud is a workflow automation suite that connects finance, procurement and HR approvals for mid-market firms. We have a working prototype, 3 signed pilot partners in Ireland and letters of intent from 6 enterprise prospects. A strong integration layer makes the product easy to adopt and hard to replace.', 'https://www.opspilotcloud.example.com', 'https://www.linkedin.com/company/opspilotcloud-sample', '', 'olivia.coleman@opspilotcloud.example.com', 'pre-seed', '$340K', '$1.1M', '', 'OpsPilot Cloud wants to connect with SaaS investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Enterprise Software (SaaS)}', '[{"name":"Emily Morgan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/emily-morgan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Dublin","country":"Ireland","profiles":{"startup":{"companyName":"OpsPilot Cloud","industry":"Enterprise Software (SaaS)","stage":"pre-seed","description":"OpsPilot Cloud is a workflow automation suite that connects finance, procurement and HR approvals for mid-market firms. We have a working prototype, 3 signed pilot partners in Ireland and letters of intent from 6 enterprise prospects. A strong integration layer makes the product easy to adopt and hard to replace.","website":"https://www.opspilotcloud.example.com","linkedin":"https://www.linkedin.com/company/opspilotcloud-sample","foundingYear":"2024","teamSize":"4","fundingRaised":"340000","fundingSought":"1050000","businessRegistration":"Registered","businessRegistrationNumber":"487992","registrationAuthorityJurisdiction":"Companies Registration Office (CRO), Ireland","teamMembers":[{"id":"da542043-350f-41e2-8352-46480e1c257a","name":"Emily Morgan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/emily-morgan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 30. Tallybase (Auckland, New Zealand)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ryan Bennett', 'ryan.bennett@tallybase.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+64 621 3096698', 'Auckland, New Zealand', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Tallybase', 'Chief Executive Officer at Tallybase', 'Enterprise Software (SaaS)', 2019, 'Auckland, New Zealand', 'Tallybase is an accounting automation tool that reconciles invoices and payments for small businesses. We operate in 17 markets with 5,200+ customers and $28.7M in annual recurring revenue. A strong integration layer makes the product easy to adopt and hard to replace.', 'https://www.tallybase.example.com', 'https://www.linkedin.com/company/tallybase-sample', '', 'ryan.bennett@tallybase.example.com', 'series-b', '$57M', '$190M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Enterprise Software (SaaS)}', '[{"name":"Camila Vargas","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/camila-vargas-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Auckland","country":"New Zealand","profiles":{"startup":{"companyName":"Tallybase","industry":"Enterprise Software (SaaS)","stage":"series-b","description":"Tallybase is an accounting automation tool that reconciles invoices and payments for small businesses. We operate in 17 markets with 5,200+ customers and $28.7M in annual recurring revenue. A strong integration layer makes the product easy to adopt and hard to replace.","website":"https://www.tallybase.example.com","linkedin":"https://www.linkedin.com/company/tallybase-sample","foundingYear":"2019","teamSize":"131","fundingRaised":"57000000","fundingSought":"190000000","businessRegistration":"Registered","businessRegistrationNumber":"NZBN 4478987254658","registrationAuthorityJurisdiction":"New Zealand Companies Office, New Zealand","teamMembers":[{"id":"ac562e3e-c8b9-411d-afe0-7cc6af676a60","name":"Camila Vargas","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/camila-vargas-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 31. Stackline Systems (Seattle, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Laura Brooks', 'laura.brooks@stacklinesystems.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 441 7500697', 'Seattle, United States', 'Stackline Systems is looking for investors with SaaS expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Stackline Systems', 'Founder & CEO at Stackline Systems', 'Enterprise Software (SaaS)', 2022, 'Seattle, United States', 'Stackline Systems is a developer-operations platform that gives engineering teams real-time cost and reliability insights. We serve 730 customers across 9 countries and generate $4.3M in annual recurring revenue. Customers go live in weeks, and net revenue retention remains above 110 percent.', 'https://www.stacklinesystems.example.com', 'https://www.linkedin.com/company/stacklinesystems-sample', '', 'laura.brooks@stacklinesystems.example.com', 'series-a', '$10M', '$28M', '', 'Stackline Systems is looking for investors with SaaS expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Enterprise Software (SaaS)}', '[{"name":"Hannah Coleman","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/hannah-coleman-sample"},{"name":"James Whitaker","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/james-whitaker-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Seattle","country":"United States","profiles":{"startup":{"companyName":"Stackline Systems","industry":"Enterprise Software (SaaS)","stage":"series-a","description":"Stackline Systems is a developer-operations platform that gives engineering teams real-time cost and reliability insights. We serve 730 customers across 9 countries and generate $4.3M in annual recurring revenue. Customers go live in weeks, and net revenue retention remains above 110 percent.","website":"https://www.stacklinesystems.example.com","linkedin":"https://www.linkedin.com/company/stacklinesystems-sample","foundingYear":"2022","teamSize":"55","fundingRaised":"10000000","fundingSought":"28000000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 5599603","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"20c15c67-8ed7-4d60-93fa-6873f079ccd4","name":"Hannah Coleman","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/hannah-coleman-sample"},{"id":"524b3e73-c987-4bef-826b-23d25e64f5c6","name":"James Whitaker","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/james-whitaker-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 32. Quorum Desk (Amsterdam, Netherlands)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Eva Hendriks', 'eva.hendriks@quorumdesk.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+31 681 0155480', 'Amsterdam, Netherlands', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Quorum Desk', 'Co-Founder & Chief Product Officer at Quorum Desk', 'Enterprise Software (SaaS)', 2016, 'Amsterdam, Netherlands', 'Quorum Desk is a board and governance portal that streamlines meetings, voting and documentation for scale-ups. We operate in 13 markets with 7,700+ customers and $42.4M in annual recurring revenue. A strong integration layer makes the product easy to adopt and hard to replace.', 'https://www.quorumdesk.example.com', 'https://www.linkedin.com/company/quorumdesk-sample', '', 'eva.hendriks@quorumdesk.example.com', 'series-b', '$26M', '$70M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Enterprise Software (SaaS)}', '[{"name":"Eva Willems","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/eva-willems-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Amsterdam","country":"Netherlands","profiles":{"startup":{"companyName":"Quorum Desk","industry":"Enterprise Software (SaaS)","stage":"series-b","description":"Quorum Desk is a board and governance portal that streamlines meetings, voting and documentation for scale-ups. We operate in 13 markets with 7,700+ customers and $42.4M in annual recurring revenue. A strong integration layer makes the product easy to adopt and hard to replace.","website":"https://www.quorumdesk.example.com","linkedin":"https://www.linkedin.com/company/quorumdesk-sample","foundingYear":"2016","teamSize":"174","fundingRaised":"26000000","fundingSought":"70000000","businessRegistration":"Registered","businessRegistrationNumber":"KVK 44569855","registrationAuthorityJurisdiction":"Kamer van Koophandel (KVK), Netherlands","teamMembers":[{"id":"01e8f1c1-9860-4c0e-88cd-2a251306dde6","name":"Eva Willems","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/eva-willems-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 33. Cortexa Analytics (Tel Aviv, Israel)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Itai Dahan', 'itai.dahan@cortexaanalytics.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+972 464 4564307', 'Tel Aviv, Israel', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Cortexa Analytics', 'Founder & Managing Director at Cortexa Analytics', 'Artificial Intelligence & Machine Learning', 2022, 'Tel Aviv, Israel', 'Cortexa Analytics is a decision-intelligence platform that turns enterprise data into predictive recommendations. We serve 680 customers across 3 countries and generate $1.4M in annual recurring revenue. Our models are trained on rigorous domain data and are fully auditable.', 'https://www.cortexaanalytics.example.com', 'https://www.linkedin.com/company/cortexaanalytics-sample', '', 'itai.dahan@cortexaanalytics.example.com', 'series-a', '$15M', '$27M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Artificial Intelligence & Machine Learning}', '[{"name":"Maya Stern","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/maya-stern-sample"},{"name":"Talia Klein","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/talia-klein-sample"},{"name":"Michal Cohen","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/michal-cohen-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Tel Aviv","country":"Israel","profiles":{"startup":{"companyName":"Cortexa Analytics","industry":"Artificial Intelligence & Machine Learning","stage":"series-a","description":"Cortexa Analytics is a decision-intelligence platform that turns enterprise data into predictive recommendations. We serve 680 customers across 3 countries and generate $1.4M in annual recurring revenue. Our models are trained on rigorous domain data and are fully auditable.","website":"https://www.cortexaanalytics.example.com","linkedin":"https://www.linkedin.com/company/cortexaanalytics-sample","foundingYear":"2022","teamSize":"67","fundingRaised":"15000000","fundingSought":"27000000","businessRegistration":"Registered","businessRegistrationNumber":"51-164596-6","registrationAuthorityJurisdiction":"Israeli Corporations Authority, Israel","teamMembers":[{"id":"20acd42d-1e59-43a8-98ae-0469e3445aa6","name":"Maya Stern","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/maya-stern-sample"},{"id":"10050151-488d-40b3-9c2b-5b5183103458","name":"Talia Klein","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/talia-klein-sample"},{"id":"ac00036f-6ed0-45b9-b859-934560b9b73a","name":"Michal Cohen","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/michal-cohen-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 34. Neurolytic (Montreal, Canada)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Andrew Mitchell', 'andrew.mitchell@neurolytic.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 864 0970245', 'Montreal, Canada', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Neurolytic', 'Co-Founder & Chief Product Officer at Neurolytic', 'Artificial Intelligence & Machine Learning', 2021, 'Montreal, Canada', 'Neurolytic is a computer-vision toolkit that automates quality inspection on production lines. We serve 720 customers across 7 countries and generate $5.3M in annual recurring revenue. We deploy in the customer cloud so sensitive data never leaves their control.', 'https://www.neurolytic.example.com', 'https://www.linkedin.com/company/neurolytic-sample', '', 'andrew.mitchell@neurolytic.example.com', 'series-a', '$9M', '$18M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Artificial Intelligence & Machine Learning}', '[{"name":"Iris Peters","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/iris-peters-sample"},{"name":"Yetunde Owusu","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/yetunde-owusu-sample"},{"name":"Megan Sullivan","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/megan-sullivan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Montreal","country":"Canada","profiles":{"startup":{"companyName":"Neurolytic","industry":"Artificial Intelligence & Machine Learning","stage":"series-a","description":"Neurolytic is a computer-vision toolkit that automates quality inspection on production lines. We serve 720 customers across 7 countries and generate $5.3M in annual recurring revenue. We deploy in the customer cloud so sensitive data never leaves their control.","website":"https://www.neurolytic.example.com","linkedin":"https://www.linkedin.com/company/neurolytic-sample","foundingYear":"2021","teamSize":"58","fundingRaised":"9000000","fundingSought":"18000000","businessRegistration":"Registered","businessRegistrationNumber":"Corporation No. 8834466-8","registrationAuthorityJurisdiction":"Corporations Canada, Canada","teamMembers":[{"id":"c809b8e1-07ca-414c-a5a9-4e367d1bf137","name":"Iris Peters","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/iris-peters-sample"},{"id":"7dfa1d6d-ed12-4252-910c-c844da437df2","name":"Yetunde Owusu","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/yetunde-owusu-sample"},{"id":"73e8b747-6ab3-4f97-bb06-f1fe9515b047","name":"Megan Sullivan","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/megan-sullivan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 35. VisionForge AI (Tokyo, Japan)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Daiki Ito', 'daiki.ito@visionforgeai.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+81 795 8271774', 'Tokyo, Japan', 'VisionForge AI is looking for investors with AI expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'VisionForge AI', 'Founder & Managing Director at VisionForge AI', 'Artificial Intelligence & Machine Learning', 2022, 'Tokyo, Japan', 'VisionForge AI is a multimodal AI assistant that reads technical drawings and manuals for field engineers. We serve 1,800 customers across 2 countries and generate $2.0M in annual recurring revenue. Our models are trained on rigorous domain data and are fully auditable.', 'https://www.visionforgeai.example.com', 'https://www.linkedin.com/company/visionforgeai-sample', '', 'daiki.ito@visionforgeai.example.com', 'series-a', '$11M', '$23M', '', 'VisionForge AI is looking for investors with AI expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Artificial Intelligence & Machine Learning}', '[{"name":"Yui Kobayashi","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/yui-kobayashi-sample"},{"name":"Haruto Tanaka","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/haruto-tanaka-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Tokyo","country":"Japan","profiles":{"startup":{"companyName":"VisionForge AI","industry":"Artificial Intelligence & Machine Learning","stage":"series-a","description":"VisionForge AI is a multimodal AI assistant that reads technical drawings and manuals for field engineers. We serve 1,800 customers across 2 countries and generate $2.0M in annual recurring revenue. Our models are trained on rigorous domain data and are fully auditable.","website":"https://www.visionforgeai.example.com","linkedin":"https://www.linkedin.com/company/visionforgeai-sample","foundingYear":"2022","teamSize":"34","fundingRaised":"11000000","fundingSought":"23000000","businessRegistration":"Registered","businessRegistrationNumber":"Corporate No. 1723249273085","registrationAuthorityJurisdiction":"Legal Affairs Bureau (Houmukyoku), Japan","teamMembers":[{"id":"180682af-c4cb-43c7-a6df-5ccb022c41dc","name":"Yui Kobayashi","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/yui-kobayashi-sample"},{"id":"fcca0234-9d01-4092-8edc-ea96fb8f6569","name":"Haruto Tanaka","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/haruto-tanaka-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 36. Sensei Data (Seoul, South Korea)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Dohyun Jung', 'dohyun.jung@senseidata.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+82 209 9808319', 'Seoul, South Korea', 'Sensei Data wants to connect with AI investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Sensei Data', 'Founder & CEO at Sensei Data', 'Artificial Intelligence & Machine Learning', 2024, 'Seoul, South Korea', 'Sensei Data is an enterprise search and summarisation engine tuned for regulated industries. We have a working prototype, 4 signed pilot partners in South Korea and letters of intent from 7 enterprise prospects. We deploy in the customer cloud so sensitive data never leaves their control.', 'https://www.senseidata.example.com', 'https://www.linkedin.com/company/senseidata-sample', '', 'dohyun.jung@senseidata.example.com', 'pre-seed', '$230K', '$1.2M', '', 'Sensei Data wants to connect with AI investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Artificial Intelligence & Machine Learning}', '[{"name":"Seoyeon Seo","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/seoyeon-seo-sample"},{"name":"Dahye Yoon","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/dahye-yoon-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Seoul","country":"South Korea","profiles":{"startup":{"companyName":"Sensei Data","industry":"Artificial Intelligence & Machine Learning","stage":"pre-seed","description":"Sensei Data is an enterprise search and summarisation engine tuned for regulated industries. We have a working prototype, 4 signed pilot partners in South Korea and letters of intent from 7 enterprise prospects. We deploy in the customer cloud so sensitive data never leaves their control.","website":"https://www.senseidata.example.com","linkedin":"https://www.linkedin.com/company/senseidata-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"230000","fundingSought":"1200000","businessRegistration":"Registered","businessRegistrationNumber":"310-29-65749","registrationAuthorityJurisdiction":"National Tax Service / Court Registry, South Korea","teamMembers":[{"id":"2deca203-1d3f-4ca1-9531-aa0d694624cf","name":"Seoyeon Seo","role":"Head of Machine Learning","linkedin":"https://www.linkedin.com/in/seoyeon-seo-sample"},{"id":"4b74adfd-00d4-4088-825a-f5d9ce7ea3c8","name":"Dahye Yoon","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/dahye-yoon-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 37. ShieldGrid (Manchester, United Kingdom)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Nathan Coleman', 'nathan.coleman@shieldgrid.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+44 821 6901337', 'Manchester, United Kingdom', 'We want to connect with investors and advisors who can help us scale ShieldGrid beyond the United Kingdom, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ShieldGrid', 'Co-Founder & CEO at ShieldGrid', 'Cybersecurity', 2023, 'Manchester, United Kingdom', 'ShieldGrid is a managed detection and response service built for mid-size organisations. The product is live with 91 paying customers and 15% month-over-month revenue growth. Our detection engine reduces false positives and speeds up incident response.', 'https://www.shieldgrid.example.com', 'https://www.linkedin.com/company/shieldgrid-sample', '', 'nathan.coleman@shieldgrid.example.com', 'seed', '$1.1M', '$3.2M', '', 'We want to connect with investors and advisors who can help us scale ShieldGrid beyond the United Kingdom, sharpen our go-to-market and prepare for a Series A.', '{Cybersecurity}', '[{"name":"Laura Foster","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/laura-foster-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Manchester","country":"United Kingdom","profiles":{"startup":{"companyName":"ShieldGrid","industry":"Cybersecurity","stage":"seed","description":"ShieldGrid is a managed detection and response service built for mid-size organisations. The product is live with 91 paying customers and 15% month-over-month revenue growth. Our detection engine reduces false positives and speeds up incident response.","website":"https://www.shieldgrid.example.com","linkedin":"https://www.linkedin.com/company/shieldgrid-sample","foundingYear":"2023","teamSize":"8","fundingRaised":"1050000","fundingSought":"3200000","businessRegistration":"Registered","businessRegistrationNumber":"36868552","registrationAuthorityJurisdiction":"Companies House (England and Wales), United Kingdom","teamMembers":[{"id":"bfcf1ea6-ec3e-47e3-9b20-42929c14dda9","name":"Laura Foster","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/laura-foster-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 38. Cipherloom (Tallinn, Estonia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Rasmus Ilves', 'rasmus.ilves@cipherloom.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+372 341 4211489', 'Tallinn, Estonia', 'We want to connect with investors and advisors who can help us scale Cipherloom beyond Estonia, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Cipherloom', 'Co-Founder & CTO at Cipherloom', 'Cybersecurity', 2022, 'Tallinn, Estonia', 'Cipherloom is an identity-verification and key-management layer for digital services and public agencies. The product is live with 58 paying customers and 8% month-over-month revenue growth. Our detection engine reduces false positives and speeds up incident response.', 'https://www.cipherloom.example.com', 'https://www.linkedin.com/company/cipherloom-sample', '', 'rasmus.ilves@cipherloom.example.com', 'seed', '$2M', '$4.8M', '', 'We want to connect with investors and advisors who can help us scale Cipherloom beyond Estonia, sharpen our go-to-market and prepare for a Series A.', '{Cybersecurity}', '[{"name":"Rasmus Vaher","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/rasmus-vaher-sample"},{"name":"Joanna Mazur","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/joanna-mazur-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Tallinn","country":"Estonia","profiles":{"startup":{"companyName":"Cipherloom","industry":"Cybersecurity","stage":"seed","description":"Cipherloom is an identity-verification and key-management layer for digital services and public agencies. The product is live with 58 paying customers and 8% month-over-month revenue growth. Our detection engine reduces false positives and speeds up incident response.","website":"https://www.cipherloom.example.com","linkedin":"https://www.linkedin.com/company/cipherloom-sample","foundingYear":"2022","teamSize":"9","fundingRaised":"2000000","fundingSought":"4800000","businessRegistration":"Registered","businessRegistrationNumber":"40788247","registrationAuthorityJurisdiction":"Estonian Commercial Register, Estonia","teamMembers":[{"id":"104a92a2-4578-46ef-9999-4071285351ae","name":"Rasmus Vaher","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/rasmus-vaher-sample"},{"id":"1bb855d3-41f8-43c5-8f9e-8844846d93ce","name":"Joanna Mazur","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/joanna-mazur-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 39. Sentinel Edge (Hyderabad, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Priya Iyer', 'priya.iyer@sentineledge.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 705 0693309', 'Hyderabad, India', 'Sentinel Edge wants to connect with cybersecurity investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Sentinel Edge', 'Chief Executive Officer at Sentinel Edge', 'Cybersecurity', 2025, 'Hyderabad, India', 'Sentinel Edge is an endpoint-protection platform that blocks ransomware on small-business networks. We have a working prototype, 3 signed pilot partners in India and letters of intent from 6 enterprise prospects. Independent penetration tests and a strong security culture underpin everything we ship.', 'https://www.sentineledge.example.com', 'https://www.linkedin.com/company/sentineledge-sample', '', 'priya.iyer@sentineledge.example.com', 'pre-seed', '$220K', '$500K', '', 'Sentinel Edge wants to connect with cybersecurity investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Cybersecurity}', '[{"name":"Marco Ferrari","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/marco-ferrari-sample"},{"name":"Siddharth Reddy","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/siddharth-reddy-sample"},{"name":"Nikhil Mehta","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/nikhil-mehta-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Hyderabad","country":"India","profiles":{"startup":{"companyName":"Sentinel Edge","industry":"Cybersecurity","stage":"pre-seed","description":"Sentinel Edge is an endpoint-protection platform that blocks ransomware on small-business networks. We have a working prototype, 3 signed pilot partners in India and letters of intent from 6 enterprise prospects. Independent penetration tests and a strong security culture underpin everything we ship.","website":"https://www.sentineledge.example.com","linkedin":"https://www.linkedin.com/company/sentineledge-sample","foundingYear":"2025","teamSize":"7","fundingRaised":"220000","fundingSought":"500000","businessRegistration":"Registered","businessRegistrationNumber":"U72900TG2025PTC396209","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"ae5afa99-97da-4200-ac39-e29f8a03dbca","name":"Marco Ferrari","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/marco-ferrari-sample"},{"id":"9b2e918a-5a45-48d6-a0e8-45fddf0a8d96","name":"Siddharth Reddy","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/siddharth-reddy-sample"},{"id":"32cca71d-e088-4feb-965a-141a5574d68f","name":"Nikhil Mehta","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/nikhil-mehta-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 40. VaultStream Security (Zurich, Switzerland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Felix Winter', 'felix.winter@vaultstreamsecurity.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+41 218 9658457', 'Zurich, Switzerland', 'Our goal is to find strategic cybersecurity investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'VaultStream Security', 'Chief Executive Officer at VaultStream Security', 'Cybersecurity', 2023, 'Zurich, Switzerland', 'VaultStream Security is a zero-trust data-sharing platform for banks and asset managers. The product is live with 108 paying customers and 15% month-over-month revenue growth. Independent penetration tests and a strong security culture underpin everything we ship.', 'https://www.vaultstreamsecurity.example.com', 'https://www.linkedin.com/company/vaultstreamsecurity-sample', '', 'felix.winter@vaultstreamsecurity.example.com', 'seed', '$1.9M', '$4.8M', '', 'Our goal is to find strategic cybersecurity investors and expert financial guidance to fund product development and expand into new regions.', '{Cybersecurity}', '[{"name":"Sophie Hartmann","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/sophie-hartmann-sample"},{"name":"Jannat Bhuiyan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/jannat-bhuiyan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Zurich","country":"Switzerland","profiles":{"startup":{"companyName":"VaultStream Security","industry":"Cybersecurity","stage":"seed","description":"VaultStream Security is a zero-trust data-sharing platform for banks and asset managers. The product is live with 108 paying customers and 15% month-over-month revenue growth. Independent penetration tests and a strong security culture underpin everything we ship.","website":"https://www.vaultstreamsecurity.example.com","linkedin":"https://www.linkedin.com/company/vaultstreamsecurity-sample","foundingYear":"2023","teamSize":"8","fundingRaised":"1950000","fundingSought":"4800000","businessRegistration":"Registered","businessRegistrationNumber":"CHE-964.043.842","registrationAuthorityJurisdiction":"Handelsregisteramt (Commercial Register Office), Switzerland","teamMembers":[{"id":"056e47d2-b124-4b1c-92c2-571e8e159a87","name":"Sophie Hartmann","role":"Chief Information Security Officer","linkedin":"https://www.linkedin.com/in/sophie-hartmann-sample"},{"id":"219f87bb-2e59-477a-8ebc-36a366b7b34d","name":"Jannat Bhuiyan","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/jannat-bhuiyan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 41. HomeAtlas (Sydney, Australia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Grace Reynolds', 'grace.reynolds@homeatlas.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+61 270 3555974', 'Sydney, Australia', 'We want to connect with investors and advisors who can help us scale HomeAtlas beyond Australia, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'HomeAtlas', 'Co-Founder & Chief Product Officer at HomeAtlas', 'Real Estate Technology (PropTech)', 2022, 'Sydney, Australia', 'HomeAtlas is a property-data platform that helps buyers and agents price homes accurately. The product is live with 110 paying customers and 22% month-over-month revenue growth. Verified listings and digital records shorten closing times and reduce disputes.', 'https://www.homeatlas.example.com', 'https://www.linkedin.com/company/homeatlas-sample', '', 'grace.reynolds@homeatlas.example.com', 'seed', '$800K', '$4.1M', '', 'We want to connect with investors and advisors who can help us scale HomeAtlas beyond Australia, sharpen our go-to-market and prepare for a Series A.', '{Real Estate Technology (PropTech)}', '[{"name":"Claire Carter","role":"Head of Product","linkedin":"https://www.linkedin.com/in/claire-carter-sample"},{"name":"Hannah Mitchell","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/hannah-mitchell-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Sydney","country":"Australia","profiles":{"startup":{"companyName":"HomeAtlas","industry":"Real Estate Technology (PropTech)","stage":"seed","description":"HomeAtlas is a property-data platform that helps buyers and agents price homes accurately. The product is live with 110 paying customers and 22% month-over-month revenue growth. Verified listings and digital records shorten closing times and reduce disputes.","website":"https://www.homeatlas.example.com","linkedin":"https://www.linkedin.com/company/homeatlas-sample","foundingYear":"2022","teamSize":"20","fundingRaised":"800000","fundingSought":"4100000","businessRegistration":"Registered","businessRegistrationNumber":"ACN 470 728 622","registrationAuthorityJurisdiction":"Australian Securities and Investments Commission (ASIC), Australia","teamMembers":[{"id":"5ed8a651-ab04-4bb1-b3c6-02bb7033627c","name":"Claire Carter","role":"Head of Product","linkedin":"https://www.linkedin.com/in/claire-carter-sample"},{"id":"88cdd761-3180-4253-8aa1-6de564462e40","name":"Hannah Mitchell","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/hannah-mitchell-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 42. Keystone Spaces (Bogota, Colombia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Camila Paredes', 'camila.paredes@keystonespaces.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+57 621 2299932', 'Bogota, Colombia', 'Our goal is to find strategic proptech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Keystone Spaces', 'Co-Founder & CTO at Keystone Spaces', 'Real Estate Technology (PropTech)', 2024, 'Bogota, Colombia', 'Keystone Spaces is a co-living and flexible-lease operator with a tenant-experience app. The product is live with 17 paying customers and 9% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.', 'https://www.keystonespaces.example.com', 'https://www.linkedin.com/company/keystonespaces-sample', '', 'camila.paredes@keystonespaces.example.com', 'seed', '$1.4M', '$2.9M', '', 'Our goal is to find strategic proptech investors and expert financial guidance to fund product development and expand into new regions.', '{Real Estate Technology (PropTech)}', '[{"name":"Beatriz Molina","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/beatriz-molina-sample"},{"name":"Rodrigo Herrera","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/rodrigo-herrera-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Bogota","country":"Colombia","profiles":{"startup":{"companyName":"Keystone Spaces","industry":"Real Estate Technology (PropTech)","stage":"seed","description":"Keystone Spaces is a co-living and flexible-lease operator with a tenant-experience app. The product is live with 17 paying customers and 9% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.","website":"https://www.keystonespaces.example.com","linkedin":"https://www.linkedin.com/company/keystonespaces-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"1350000","fundingSought":"2900000","businessRegistration":"Registered","businessRegistrationNumber":"NIT 901.933.512-3","registrationAuthorityJurisdiction":"Camara de Comercio, Colombia","teamMembers":[{"id":"aca5b33a-6409-4097-9f32-6a9a0c16d356","name":"Beatriz Molina","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/beatriz-molina-sample"},{"id":"852a1c3e-a821-4812-837d-aa535399a4a3","name":"Rodrigo Herrera","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/rodrigo-herrera-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 43. Plotwise (Lahore, Pakistan)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Maryam Jamil', 'maryam.jamil@plotwise.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+92 722 8221171', 'Lahore, Pakistan', 'Our goal is to find strategic proptech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Plotwise', 'Co-Founder & COO at Plotwise', 'Real Estate Technology (PropTech)', 2022, 'Lahore, Pakistan', 'Plotwise is a digital land-records and verification service that reduces property fraud. The product is live with 119 paying customers and 19% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.', 'https://www.plotwise.example.com', 'https://www.linkedin.com/company/plotwise-sample', '', 'maryam.jamil@plotwise.example.com', 'seed', '$900K', '$3.6M', '', 'Our goal is to find strategic proptech investors and expert financial guidance to fund product development and expand into new regions.', '{Real Estate Technology (PropTech)}', '[{"name":"Saad Siddiqui","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/saad-siddiqui-sample"},{"name":"Efua Nwosu","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/efua-nwosu-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Lahore","country":"Pakistan","profiles":{"startup":{"companyName":"Plotwise","industry":"Real Estate Technology (PropTech)","stage":"seed","description":"Plotwise is a digital land-records and verification service that reduces property fraud. The product is live with 119 paying customers and 19% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.","website":"https://www.plotwise.example.com","linkedin":"https://www.linkedin.com/company/plotwise-sample","foundingYear":"2022","teamSize":"16","fundingRaised":"900000","fundingSought":"3600000","businessRegistration":"Registered","businessRegistrationNumber":"SECP Reg. No. 2716345","registrationAuthorityJurisdiction":"Securities and Exchange Commission of Pakistan (SECP), Pakistan","teamMembers":[{"id":"9874c29d-20c6-49fb-a78f-92827d33b7e0","name":"Saad Siddiqui","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/saad-siddiqui-sample"},{"id":"1119ed66-0012-489f-90b3-86a75d02e549","name":"Efua Nwosu","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/efua-nwosu-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 44. Urbania Living (Manila, Philippines)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Aiman Ismail', 'aiman.ismail@urbanialiving.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+63 531 0182097', 'Manila, Philippines', 'We want to connect with investors and advisors who can help us scale Urbania Living beyond the Philippines, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Urbania Living', 'Co-Founder & CTO at Urbania Living', 'Real Estate Technology (PropTech)', 2024, 'Manila, Philippines', 'Urbania Living is a rent-to-own platform that helps young families finance their first home. The product is live with 159 paying customers and 18% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.', 'https://www.urbanialiving.example.com', 'https://www.linkedin.com/company/urbanialiving-sample', '', 'aiman.ismail@urbanialiving.example.com', 'seed', '$925K', '$3.9M', '', 'We want to connect with investors and advisors who can help us scale Urbania Living beyond the Philippines, sharpen our go-to-market and prepare for a Series A.', '{Real Estate Technology (PropTech)}', '[{"name":"Rizal Tan","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rizal-tan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Manila","country":"Philippines","profiles":{"startup":{"companyName":"Urbania Living","industry":"Real Estate Technology (PropTech)","stage":"seed","description":"Urbania Living is a rent-to-own platform that helps young families finance their first home. The product is live with 159 paying customers and 18% month-over-month revenue growth. Landlords and agents rely on our tools daily, which drives high retention.","website":"https://www.urbanialiving.example.com","linkedin":"https://www.linkedin.com/company/urbanialiving-sample","foundingYear":"2024","teamSize":"20","fundingRaised":"925000","fundingSought":"3900000","businessRegistration":"Registered","businessRegistrationNumber":"CS202452377","registrationAuthorityJurisdiction":"Securities and Exchange Commission (SEC), Philippines","teamMembers":[{"id":"05fc84f4-b333-427e-8f1d-e1b5f200e75d","name":"Rizal Tan","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rizal-tan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 45. CoverLoop (Munich, Germany)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Tobias Neumann', 'tobias.neumann@coverloop.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+49 905 9292747', 'Munich, Germany', 'We want to connect with investors and advisors who can help us scale CoverLoop beyond Germany, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'CoverLoop', 'Chief Executive Officer at CoverLoop', 'Insurance Technology (InsurTech)', 2023, 'Munich, Germany', 'CoverLoop is an embedded-insurance API that lets online retailers add cover at checkout. The product is live with 108 paying customers and 12% month-over-month revenue growth. Automated claims handling pays out faster while controlling fraud.', 'https://www.coverloop.example.com', 'https://www.linkedin.com/company/coverloop-sample', '', 'tobias.neumann@coverloop.example.com', 'seed', '$1.8M', '$3.1M', '', 'We want to connect with investors and advisors who can help us scale CoverLoop beyond Germany, sharpen our go-to-market and prepare for a Series A.', '{Insurance Technology (InsurTech)}', '[{"name":"Lea Fischer","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/lea-fischer-sample"},{"name":"Clara Hoffmann","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/clara-hoffmann-sample"},{"name":"Maximilian Kruger","role":"Head of Product","linkedin":"https://www.linkedin.com/in/maximilian-kruger-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Munich","country":"Germany","profiles":{"startup":{"companyName":"CoverLoop","industry":"Insurance Technology (InsurTech)","stage":"seed","description":"CoverLoop is an embedded-insurance API that lets online retailers add cover at checkout. The product is live with 108 paying customers and 12% month-over-month revenue growth. Automated claims handling pays out faster while controlling fraud.","website":"https://www.coverloop.example.com","linkedin":"https://www.linkedin.com/company/coverloop-sample","foundingYear":"2023","teamSize":"14","fundingRaised":"1750000","fundingSought":"3100000","businessRegistration":"Registered","businessRegistrationNumber":"HRB 545664","registrationAuthorityJurisdiction":"Handelsregister (Commercial Register), Germany","teamMembers":[{"id":"170e6251-a073-4fb4-9f33-7098a81c25df","name":"Lea Fischer","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/lea-fischer-sample"},{"id":"2b330af8-6ba3-4285-9851-23d23f2a69b2","name":"Clara Hoffmann","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/clara-hoffmann-sample"},{"id":"04d1b89a-c169-49d0-9a30-ebf7156bada9","name":"Maximilian Kruger","role":"Head of Product","linkedin":"https://www.linkedin.com/in/maximilian-kruger-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 46. PolicyPebble (Singapore, Singapore)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ying Toh', 'ying.toh@policypebble.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+65 881 9502423', 'Singapore, Singapore', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'PolicyPebble', 'Founder & Managing Director at PolicyPebble', 'Insurance Technology (InsurTech)', 2020, 'Singapore, Singapore', 'PolicyPebble is a digital broker that compares and personalises health and life cover. We serve 400 customers across 7 countries and generate $2.1M in annual recurring revenue. Automated claims handling pays out faster while controlling fraud.', 'https://www.policypebble.example.com', 'https://www.linkedin.com/company/policypebble-sample', '', 'ying.toh@policypebble.example.com', 'series-a', '$8M', '$22M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Insurance Technology (InsurTech)}', '[{"name":"Ling Goh","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/ling-goh-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Singapore","country":"Singapore","profiles":{"startup":{"companyName":"PolicyPebble","industry":"Insurance Technology (InsurTech)","stage":"series-a","description":"PolicyPebble is a digital broker that compares and personalises health and life cover. We serve 400 customers across 7 countries and generate $2.1M in annual recurring revenue. Automated claims handling pays out faster while controlling fraud.","website":"https://www.policypebble.example.com","linkedin":"https://www.linkedin.com/company/policypebble-sample","foundingYear":"2020","teamSize":"41","fundingRaised":"8000000","fundingSought":"22000000","businessRegistration":"Registered","businessRegistrationNumber":"UEN 202099430Y","registrationAuthorityJurisdiction":"Accounting and Corporate Regulatory Authority (ACRA), Singapore","teamMembers":[{"id":"1127244c-0a46-41b6-b891-a586d5f28f99","name":"Ling Goh","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/ling-goh-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 47. ClaimSwift (Kuala Lumpur, Malaysia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Linh Pham', 'linh.pham@claimswift.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+60 668 4585079', 'Kuala Lumpur, Malaysia', 'We want to connect with investors and advisors who can help us scale ClaimSwift beyond Malaysia, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ClaimSwift', 'Founder & CEO at ClaimSwift', 'Insurance Technology (InsurTech)', 2024, 'Kuala Lumpur, Malaysia', 'ClaimSwift is a claims-automation system that settles motor and property claims in hours. The product is live with 113 paying customers and 8% month-over-month revenue growth. Licensed carrier partners underwrite every policy we distribute.', 'https://www.claimswift.example.com', 'https://www.linkedin.com/company/claimswift-sample', '', 'linh.pham@claimswift.example.com', 'seed', '$1.6M', '$4.6M', '', 'We want to connect with investors and advisors who can help us scale ClaimSwift beyond Malaysia, sharpen our go-to-market and prepare for a Series A.', '{Insurance Technology (InsurTech)}', '[{"name":"Siti Hassan","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/siti-hassan-sample"},{"name":"Wanjiru Niyonzima","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/wanjiru-niyonzima-sample"},{"name":"Dina Barakat","role":"Head of Product","linkedin":"https://www.linkedin.com/in/dina-barakat-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Kuala Lumpur","country":"Malaysia","profiles":{"startup":{"companyName":"ClaimSwift","industry":"Insurance Technology (InsurTech)","stage":"seed","description":"ClaimSwift is a claims-automation system that settles motor and property claims in hours. The product is live with 113 paying customers and 8% month-over-month revenue growth. Licensed carrier partners underwrite every policy we distribute.","website":"https://www.claimswift.example.com","linkedin":"https://www.linkedin.com/company/claimswift-sample","foundingYear":"2024","teamSize":"12","fundingRaised":"1600000","fundingSought":"4600000","businessRegistration":"Registered","businessRegistrationNumber":"202405624320 (167233-C)","registrationAuthorityJurisdiction":"Companies Commission of Malaysia (SSM), Malaysia","teamMembers":[{"id":"20b23ce7-275b-473d-a141-d00f37cdeed0","name":"Siti Hassan","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/siti-hassan-sample"},{"id":"bf72629e-3399-442b-9e6f-94c80d1d173d","name":"Wanjiru Niyonzima","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/wanjiru-niyonzima-sample"},{"id":"6664b001-7fa4-475b-9dcb-cc0bccd0c6dc","name":"Dina Barakat","role":"Head of Product","linkedin":"https://www.linkedin.com/in/dina-barakat-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 48. Bima Connect (Dhaka, Bangladesh)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Mim Bhuiyan', 'mim.bhuiyan@bimaconnect.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+880 896 8525945', 'Dhaka, Bangladesh', 'Bima Connect is looking for investors with insurtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Bima Connect', 'Founder & Managing Director at Bima Connect', 'Insurance Technology (InsurTech)', 2021, 'Dhaka, Bangladesh', 'Bima Connect is a micro-insurance platform that protects farmers and garment workers through mobile payments. We serve 1,800 customers across 9 countries and generate $1.4M in annual recurring revenue. Licensed carrier partners underwrite every policy we distribute.', 'https://www.bimaconnect.example.com', 'https://www.linkedin.com/company/bimaconnect-sample', '', 'mim.bhuiyan@bimaconnect.example.com', 'series-a', '$6M', '$13M', '', 'Bima Connect is looking for investors with insurtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Insurance Technology (InsurTech)}', '[{"name":"Jannat Chowdhury","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jannat-chowdhury-sample"},{"name":"Jannat Mondal","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/jannat-mondal-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Dhaka","country":"Bangladesh","profiles":{"startup":{"companyName":"Bima Connect","industry":"Insurance Technology (InsurTech)","stage":"series-a","description":"Bima Connect is a micro-insurance platform that protects farmers and garment workers through mobile payments. We serve 1,800 customers across 9 countries and generate $1.4M in annual recurring revenue. Licensed carrier partners underwrite every policy we distribute.","website":"https://www.bimaconnect.example.com","linkedin":"https://www.linkedin.com/company/bimaconnect-sample","foundingYear":"2021","teamSize":"25","fundingRaised":"6000000","fundingSought":"13000000","businessRegistration":"Registered","businessRegistrationNumber":"C-170812/2021","registrationAuthorityJurisdiction":"Registrar of Joint Stock Companies and Firms (RJSC), Bangladesh","teamMembers":[{"id":"4ca40db0-28be-4205-b2b3-d02708fbac18","name":"Jannat Chowdhury","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jannat-chowdhury-sample"},{"id":"6418ffa5-167d-4680-a83c-feed65776d07","name":"Jannat Mondal","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/jannat-mondal-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 49. GeneNova Therapeutics (San Diego, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Daniel Carter', 'daniel.carter@genenovatherapeutics.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 334 0448452', 'San Diego, United States', 'GeneNova Therapeutics wants to connect with biotech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'GeneNova Therapeutics', 'Co-Founder & CEO at GeneNova Therapeutics', 'Biotechnology & Life Sciences', 2024, 'San Diego, United States', 'GeneNova Therapeutics is a gene-editing platform developing treatments for rare inherited blood disorders. We have a validated proof of concept, 5 signed pilot partners in the United States and letters of intent from 8 enterprise prospects. A strong intellectual property position protects our core platform.', 'https://www.genenovatherapeutics.example.com', 'https://www.linkedin.com/company/genenovatherapeutics-sample', '', 'daniel.carter@genenovatherapeutics.example.com', 'pre-seed', '$125K', '$1M', '', 'GeneNova Therapeutics wants to connect with biotech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Biotechnology & Life Sciences}', '[{"name":"Daniel Spencer","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/daniel-spencer-sample"},{"name":"Emily Griffin","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/emily-griffin-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"San Diego","country":"United States","profiles":{"startup":{"companyName":"GeneNova Therapeutics","industry":"Biotechnology & Life Sciences","stage":"pre-seed","description":"GeneNova Therapeutics is a gene-editing platform developing treatments for rare inherited blood disorders. We have a validated proof of concept, 5 signed pilot partners in the United States and letters of intent from 8 enterprise prospects. A strong intellectual property position protects our core platform.","website":"https://www.genenovatherapeutics.example.com","linkedin":"https://www.linkedin.com/company/genenovatherapeutics-sample","foundingYear":"2024","teamSize":"5","fundingRaised":"125000","fundingSought":"1000000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 3619061","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"f926194d-43ac-44aa-8b92-2ac88069e9a2","name":"Daniel Spencer","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/daniel-spencer-sample"},{"id":"c25e0d99-9e3a-428b-b390-15991fababdc","name":"Emily Griffin","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/emily-griffin-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 50. Biosynth Works (Copenhagen, Denmark)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Oskar Eriksson', 'oskar.eriksson@biosynthworks.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+45 793 5895580', 'Copenhagen, Denmark', 'Our goal is to find strategic biotech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Biosynth Works', 'Founder & CEO at Biosynth Works', 'Biotechnology & Life Sciences', 2022, 'Copenhagen, Denmark', 'Biosynth Works is a synthetic-biology foundry producing sustainable ingredients for food and cosmetics. We have 7 funded research and commercial partnerships and a proven proof of concept with early revenue. A strong intellectual property position protects our core platform.', 'https://www.biosynthworks.example.com', 'https://www.linkedin.com/company/biosynthworks-sample', '', 'oskar.eriksson@biosynthworks.example.com', 'seed', '$700K', '$2.6M', '', 'Our goal is to find strategic biotech investors and expert financial guidance to fund product development and expand into new regions.', '{Biotechnology & Life Sciences}', '[{"name":"Isabella Campos","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/isabella-campos-sample"},{"name":"Kelvin Wekesa","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/kelvin-wekesa-sample"},{"name":"Maja Korhonen","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/maja-korhonen-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Copenhagen","country":"Denmark","profiles":{"startup":{"companyName":"Biosynth Works","industry":"Biotechnology & Life Sciences","stage":"seed","description":"Biosynth Works is a synthetic-biology foundry producing sustainable ingredients for food and cosmetics. We have 7 funded research and commercial partnerships and a proven proof of concept with early revenue. A strong intellectual property position protects our core platform.","website":"https://www.biosynthworks.example.com","linkedin":"https://www.linkedin.com/company/biosynthworks-sample","foundingYear":"2022","teamSize":"20","fundingRaised":"700000","fundingSought":"2600000","businessRegistration":"Registered","businessRegistrationNumber":"CVR 53458392","registrationAuthorityJurisdiction":"Danish Business Authority (CVR), Denmark","teamMembers":[{"id":"89b0d8ed-3dde-4fbe-bed6-1398d7a4fbf1","name":"Isabella Campos","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/isabella-campos-sample"},{"id":"6ead3a5b-1f78-4948-886f-24bce3908cab","name":"Kelvin Wekesa","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/kelvin-wekesa-sample"},{"id":"ce71cf6a-d3a1-4614-b623-4df724c45998","name":"Maja Korhonen","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/maja-korhonen-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 51. Helixa Diagnostics (Basel, Switzerland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Tobias Lindner', 'tobias.lindner@helixadiagnostics.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+41 845 6917551', 'Basel, Switzerland', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Helixa Diagnostics', 'Founder & CEO at Helixa Diagnostics', 'Biotechnology & Life Sciences', 2021, 'Basel, Switzerland', 'Helixa Diagnostics is a rapid molecular diagnostic test that detects infections from a single drop of blood. We serve 64 customers across 7 countries and generate $4.3M in annual revenue. A strong intellectual property position protects our core platform.', 'https://www.helixadiagnostics.example.com', 'https://www.linkedin.com/company/helixadiagnostics-sample', '', 'tobias.lindner@helixadiagnostics.example.com', 'series-a', '$7M', '$15M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Biotechnology & Life Sciences}', '[{"name":"Nina Hartmann","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/nina-hartmann-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Basel","country":"Switzerland","profiles":{"startup":{"companyName":"Helixa Diagnostics","industry":"Biotechnology & Life Sciences","stage":"series-a","description":"Helixa Diagnostics is a rapid molecular diagnostic test that detects infections from a single drop of blood. We serve 64 customers across 7 countries and generate $4.3M in annual revenue. A strong intellectual property position protects our core platform.","website":"https://www.helixadiagnostics.example.com","linkedin":"https://www.linkedin.com/company/helixadiagnostics-sample","foundingYear":"2021","teamSize":"32","fundingRaised":"7000000","fundingSought":"15000000","businessRegistration":"Registered","businessRegistrationNumber":"CHE-667.792.469","registrationAuthorityJurisdiction":"Handelsregisteramt (Commercial Register Office), Switzerland","teamMembers":[{"id":"e183e5da-a4f5-43f9-b4c8-4b3fe93bf3c2","name":"Nina Hartmann","role":"Chief Scientific Officer","linkedin":"https://www.linkedin.com/in/nina-hartmann-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 52. Proteon Labs (Paris, France)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Hugo Mercier', 'hugo.mercier@proteonlabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+33 786 1740845', 'Paris, France', 'We are joining MoneyMinds to meet early-stage investors who understand biotech, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Proteon Labs', 'Chief Executive Officer at Proteon Labs', 'Biotechnology & Life Sciences', 2025, 'Paris, France', 'Proteon Labs is a protein-design platform that accelerates early drug discovery for biopharma partners. We have a validated proof of concept, 3 signed pilot partners in France and letters of intent from 6 enterprise prospects. A strong intellectual property position protects our core platform.', 'https://www.proteonlabs.example.com', 'https://www.linkedin.com/company/proteonlabs-sample', '', 'hugo.mercier@proteonlabs.example.com', 'pre-seed', '$165K', '$550K', '', 'We are joining MoneyMinds to meet early-stage investors who understand biotech, validate our roadmap with experienced advisors and close our first institutional round.', '{Biotechnology & Life Sciences}', '[{"name":"Mathieu Dupont","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/mathieu-dupont-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Paris","country":"France","profiles":{"startup":{"companyName":"Proteon Labs","industry":"Biotechnology & Life Sciences","stage":"pre-seed","description":"Proteon Labs is a protein-design platform that accelerates early drug discovery for biopharma partners. We have a validated proof of concept, 3 signed pilot partners in France and letters of intent from 6 enterprise prospects. A strong intellectual property position protects our core platform.","website":"https://www.proteonlabs.example.com","linkedin":"https://www.linkedin.com/company/proteonlabs-sample","foundingYear":"2025","teamSize":"4","fundingRaised":"165000","fundingSought":"550000","businessRegistration":"Registered","businessRegistrationNumber":"SIREN 725 564 915","registrationAuthorityJurisdiction":"Registre du Commerce et des Societes (RCS), France","teamMembers":[{"id":"5f1fa324-c9c8-460a-b452-c6fd9de8ec1c","name":"Mathieu Dupont","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/mathieu-dupont-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 53. EVoyage (Pune, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Divya Rao', 'divya.rao@evoyage.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 812 6941055', 'Pune, India', 'EVoyage wants to connect with mobility investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'EVoyage', 'Co-Founder & Chief Product Officer at EVoyage', 'Mobility & Transportation', 2025, 'Pune, India', 'EVoyage is an electric-vehicle fleet service that powers last-mile delivery and employee commuting. We have a working prototype, 6 signed pilot partners in India and a waitlist of 650 early users. Our vehicles and software are designed for lower total cost of ownership.', 'https://www.evoyage.example.com', 'https://www.linkedin.com/company/evoyage-sample', '', 'divya.rao@evoyage.example.com', 'pre-seed', '$250K', '$650K', '', 'EVoyage wants to connect with mobility investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Mobility & Transportation}', '[{"name":"Palesa Mahlangu","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/palesa-mahlangu-sample"},{"name":"Priya Banerjee","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/priya-banerjee-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Pune","country":"India","profiles":{"startup":{"companyName":"EVoyage","industry":"Mobility & Transportation","stage":"pre-seed","description":"EVoyage is an electric-vehicle fleet service that powers last-mile delivery and employee commuting. We have a working prototype, 6 signed pilot partners in India and a waitlist of 650 early users. Our vehicles and software are designed for lower total cost of ownership.","website":"https://www.evoyage.example.com","linkedin":"https://www.linkedin.com/company/evoyage-sample","foundingYear":"2025","teamSize":"5","fundingRaised":"250000","fundingSought":"650000","businessRegistration":"Registered","businessRegistrationNumber":"U72900MH2025PTC460154","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"ea8294b9-e1fb-47eb-adb8-f1a6b95eeea2","name":"Palesa Mahlangu","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/palesa-mahlangu-sample"},{"id":"bbd23327-ce7a-43e2-ac6b-ed89545b2125","name":"Priya Banerjee","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/priya-banerjee-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 54. MoveSmart Mobility (Curitiba, Brazil)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Luciana Pacheco', 'luciana.pacheco@movesmartmobility.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+55 333 7002952', 'Curitiba, Brazil', 'We want to connect with investors and advisors who can help us scale MoveSmart Mobility beyond Brazil, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'MoveSmart Mobility', 'Co-Founder & CTO at MoveSmart Mobility', 'Mobility & Transportation', 2023, 'Curitiba, Brazil', 'MoveSmart Mobility is a shared-mobility platform that connects commuters to affordable rides and micro-transit. The product is live with 9 paying customers and 14% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.', 'https://www.movesmartmobility.example.com', 'https://www.linkedin.com/company/movesmartmobility-sample', '', 'luciana.pacheco@movesmartmobility.example.com', 'seed', '$1.6M', '$4.4M', '', 'We want to connect with investors and advisors who can help us scale MoveSmart Mobility beyond Brazil, sharpen our go-to-market and prepare for a Series A.', '{Mobility & Transportation}', '[{"name":"Isabella Duarte","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/isabella-duarte-sample"},{"name":"Nikhil Gupta","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/nikhil-gupta-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Curitiba","country":"Brazil","profiles":{"startup":{"companyName":"MoveSmart Mobility","industry":"Mobility & Transportation","stage":"seed","description":"MoveSmart Mobility is a shared-mobility platform that connects commuters to affordable rides and micro-transit. The product is live with 9 paying customers and 14% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.","website":"https://www.movesmartmobility.example.com","linkedin":"https://www.linkedin.com/company/movesmartmobility-sample","foundingYear":"2023","teamSize":"12","fundingRaised":"1600000","fundingSought":"4400000","businessRegistration":"Registered","businessRegistrationNumber":"CNPJ 26.460.306/0001-51","registrationAuthorityJurisdiction":"Junta Comercial / Receita Federal, Brazil","teamMembers":[{"id":"3f83f46a-74c1-4380-8a88-0d0dab81727c","name":"Isabella Duarte","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/isabella-duarte-sample"},{"id":"c5cc15ba-9562-4cdb-a98a-7501a222604d","name":"Nikhil Gupta","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/nikhil-gupta-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 55. Cyclora (Utrecht, Netherlands)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Sander Jansen', 'sander.jansen@cyclora.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+31 283 1023187', 'Utrecht, Netherlands', 'Our goal is to find strategic mobility investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Cyclora', 'Co-Founder & CTO at Cyclora', 'Mobility & Transportation', 2024, 'Utrecht, Netherlands', 'Cyclora is a smart e-bike sharing system designed for university campuses and business parks. The product is live with 4 paying customers and 16% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.', 'https://www.cyclora.example.com', 'https://www.linkedin.com/company/cyclora-sample', '', 'sander.jansen@cyclora.example.com', 'seed', '$1.9M', '$4.3M', '', 'Our goal is to find strategic mobility investors and expert financial guidance to fund product development and expand into new regions.', '{Mobility & Transportation}', '[{"name":"Eva Visser","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/eva-visser-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Utrecht","country":"Netherlands","profiles":{"startup":{"companyName":"Cyclora","industry":"Mobility & Transportation","stage":"seed","description":"Cyclora is a smart e-bike sharing system designed for university campuses and business parks. The product is live with 4 paying customers and 16% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.","website":"https://www.cyclora.example.com","linkedin":"https://www.linkedin.com/company/cyclora-sample","foundingYear":"2024","teamSize":"6","fundingRaised":"1850000","fundingSought":"4300000","businessRegistration":"Registered","businessRegistrationNumber":"KVK 51596690","registrationAuthorityJurisdiction":"Kamer van Koophandel (KVK), Netherlands","teamMembers":[{"id":"447cae26-d639-4d8d-a7e7-21f1d3bc0963","name":"Eva Visser","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/eva-visser-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 56. AeroLink Drones (Kigali, Rwanda)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Brian Mugisha', 'brian.mugisha@aerolinkdrones.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+250 485 6085336', 'Kigali, Rwanda', 'We want to connect with investors and advisors who can help us scale AeroLink Drones beyond Rwanda, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'AeroLink Drones', 'Co-Founder & Chief Product Officer at AeroLink Drones', 'Mobility & Transportation', 2024, 'Kigali, Rwanda', 'AeroLink Drones is a medical-drone delivery network that moves blood and vaccines to remote clinics. The product is live with 4 paying customers and 12% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.', 'https://www.aerolinkdrones.example.com', 'https://www.linkedin.com/company/aerolinkdrones-sample', '', 'brian.mugisha@aerolinkdrones.example.com', 'seed', '$775K', '$3.7M', '', 'We want to connect with investors and advisors who can help us scale AeroLink Drones beyond Rwanda, sharpen our go-to-market and prepare for a Series A.', '{Mobility & Transportation}', '[{"name":"Lorenzo Moretti","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/lorenzo-moretti-sample"},{"name":"Wambui Ndayisenga","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/wambui-ndayisenga-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Kigali","country":"Rwanda","profiles":{"startup":{"companyName":"AeroLink Drones","industry":"Mobility & Transportation","stage":"seed","description":"AeroLink Drones is a medical-drone delivery network that moves blood and vaccines to remote clinics. The product is live with 4 paying customers and 12% month-over-month revenue growth. Our vehicles and software are designed for lower total cost of ownership.","website":"https://www.aerolinkdrones.example.com","linkedin":"https://www.linkedin.com/company/aerolinkdrones-sample","foundingYear":"2024","teamSize":"15","fundingRaised":"775000","fundingSought":"3700000","businessRegistration":"Registered","businessRegistrationNumber":"RDB 778647747","registrationAuthorityJurisdiction":"Rwanda Development Board (RDB), Rwanda","teamMembers":[{"id":"6bc22436-dc38-4340-8f02-959dd8f5bcc0","name":"Lorenzo Moretti","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/lorenzo-moretti-sample"},{"id":"a3aedcf1-42c3-4f9c-9d54-d4c024bac38e","name":"Wambui Ndayisenga","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/wambui-ndayisenga-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 57. PlantCraft Foods (Denver, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Andrew Coleman', 'andrew.coleman@plantcraftfoods.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 831 2510420', 'Denver, United States', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'PlantCraft Foods', 'Founder & CEO at PlantCraft Foods', 'Food & Beverage', 2022, 'Denver, United States', 'PlantCraft Foods is a range of plant-based proteins that match the taste and texture of conventional meat. We serve 36 customers across 7 countries and generate $5.2M in annual revenue. Our products pass independent quality and safety audits and hold retail listings.', 'https://www.plantcraftfoods.example.com', 'https://www.linkedin.com/company/plantcraftfoods-sample', '', 'andrew.coleman@plantcraftfoods.example.com', 'series-a', '$15M', '$32M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Food & Beverage}', '[{"name":"Mehnaz Chowdhury","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/mehnaz-chowdhury-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Denver","country":"United States","profiles":{"startup":{"companyName":"PlantCraft Foods","industry":"Food & Beverage","stage":"series-a","description":"PlantCraft Foods is a range of plant-based proteins that match the taste and texture of conventional meat. We serve 36 customers across 7 countries and generate $5.2M in annual revenue. Our products pass independent quality and safety audits and hold retail listings.","website":"https://www.plantcraftfoods.example.com","linkedin":"https://www.linkedin.com/company/plantcraftfoods-sample","foundingYear":"2022","teamSize":"57","fundingRaised":"15000000","fundingSought":"32000000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 4039121","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"150c1cd9-3c9a-4b9c-8e6d-69ecc2f3f2f9","name":"Mehnaz Chowdhury","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/mehnaz-chowdhury-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 58. Savora Kitchens (Penang, Malaysia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Carlo Hoang', 'carlo.hoang@savorakitchens.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+60 519 9740360', 'Penang, Malaysia', 'We want to connect with investors and advisors who can help us scale Savora Kitchens beyond Malaysia, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Savora Kitchens', 'Founder & CEO at Savora Kitchens', 'Food & Beverage', 2023, 'Penang, Malaysia', 'Savora Kitchens is a cloud-kitchen network that supplies healthy ready meals to corporate offices. The product is live with 4 paying customers and 19% month-over-month revenue growth. Efficient sourcing keeps gross margin healthy as we scale.', 'https://www.savorakitchens.example.com', 'https://www.linkedin.com/company/savorakitchens-sample', '', 'carlo.hoang@savorakitchens.example.com', 'seed', '$1.6M', '$4.5M', '', 'We want to connect with investors and advisors who can help us scale Savora Kitchens beyond Malaysia, sharpen our go-to-market and prepare for a Series A.', '{Food & Beverage}', '[{"name":"Adaeze Eze","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/adaeze-eze-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Penang","country":"Malaysia","profiles":{"startup":{"companyName":"Savora Kitchens","industry":"Food & Beverage","stage":"seed","description":"Savora Kitchens is a cloud-kitchen network that supplies healthy ready meals to corporate offices. The product is live with 4 paying customers and 19% month-over-month revenue growth. Efficient sourcing keeps gross margin healthy as we scale.","website":"https://www.savorakitchens.example.com","linkedin":"https://www.linkedin.com/company/savorakitchens-sample","foundingYear":"2023","teamSize":"18","fundingRaised":"1650000","fundingSought":"4500000","businessRegistration":"Registered","businessRegistrationNumber":"202334595037 (316885-M)","registrationAuthorityJurisdiction":"Companies Commission of Malaysia (SSM), Malaysia","teamMembers":[{"id":"5343ac64-ef02-416a-8f89-c08f90b92636","name":"Adaeze Eze","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/adaeze-eze-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 59. BeanTrace Coffee (Medellin, Colombia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Camila Mendoza', 'camila.mendoza@beantracecoffee.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+57 681 8798236', 'Medellin, Colombia', 'BeanTrace Coffee is looking for investors with food-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'BeanTrace Coffee', 'Co-Founder & CEO at BeanTrace Coffee', 'Food & Beverage', 2022, 'Medellin, Colombia', 'BeanTrace Coffee is a direct-trade specialty coffee brand that pays growers premium prices and tracks origin. We serve 13 customers across 2 countries and generate $6.5M in annual revenue. Our products pass independent quality and safety audits and hold retail listings.', 'https://www.beantracecoffee.example.com', 'https://www.linkedin.com/company/beantracecoffee-sample', '', 'camila.mendoza@beantracecoffee.example.com', 'series-a', '$16M', '$36.5M', '', 'BeanTrace Coffee is looking for investors with food-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Food & Beverage}', '[{"name":"Rodrigo Alvarado","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/rodrigo-alvarado-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Medellin","country":"Colombia","profiles":{"startup":{"companyName":"BeanTrace Coffee","industry":"Food & Beverage","stage":"series-a","description":"BeanTrace Coffee is a direct-trade specialty coffee brand that pays growers premium prices and tracks origin. We serve 13 customers across 2 countries and generate $6.5M in annual revenue. Our products pass independent quality and safety audits and hold retail listings.","website":"https://www.beantracecoffee.example.com","linkedin":"https://www.linkedin.com/company/beantracecoffee-sample","foundingYear":"2022","teamSize":"65","fundingRaised":"16000000","fundingSought":"36500000","businessRegistration":"Registered","businessRegistrationNumber":"NIT 901.475.651-9","registrationAuthorityJurisdiction":"Camara de Comercio, Colombia","teamMembers":[{"id":"cb3037be-35cc-4dfe-b13f-0572de3e372c","name":"Rodrigo Alvarado","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/rodrigo-alvarado-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 60. Nordic Brewtech (Helsinki, Finland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Sofie Berg', 'sofie.berg@nordicbrewtech.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+358 792 7438331', 'Helsinki, Finland', 'Our goal is to find strategic food-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Nordic Brewtech', 'Founder & CEO at Nordic Brewtech', 'Food & Beverage', 2022, 'Helsinki, Finland', 'Nordic Brewtech is a functional-beverage company producing low-sugar fermented drinks for health-conscious consumers. The product is live with 8 paying customers and 8% month-over-month revenue growth. Efficient sourcing keeps gross margin healthy as we scale.', 'https://www.nordicbrewtech.example.com', 'https://www.linkedin.com/company/nordicbrewtech-sample', '', 'sofie.berg@nordicbrewtech.example.com', 'seed', '$2.4M', '$5.4M', '', 'Our goal is to find strategic food-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Food & Beverage}', '[{"name":"Anders Johansson","role":"Head of Product","linkedin":"https://www.linkedin.com/in/anders-johansson-sample"},{"name":"Saga Hansen","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/saga-hansen-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Helsinki","country":"Finland","profiles":{"startup":{"companyName":"Nordic Brewtech","industry":"Food & Beverage","stage":"seed","description":"Nordic Brewtech is a functional-beverage company producing low-sugar fermented drinks for health-conscious consumers. The product is live with 8 paying customers and 8% month-over-month revenue growth. Efficient sourcing keeps gross margin healthy as we scale.","website":"https://www.nordicbrewtech.example.com","linkedin":"https://www.linkedin.com/company/nordicbrewtech-sample","foundingYear":"2022","teamSize":"15","fundingRaised":"2375000","fundingSought":"5400000","businessRegistration":"Registered","businessRegistrationNumber":"6422644-5","registrationAuthorityJurisdiction":"Finnish Patent and Registration Office (PRH), Finland","teamMembers":[{"id":"b31a2864-8bbe-49fd-9e22-7e9037c59be1","name":"Anders Johansson","role":"Head of Product","linkedin":"https://www.linkedin.com/in/anders-johansson-sample"},{"id":"bfa26c4c-06c8-4dbf-bfc5-791674070ddb","name":"Saga Hansen","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/saga-hansen-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 61. PixelHarbor Studios (Krakow, Poland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Joanna Kowalski', 'joanna.kowalski@pixelharborstudios.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+48 748 1109052', 'Krakow, Poland', 'PixelHarbor Studios wants to connect with gaming investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'PixelHarbor Studios', 'Co-Founder & CEO at PixelHarbor Studios', 'Gaming & Interactive Media', 2024, 'Krakow, Poland', 'PixelHarbor Studios is a mobile strategy-game studio with a global audience and strong player retention. We have a working prototype, 6 signed pilot partners in Poland and a waitlist of 2,850 early users. A lean, experienced studio ships high-quality content on predictable cycles.', 'https://www.pixelharborstudios.example.com', 'https://www.linkedin.com/company/pixelharborstudios-sample', '', 'joanna.kowalski@pixelharborstudios.example.com', 'pre-seed', '$60K', '$1.1M', '', 'PixelHarbor Studios wants to connect with gaming investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Gaming & Interactive Media}', '[{"name":"Karl Saar","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/karl-saar-sample"},{"name":"Anna Tamm","role":"Head of Product","linkedin":"https://www.linkedin.com/in/anna-tamm-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Krakow","country":"Poland","profiles":{"startup":{"companyName":"PixelHarbor Studios","industry":"Gaming & Interactive Media","stage":"pre-seed","description":"PixelHarbor Studios is a mobile strategy-game studio with a global audience and strong player retention. We have a working prototype, 6 signed pilot partners in Poland and a waitlist of 2,850 early users. A lean, experienced studio ships high-quality content on predictable cycles.","website":"https://www.pixelharborstudios.example.com","linkedin":"https://www.linkedin.com/company/pixelharborstudios-sample","foundingYear":"2024","teamSize":"6","fundingRaised":"60000","fundingSought":"1100000","businessRegistration":"Registered","businessRegistrationNumber":"KRS 8678461174","registrationAuthorityJurisdiction":"Krajowy Rejestr Sadowy (KRS), Poland","teamMembers":[{"id":"708e26d3-4058-4ea9-9c71-b2ba4c45a66c","name":"Karl Saar","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/karl-saar-sample"},{"id":"2093d170-8782-46b8-ba9c-ab1b89ac1103","name":"Anna Tamm","role":"Head of Product","linkedin":"https://www.linkedin.com/in/anna-tamm-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 62. Questloom (Vancouver, Canada)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Claire Mitchell', 'claire.mitchell@questloom.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 999 0168353', 'Vancouver, Canada', 'Our goal is to find strategic gaming investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Questloom', 'Co-Founder & COO at Questloom', 'Gaming & Interactive Media', 2023, 'Vancouver, Canada', 'Questloom is a cross-platform adventure game engine and publishing label for indie developers. The product is live with 104 paying customers and 11% month-over-month revenue growth. Our live-operations data drives strong retention and lifetime value.', 'https://www.questloom.example.com', 'https://www.linkedin.com/company/questloom-sample', '', 'claire.mitchell@questloom.example.com', 'seed', '$1.9M', '$4.6M', '', 'Our goal is to find strategic gaming investors and expert financial guidance to fund product development and expand into new regions.', '{Gaming & Interactive Media}', '[{"name":"James Fletcher","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/james-fletcher-sample"},{"name":"Nathan Carter","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/nathan-carter-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Vancouver","country":"Canada","profiles":{"startup":{"companyName":"Questloom","industry":"Gaming & Interactive Media","stage":"seed","description":"Questloom is a cross-platform adventure game engine and publishing label for indie developers. The product is live with 104 paying customers and 11% month-over-month revenue growth. Our live-operations data drives strong retention and lifetime value.","website":"https://www.questloom.example.com","linkedin":"https://www.linkedin.com/company/questloom-sample","foundingYear":"2023","teamSize":"11","fundingRaised":"1925000","fundingSought":"4600000","businessRegistration":"Registered","businessRegistrationNumber":"Corporation No. 4374105-7","registrationAuthorityJurisdiction":"Corporations Canada, Canada","teamMembers":[{"id":"069b2b83-9c4f-4f39-af9b-584241d1076a","name":"James Fletcher","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/james-fletcher-sample"},{"id":"333c82e3-f996-4f6d-a19d-757dcf7a88c2","name":"Nathan Carter","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/nathan-carter-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 63. Arcadia Nova (Busan, South Korea)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Dohyun Cho', 'dohyun.cho@arcadianova.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+82 449 9425989', 'Busan, South Korea', 'We are joining MoneyMinds to meet early-stage investors who understand gaming, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Arcadia Nova', 'Co-Founder & CTO at Arcadia Nova', 'Gaming & Interactive Media', 2024, 'Busan, South Korea', 'Arcadia Nova is an esports and fan-engagement platform that rewards players and viewers. We have a working prototype, 6 signed pilot partners in South Korea and a waitlist of 650 early users. A lean, experienced studio ships high-quality content on predictable cycles.', 'https://www.arcadianova.example.com', 'https://www.linkedin.com/company/arcadianova-sample', '', 'dohyun.cho@arcadianova.example.com', 'pre-seed', '$260K', '$1.1M', '', 'We are joining MoneyMinds to meet early-stage investors who understand gaming, validate our roadmap with experienced advisors and close our first institutional round.', '{Gaming & Interactive Media}', '[{"name":"Soyeon Kwon","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/soyeon-kwon-sample"},{"name":"Yetunde Nwosu","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/yetunde-nwosu-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Busan","country":"South Korea","profiles":{"startup":{"companyName":"Arcadia Nova","industry":"Gaming & Interactive Media","stage":"pre-seed","description":"Arcadia Nova is an esports and fan-engagement platform that rewards players and viewers. We have a working prototype, 6 signed pilot partners in South Korea and a waitlist of 650 early users. A lean, experienced studio ships high-quality content on predictable cycles.","website":"https://www.arcadianova.example.com","linkedin":"https://www.linkedin.com/company/arcadianova-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"260000","fundingSought":"1150000","businessRegistration":"Registered","businessRegistrationNumber":"251-38-18486","registrationAuthorityJurisdiction":"National Tax Service / Court Registry, South Korea","teamMembers":[{"id":"1dbfc2ba-524e-40f5-859a-f221f6fc636c","name":"Soyeon Kwon","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/soyeon-kwon-sample"},{"id":"862e129f-b0a8-4f1d-bea1-c41f6c214e04","name":"Yetunde Nwosu","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/yetunde-nwosu-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 64. GameForge Africa (Cape Town, South Africa)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Zanele Sithole', 'zanele.sithole@gameforgeafrica.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+27 639 3718713', 'Cape Town, South Africa', 'We are joining MoneyMinds to meet early-stage investors who understand gaming, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'GameForge Africa', 'Founder & CEO at GameForge Africa', 'Gaming & Interactive Media', 2024, 'Cape Town, South Africa', 'GameForge Africa is a mobile gaming studio and payments layer for emerging-market players. We have a working prototype, 4 signed pilot partners in South Africa and a waitlist of 1,700 early users. Our live-operations data drives strong retention and lifetime value.', 'https://www.gameforgeafrica.example.com', 'https://www.linkedin.com/company/gameforgeafrica-sample', '', 'zanele.sithole@gameforgeafrica.example.com', 'pre-seed', '$240K', '$1.2M', '', 'We are joining MoneyMinds to meet early-stage investors who understand gaming, validate our roadmap with experienced advisors and close our first institutional round.', '{Gaming & Interactive Media}', '[{"name":"Thomas Harper","role":"Head of Product","linkedin":"https://www.linkedin.com/in/thomas-harper-sample"},{"name":"Naledi Venter","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/naledi-venter-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Cape Town","country":"South Africa","profiles":{"startup":{"companyName":"GameForge Africa","industry":"Gaming & Interactive Media","stage":"pre-seed","description":"GameForge Africa is a mobile gaming studio and payments layer for emerging-market players. We have a working prototype, 4 signed pilot partners in South Africa and a waitlist of 1,700 early users. Our live-operations data drives strong retention and lifetime value.","website":"https://www.gameforgeafrica.example.com","linkedin":"https://www.linkedin.com/company/gameforgeafrica-sample","foundingYear":"2024","teamSize":"4","fundingRaised":"240000","fundingSought":"1200000","businessRegistration":"Registered","businessRegistrationNumber":"2024/270199/07","registrationAuthorityJurisdiction":"Companies and Intellectual Property Commission (CIPC), South Africa","teamMembers":[{"id":"eb063c3f-93f6-4b24-bccc-3e02a47ff1eb","name":"Thomas Harper","role":"Head of Product","linkedin":"https://www.linkedin.com/in/thomas-harper-sample"},{"id":"4b112412-962b-402b-870e-84125a3bbb56","name":"Naledi Venter","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/naledi-venter-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 65. WanderLedger (Lisbon, Portugal)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Carmen Santos', 'carmen.santos@wanderledger.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+351 227 9626884', 'Lisbon, Portugal', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'WanderLedger', 'Chief Executive Officer at WanderLedger', 'Travel & Hospitality', 2020, 'Lisbon, Portugal', 'WanderLedger is a trip-planning and booking platform for remote workers and long-stay travellers. We operate in 20 markets with 4,200+ customers and $32.9M in annual recurring revenue. Our personalisation engine increases repeat bookings and average order value.', 'https://www.wanderledger.example.com', 'https://www.linkedin.com/company/wanderledger-sample', '', 'carmen.santos@wanderledger.example.com', 'series-b', '$60M', '$185M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Travel & Hospitality}', '[{"name":"Paula Vidal","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/paula-vidal-sample"},{"name":"Diego Costa","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/diego-costa-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Lisbon","country":"Portugal","profiles":{"startup":{"companyName":"WanderLedger","industry":"Travel & Hospitality","stage":"series-b","description":"WanderLedger is a trip-planning and booking platform for remote workers and long-stay travellers. We operate in 20 markets with 4,200+ customers and $32.9M in annual recurring revenue. Our personalisation engine increases repeat bookings and average order value.","website":"https://www.wanderledger.example.com","linkedin":"https://www.linkedin.com/company/wanderledger-sample","foundingYear":"2020","teamSize":"169","fundingRaised":"60000000","fundingSought":"185000000","businessRegistration":"Registered","businessRegistrationNumber":"NIPC 693173237","registrationAuthorityJurisdiction":"Conservatoria do Registo Comercial, Portugal","teamMembers":[{"id":"6fb8c1d6-6b67-4c67-8d60-d171e7d5f1b5","name":"Paula Vidal","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/paula-vidal-sample"},{"id":"99c38871-4f0f-492b-bb4a-da26c81ceb44","name":"Diego Costa","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/diego-costa-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 66. StayMosaic (Marrakech, Morocco)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Rashid Haddad', 'rashid.haddad@staymosaic.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+212 781 8815636', 'Marrakech, Morocco', 'Our goal is to find strategic travel-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'StayMosaic', 'Co-Founder & CTO at StayMosaic', 'Travel & Hospitality', 2023, 'Marrakech, Morocco', 'StayMosaic is a boutique-hospitality platform that lists and manages authentic guesthouses. The product is live with 100 paying customers and 9% month-over-month revenue growth. Our personalisation engine increases repeat bookings and average order value.', 'https://www.staymosaic.example.com', 'https://www.linkedin.com/company/staymosaic-sample', '', 'rashid.haddad@staymosaic.example.com', 'seed', '$1.8M', '$5.1M', '', 'Our goal is to find strategic travel-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Travel & Hospitality}', '[{"name":"Mariam Amrani","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/mariam-amrani-sample"},{"name":"Noura Mostafa","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/noura-mostafa-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Marrakech","country":"Morocco","profiles":{"startup":{"companyName":"StayMosaic","industry":"Travel & Hospitality","stage":"seed","description":"StayMosaic is a boutique-hospitality platform that lists and manages authentic guesthouses. The product is live with 100 paying customers and 9% month-over-month revenue growth. Our personalisation engine increases repeat bookings and average order value.","website":"https://www.staymosaic.example.com","linkedin":"https://www.linkedin.com/company/staymosaic-sample","foundingYear":"2023","teamSize":"12","fundingRaised":"1750000","fundingSought":"5100000","businessRegistration":"Registered","businessRegistrationNumber":"RC 785505","registrationAuthorityJurisdiction":"Office Marocain de la Propriete Industrielle et Commerciale (OMPIC), Morocco","teamMembers":[{"id":"eac0a8cb-af6e-4776-97d5-cbbc97f7cbe8","name":"Mariam Amrani","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/mariam-amrani-sample"},{"id":"38281257-2ccd-4656-9ef1-50b47a67f451","name":"Noura Mostafa","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/noura-mostafa-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 67. Itinera AI (Milan, Italy)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Elena Rinaldi', 'elena.rinaldi@itineraai.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+39 937 3815724', 'Milan, Italy', 'We want to connect with investors and advisors who can help us scale Itinera AI beyond Italy, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Itinera AI', 'Chief Executive Officer at Itinera AI', 'Travel & Hospitality', 2023, 'Milan, Italy', 'Itinera AI is an AI itinerary builder that creates and books personalised cultural trips. The product is live with 99 paying customers and 14% month-over-month revenue growth. Direct supplier integrations ensure accurate inventory and pricing.', 'https://www.itineraai.example.com', 'https://www.linkedin.com/company/itineraai-sample', '', 'elena.rinaldi@itineraai.example.com', 'seed', '$925K', '$2.6M', '', 'We want to connect with investors and advisors who can help us scale Itinera AI beyond Italy, sharpen our go-to-market and prepare for a Series A.', '{Travel & Hospitality}', '[{"name":"Antoine Perrin","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/antoine-perrin-sample"},{"name":"Giulia Barbieri","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/giulia-barbieri-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Milan","country":"Italy","profiles":{"startup":{"companyName":"Itinera AI","industry":"Travel & Hospitality","stage":"seed","description":"Itinera AI is an AI itinerary builder that creates and books personalised cultural trips. The product is live with 99 paying customers and 14% month-over-month revenue growth. Direct supplier integrations ensure accurate inventory and pricing.","website":"https://www.itineraai.example.com","linkedin":"https://www.linkedin.com/company/itineraai-sample","foundingYear":"2023","teamSize":"9","fundingRaised":"925000","fundingSought":"2600000","businessRegistration":"Registered","businessRegistrationNumber":"REA 73983892168","registrationAuthorityJurisdiction":"Registro delle Imprese (Chamber of Commerce), Italy","teamMembers":[{"id":"36a0c1b1-7489-42c6-a8e4-63c2013c0c74","name":"Antoine Perrin","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/antoine-perrin-sample"},{"id":"aa57820b-468b-4d9c-b181-8e53770faf9a","name":"Giulia Barbieri","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/giulia-barbieri-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 68. TrailKeeper (Queenstown, New Zealand)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Emily Reynolds', 'emily.reynolds@trailkeeper.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+64 558 1096526', 'Queenstown, New Zealand', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'TrailKeeper', 'Co-Founder & COO at TrailKeeper', 'Travel & Hospitality', 2020, 'Queenstown, New Zealand', 'TrailKeeper is an adventure-tourism booking and safety platform for outdoor operators. We operate in 17 markets with 2,100+ customers and $47.9M in annual recurring revenue. Direct supplier integrations ensure accurate inventory and pricing.', 'https://www.trailkeeper.example.com', 'https://www.linkedin.com/company/trailkeeper-sample', '', 'emily.reynolds@trailkeeper.example.com', 'series-b', '$47M', '$125M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Travel & Hospitality}', '[{"name":"Michael Fletcher","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/michael-fletcher-sample"},{"name":"Michael Morgan","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/michael-morgan-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Queenstown","country":"New Zealand","profiles":{"startup":{"companyName":"TrailKeeper","industry":"Travel & Hospitality","stage":"series-b","description":"TrailKeeper is an adventure-tourism booking and safety platform for outdoor operators. We operate in 17 markets with 2,100+ customers and $47.9M in annual recurring revenue. Direct supplier integrations ensure accurate inventory and pricing.","website":"https://www.trailkeeper.example.com","linkedin":"https://www.linkedin.com/company/trailkeeper-sample","foundingYear":"2020","teamSize":"203","fundingRaised":"47000000","fundingSought":"125000000","businessRegistration":"Registered","businessRegistrationNumber":"NZBN 5501513166482","registrationAuthorityJurisdiction":"New Zealand Companies Office, New Zealand","teamMembers":[{"id":"2296ad0e-6fc7-4c62-a6c3-84f9051adc25","name":"Michael Fletcher","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/michael-fletcher-sample"},{"id":"76362b8d-2a9d-48b4-820b-76613a3afbdf","name":"Michael Morgan","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/michael-morgan-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 69. Forgewise (Stuttgart, Germany)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Paul Weber', 'paul.weber@forgewise.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+49 400 4657408', 'Stuttgart, Germany', 'Forgewise is looking for investors with industrial technology expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Forgewise', 'Founder & Managing Director at Forgewise', 'Manufacturing & Industrial Technology', 2020, 'Stuttgart, Germany', 'Forgewise is a predictive-maintenance system that reduces downtime in automotive supplier plants. We serve 56 customers across 3 countries and generate $7.1M in annual revenue. Our systems retrofit existing machines, so customers avoid costly replacement.', 'https://www.forgewise.example.com', 'https://www.linkedin.com/company/forgewise-sample', '', 'paul.weber@forgewise.example.com', 'series-a', '$4M', '$22M', '', 'Forgewise is looking for investors with industrial technology expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Manufacturing & Industrial Technology}', '[{"name":"Louis Girard","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/louis-girard-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Stuttgart","country":"Germany","profiles":{"startup":{"companyName":"Forgewise","industry":"Manufacturing & Industrial Technology","stage":"series-a","description":"Forgewise is a predictive-maintenance system that reduces downtime in automotive supplier plants. We serve 56 customers across 3 countries and generate $7.1M in annual revenue. Our systems retrofit existing machines, so customers avoid costly replacement.","website":"https://www.forgewise.example.com","linkedin":"https://www.linkedin.com/company/forgewise-sample","foundingYear":"2020","teamSize":"65","fundingRaised":"4000000","fundingSought":"22000000","businessRegistration":"Registered","businessRegistrationNumber":"HRB 291708","registrationAuthorityJurisdiction":"Handelsregister (Commercial Register), Germany","teamMembers":[{"id":"8ef57119-9cbf-4ef4-a714-26e5f0f5faf0","name":"Louis Girard","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/louis-girard-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 70. Printonomy (Detroit, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Claire Brooks', 'claire.brooks@printonomy.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 454 1807322', 'Detroit, United States', 'Our goal is to find strategic industrial technology investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Printonomy', 'Founder & CEO at Printonomy', 'Manufacturing & Industrial Technology', 2024, 'Detroit, United States', 'Printonomy is an industrial 3D-printing service that produces low-volume metal parts on demand. The product is live with 7 paying customers and 11% month-over-month revenue growth. Our systems retrofit existing machines, so customers avoid costly replacement.', 'https://www.printonomy.example.com', 'https://www.linkedin.com/company/printonomy-sample', '', 'claire.brooks@printonomy.example.com', 'seed', '$1.9M', '$3.9M', '', 'Our goal is to find strategic industrial technology investors and expert financial guidance to fund product development and expand into new regions.', '{Manufacturing & Industrial Technology}', '[{"name":"Li Chan","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/li-chan-sample"},{"name":"Sarah Foster","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/sarah-foster-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Detroit","country":"United States","profiles":{"startup":{"companyName":"Printonomy","industry":"Manufacturing & Industrial Technology","stage":"seed","description":"Printonomy is an industrial 3D-printing service that produces low-volume metal parts on demand. The product is live with 7 paying customers and 11% month-over-month revenue growth. Our systems retrofit existing machines, so customers avoid costly replacement.","website":"https://www.printonomy.example.com","linkedin":"https://www.linkedin.com/company/printonomy-sample","foundingYear":"2024","teamSize":"6","fundingRaised":"1925000","fundingSought":"3900000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 6813323","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"8a268ec5-a610-4a7f-9a37-98ed40e2034f","name":"Li Chan","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/li-chan-sample"},{"id":"bbe8bd5f-329d-431e-88a0-3ad748f50378","name":"Sarah Foster","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/sarah-foster-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 71. Fabricore Robotics (Incheon, South Korea)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Haeun Han', 'haeun.han@fabricorerobotics.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+82 239 2040823', 'Incheon, South Korea', 'Fabricore Robotics is looking for investors with industrial technology expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Fabricore Robotics', 'Co-Founder & CTO at Fabricore Robotics', 'Manufacturing & Industrial Technology', 2020, 'Incheon, South Korea', 'Fabricore Robotics is collaborative robots that automate welding and assembly for small factories. We serve 90 customers across 6 countries and generate $8.2M in annual revenue. Our systems retrofit existing machines, so customers avoid costly replacement.', 'https://www.fabricorerobotics.example.com', 'https://www.linkedin.com/company/fabricorerobotics-sample', '', 'haeun.han@fabricorerobotics.example.com', 'series-a', '$13M', '$34.5M', '', 'Fabricore Robotics is looking for investors with industrial technology expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Manufacturing & Industrial Technology}', '[{"name":"Louis Colin","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/louis-colin-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Incheon","country":"South Korea","profiles":{"startup":{"companyName":"Fabricore Robotics","industry":"Manufacturing & Industrial Technology","stage":"series-a","description":"Fabricore Robotics is collaborative robots that automate welding and assembly for small factories. We serve 90 customers across 6 countries and generate $8.2M in annual revenue. Our systems retrofit existing machines, so customers avoid costly replacement.","website":"https://www.fabricorerobotics.example.com","linkedin":"https://www.linkedin.com/company/fabricorerobotics-sample","foundingYear":"2020","teamSize":"47","fundingRaised":"13000000","fundingSought":"34500000","businessRegistration":"Registered","businessRegistrationNumber":"528-25-69426","registrationAuthorityJurisdiction":"National Tax Service / Court Registry, South Korea","teamMembers":[{"id":"5393775a-3579-4bf8-9806-f5247cda3bc8","name":"Louis Colin","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/louis-colin-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 72. MicroMold Works (Hanoi, Vietnam)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Minh Hoang', 'minh.hoang@micromoldworks.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+84 823 0996350', 'Hanoi, Vietnam', 'We are joining MoneyMinds to meet early-stage investors who understand industrial technology, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'MicroMold Works', 'Co-Founder & CTO at MicroMold Works', 'Manufacturing & Industrial Technology', 2024, 'Hanoi, Vietnam', 'MicroMold Works is a precision micro-moulding facility serving medical-device and electronics makers. We have a working prototype, 6 signed pilot partners in Vietnam and letters of intent from 9 enterprise prospects. Our systems retrofit existing machines, so customers avoid costly replacement.', 'https://www.micromoldworks.example.com', 'https://www.linkedin.com/company/micromoldworks-sample', '', 'minh.hoang@micromoldworks.example.com', 'pre-seed', '$160K', '$650K', '', 'We are joining MoneyMinds to meet early-stage investors who understand industrial technology, validate our roadmap with experienced advisors and close our first institutional round.', '{Manufacturing & Industrial Technology}', '[{"name":"Dewi Pratama","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/dewi-pratama-sample"},{"name":"Nurul Santos","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/nurul-santos-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Hanoi","country":"Vietnam","profiles":{"startup":{"companyName":"MicroMold Works","industry":"Manufacturing & Industrial Technology","stage":"pre-seed","description":"MicroMold Works is a precision micro-moulding facility serving medical-device and electronics makers. We have a working prototype, 6 signed pilot partners in Vietnam and letters of intent from 9 enterprise prospects. Our systems retrofit existing machines, so customers avoid costly replacement.","website":"https://www.micromoldworks.example.com","linkedin":"https://www.linkedin.com/company/micromoldworks-sample","foundingYear":"2024","teamSize":"8","fundingRaised":"160000","fundingSought":"650000","businessRegistration":"Registered","businessRegistrationNumber":"MST 1531640149","registrationAuthorityJurisdiction":"Department of Planning and Investment, Vietnam","teamMembers":[{"id":"40e55ce8-a67e-4aef-b0e1-64a15d1186a0","name":"Dewi Pratama","role":"Head of Manufacturing","linkedin":"https://www.linkedin.com/in/dewi-pratama-sample"},{"id":"b421a7f0-074b-459b-87b4-2edde4ddd6a7","name":"Nurul Santos","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/nurul-santos-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 73. Skyforge Space (Chennai, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Arjun Chopra', 'arjun.chopra@skyforgespace.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 314 2087374', 'Chennai, India', 'We are joining MoneyMinds to meet early-stage investors who understand space-tech, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Skyforge Space', 'Chief Executive Officer at Skyforge Space', 'Space & Aerospace', 2025, 'Chennai, India', 'Skyforge Space is a small-satellite launch services company with reusable upper-stage technology. We have a validated proof of concept, 5 signed pilot partners in India and letters of intent from 8 enterprise prospects. Ground-tested components and a disciplined test programme reduce technical risk for customers.', 'https://www.skyforgespace.example.com', 'https://www.linkedin.com/company/skyforgespace-sample', '', 'arjun.chopra@skyforgespace.example.com', 'pre-seed', '$295K', '$550K', '', 'We are joining MoneyMinds to meet early-stage investors who understand space-tech, validate our roadmap with experienced advisors and close our first institutional round.', '{Space & Aerospace}', '[{"name":"Ananya Nair","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/ananya-nair-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Chennai","country":"India","profiles":{"startup":{"companyName":"Skyforge Space","industry":"Space & Aerospace","stage":"pre-seed","description":"Skyforge Space is a small-satellite launch services company with reusable upper-stage technology. We have a validated proof of concept, 5 signed pilot partners in India and letters of intent from 8 enterprise prospects. Ground-tested components and a disciplined test programme reduce technical risk for customers.","website":"https://www.skyforgespace.example.com","linkedin":"https://www.linkedin.com/company/skyforgespace-sample","foundingYear":"2025","teamSize":"7","fundingRaised":"295000","fundingSought":"550000","businessRegistration":"Registered","businessRegistrationNumber":"U72900TN2025PTC593370","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"b7135945-1180-4fc1-896f-eb668d9f0896","name":"Ananya Nair","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/ananya-nair-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 74. Lunaris Propulsion (Adelaide, Australia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Laura Dawson', 'laura.dawson@lunarispropulsion.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+61 472 3034295', 'Adelaide, Australia', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Lunaris Propulsion', 'Co-Founder & CEO at Lunaris Propulsion', 'Space & Aerospace', 2020, 'Adelaide, Australia', 'Lunaris Propulsion is an electric propulsion system that extends the life of commercial satellites. We operate in 17 markets with 573+ customers and $41.2M in annual revenue. Ground-tested components and a disciplined test programme reduce technical risk for customers.', 'https://www.lunarispropulsion.example.com', 'https://www.linkedin.com/company/lunarispropulsion-sample', '', 'laura.dawson@lunarispropulsion.example.com', 'series-b', '$40M', '$105M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{Space & Aerospace}', '[{"name":"Saga Lehtonen","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/saga-lehtonen-sample"},{"name":"Laura Hughes","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/laura-hughes-sample"},{"name":"Jean Njoroge","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jean-njoroge-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Adelaide","country":"Australia","profiles":{"startup":{"companyName":"Lunaris Propulsion","industry":"Space & Aerospace","stage":"series-b","description":"Lunaris Propulsion is an electric propulsion system that extends the life of commercial satellites. We operate in 17 markets with 573+ customers and $41.2M in annual revenue. Ground-tested components and a disciplined test programme reduce technical risk for customers.","website":"https://www.lunarispropulsion.example.com","linkedin":"https://www.linkedin.com/company/lunarispropulsion-sample","foundingYear":"2020","teamSize":"196","fundingRaised":"40000000","fundingSought":"105000000","businessRegistration":"Registered","businessRegistrationNumber":"ACN 587 294 502","registrationAuthorityJurisdiction":"Australian Securities and Investments Commission (ASIC), Australia","teamMembers":[{"id":"2839d8ae-50af-4eed-8f76-9d5ac2259d67","name":"Saga Lehtonen","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/saga-lehtonen-sample"},{"id":"fd5c23a6-4817-42f2-b11d-a3a04ed73301","name":"Laura Hughes","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/laura-hughes-sample"},{"id":"21b17e7f-e628-49fc-acbd-d3731efbdab1","name":"Jean Njoroge","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/jean-njoroge-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 75. Geoscribe Orbital (Abu Dhabi, United Arab Emirates)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Dina Qasim', 'dina.qasim@geoscribeorbital.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+971 680 8519971', 'Abu Dhabi, United Arab Emirates', 'We want to connect with investors and advisors who can help us scale Geoscribe Orbital beyond the United Arab Emirates, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Geoscribe Orbital', 'Co-Founder & CEO at Geoscribe Orbital', 'Space & Aerospace', 2023, 'Abu Dhabi, United Arab Emirates', 'Geoscribe Orbital is an Earth-observation data service that monitors infrastructure and crops from orbit. We have 4 funded research and commercial partnerships and a proven proof of concept with early revenue. Our team includes veterans of leading space agencies and engineering firms.', 'https://www.geoscribeorbital.example.com', 'https://www.linkedin.com/company/geoscribeorbital-sample', '', 'dina.qasim@geoscribeorbital.example.com', 'seed', '$1.2M', '$3.9M', '', 'We want to connect with investors and advisors who can help us scale Geoscribe Orbital beyond the United Arab Emirates, sharpen our go-to-market and prepare for a Series A.', '{Space & Aerospace}', '[{"name":"Karim Idrissi","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/karim-idrissi-sample"},{"name":"David Mwangi","role":"Head of Product","linkedin":"https://www.linkedin.com/in/david-mwangi-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Abu Dhabi","country":"United Arab Emirates","profiles":{"startup":{"companyName":"Geoscribe Orbital","industry":"Space & Aerospace","stage":"seed","description":"Geoscribe Orbital is an Earth-observation data service that monitors infrastructure and crops from orbit. We have 4 funded research and commercial partnerships and a proven proof of concept with early revenue. Our team includes veterans of leading space agencies and engineering firms.","website":"https://www.geoscribeorbital.example.com","linkedin":"https://www.linkedin.com/company/geoscribeorbital-sample","foundingYear":"2023","teamSize":"11","fundingRaised":"1225000","fundingSought":"3900000","businessRegistration":"Registered","businessRegistrationNumber":"DED-502189","registrationAuthorityJurisdiction":"Dubai Department of Economy and Tourism, United Arab Emirates","teamMembers":[{"id":"9237a436-c769-4468-9e6c-ce78d08067c5","name":"Karim Idrissi","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/karim-idrissi-sample"},{"id":"51c75d38-0194-41b2-bc3b-48ce71995207","name":"David Mwangi","role":"Head of Product","linkedin":"https://www.linkedin.com/in/david-mwangi-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 76. Nimbus Orbit (Ottawa, Canada)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Michael Mitchell', 'michael.mitchell@nimbusorbit.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 383 3324138', 'Ottawa, Canada', 'We want to connect with investors and advisors who can help us scale Nimbus Orbit beyond Canada, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Nimbus Orbit', 'Founder & Managing Director at Nimbus Orbit', 'Space & Aerospace', 2024, 'Ottawa, Canada', 'Nimbus Orbit is a space-weather forecasting platform that protects satellites and power grids. We have 10 funded research and commercial partnerships and a proven proof of concept with early revenue. Ground-tested components and a disciplined test programme reduce technical risk for customers.', 'https://www.nimbusorbit.example.com', 'https://www.linkedin.com/company/nimbusorbit-sample', '', 'michael.mitchell@nimbusorbit.example.com', 'seed', '$1.2M', '$3.9M', '', 'We want to connect with investors and advisors who can help us scale Nimbus Orbit beyond Canada, sharpen our go-to-market and prepare for a Series A.', '{Space & Aerospace}', '[{"name":"Megan Brooks","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/megan-brooks-sample"},{"name":"Subin Han","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/subin-han-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Ottawa","country":"Canada","profiles":{"startup":{"companyName":"Nimbus Orbit","industry":"Space & Aerospace","stage":"seed","description":"Nimbus Orbit is a space-weather forecasting platform that protects satellites and power grids. We have 10 funded research and commercial partnerships and a proven proof of concept with early revenue. Ground-tested components and a disciplined test programme reduce technical risk for customers.","website":"https://www.nimbusorbit.example.com","linkedin":"https://www.linkedin.com/company/nimbusorbit-sample","foundingYear":"2024","teamSize":"20","fundingRaised":"1200000","fundingSought":"3900000","businessRegistration":"Registered","businessRegistrationNumber":"Corporation No. 4838246-3","registrationAuthorityJurisdiction":"Corporations Canada, Canada","teamMembers":[{"id":"c8126edd-7225-48f5-9c18-af7dc95fa896","name":"Megan Brooks","role":"Chief Engineer","linkedin":"https://www.linkedin.com/in/megan-brooks-sample"},{"id":"865a3859-f344-4e2a-ac62-08aaf9c7b0bb","name":"Subin Han","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/subin-han-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 77. Rainmark Water (Cape Town, South Africa)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Riaan Molefe', 'riaan.molefe@rainmarkwater.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+27 902 3492945', 'Cape Town, South Africa', 'Our goal is to find strategic water-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Rainmark Water', 'Co-Founder & COO at Rainmark Water', 'Water & Environmental Technology', 2023, 'Cape Town, South Africa', 'Rainmark Water is a decentralised water-recycling system for municipalities and industrial sites. The product is live with 8 paying customers and 20% month-over-month revenue growth. Our systems cut energy use and chemical consumption versus conventional treatment.', 'https://www.rainmarkwater.example.com', 'https://www.linkedin.com/company/rainmarkwater-sample', '', 'riaan.molefe@rainmarkwater.example.com', 'seed', '$1.8M', '$3.4M', '', 'Our goal is to find strategic water-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Water & Environmental Technology}', '[{"name":"Willem Joubert","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/willem-joubert-sample"},{"name":"Zanele Zulu","role":"Head of Product","linkedin":"https://www.linkedin.com/in/zanele-zulu-sample"},{"name":"Palesa Venter","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/palesa-venter-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Cape Town","country":"South Africa","profiles":{"startup":{"companyName":"Rainmark Water","industry":"Water & Environmental Technology","stage":"seed","description":"Rainmark Water is a decentralised water-recycling system for municipalities and industrial sites. The product is live with 8 paying customers and 20% month-over-month revenue growth. Our systems cut energy use and chemical consumption versus conventional treatment.","website":"https://www.rainmarkwater.example.com","linkedin":"https://www.linkedin.com/company/rainmarkwater-sample","foundingYear":"2023","teamSize":"19","fundingRaised":"1775000","fundingSought":"3400000","businessRegistration":"Registered","businessRegistrationNumber":"2023/912147/07","registrationAuthorityJurisdiction":"Companies and Intellectual Property Commission (CIPC), South Africa","teamMembers":[{"id":"b8d693f0-e526-4690-8ad8-18c6a5d1235b","name":"Willem Joubert","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/willem-joubert-sample"},{"id":"4d74e401-021b-4b98-b72e-cb5d951d36d5","name":"Zanele Zulu","role":"Head of Product","linkedin":"https://www.linkedin.com/in/zanele-zulu-sample"},{"id":"014f0c24-0c6d-4ba8-988c-3c60a89a26d1","name":"Palesa Venter","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/palesa-venter-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 78. BlueCurrent Tech (Haifa, Israel)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Itai Azulay', 'itai.azulay@bluecurrenttech.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+972 507 3560140', 'Haifa, Israel', 'BlueCurrent Tech is looking for investors with water-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'BlueCurrent Tech', 'Founder & Managing Director at BlueCurrent Tech', 'Water & Environmental Technology', 2019, 'Haifa, Israel', 'BlueCurrent Tech is a low-energy desalination module for coastal communities and resorts. We serve 73 customers across 9 countries and generate $4.1M in annual revenue. Remote monitoring gives utilities live data and predictive maintenance.', 'https://www.bluecurrenttech.example.com', 'https://www.linkedin.com/company/bluecurrenttech-sample', '', 'itai.azulay@bluecurrenttech.example.com', 'series-a', '$11M', '$17M', '', 'BlueCurrent Tech is looking for investors with water-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Water & Environmental Technology}', '[{"name":"Hui Ng","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/hui-ng-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Haifa","country":"Israel","profiles":{"startup":{"companyName":"BlueCurrent Tech","industry":"Water & Environmental Technology","stage":"series-a","description":"BlueCurrent Tech is a low-energy desalination module for coastal communities and resorts. We serve 73 customers across 9 countries and generate $4.1M in annual revenue. Remote monitoring gives utilities live data and predictive maintenance.","website":"https://www.bluecurrenttech.example.com","linkedin":"https://www.linkedin.com/company/bluecurrenttech-sample","foundingYear":"2019","teamSize":"46","fundingRaised":"11000000","fundingSought":"17000000","businessRegistration":"Registered","businessRegistrationNumber":"51-520942-2","registrationAuthorityJurisdiction":"Israeli Corporations Authority, Israel","teamMembers":[{"id":"48ea0161-b0f0-46e9-a6b5-6d8607214bf9","name":"Hui Ng","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/hui-ng-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 79. Hydrosense (Monterrey, Mexico)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Gabriel Pacheco', 'gabriel.pacheco@hydrosense.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+52 503 0675394', 'Monterrey, Mexico', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Hydrosense', 'Co-Founder & Chief Product Officer at Hydrosense', 'Water & Environmental Technology', 2017, 'Monterrey, Mexico', 'Hydrosense is an IoT leak-detection platform that lowers water loss for city utilities. We operate in 10 markets with 116+ customers and $20.4M in annual revenue. Remote monitoring gives utilities live data and predictive maintenance.', 'https://www.hydrosense.example.com', 'https://www.linkedin.com/company/hydrosense-sample', '', 'gabriel.pacheco@hydrosense.example.com', 'series-b', '$31M', '$75M', '', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', '{Water & Environmental Technology}', '[{"name":"Merve Sahin","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/merve-sahin-sample"},{"name":"Budi Pham","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/budi-pham-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Monterrey","country":"Mexico","profiles":{"startup":{"companyName":"Hydrosense","industry":"Water & Environmental Technology","stage":"series-b","description":"Hydrosense is an IoT leak-detection platform that lowers water loss for city utilities. We operate in 10 markets with 116+ customers and $20.4M in annual revenue. Remote monitoring gives utilities live data and predictive maintenance.","website":"https://www.hydrosense.example.com","linkedin":"https://www.linkedin.com/company/hydrosense-sample","foundingYear":"2017","teamSize":"216","fundingRaised":"31000000","fundingSought":"75000000","businessRegistration":"Registered","businessRegistrationNumber":"Folio Mercantil 119604","registrationAuthorityJurisdiction":"Registro Publico de Comercio, Mexico","teamMembers":[{"id":"88304261-ad8e-4a11-a381-06a0859afaca","name":"Merve Sahin","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/merve-sahin-sample"},{"id":"5e95817c-d8c8-4e60-a7b1-b49e3819c6f3","name":"Budi Pham","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/budi-pham-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 80. ClearTide (Cebu, Philippines)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Dewi Reyes', 'dewi.reyes@cleartide.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+63 564 1549765', 'Cebu, Philippines', 'We want to connect with investors and advisors who can help us scale ClearTide beyond the Philippines, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ClearTide', 'Co-Founder & COO at ClearTide', 'Water & Environmental Technology', 2023, 'Cebu, Philippines', 'ClearTide is a wastewater treatment service for food-processing plants and fisheries. The product is live with 6 paying customers and 11% month-over-month revenue growth. Remote monitoring gives utilities live data and predictive maintenance.', 'https://www.cleartide.example.com', 'https://www.linkedin.com/company/cleartide-sample', '', 'dewi.reyes@cleartide.example.com', 'seed', '$1.3M', '$4.6M', '', 'We want to connect with investors and advisors who can help us scale ClearTide beyond the Philippines, sharpen our go-to-market and prepare for a Series A.', '{Water & Environmental Technology}', '[{"name":"Lotte Willems","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/lotte-willems-sample"},{"name":"Aurelie Rousseau","role":"Head of Product","linkedin":"https://www.linkedin.com/in/aurelie-rousseau-sample"},{"name":"Wanjiru Mwangi","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/wanjiru-mwangi-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Cebu","country":"Philippines","profiles":{"startup":{"companyName":"ClearTide","industry":"Water & Environmental Technology","stage":"seed","description":"ClearTide is a wastewater treatment service for food-processing plants and fisheries. The product is live with 6 paying customers and 11% month-over-month revenue growth. Remote monitoring gives utilities live data and predictive maintenance.","website":"https://www.cleartide.example.com","linkedin":"https://www.linkedin.com/company/cleartide-sample","foundingYear":"2023","teamSize":"16","fundingRaised":"1250000","fundingSought":"4600000","businessRegistration":"Registered","businessRegistrationNumber":"CS202338299","registrationAuthorityJurisdiction":"Securities and Exchange Commission (SEC), Philippines","teamMembers":[{"id":"835af22e-08bd-4b15-a165-94c64cace50b","name":"Lotte Willems","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/lotte-willems-sample"},{"id":"b3ecb1d6-4ffc-4b7f-b375-0daae745946d","name":"Aurelie Rousseau","role":"Head of Product","linkedin":"https://www.linkedin.com/in/aurelie-rousseau-sample"},{"id":"6961144d-2be9-4bce-b89f-b4d3915c1df1","name":"Wanjiru Mwangi","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/wanjiru-mwangi-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 81. ComplyPilot (London, United Kingdom)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Michael Dawson', 'michael.dawson@complypilot.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+44 826 3468904', 'London, United Kingdom', 'ComplyPilot is looking for investors with regtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ComplyPilot', 'Chief Executive Officer at ComplyPilot', 'Legal & Compliance Technology (RegTech)', 2021, 'London, United Kingdom', 'ComplyPilot is an automated KYC and AML monitoring service for fintechs and payment firms. We serve 310 customers across 8 countries and generate $5.8M in annual recurring revenue. Customers cut review time sharply while improving audit readiness.', 'https://www.complypilot.example.com', 'https://www.linkedin.com/company/complypilot-sample', '', 'michael.dawson@complypilot.example.com', 'series-a', '$12M', '$19M', '', 'ComplyPilot is looking for investors with regtech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Legal & Compliance Technology (RegTech)}', '[{"name":"Hannah Carter","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/hannah-carter-sample"},{"name":"Can Koc","role":"Head of Product","linkedin":"https://www.linkedin.com/in/can-koc-sample"},{"name":"Hana Saleh","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/hana-saleh-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"London","country":"United Kingdom","profiles":{"startup":{"companyName":"ComplyPilot","industry":"Legal & Compliance Technology (RegTech)","stage":"series-a","description":"ComplyPilot is an automated KYC and AML monitoring service for fintechs and payment firms. We serve 310 customers across 8 countries and generate $5.8M in annual recurring revenue. Customers cut review time sharply while improving audit readiness.","website":"https://www.complypilot.example.com","linkedin":"https://www.linkedin.com/company/complypilot-sample","foundingYear":"2021","teamSize":"36","fundingRaised":"12000000","fundingSought":"19000000","businessRegistration":"Registered","businessRegistrationNumber":"17828020","registrationAuthorityJurisdiction":"Companies House (England and Wales), United Kingdom","teamMembers":[{"id":"fd4370a2-6aa3-480c-a8db-aad736696eb4","name":"Hannah Carter","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/hannah-carter-sample"},{"id":"81e0bb64-a665-4adb-bb55-4acfad54439b","name":"Can Koc","role":"Head of Product","linkedin":"https://www.linkedin.com/in/can-koc-sample"},{"id":"b6f680cf-af68-4508-aa70-f4bf17470776","name":"Hana Saleh","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/hana-saleh-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 82. RegBridge (Singapore, Singapore)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Hao Goh', 'hao.goh@regbridge.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+65 963 0229247', 'Singapore, Singapore', 'RegBridge wants to connect with regtech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'RegBridge', 'Founder & Managing Director at RegBridge', 'Legal & Compliance Technology (RegTech)', 2024, 'Singapore, Singapore', 'RegBridge is a regulatory-change tracker that maps new rules to company policies. We have a working prototype, 6 signed pilot partners in Singapore and letters of intent from 9 enterprise prospects. Our rules engine is maintained by in-house lawyers and updated as regulations change.', 'https://www.regbridge.example.com', 'https://www.linkedin.com/company/regbridge-sample', '', 'hao.goh@regbridge.example.com', 'pre-seed', '$120K', '$1.1M', '', 'RegBridge wants to connect with regtech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Legal & Compliance Technology (RegTech)}', '[{"name":"Ling Wong","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/ling-wong-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Singapore","country":"Singapore","profiles":{"startup":{"companyName":"RegBridge","industry":"Legal & Compliance Technology (RegTech)","stage":"pre-seed","description":"RegBridge is a regulatory-change tracker that maps new rules to company policies. We have a working prototype, 6 signed pilot partners in Singapore and letters of intent from 9 enterprise prospects. Our rules engine is maintained by in-house lawyers and updated as regulations change.","website":"https://www.regbridge.example.com","linkedin":"https://www.linkedin.com/company/regbridge-sample","foundingYear":"2024","teamSize":"7","fundingRaised":"120000","fundingSought":"1100000","businessRegistration":"Registered","businessRegistrationNumber":"UEN 202483121G","registrationAuthorityJurisdiction":"Accounting and Corporate Regulatory Authority (ACRA), Singapore","teamMembers":[{"id":"4ec6e782-4af9-49c2-ad89-69c6ddef595e","name":"Ling Wong","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/ling-wong-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 83. ContractLeaf (Vancouver, Canada)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Oliver Fletcher', 'oliver.fletcher@contractleaf.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 319 7042724', 'Vancouver, Canada', 'Our goal is to find strategic regtech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ContractLeaf', 'Founder & CEO at ContractLeaf', 'Legal & Compliance Technology (RegTech)', 2024, 'Vancouver, Canada', 'ContractLeaf is an AI contract-review tool that flags risk and suggests standard clauses. The product is live with 156 paying customers and 10% month-over-month revenue growth. Our rules engine is maintained by in-house lawyers and updated as regulations change.', 'https://www.contractleaf.example.com', 'https://www.linkedin.com/company/contractleaf-sample', '', 'oliver.fletcher@contractleaf.example.com', 'seed', '$1.9M', '$4.1M', '', 'Our goal is to find strategic regtech investors and expert financial guidance to fund product development and expand into new regions.', '{Legal & Compliance Technology (RegTech)}', '[{"name":"James Mitchell","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/james-mitchell-sample"},{"name":"Laura Mitchell","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/laura-mitchell-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Vancouver","country":"Canada","profiles":{"startup":{"companyName":"ContractLeaf","industry":"Legal & Compliance Technology (RegTech)","stage":"seed","description":"ContractLeaf is an AI contract-review tool that flags risk and suggests standard clauses. The product is live with 156 paying customers and 10% month-over-month revenue growth. Our rules engine is maintained by in-house lawyers and updated as regulations change.","website":"https://www.contractleaf.example.com","linkedin":"https://www.linkedin.com/company/contractleaf-sample","foundingYear":"2024","teamSize":"12","fundingRaised":"1850000","fundingSought":"4100000","businessRegistration":"Registered","businessRegistrationNumber":"Corporation No. 9624425-1","registrationAuthorityJurisdiction":"Corporations Canada, Canada","teamMembers":[{"id":"e71cb84a-62e9-4f3e-9c80-605d4ca165ce","name":"James Mitchell","role":"Head of Legal & Compliance","linkedin":"https://www.linkedin.com/in/james-mitchell-sample"},{"id":"2b4f628d-68f9-49e2-8f57-0b581e623941","name":"Laura Mitchell","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/laura-mitchell-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 84. AuditAnchor (Madrid, Spain)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Javier Romero', 'javier.romero@auditanchor.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+34 519 9747390', 'Madrid, Spain', 'AuditAnchor wants to connect with regtech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'AuditAnchor', 'Founder & CEO at AuditAnchor', 'Legal & Compliance Technology (RegTech)', 2024, 'Madrid, Spain', 'AuditAnchor is a continuous-audit platform that gives finance teams real-time control testing. We have a working prototype, 3 signed pilot partners in Spain and letters of intent from 6 enterprise prospects. Customers cut review time sharply while improving audit readiness.', 'https://www.auditanchor.example.com', 'https://www.linkedin.com/company/auditanchor-sample', '', 'javier.romero@auditanchor.example.com', 'pre-seed', '$85K', '$850K', '', 'AuditAnchor wants to connect with regtech investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Legal & Compliance Technology (RegTech)}', '[{"name":"Sergio Castillo","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/sergio-castillo-sample"},{"name":"Diego Fernandez","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/diego-fernandez-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Madrid","country":"Spain","profiles":{"startup":{"companyName":"AuditAnchor","industry":"Legal & Compliance Technology (RegTech)","stage":"pre-seed","description":"AuditAnchor is a continuous-audit platform that gives finance teams real-time control testing. We have a working prototype, 3 signed pilot partners in Spain and letters of intent from 6 enterprise prospects. Customers cut review time sharply while improving audit readiness.","website":"https://www.auditanchor.example.com","linkedin":"https://www.linkedin.com/company/auditanchor-sample","foundingYear":"2024","teamSize":"4","fundingRaised":"85000","fundingSought":"850000","businessRegistration":"Registered","businessRegistrationNumber":"B29336895","registrationAuthorityJurisdiction":"Registro Mercantil, Spain","teamMembers":[{"id":"f35c361e-46fc-45b4-8f20-bcdd625e5a12","name":"Sergio Castillo","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/sergio-castillo-sample"},{"id":"635a4759-0aa2-4cb4-b006-6a7acf8e8d6a","name":"Diego Fernandez","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/diego-fernandez-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 85. TalentTide (Islamabad, Pakistan)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ahmed Khan', 'ahmed.khan@talenttide.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+92 546 9470814', 'Islamabad, Pakistan', 'TalentTide is looking for investors with HR-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'TalentTide', 'Co-Founder & CTO at TalentTide', 'HR & Workforce Technology', 2022, 'Islamabad, Pakistan', 'TalentTide is a remote-hiring marketplace that matches skilled engineers with international employers. We serve 290 customers across 9 countries and generate $7.8M in annual recurring revenue. Deep payroll and compliance integrations make adoption simple.', 'https://www.talenttide.example.com', 'https://www.linkedin.com/company/talenttide-sample', '', 'ahmed.khan@talenttide.example.com', 'series-a', '$11M', '$30M', '', 'TalentTide is looking for investors with HR-tech expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{HR & Workforce Technology}', '[{"name":"Sana Mirza","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/sana-mirza-sample"},{"name":"Khalid Haddad","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/khalid-haddad-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Islamabad","country":"Pakistan","profiles":{"startup":{"companyName":"TalentTide","industry":"HR & Workforce Technology","stage":"series-a","description":"TalentTide is a remote-hiring marketplace that matches skilled engineers with international employers. We serve 290 customers across 9 countries and generate $7.8M in annual recurring revenue. Deep payroll and compliance integrations make adoption simple.","website":"https://www.talenttide.example.com","linkedin":"https://www.linkedin.com/company/talenttide-sample","foundingYear":"2022","teamSize":"28","fundingRaised":"11000000","fundingSought":"30000000","businessRegistration":"Registered","businessRegistrationNumber":"SECP Reg. No. 3798705","registrationAuthorityJurisdiction":"Securities and Exchange Commission of Pakistan (SECP), Pakistan","teamMembers":[{"id":"116aef36-4c7b-4aca-bceb-04bbfa1796bd","name":"Sana Mirza","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/sana-mirza-sample"},{"id":"57e3f7df-e923-448b-b945-5c8e9f5f6aa2","name":"Khalid Haddad","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/khalid-haddad-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 86. HireOrbit (Hamburg, Germany)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Julia Baumann', 'julia.baumann@hireorbit.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+49 371 5398248', 'Hamburg, Germany', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'HireOrbit', 'Founder & CEO at HireOrbit', 'HR & Workforce Technology', 2020, 'Hamburg, Germany', 'HireOrbit is a recruitment platform that uses structured assessments to reduce bias. We serve 1,370 customers across 9 countries and generate $1.9M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.', 'https://www.hireorbit.example.com', 'https://www.linkedin.com/company/hireorbit-sample', '', 'julia.baumann@hireorbit.example.com', 'series-a', '$16M', '$52.5M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{HR & Workforce Technology}', '[{"name":"Clara Lindner","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/clara-lindner-sample"},{"name":"Brian Niyonzima","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/brian-niyonzima-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Hamburg","country":"Germany","profiles":{"startup":{"companyName":"HireOrbit","industry":"HR & Workforce Technology","stage":"series-a","description":"HireOrbit is a recruitment platform that uses structured assessments to reduce bias. We serve 1,370 customers across 9 countries and generate $1.9M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.","website":"https://www.hireorbit.example.com","linkedin":"https://www.linkedin.com/company/hireorbit-sample","foundingYear":"2020","teamSize":"49","fundingRaised":"16000000","fundingSought":"52500000","businessRegistration":"Registered","businessRegistrationNumber":"HRB 371772","registrationAuthorityJurisdiction":"Handelsregister (Commercial Register), Germany","teamMembers":[{"id":"855086ab-d4b8-4370-a8b0-d686d3c870ed","name":"Clara Lindner","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/clara-lindner-sample"},{"id":"19fec6b6-b1b3-4e18-be90-fa62f760eb3a","name":"Brian Niyonzima","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/brian-niyonzima-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 87. ShiftEase (New York, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Megan Reynolds', 'megan.reynolds@shiftease.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 266 4783317', 'New York, United States', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'ShiftEase', 'Founder & Managing Director at ShiftEase', 'HR & Workforce Technology', 2022, 'New York, United States', 'ShiftEase is a scheduling and shift-marketplace app for hospitality and healthcare workers. We serve 1,560 customers across 3 countries and generate $2.0M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.', 'https://www.shiftease.example.com', 'https://www.linkedin.com/company/shiftease-sample', '', 'megan.reynolds@shiftease.example.com', 'series-a', '$8M', '$15M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{HR & Workforce Technology}', '[{"name":"Dewald Botha","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/dewald-botha-sample"},{"name":"Daniel Griffin","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/daniel-griffin-sample"},{"name":"Oliver Hughes","role":"Head of Product","linkedin":"https://www.linkedin.com/in/oliver-hughes-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"New York","country":"United States","profiles":{"startup":{"companyName":"ShiftEase","industry":"HR & Workforce Technology","stage":"series-a","description":"ShiftEase is a scheduling and shift-marketplace app for hospitality and healthcare workers. We serve 1,560 customers across 3 countries and generate $2.0M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.","website":"https://www.shiftease.example.com","linkedin":"https://www.linkedin.com/company/shiftease-sample","foundingYear":"2022","teamSize":"35","fundingRaised":"8000000","fundingSought":"15000000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 4360544","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"05be992b-d058-43e0-87ab-08377b6df0c8","name":"Dewald Botha","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/dewald-botha-sample"},{"id":"175b9d6f-52f7-4356-8aea-cde05002e58e","name":"Daniel Griffin","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/daniel-griffin-sample"},{"id":"7159f80d-aa9e-486d-8328-d98796cd47d8","name":"Oliver Hughes","role":"Head of Product","linkedin":"https://www.linkedin.com/in/oliver-hughes-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 88. TeamPulse Labs (Santiago, Chile)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Andres Ramirez', 'andres.ramirez@teampulselabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+56 425 6817079', 'Santiago, Chile', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'TeamPulse Labs', 'Co-Founder & CTO at TeamPulse Labs', 'HR & Workforce Technology', 2019, 'Santiago, Chile', 'TeamPulse Labs is an employee-engagement analytics tool that predicts attrition risk. We operate in 14 markets with 5,800+ customers and $17.7M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.', 'https://www.teampulselabs.example.com', 'https://www.linkedin.com/company/teampulselabs-sample', '', 'andres.ramirez@teampulselabs.example.com', 'series-b', '$45M', '$75M', '', 'We want to build relationships with institutional investors and financial advisors ahead of a late-stage round and long-term capital planning.', '{HR & Workforce Technology}', '[{"name":"Sebastian Herrera","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/sebastian-herrera-sample"},{"name":"Irem Kurt","role":"Head of Product","linkedin":"https://www.linkedin.com/in/irem-kurt-sample"},{"name":"Joaquin Duarte","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/joaquin-duarte-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Santiago","country":"Chile","profiles":{"startup":{"companyName":"TeamPulse Labs","industry":"HR & Workforce Technology","stage":"series-b","description":"TeamPulse Labs is an employee-engagement analytics tool that predicts attrition risk. We operate in 14 markets with 5,800+ customers and $17.7M in annual recurring revenue. Our matching engine improves hire quality and cuts time to fill.","website":"https://www.teampulselabs.example.com","linkedin":"https://www.linkedin.com/company/teampulselabs-sample","foundingYear":"2019","teamSize":"186","fundingRaised":"45000000","fundingSought":"75000000","businessRegistration":"Registered","businessRegistrationNumber":"RUT 76.502.780-9","registrationAuthorityJurisdiction":"Servicio de Impuestos Internos / Registro de Comercio, Chile","teamMembers":[{"id":"d1a22e54-f73a-4a6c-a091-107e1ca9a163","name":"Sebastian Herrera","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/sebastian-herrera-sample"},{"id":"faace7a6-bb41-426f-b67b-50d677a98cda","name":"Irem Kurt","role":"Head of Product","linkedin":"https://www.linkedin.com/in/irem-kurt-sample"},{"id":"59cce8a6-eff5-4a8d-b442-c3c8cee57df7","name":"Joaquin Duarte","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/joaquin-duarte-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 89. MeshWave Networks (Abuja, Nigeria)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Kofi Danjuma', 'kofi.danjuma@meshwavenetworks.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+234 618 1000159', 'Abuja, Nigeria', 'MeshWave Networks wants to connect with IoT investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'MeshWave Networks', 'Co-Founder & CTO at MeshWave Networks', 'Telecommunications & IoT', 2025, 'Abuja, Nigeria', 'MeshWave Networks is a community mesh-network service that brings affordable internet to underserved towns. We have a working prototype, 6 signed pilot partners in Nigeria and letters of intent from 9 enterprise prospects. Large pilot deployments prove reliability at scale.', 'https://www.meshwavenetworks.example.com', 'https://www.linkedin.com/company/meshwavenetworks-sample', '', 'kofi.danjuma@meshwavenetworks.example.com', 'pre-seed', '$195K', '$750K', '', 'MeshWave Networks wants to connect with IoT investors and financial advisors who can help us turn pilots into paying customers and prepare for a seed round.', '{Telecommunications & IoT}', '[{"name":"Efua Adeyemi","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/efua-adeyemi-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Abuja","country":"Nigeria","profiles":{"startup":{"companyName":"MeshWave Networks","industry":"Telecommunications & IoT","stage":"pre-seed","description":"MeshWave Networks is a community mesh-network service that brings affordable internet to underserved towns. We have a working prototype, 6 signed pilot partners in Nigeria and letters of intent from 9 enterprise prospects. Large pilot deployments prove reliability at scale.","website":"https://www.meshwavenetworks.example.com","linkedin":"https://www.linkedin.com/company/meshwavenetworks-sample","foundingYear":"2025","teamSize":"5","fundingRaised":"195000","fundingSought":"750000","businessRegistration":"Registered","businessRegistrationNumber":"RC 6863997","registrationAuthorityJurisdiction":"Corporate Affairs Commission (CAC), Nigeria","teamMembers":[{"id":"2573cb84-424c-48e8-9ced-485eeccbd673","name":"Efua Adeyemi","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/efua-adeyemi-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 90. SignalForge (Helsinki, Finland)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Mikael Nielsen', 'mikael.nielsen@signalforge.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+358 929 7792332', 'Helsinki, Finland', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'SignalForge', 'Co-Founder & CEO at SignalForge', 'Telecommunications & IoT', 2019, 'Helsinki, Finland', 'SignalForge is a private 5G network platform for ports, mines and factories. We operate in 9 markets with 3,400+ customers and $49.7M in annual recurring revenue. Large pilot deployments prove reliability at scale.', 'https://www.signalforge.example.com', 'https://www.linkedin.com/company/signalforge-sample', '', 'mikael.nielsen@signalforge.example.com', 'series-b', '$31M', '$90M', '', 'We are joining MoneyMinds to engage growth-stage investors and advisors on international expansion, strategic acquisitions and pre-IPO readiness.', '{Telecommunications & IoT}', '[{"name":"Marco Barbieri","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/marco-barbieri-sample"},{"name":"Sofie Larsen","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sofie-larsen-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Helsinki","country":"Finland","profiles":{"startup":{"companyName":"SignalForge","industry":"Telecommunications & IoT","stage":"series-b","description":"SignalForge is a private 5G network platform for ports, mines and factories. We operate in 9 markets with 3,400+ customers and $49.7M in annual recurring revenue. Large pilot deployments prove reliability at scale.","website":"https://www.signalforge.example.com","linkedin":"https://www.linkedin.com/company/signalforge-sample","foundingYear":"2019","teamSize":"115","fundingRaised":"31000000","fundingSought":"90000000","businessRegistration":"Registered","businessRegistrationNumber":"9408731-2","registrationAuthorityJurisdiction":"Finnish Patent and Registration Office (PRH), Finland","teamMembers":[{"id":"62527e7d-ca11-4321-92c0-bb53c91e899e","name":"Marco Barbieri","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/marco-barbieri-sample"},{"id":"001c6c2a-9cfa-4676-897c-c8328d4818a2","name":"Sofie Larsen","role":"Head of Product","linkedin":"https://www.linkedin.com/in/sofie-larsen-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 91. IoTrellis (Gurugram, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Vikram Joshi', 'vikram.joshi@iotrellis.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 369 1091912', 'Gurugram, India', 'IoTrellis is looking for investors with IoT expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'IoTrellis', 'Co-Founder & CEO at IoTrellis', 'Telecommunications & IoT', 2021, 'Gurugram, India', 'IoTrellis is an IoT device-management platform for smart buildings and cold-chain assets. We serve 740 customers across 3 countries and generate $4.1M in annual recurring revenue. Our network-agnostic platform runs on any carrier and any device.', 'https://www.iotrellis.example.com', 'https://www.linkedin.com/company/iotrellis-sample', '', 'vikram.joshi@iotrellis.example.com', 'series-a', '$17M', '$27M', '', 'IoTrellis is looking for investors with IoT expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Telecommunications & IoT}', '[{"name":"Divya Gupta","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/divya-gupta-sample"},{"name":"Meera Menon","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/meera-menon-sample"},{"name":"Taeyang Park","role":"Head of Product","linkedin":"https://www.linkedin.com/in/taeyang-park-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Gurugram","country":"India","profiles":{"startup":{"companyName":"IoTrellis","industry":"Telecommunications & IoT","stage":"series-a","description":"IoTrellis is an IoT device-management platform for smart buildings and cold-chain assets. We serve 740 customers across 3 countries and generate $4.1M in annual recurring revenue. Our network-agnostic platform runs on any carrier and any device.","website":"https://www.iotrellis.example.com","linkedin":"https://www.linkedin.com/company/iotrellis-sample","foundingYear":"2021","teamSize":"45","fundingRaised":"17000000","fundingSought":"27000000","businessRegistration":"Registered","businessRegistrationNumber":"U72900HR2021PTC102692","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"5c807842-08a9-4baf-93c0-986c7a6d63b6","name":"Divya Gupta","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/divya-gupta-sample"},{"id":"6469f6f9-2b76-48c6-a61f-957858a0a430","name":"Meera Menon","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/meera-menon-sample"},{"id":"92b642a6-fb2a-48a8-a15f-660e556f98de","name":"Taeyang Park","role":"Head of Product","linkedin":"https://www.linkedin.com/in/taeyang-park-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 92. LinkSphere (Ankara, Turkey)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Defne Aydin', 'defne.aydin@linksphere.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+90 684 3077263', 'Ankara, Turkey', 'LinkSphere is looking for investors with IoT expertise and advisors who can help us optimise capital allocation as we expand into new markets.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'LinkSphere', 'Founder & CEO at LinkSphere', 'Telecommunications & IoT', 2022, 'Ankara, Turkey', 'LinkSphere is a satellite-and-fibre connectivity broker for enterprises and public institutions. We serve 1,470 customers across 4 countries and generate $6.7M in annual recurring revenue. Large pilot deployments prove reliability at scale.', 'https://www.linksphere.example.com', 'https://www.linkedin.com/company/linksphere-sample', '', 'defne.aydin@linksphere.example.com', 'series-a', '$9M', '$23.5M', '', 'LinkSphere is looking for investors with IoT expertise and advisors who can help us optimise capital allocation as we expand into new markets.', '{Telecommunications & IoT}', '[{"name":"Ece Kaya","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/ece-kaya-sample"},{"name":"Sipho Steyn","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/sipho-steyn-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Ankara","country":"Turkey","profiles":{"startup":{"companyName":"LinkSphere","industry":"Telecommunications & IoT","stage":"series-a","description":"LinkSphere is a satellite-and-fibre connectivity broker for enterprises and public institutions. We serve 1,470 customers across 4 countries and generate $6.7M in annual recurring revenue. Large pilot deployments prove reliability at scale.","website":"https://www.linksphere.example.com","linkedin":"https://www.linkedin.com/company/linksphere-sample","foundingYear":"2022","teamSize":"43","fundingRaised":"9000000","fundingSought":"23500000","businessRegistration":"Registered","businessRegistrationNumber":"Sicil No. 993519","registrationAuthorityJurisdiction":"Trade Registry Office (Ticaret Sicil), Turkey","teamMembers":[{"id":"7ca3e825-20e5-4f75-bd7c-7ffeea19d747","name":"Ece Kaya","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/ece-kaya-sample"},{"id":"005da752-8414-452d-ae20-7b52f5ca7ab4","name":"Sipho Steyn","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/sipho-steyn-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 93. CreatorKit (Los Angeles, United States)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Daniel Dawson', 'daniel.dawson@creatorkit.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+1 656 1415650', 'Los Angeles, United States', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'CreatorKit', 'Co-Founder & CEO at CreatorKit', 'Media & Creator Economy', 2021, 'Los Angeles, United States', 'CreatorKit is an all-in-one toolkit that lets creators sell memberships, courses and merchandise. We serve 220 customers across 3 countries and generate $7.9M in annual recurring revenue. Our tools help creators earn more with less overhead.', 'https://www.creatorkit.example.com', 'https://www.linkedin.com/company/creatorkit-sample', '', 'daniel.dawson@creatorkit.example.com', 'series-a', '$4M', '$25M', '', 'We are seeking strategic investors and financial advisors to support regional expansion and to structure our next growth round.', '{Media & Creator Economy}', '[{"name":"James Bennett","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/james-bennett-sample"},{"name":"Federica Greco","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/federica-greco-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Los Angeles","country":"United States","profiles":{"startup":{"companyName":"CreatorKit","industry":"Media & Creator Economy","stage":"series-a","description":"CreatorKit is an all-in-one toolkit that lets creators sell memberships, courses and merchandise. We serve 220 customers across 3 countries and generate $7.9M in annual recurring revenue. Our tools help creators earn more with less overhead.","website":"https://www.creatorkit.example.com","linkedin":"https://www.linkedin.com/company/creatorkit-sample","foundingYear":"2021","teamSize":"67","fundingRaised":"4000000","fundingSought":"25000000","businessRegistration":"Registered","businessRegistrationNumber":"File No. 2138491","registrationAuthorityJurisdiction":"Delaware Division of Corporations, United States","teamMembers":[{"id":"f5c47cca-413e-4b0a-b2ee-74da33a7a535","name":"James Bennett","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/james-bennett-sample"},{"id":"0657c48d-636c-4ad0-aabc-ff80038bd62b","name":"Federica Greco","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/federica-greco-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 94. StoryLoom Media (Lyon, France)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Antoine Mercier', 'antoine.mercier@storyloommedia.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+33 856 5246577', 'Lyon, France', 'Our goal is to find strategic creator-economy investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'StoryLoom Media', 'Co-Founder & Chief Product Officer at StoryLoom Media', 'Media & Creator Economy', 2023, 'Lyon, France', 'StoryLoom Media is a vertical-video studio producing branded series for streaming platforms. The product is live with 180 paying customers and 19% month-over-month revenue growth. Strong creator retention and organic referrals keep acquisition cost low.', 'https://www.storyloommedia.example.com', 'https://www.linkedin.com/company/storyloommedia-sample', '', 'antoine.mercier@storyloommedia.example.com', 'seed', '$1.4M', '$3.2M', '', 'Our goal is to find strategic creator-economy investors and expert financial guidance to fund product development and expand into new regions.', '{Media & Creator Economy}', '[{"name":"Aurelie Dupont","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/aurelie-dupont-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Lyon","country":"France","profiles":{"startup":{"companyName":"StoryLoom Media","industry":"Media & Creator Economy","stage":"seed","description":"StoryLoom Media is a vertical-video studio producing branded series for streaming platforms. The product is live with 180 paying customers and 19% month-over-month revenue growth. Strong creator retention and organic referrals keep acquisition cost low.","website":"https://www.storyloommedia.example.com","linkedin":"https://www.linkedin.com/company/storyloommedia-sample","foundingYear":"2023","teamSize":"13","fundingRaised":"1400000","fundingSought":"3200000","businessRegistration":"Registered","businessRegistrationNumber":"SIREN 325 434 821","registrationAuthorityJurisdiction":"Registre du Commerce et des Societes (RCS), France","teamMembers":[{"id":"9e655eb6-8242-4b6b-8d6d-ba271dd1cee0","name":"Aurelie Dupont","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/aurelie-dupont-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 95. Clipharbor (Rio de Janeiro, Brazil)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Fernanda Rojas', 'fernanda.rojas@clipharbor.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+55 967 5793181', 'Rio de Janeiro, Brazil', 'We are joining MoneyMinds to meet early-stage investors who understand creator-economy, validate our roadmap with experienced advisors and close our first institutional round.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Clipharbor', 'Co-Founder & Chief Product Officer at Clipharbor', 'Media & Creator Economy', 2025, 'Rio de Janeiro, Brazil', 'Clipharbor is a short-video editing and monetisation app for Latin American creators. We have a working prototype, 2 signed pilot partners in Brazil and a waitlist of 2,750 early users. Our tools help creators earn more with less overhead.', 'https://www.clipharbor.example.com', 'https://www.linkedin.com/company/clipharbor-sample', '', 'fernanda.rojas@clipharbor.example.com', 'pre-seed', '$180K', '$800K', '', 'We are joining MoneyMinds to meet early-stage investors who understand creator-economy, validate our roadmap with experienced advisors and close our first institutional round.', '{Media & Creator Economy}', '[{"name":"Rodrigo Duarte","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rodrigo-duarte-sample"},{"name":"Santiago Mendoza","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/santiago-mendoza-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Rio de Janeiro","country":"Brazil","profiles":{"startup":{"companyName":"Clipharbor","industry":"Media & Creator Economy","stage":"pre-seed","description":"Clipharbor is a short-video editing and monetisation app for Latin American creators. We have a working prototype, 2 signed pilot partners in Brazil and a waitlist of 2,750 early users. Our tools help creators earn more with less overhead.","website":"https://www.clipharbor.example.com","linkedin":"https://www.linkedin.com/company/clipharbor-sample","foundingYear":"2025","teamSize":"5","fundingRaised":"180000","fundingSought":"800000","businessRegistration":"Registered","businessRegistrationNumber":"CNPJ 28.220.204/0001-33","registrationAuthorityJurisdiction":"Junta Comercial / Receita Federal, Brazil","teamMembers":[{"id":"6c4e72f3-3bf4-4e9a-82d0-fde9d49eeb3d","name":"Rodrigo Duarte","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/rodrigo-duarte-sample"},{"id":"0dc5cdcd-2177-477b-b2ac-79d594b90a11","name":"Santiago Mendoza","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/santiago-mendoza-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 96. Amplify Sound (Accra, Ghana)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Tunde Asante', 'tunde.asante@amplifysound.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+233 741 3675809', 'Accra, Ghana', 'Our goal is to find strategic creator-economy investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Amplify Sound', 'Co-Founder & COO at Amplify Sound', 'Media & Creator Economy', 2022, 'Accra, Ghana', 'Amplify Sound is a music distribution and royalty platform for African independent artists. The product is live with 110 paying customers and 9% month-over-month revenue growth. Our tools help creators earn more with less overhead.', 'https://www.amplifysound.example.com', 'https://www.linkedin.com/company/amplifysound-sample', '', 'tunde.asante@amplifysound.example.com', 'seed', '$1.4M', '$2.2M', '', 'Our goal is to find strategic creator-economy investors and expert financial guidance to fund product development and expand into new regions.', '{Media & Creator Economy}', '[{"name":"Adaeze Okafor","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/adaeze-okafor-sample"},{"name":"Kwesi Eze","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/kwesi-eze-sample"},{"name":"Giulia Leone","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/giulia-leone-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Accra","country":"Ghana","profiles":{"startup":{"companyName":"Amplify Sound","industry":"Media & Creator Economy","stage":"seed","description":"Amplify Sound is a music distribution and royalty platform for African independent artists. The product is live with 110 paying customers and 9% month-over-month revenue growth. Our tools help creators earn more with less overhead.","website":"https://www.amplifysound.example.com","linkedin":"https://www.linkedin.com/company/amplifysound-sample","foundingYear":"2022","teamSize":"15","fundingRaised":"1425000","fundingSought":"2200000","businessRegistration":"Registered","businessRegistrationNumber":"CS100152869","registrationAuthorityJurisdiction":"Registrar General''s Department, Ghana","teamMembers":[{"id":"f7d6cd12-9175-4774-8821-b76ba9765676","name":"Adaeze Okafor","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/adaeze-okafor-sample"},{"id":"d2f93969-7eab-4407-ad5e-bf0a9b970b7b","name":"Kwesi Eze","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/kwesi-eze-sample"},{"id":"1d4fdb45-29dc-4c34-9c6e-b228f5941209","name":"Giulia Leone","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/giulia-leone-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 97. StrideIQ (Brisbane, Australia)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Andrew Morgan', 'andrew.morgan@strideiq.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+61 575 6541193', 'Brisbane, Australia', 'We want to connect with investors and advisors who can help us scale StrideIQ beyond Australia, sharpen our go-to-market and prepare for a Series A.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'StrideIQ', 'Founder & CEO at StrideIQ', 'Sports & Wellness Technology', 2024, 'Brisbane, Australia', 'StrideIQ is a wearable-analytics platform that helps runners prevent injury and improve performance. The product is live with 173 paying customers and 19% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.', 'https://www.strideiq.example.com', 'https://www.linkedin.com/company/strideiq-sample', '', 'andrew.morgan@strideiq.example.com', 'seed', '$650K', '$3.3M', '', 'We want to connect with investors and advisors who can help us scale StrideIQ beyond Australia, sharpen our go-to-market and prepare for a Series A.', '{Sports & Wellness Technology}', '[{"name":"Hannah Griffin","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/hannah-griffin-sample"},{"name":"Claire Whitaker","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/claire-whitaker-sample"},{"name":"Moritz Winter","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/moritz-winter-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Brisbane","country":"Australia","profiles":{"startup":{"companyName":"StrideIQ","industry":"Sports & Wellness Technology","stage":"seed","description":"StrideIQ is a wearable-analytics platform that helps runners prevent injury and improve performance. The product is live with 173 paying customers and 19% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.","website":"https://www.strideiq.example.com","linkedin":"https://www.linkedin.com/company/strideiq-sample","foundingYear":"2024","teamSize":"11","fundingRaised":"650000","fundingSought":"3300000","businessRegistration":"Registered","businessRegistrationNumber":"ACN 747 737 437","registrationAuthorityJurisdiction":"Australian Securities and Investments Commission (ASIC), Australia","teamMembers":[{"id":"c1212e99-fb8d-47cd-9fbf-132b423f3ea9","name":"Hannah Griffin","role":"Chief Technology Officer","linkedin":"https://www.linkedin.com/in/hannah-griffin-sample"},{"id":"d8bdc8f7-f666-4a01-ab2d-1ad9fc84de59","name":"Claire Whitaker","role":"Chief Operating Officer","linkedin":"https://www.linkedin.com/in/claire-whitaker-sample"},{"id":"952a5929-e275-4f6d-be97-05cb02d629a8","name":"Moritz Winter","role":"Head of Partnerships","linkedin":"https://www.linkedin.com/in/moritz-winter-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 98. FitForge Labs (Gothenburg, Sweden)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Lars Virtanen', 'lars.virtanen@fitforgelabs.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+46 707 9348450', 'Gothenburg, Sweden', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'FitForge Labs', 'Chief Executive Officer at FitForge Labs', 'Sports & Wellness Technology', 2022, 'Gothenburg, Sweden', 'FitForge Labs is an AI strength-coaching app that adapts training plans in real time. The product is live with 135 paying customers and 22% month-over-month revenue growth. Our models are built with sports scientists and validated against real performance data.', 'https://www.fitforgelabs.example.com', 'https://www.linkedin.com/company/fitforgelabs-sample', '', 'lars.virtanen@fitforgelabs.example.com', 'seed', '$1.8M', '$4.4M', '', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Sports & Wellness Technology}', '[{"name":"Pieter Mahlangu","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/pieter-mahlangu-sample"},{"name":"Sanne Hendriks","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/sanne-hendriks-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Gothenburg","country":"Sweden","profiles":{"startup":{"companyName":"FitForge Labs","industry":"Sports & Wellness Technology","stage":"seed","description":"FitForge Labs is an AI strength-coaching app that adapts training plans in real time. The product is live with 135 paying customers and 22% month-over-month revenue growth. Our models are built with sports scientists and validated against real performance data.","website":"https://www.fitforgelabs.example.com","linkedin":"https://www.linkedin.com/company/fitforgelabs-sample","foundingYear":"2022","teamSize":"15","fundingRaised":"1800000","fundingSought":"4400000","businessRegistration":"Registered","businessRegistrationNumber":"556021-7433","registrationAuthorityJurisdiction":"Bolagsverket (Swedish Companies Registration Office), Sweden","teamMembers":[{"id":"cac799a6-16fe-439d-8c46-82bfc45250fb","name":"Pieter Mahlangu","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/pieter-mahlangu-sample"},{"id":"1405a2cc-fa7e-4ecc-8d8d-6b8bc83d7cff","name":"Sanne Hendriks","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/sanne-hendriks-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 99. PlayMetrics Arena (Osaka, Japan)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Kenji Tanaka', 'kenji.tanaka@playmetricsarena.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+81 940 1534197', 'Osaka, Japan', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'PlayMetrics Arena', 'Co-Founder & CTO at PlayMetrics Arena', 'Sports & Wellness Technology', 2022, 'Osaka, Japan', 'PlayMetrics Arena is a performance-tracking system for youth and amateur football clubs. The product is live with 87 paying customers and 8% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.', 'https://www.playmetricsarena.example.com', 'https://www.linkedin.com/company/playmetricsarena-sample', '', 'kenji.tanaka@playmetricsarena.example.com', 'seed', '$775K', '$2.7M', '', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Sports & Wellness Technology}', '[{"name":"Haruto Ito","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/haruto-ito-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"Osaka","country":"Japan","profiles":{"startup":{"companyName":"PlayMetrics Arena","industry":"Sports & Wellness Technology","stage":"seed","description":"PlayMetrics Arena is a performance-tracking system for youth and amateur football clubs. The product is live with 87 paying customers and 8% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.","website":"https://www.playmetricsarena.example.com","linkedin":"https://www.linkedin.com/company/playmetricsarena-sample","foundingYear":"2022","teamSize":"18","fundingRaised":"775000","fundingSought":"2700000","businessRegistration":"Registered","businessRegistrationNumber":"Corporate No. 5427377839352","registrationAuthorityJurisdiction":"Legal Affairs Bureau (Houmukyoku), Japan","teamMembers":[{"id":"d941d48d-a975-4158-8945-35b2a3962c58","name":"Haruto Ito","role":"Chief Marketing Officer","linkedin":"https://www.linkedin.com/in/haruto-ito-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

-- 100. Zenfield Wellness (New Delhi, India)
DO $$
DECLARE uid UUID;
BEGIN
  INSERT INTO platform_users (full_name, email, password_hash, phone, location, bio, status, requested_roles, approved_roles, is_admin, admin_notes, approved_at)
  VALUES ('Ishita Desai', 'ishita.desai@zenfieldwellness.example.com', '$2b$10$uEL1RxRp.x4mWzUVLvb46e380KuVZx8EIEHmdUU7VDkwdRn/o5kfG', '+91 830 9991148', 'New Delhi, India', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', 'approved', ARRAY['startup'], ARRAY['startup'], false, 'Bulk-seeded startup account', now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO uid;

  IF uid IS NOT NULL THEN
    INSERT INTO startup_profiles (user_id, company_name, tagline, industry, founded_year, location, description, website, linkedin, twitter, contact_email, stage, total_raised, funding_goal, valuation, pitch, categories, team_members, is_public, show_contact_info, allow_advisor_invitations)
    VALUES (uid, 'Zenfield Wellness', 'Founder & CEO at Zenfield Wellness', 'Sports & Wellness Technology', 2024, 'New Delhi, India', 'Zenfield Wellness is a corporate wellness platform combining fitness, nutrition and mental-health coaching. The product is live with 82 paying customers and 18% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.', 'https://www.zenfieldwellness.example.com', 'https://www.linkedin.com/company/zenfieldwellness-sample', '', 'ishita.desai@zenfieldwellness.example.com', 'seed', '$2.1M', '$4.2M', '', 'Our goal is to find strategic sports-tech investors and expert financial guidance to fund product development and expand into new regions.', '{Sports & Wellness Technology}', '[{"name":"Arjun Menon","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/arjun-menon-sample"},{"name":"Meera Chopra","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/meera-chopra-sample"},{"name":"Ishita Reddy","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/ishita-reddy-sample"}]'::jsonb, true, true, true);

    INSERT INTO profile_applications (user_id, details)
    VALUES (uid, '{"version":1,"city":"New Delhi","country":"India","profiles":{"startup":{"companyName":"Zenfield Wellness","industry":"Sports & Wellness Technology","stage":"seed","description":"Zenfield Wellness is a corporate wellness platform combining fitness, nutrition and mental-health coaching. The product is live with 82 paying customers and 18% month-over-month revenue growth. Partnerships with clubs and gyms provide distribution and credibility.","website":"https://www.zenfieldwellness.example.com","linkedin":"https://www.linkedin.com/company/zenfieldwellness-sample","foundingYear":"2024","teamSize":"7","fundingRaised":"2100000","fundingSought":"4200000","businessRegistration":"Registered","businessRegistrationNumber":"U72900DL2024PTC995885","registrationAuthorityJurisdiction":"Ministry of Corporate Affairs (MCA), India","teamMembers":[{"id":"8feb05b7-d869-499d-84f5-48a550c198a5","name":"Arjun Menon","role":"Head of Engineering","linkedin":"https://www.linkedin.com/in/arjun-menon-sample"},{"id":"46cb3a2a-3f9e-42fe-8153-d4f77db88e81","name":"Meera Chopra","role":"Head of Growth","linkedin":"https://www.linkedin.com/in/meera-chopra-sample"},{"id":"ff4f5201-d760-440e-a59e-107df7543c2b","name":"Ishita Reddy","role":"Chief Financial Officer","linkedin":"https://www.linkedin.com/in/ishita-reddy-sample"}]}},"documents":[]}'::jsonb);
  END IF;
END $$;

COMMIT;

-- Done! Check results:
-- SELECT count(*) FROM platform_users WHERE admin_notes = 'Bulk-seeded startup account';
-- SELECT count(*) FROM startup_profiles;
-- SELECT count(*) FROM profile_applications;
