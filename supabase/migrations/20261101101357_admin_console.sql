-- MoneyMinds admin console. Run after the agent runtime repair.
-- Additive and repeatable; no emails, AI requests or payment actions are run.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
ALTER TABLE public.platform_users
  ADD COLUMN IF NOT EXISTS admin_role text NOT NULL DEFAULT 'super_admin' CHECK (admin_role IN ('super_admin','reviewer','support','finance')),
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.platform_users(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  action text NOT NULL,
  target_id text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_events_date ON public.admin_audit_events(created_at DESC, id);
CREATE INDEX IF NOT EXISTS admin_audit_events_target ON public.admin_audit_events(target_id, created_at DESC);
CREATE TABLE IF NOT EXISTS public.admin_reviews (
  user_id uuid PRIMARY KEY REFERENCES public.platform_users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.platform_users(id) ON DELETE SET NULL,
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','in_review','resolved')),
  notes text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.platform_users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.content_moderation (
  entity_type text NOT NULL CHECK (entity_type IN ('group','signal','comment','training')),
  entity_id uuid NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.platform_users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id)
);
ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_audit_events, public.admin_reviews, public.content_moderation FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.admin_audit_events FROM service_role;
GRANT SELECT, INSERT ON public.admin_audit_events TO service_role;
GRANT ALL ON public.admin_reviews, public.content_moderation TO service_role;
-- Settings are server-managed. This app uses Express authentication.
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;

-- Keep each admin mutation and its audit event in the same transaction.
CREATE OR REPLACE FUNCTION public.admin_console_mutation(
  actor_id uuid, action_kind text, target_id text, payload jsonb DEFAULT '{}'
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE
  actor public.platform_users;
  target public.platform_users;
  doc public.profile_verifications;
  assignee public.platform_users;
  permitted boolean := false;
  entity_exists boolean := false;
  settings jsonb;
  profile_table text;
BEGIN
  -- Serialize rare administrative writes, including last-super-admin protection.
  PERFORM pg_advisory_xact_lock(741938201);
  SELECT * INTO actor FROM public.platform_users WHERE id = actor_id;
  IF actor.id IS NULL OR NOT actor.is_admin OR actor.is_suspended THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  permitted := actor.admin_role = 'super_admin'
    OR (actor.admin_role = 'reviewer' AND action_kind IN ('user.approval','review.update','document.decision'))
    OR (actor.admin_role = 'support' AND action_kind IN ('user.suspension','content.moderate'));
  IF NOT permitted THEN RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501'; END IF;

  IF action_kind = 'settings.update' THEN
    IF jsonb_typeof(payload->'registrationOpen') <> 'boolean'
       OR jsonb_typeof(payload->'maintenanceMode') <> 'boolean'
       OR jsonb_typeof(payload->'requireBackgroundCheck') <> 'boolean'
       OR NOT (payload ?& ARRAY['registrationOpen','maintenanceMode','requireBackgroundCheck']) THEN
      RAISE EXCEPTION 'Invalid settings';
    END IF;
    INSERT INTO public.platform_settings(key,value,updated_by,updated_at)
      VALUES ('admin_console',payload::text,actor_id,now())
      ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  ELSIF action_kind IN ('user.suspension','user.admin_role','user.approval','review.update') THEN
    SELECT * INTO target FROM public.platform_users WHERE id=target_id::uuid FOR UPDATE;
    IF target.id IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;
    IF action_kind = 'user.suspension' THEN
      IF target.id=actor.id OR (target.is_admin AND actor.admin_role <> 'super_admin') THEN RAISE EXCEPTION 'Cannot suspend this administrator'; END IF;
      IF jsonb_typeof(payload->'suspended') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Suspension must be true or false'; END IF;
      IF (payload->>'suspended')::boolean AND length(trim(coalesce(payload->>'reason',''))) = 0 THEN RAISE EXCEPTION 'A suspension reason is required'; END IF;
      UPDATE public.platform_users SET is_suspended=(payload->>'suspended')::boolean,
        suspension_reason=payload->>'reason', suspended_at=CASE WHEN (payload->>'suspended')::boolean THEN now() ELSE NULL END,
        updated_at=now() WHERE id=target.id;
    ELSIF action_kind = 'user.admin_role' THEN
      IF target.id=actor.id THEN RAISE EXCEPTION 'You cannot change your own admin access'; END IF;
      IF payload->>'role' IS NOT NULL AND payload->>'role' NOT IN ('super_admin','reviewer','support','finance') THEN RAISE EXCEPTION 'Invalid admin role'; END IF;
      IF payload->>'role' IS NOT NULL AND (target.status <> 'approved' OR target.is_suspended) THEN RAISE EXCEPTION 'Approve and reactivate the account first'; END IF;
      UPDATE public.platform_users SET is_admin=(payload->>'role' IS NOT NULL),admin_role=coalesce(payload->>'role','super_admin'),updated_at=now() WHERE id=target.id;
    ELSIF action_kind = 'user.approval' THEN
      IF target.is_admin THEN RAISE EXCEPTION 'Use administrator access controls for admin accounts'; END IF;
      IF payload->>'status' IS NULL OR payload->>'status' NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid approval status'; END IF;
      IF payload->>'status'='approved' THEN
        IF jsonb_typeof(payload->'approvedRoles') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'approvedRoles')=0 THEN RAISE EXCEPTION 'Select at least one role'; END IF;
        IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(payload->'approvedRoles') r WHERE r NOT IN ('startup','investor','advisor')) THEN RAISE EXCEPTION 'Invalid role'; END IF;
        SELECT value::jsonb INTO settings FROM public.platform_settings WHERE key='admin_console';
        IF coalesce((settings->>'requireBackgroundCheck')::boolean,false) AND NOT EXISTS(SELECT 1 FROM public.ai_verifications WHERE user_id=target.id AND status='complete') THEN RAISE EXCEPTION 'Complete the background check before approving this account'; END IF;
      ELSIF length(trim(coalesce(payload->>'rejectionReason',''))) = 0 THEN RAISE EXCEPTION 'A rejection reason is required'; END IF;
      UPDATE public.platform_users SET status=payload->>'status',
        approved_roles=CASE WHEN payload->>'status'='approved' THEN ARRAY(SELECT jsonb_array_elements_text(payload->'approvedRoles')) ELSE '{}'::text[] END,
        admin_notes=payload->>'adminNotes',rejection_reason=CASE WHEN payload->>'status'='rejected' THEN payload->>'rejectionReason' ELSE NULL END,
        approved_at=CASE WHEN payload->>'status'='approved' THEN now() ELSE NULL END,approved_by=actor_id,updated_at=now() WHERE id=target.id;
    ELSE
      IF payload->>'assignedTo' IS NOT NULL THEN
        SELECT * INTO assignee FROM public.platform_users WHERE id=(payload->>'assignedTo')::uuid;
        IF assignee.id IS NULL OR NOT assignee.is_admin OR assignee.is_suspended OR assignee.admin_role NOT IN ('super_admin','reviewer') THEN RAISE EXCEPTION 'Select an active reviewer'; END IF;
      END IF;
      INSERT INTO public.admin_reviews(user_id,assigned_to,state,notes,updated_by,updated_at)
        VALUES(target.id,(payload->>'assignedTo')::uuid,payload->>'state',coalesce(payload->>'notes',''),actor_id,now())
        ON CONFLICT(user_id) DO UPDATE SET assigned_to=excluded.assigned_to,state=excluded.state,notes=excluded.notes,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.platform_users WHERE is_admin AND admin_role='super_admin' AND NOT is_suspended) THEN RAISE EXCEPTION 'Keep at least one active super administrator'; END IF;
  ELSIF action_kind = 'content.moderate' THEN
    IF jsonb_typeof(payload->'hidden') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Hidden must be true or false'; END IF;
    IF length(trim(coalesce(payload->>'reason',''))) = 0 THEN RAISE EXCEPTION 'A moderation reason is required'; END IF;
    CASE payload->>'entityType'
      WHEN 'group' THEN SELECT EXISTS(SELECT 1 FROM public.advisor_groups WHERE id=target_id::uuid) INTO entity_exists;
      WHEN 'signal' THEN SELECT EXISTS(SELECT 1 FROM public.advisor_signals WHERE id=target_id::uuid) INTO entity_exists;
      WHEN 'comment' THEN SELECT EXISTS(SELECT 1 FROM public.signal_comments WHERE id=target_id::uuid) INTO entity_exists;
      WHEN 'training' THEN SELECT EXISTS(SELECT 1 FROM public.trainings WHERE id=target_id::uuid) INTO entity_exists;
      ELSE RAISE EXCEPTION 'Invalid content type';
    END CASE;
    IF NOT entity_exists THEN RAISE EXCEPTION 'Content not found'; END IF;
    INSERT INTO public.content_moderation(entity_type,entity_id,hidden,reason,updated_by,updated_at)
      VALUES(payload->>'entityType',target_id::uuid,(payload->>'hidden')::boolean,payload->>'reason',actor_id,now())
      ON CONFLICT(entity_type,entity_id) DO UPDATE SET hidden=excluded.hidden,reason=excluded.reason,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  ELSIF action_kind = 'document.decision' THEN
    SELECT * INTO doc FROM public.profile_verifications WHERE id=target_id::uuid FOR UPDATE;
    IF doc.id IS NULL THEN RAISE EXCEPTION 'Document not found'; END IF;
    IF payload->>'status' IS NULL OR payload->>'status' NOT IN ('verified','rejected') THEN RAISE EXCEPTION 'Invalid document decision'; END IF;
    IF payload->>'status'='rejected' AND length(trim(coalesce(payload->>'note','')))=0 THEN RAISE EXCEPTION 'A rejection reason is required'; END IF;
    UPDATE public.profile_verifications SET status=payload->>'status',reviewed_by=actor_id,reviewed_at=now(),admin_note=payload->>'note',updated_at=now() WHERE id=doc.id;
    FOREACH profile_table IN ARRAY ARRAY['startup_profiles','investor_profiles','advisor_profiles'] LOOP
      IF payload->>'status'='verified' THEN
        EXECUTE format('UPDATE public.%I SET is_verified=true,verified_at=now(),verification_id=$1 WHERE user_id=$2', profile_table) USING doc.id,doc.user_id;
      ELSE
        EXECUTE format('UPDATE public.%I SET is_verified=false,verified_at=NULL,verification_id=NULL WHERE verification_id=$1', profile_table) USING doc.id;
      END IF;
    END LOOP;
  ELSE RAISE EXCEPTION 'Unknown admin action';
  END IF;
  INSERT INTO public.admin_audit_events(actor_id,actor_name,action,target_id,details)
    VALUES(actor.id,actor.full_name,action_kind,target_id,payload);
END $$;
REVOKE ALL ON FUNCTION public.admin_console_mutation(uuid,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_console_mutation(uuid,text,text,jsonb) TO service_role;

-- A confirmed provider payment and the user's entitlement commit together.
-- Browser returns and webhook deliveries can arrive concurrently or be retried.
CREATE INDEX IF NOT EXISTS payments_provider_reference ON public.payments(transaction_ref) WHERE transaction_ref IS NOT NULL;
CREATE OR REPLACE FUNCTION public.record_confirmed_checkout(
  payer_id uuid, purchase_type text, purchase_id text, paid_amount numeric,
  paid_currency text, provider_reference text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE saved public.payments; affected integer;
BEGIN
  IF purchase_type IS NULL OR purchase_type NOT IN ('training','group_join','group_monthly')
    OR paid_amount IS NULL OR paid_amount <= 0 OR upper(paid_currency) IS DISTINCT FROM 'USD'
    OR length(coalesce(provider_reference,''))=0 THEN RAISE EXCEPTION 'Invalid confirmed payment'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('checkout:'||provider_reference,0));
  SELECT * INTO saved FROM public.payments WHERE transaction_ref=provider_reference ORDER BY created_at LIMIT 1;
  IF saved.id IS NOT NULL THEN
    IF saved.user_id<>payer_id OR saved.item_type<>purchase_type OR saved.item_id<>purchase_id OR saved.amount<>paid_amount OR upper(saved.currency)<>upper(paid_currency) THEN RAISE EXCEPTION 'Payment reference belongs to another purchase'; END IF;
    RETURN jsonb_build_object('payment',to_jsonb(saved),'created',false);
  END IF;
  IF purchase_type='training' THEN
    PERFORM 1 FROM public.trainings WHERE id=purchase_id::uuid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Purchased training no longer exists'; END IF;
    INSERT INTO public.training_enrollments(training_id,user_id) VALUES(purchase_id::uuid,payer_id) ON CONFLICT(training_id,user_id) DO NOTHING;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected>0 THEN UPDATE public.trainings SET enrolled=enrolled+1 WHERE id=purchase_id::uuid; END IF;
  ELSE
    PERFORM 1 FROM public.advisor_groups WHERE id=purchase_id::uuid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Purchased group no longer exists'; END IF;
    INSERT INTO public.advisor_group_members(group_id,user_id) VALUES(purchase_id::uuid,payer_id) ON CONFLICT(group_id,user_id) DO NOTHING;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected>0 THEN UPDATE public.advisor_groups SET member_count=member_count+1 WHERE id=purchase_id::uuid; END IF;
  END IF;
  INSERT INTO public.payments(user_id,item_type,item_id,amount,currency,status,payment_method,transaction_ref)
    VALUES(payer_id,purchase_type,purchase_id,paid_amount,upper(paid_currency),'completed','card',provider_reference) RETURNING * INTO saved;
  RETURN jsonb_build_object('payment',to_jsonb(saved),'created',true);
END $$;
REVOKE ALL ON FUNCTION public.record_confirmed_checkout(uuid,text,text,numeric,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_confirmed_checkout(uuid,text,text,numeric,text,text) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
