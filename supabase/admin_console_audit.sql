-- Read-only deployment check. Run after 20261101101357_admin_console.sql.
WITH tables(name) AS (VALUES ('admin_audit_events'),('admin_reviews'),('content_moderation'),('platform_settings')),
checks AS (
  SELECT name AS check_name, coalesce(c.relrowsecurity,false)
    AND NOT coalesce(has_table_privilege('anon',c.oid,'SELECT'),true)
    AND NOT coalesce(has_table_privilege('authenticated',c.oid,'SELECT'),true)
    AND coalesce(has_table_privilege('service_role',c.oid,'SELECT'),false) AS ready
  FROM tables LEFT JOIN pg_class c ON c.oid=to_regclass(format('public.%I',name))
  UNION ALL
  SELECT 'admin_console_mutation server access',
    to_regprocedure('public.admin_console_mutation(uuid,text,text,jsonb)') IS NOT NULL
    AND coalesce(has_function_privilege('service_role',to_regprocedure('public.admin_console_mutation(uuid,text,text,jsonb)'),'EXECUTE'),false)
    AND NOT coalesce(has_function_privilege('anon',to_regprocedure('public.admin_console_mutation(uuid,text,text,jsonb)'),'EXECUTE'),true)
    AND NOT coalesce(has_function_privilege('authenticated',to_regprocedure('public.admin_console_mutation(uuid,text,text,jsonb)'),'EXECUTE'),true)
  UNION ALL
  SELECT 'record_confirmed_checkout server access',
    to_regprocedure('public.record_confirmed_checkout(uuid,text,text,numeric,text,text)') IS NOT NULL
    AND coalesce(has_function_privilege('service_role',to_regprocedure('public.record_confirmed_checkout(uuid,text,text,numeric,text,text)'),'EXECUTE'),false)
    AND NOT coalesce(has_function_privilege('anon',to_regprocedure('public.record_confirmed_checkout(uuid,text,text,numeric,text,text)'),'EXECUTE'),true)
    AND NOT coalesce(has_function_privilege('authenticated',to_regprocedure('public.record_confirmed_checkout(uuid,text,text,numeric,text,text)'),'EXECUTE'),true)
)
SELECT check_name, CASE WHEN ready THEN 'READY' ELSE 'NEEDS REPAIR' END AS status FROM checks ORDER BY check_name;
