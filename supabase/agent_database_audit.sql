-- Read-only audit of all application tables, expected columns and exact row counts.
-- Run before and after the repair in project ievzkvvidsdrlytvitup.
WITH expected(table_name, required_columns) AS (VALUES
  ('advisor_group_members', 'id,group_id,user_id,role,joined_at'),
  ('advisor_groups', 'id,advisor_id,name,description,category,is_private,is_paid,joining_fee,monthly_fee,member_count,signal_count,created_at,updated_at'),
  ('advisor_profiles', 'id,user_id,title,bio,website,linkedin,twitter,contact_email,photo_url,years_experience,clients_helped,specialization,previous_roles,expertise_areas,certifications,industries,preferred_stage,engagement_type,availability,typical_rate,services_offered,default_group_type,default_joining_fee,default_monthly_fee,auto_approve_members,allow_group_discovery,enable_payment_processing,payment_email,tax_id,is_public,show_contact_info,allow_connection_requests,show_testimonials,created_at,updated_at,is_verified,verified_at,verification_id,credibility_score,credibility_tier,credibility_updated_at'),
  ('advisor_signals', 'id,group_id,advisor_id,post_type,title,content,signal_type,target_price,time_horizon,confidence_level,tags,notify_members,created_at,updated_at,sentiment,sentiment_confidence,sentiment_reasoning,risk_level,risk_reasoning,actionability,actionability_reasoning,entities,sectors,key_points,analyzed_at,prediction_direction,prediction_target_price,prediction_timeframe,prediction_timeframe_days,prediction_check_date,baseline_price,baseline_fetched_at,actual_price,prediction_accuracy,prediction_result,prediction_checked_at,prediction_explanation,prediction_ticker'),
  ('agent_follows', 'user_id,agent_key,created_at'),
  ('agent_runs', 'id,user_id,agent_key,target_id,status,stage,progress,result,error,created_at,started_at,completed_at,updated_at,events'),
  ('ai_verifications', 'id,user_id,status,recommendation,confidence,credibility_score,summary,findings,report_markdown,sources,red_flags,search_queries_run,created_at,completed_at'),
  ('connections', 'id,from_user_id,to_user_id,message,status,created_at,updated_at'),
  ('credibility_scores_history', 'id,advisor_id,score,tier,total_predictions,breakdown,recorded_at'),
  ('investor_profiles', 'id,user_id,investor_type,preferred_stage,min_investment,max_investment,portfolio_size,investment_thesis,industries,other_interests,geographic_focus,firm_name,title,website,linkedin,twitter,contact_email,bio,photo_url,is_private,anonymous_browsing,show_investment_preferences,allow_connection_requests,show_contact_info,created_at,updated_at,is_verified,verified_at,verification_id'),
  ('notifications', 'id,user_id,title,message,type,read,created_at'),
  ('password_reset_tokens', 'id,user_id,token,expires_at,used,created_at'),
  ('payments', 'id,user_id,item_type,item_id,amount,currency,status,payment_method,transaction_ref,created_at,updated_at'),
  ('platform_settings', 'id,key,value,updated_by,updated_at'),
  ('platform_users', 'id,full_name,email,password_hash,phone,location,bio,status,requested_roles,approved_roles,is_admin,admin_notes,rejection_reason,approved_at,approved_by,created_at,updated_at'),
  ('profile_verifications', 'id,user_id,doc_type,doc_url,claim_to_verify,status,ai_confidence,ai_reasoning,ai_extracted,reviewed_by,reviewed_at,admin_note,created_at,updated_at'),
  ('signal_comments', 'id,signal_id,user_id,content,created_at,updated_at'),
  ('signal_reactions', 'id,signal_id,user_id,reaction,created_at'),
  ('startup_profiles', 'id,user_id,company_name,tagline,industry,founded_year,location,description,website,linkedin,twitter,contact_email,stage,total_raised,funding_goal,valuation,pitch,photo_url,categories,team_members,is_public,show_contact_info,allow_advisor_invitations,created_at,updated_at,is_verified,verified_at,verification_id'),
  ('training_enrollments', 'id,training_id,user_id,progress,enrolled_at'),
  ('trainings', 'id,advisor_id,title,description,type,price,format,duration,schedule,capacity,enrolled,status,topics,location,target_audience,level,created_at,updated_at'),
  ('two_fa_secrets', 'user_id,secret,enabled,backup_codes,created_at')
), checks AS (
 SELECT e.table_name, to_regclass(format('public.%I',e.table_name)) IS NOT NULL AS present,
 ARRAY(SELECT c FROM unnest(string_to_array(e.required_columns,',')) AS c
       WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns actual
                         WHERE actual.table_schema='public' AND actual.table_name=e.table_name AND actual.column_name=c)) AS missing_columns
 FROM expected e
)
SELECT table_name,
 CASE WHEN NOT present THEN 'MISSING TABLE' WHEN cardinality(missing_columns)>0 THEN 'MISSING COLUMNS' ELSE 'READY' END AS status,
 missing_columns,
 CASE WHEN present THEN ((xpath('/table/row/total/text()',query_to_xml(format('SELECT count(*) AS total FROM public.%I',table_name),false,false,'')))[1]::text)::bigint ELSE NULL END AS row_count
FROM checks ORDER BY table_name;

