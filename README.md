
  # MoneyMinds Digital Platform UI

  This is a code bundle for MoneyMinds Digital Platform UI. The original project is available at https://www.figma.com/design/i1YkmFFH5Sq3edAe6xbb8n/MoneyMinds-Digital-Platform-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Automatic database migrations with Docker

Docker can apply the reviewed SQL migrations before the server starts. This is opt-in, so existing manual deployments keep working. The runtime image includes `shared/` (required by the admin API), the migration runner and its SQL files.

One-time setup on the production server:

1. In [the Supabase project](https://supabase.com/dashboard/project/ievzkvvidsdrlytvitup), open **Connect**. Copy the **Direct connection** URI, or **Session pooler** URI on port **5432** if your server needs IPv4. Use the database password, not the service-role API key. Percent-encode reserved characters in the password. See [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).
2. Edit `/opt/moneyminds/.env.production` privately on the server. Keep the existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and add:

   ```dotenv
   AUTO_MIGRATE=true
   SUPABASE_DB_URL='PASTE_THE_POSTGRES_CONNECTION_URI_HERE'
   ```

   Both URLs must target the same project. Use single quotes around the URI in Compose's env file to prevent `$` interpolation. Never commit the real env file or paste the password into chat. The runner includes the [official Supabase production root CA](server/certs/README.md), which fixes `SELF_SIGNED_CERT_IN_CHAIN` for that certificate chain without extra env configuration. TLS certificate and hostname verification stay enabled. If your project uses a different CA, copy its root certificate from Supabase Database settings into the optional `SUPABASE_DB_SSL_CA`, using literal `\n` between PEM lines. See [Supabase SSL guidance](https://supabase.com/docs/guides/platform/ssl-enforcement) and [node-postgres SSL configuration](https://node-postgres.com/features/ssl).
3. After committing/pushing the updated code to `develop`, use your existing deployment command:

   ```bash
   cd /opt/moneyminds && git pull origin develop && docker compose up -d --build moneyminds
   ```

4. Check completion, because detached Compose returns before startup migrations finish:

   ```bash
   docker compose logs --tail=100 moneyminds
   docker compose ps
   docker compose exec moneyminds npm run db:migrate:status
   ```

   Logs should show `[migrations] Ready` followed by the API listening message, the container should become `healthy`, and the status command should show all files `APPLIED`. If you prefer the deploy command itself to wait for health, use `docker compose up -d --build --wait --wait-timeout 240 moneyminds` on a Compose version supporting `--wait`.

Only files explicitly listed in [auto-migrations.json](supabase/auto-migrations.json) run, in version order. The initial list contains the two agent/profile repairs and the admin console migration. These three are safe to reapply to the existing schema: the first automated deploy reruns them and records them even if they were already applied manually. It does not invent history from table existence. Legacy `001_initial_schema.sql` and `002_rls_policies.sql` target a different schema and are excluded. An empty database without `platform_users` is rejected.

The private `moneyminds_internal.schema_migrations` table records filename, version, checksum and time. The runner checks history on every startup, skips recorded files and refuses changed/missing applied files or out-of-order additions. A database session lock prevents two deployments from migrating concurrently. Each file and its history entry share one transaction; SQL errors roll back that file and stop startup, while earlier successful files remain recorded. Fix the failed **unapplied** file and redeploy; for an already applied migration, add a new file. A database connection is opened only for migration/status work and then closed. The runner does not start agents, seed users, send email or charge payments; normal application bootstrap follows only after it succeeds.

For future changes, create a timestamped migration with Supabase CLI, use one outer `BEGIN; ... COMMIT;`, test it, and append its filename to `auto-migrations.json`. Commit the SQL and manifest together. This ledger is separate from Supabase CLI migration history; do not mix `supabase db push` with this runner's deployment workflow. `npm run db:migrate` applies pending files without starting the app; `npm run db:migrate:status` only reads history. Both commands read the process environment (and local `.env` outside Docker). Set `AUTO_MIGRATE=false` to keep managing SQL manually. Automatic startup migrations apply to the persistent Node/Docker entrypoint, not Vercel request handlers.

Migration validation on 2026-11-01: **269 tests passed, 2 live-search tests skipped**; production frontend build and Compose configuration validation passed. Isolated PostgreSQL tests cover manual-repair adoption, record preservation, repeat deployment, changed-history rejection, SQL/history-write rollback and retry. Lock contention is tested using a stubbed client. A runtime packaging test copies the Docker runtime's declared source files into an isolated directory, imports the server and migrations, and verifies that missing migration configuration stops startup. The local Docker daemon was unavailable, so an actual image build, container startup and live database migration were not verified here.

TLS follow-up on 2026-11-01: production reported `SELF_SIGNED_CERT_IN_CHAIN`, so the official Supabase production root CA is now bundled with the runner. **270 tests passed, 2 live-search tests skipped**, including certificate provenance/fingerprint and Docker runtime packaging. A credential-free PostgreSQL STARTTLS check against `aws-1-eu-west-2.pooler.supabase.com:5432` verified the real pooler certificate with the bundled CA, reproduced `SELF_SIGNED_CERT_IN_CHAIN` without it, and rejected an incorrect hostname with `ERR_TLS_CERT_ALTNAME_INVALID`. This check sent no database username/password or SQL; it verifies TLS, not the production project's credentials or migration state. Commit/push the fix and rebuild the deployment to include the certificate.

## Admin console deployment (2026-11-01)

The admin area now has Overview, Users, Due Diligence, AI Operations, Content, Payments, Reports & Audit, and Settings. The account page includes authenticator setup. Existing administrators receive `super_admin` access; new admin permissions can be assigned to approved, active users from **Users > View details**.

1. Enable automatic migrations as described above, or after the two earlier agent repairs run the **entire** [admin_console.sql](supabase/migrations/20261101101357_admin_console.sql) in the live Supabase SQL Editor. This additive migration adds three admin tables, account access columns, and server-only transaction functions. It preserves existing records and does not run agents, send messages or charge payments.
2. Run [agent_database_audit.sql](supabase/agent_database_audit.sql) (now 25 tables) and [admin_console_audit.sql](supabase/admin_console_audit.sql). All rows should say `READY`. The second audit also checks RLS and access to both transaction functions.
3. Deploy the server and frontend together, after the migration. Run `npm test` and `npm run build`. No production deployment or production database mutation was performed by this implementation.
4. Visit `/admin/dashboard`. Test one review, refresh Settings after saving a change, and inspect Reports & Audit. AI Operations still requires production AI/search keys; database readiness and provider configuration are separate checks.

| Workspace | Implemented controls |
| --- | --- |
| Overview | Account counts, pending applications, report coverage, recent agent failures, real average registration-to-approval duration |
| Users | Name/email search, status/role filters, pagination, CSV export, submitted profiles, approval/rejection, suspension/reactivation, administrator roles |
| Due Diligence | Background checks for all registered users, individual evidence reports, document decisions, reviewer assignment, internal notes and review state |
| AI Operations | Readiness checks, user/agent/date/status filters within the latest 100 runs, execution steps, retry/resume and backlog controls |
| Content | Review and hide/restore groups, signals, comments and trainings; hidden content is also blocked in normal reads, enrollment and checkout |
| Payments | All recorded payments, user/transaction search, date/status filters, separate currency totals and CSV export; simulated records excluded from collected-value totals |
| Reports & Audit | Links to background-check reports and completed agent results (with review/agent permissions), payment report, and latest 500 saved administrative changes |
| Settings | Persisted registration and maintenance controls; optional completed-background-report requirement before manual approval |

Permissions are enforced in the API using the current account record, so existing sessions reflect role changes and suspension. Reviewers handle applications/evidence/agents; support handles user visibility, suspension and content; finance sees payments/reports; super admins have all controls. An administrator cannot suspend or demote their own account. Review decisions and their audit entries commit together. The database's service role can insert/read audit events, but cannot update/delete them through normal table grants. Tracking starts with this release; earlier decisions are not invented as history.

### Payment and session fixes

The old card form did not obtain provider confirmation. Paid checkout now redirects to **Stripe Checkout**, with prices and account/item metadata set by the server. The browser return and signed webhook both reconcile the confirmed payment. A database transaction saves the payment and enrollment/group membership together; replaying the same provider reference does not duplicate payment records or membership counts. Customer card fields are no longer collected by the app. Production cannot simulate successful payment; local development offers an explicitly labelled demo flow.

For real payments configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the correct `CLIENT_ORIGIN` on the server. Register `https://moneymindsdigital.site/api/payments/webhook` in Stripe for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `payment_intent.succeeded`, and `payment_intent.payment_failed`. Verify a test-mode purchase and webhook delivery before using live charges. Hosted confirmation follows [Stripe's Checkout fulfillment guidance](https://docs.stripe.com/checkout/fulfillment). Refund execution, provider balance reconciliation, recurring subscription renewals and chargeback management are not provided by this console; handle them in the provider dashboard. Payment totals represent application records, not settlement balances.

Cookie-only session reloads now load dashboards, profiles, advisor management and training pages correctly. Training detail pages use the same checkout as the marketplace. Paid joins/enrollments cannot bypass payment through their direct APIs. Authenticator setup uses the installed library API, and enabled factors are required at login. Rejecting a previously verified document removes the badge backed by that document.

### Two-factor on/off switch

Set `TWO_FACTOR_ENABLED=false` in the server's `/opt/moneyminds/.env.production` to temporarily turn off authenticator prompts and setup for all accounts. Email/password, account approval and suspension checks still apply. Existing authenticator secrets stay saved. Set `TWO_FACTOR_ENABLED=true` and recreate the container to restore them; accounts already enrolled will need their authenticator codes again. Unset values default to enabled.

After deploying the code that supports this flag, an env-only change needs:

```bash
cd /opt/moneyminds
docker compose up -d --force-recreate moneyminds
```

The administrator profile displays when two-factor is turned off. The Supabase store now implements reading, saving and deleting authenticator factors, fixing `store.getTwoFASecret is not a function` at login. It uses the existing `two_fa_secrets` table from the agent repair; no new migration is required.

### Local validation

`npm test` covers admin permissions, settings persistence/enforcement, stale-session rejection, review prerequisites, moderation, document badge reversal, authenticator setup/login, provider ownership/amount checks, signed webhooks, and duplicate fulfillment. SQL tests execute the migration twice in isolated PGlite, exercise the service role, verify audit atomicity, and preserve existing records.

After `npm run build`, run `node scripts/check-admin-browser.mjs` with Chrome installed (`CHROME_PATH` can override the executable). This uses isolated generated fixtures, blocks server provider requests, checks all admin routes at desktop/mobile widths, saved settings and reviews, CSV download, role restrictions, customer browsing and development checkout. Screenshots go to ignored `docs/admin-validation/`. It does not connect to the live database, send email or charge money. Real production AI, email and Stripe delivery still need verification after deployment with the production configuration.

Validation on 2026-11-01: **246 tests passed**, with two live Tavily tests skipped because the isolated test environment has no search key. The production build passed with the existing environment/chunk-size warnings. Chrome checks passed without browser errors, including all nine admin screens at mobile width and actual profile API loading after cookie-only refresh for investor, startup and advisor accounts. A simulated development purchase persisted its enrollment after reload; real Stripe requests were mocked in automated tests, while webhook signatures were generated and validated with the installed Stripe SDK.

## Deploying the agent repair

The initial live database reported `ai_verifications` missing, four signals without saved AI analysis, three advisor profiles, and no document-verification or credibility-history rows. Empty tables are different from missing tables. The original agent repair covered 22 application tables; the current audit includes the three new admin tables described above.

1. In Supabase project `ievzkvvidsdrlytvitup`, run the entire file [repair_agent_runtime.sql](supabase/migrations/20261101084337_repair_agent_runtime.sql) in the SQL Editor. It preserves existing rows, creates missing tables, adds agent columns, and creates `agent_runs` and `agent_follows`. It requires the existing `platform_users` table. Apply this specific repair; do not blindly replay the old `001_initial_schema.sql`, which targets a different `users` schema.
2. Run [repair_profile_photo_columns.sql](supabase/migrations/20261101090525_repair_profile_photo_columns.sql), then the admin console migration above, followed by [agent_database_audit.sql](supabase/agent_database_audit.sql). The live audit after the first repair found all 22 original tables present, with only `photo_url` missing from the existing advisor, investor and startup profile tables. The photo follow-up adds those three columns without replacing profiles or existing photos. Check that every table reports `READY` with no `missing_columns`; row counts can legitimately be zero before agents run.
3. Configure the **server's** production environment using `.env.production.example`. Use `SUPABASE_URL=https://ievzkvvidsdrlytvitup.supabase.co` and the service-role key for that same project. Set `GROQ_API_KEY` or `ANTHROPIC_API_KEY`, plus `TAVILY_API_KEY` for research/background verification. Keep keys on the server. Local `.env` keys do not automatically configure the deployed server.
4. Keep `VITE_API_BASE_URL` empty for this repository's same-origin deployment. For a separately hosted API, set its public HTTPS origin at build time. The production client ignores inherited localhost development URLs.
5. Deploy the updated server and frontend together. For the included Docker Compose deployment, run `docker compose up -d --build moneyminds`, then inspect `docker compose logs --tail=100 moneyminds`. This change has not been deployed automatically.
6. Open **Admin > Agent Activity** (`/admin/agents`). Storage must say `supabase`, and required tables/columns must be available. Provider badges check configuration presence; a completed run verifies a working request. Use **Existing records awaiting processing** to run analysis on the four older signals and background checks for existing applicants.

Text agents use configurable model names. The Groq defaults were checked against the account's available models: `openai/gpt-oss-20b` for text and `qwen/qwen3.8-27b` for image reading. The previous hardcoded Llama models were unavailable. See [Groq text model](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [vision documentation](https://console.groq.com/docs/vision). Anthropic is supported as an alternative; its live credentials were not available for this local validation.

`ALPHA_VANTAGE_KEY` or `FINNHUB_API_KEY` enables stock baselines and checks. Crypto prices use CoinGecko. Credential uploads also require the existing Supabase Storage `uploads` bucket used by the app; provider configuration alone does not create storage. A scanned PDF with no extractable text needs a readable PDF or image upload/manual review.

## Where agents run and where to see them

### Background checks for registered users

Use **Admin > Users > View details > Run background check** for an existing applicant, or select a user under **Admin > AI Operations** and click **Background check**. **View report** opens that user's latest verification report. The backlog lists pending/approved users with missing, failed or skipped reports; rejected users can be selected explicitly. These checks do not change account approval.

For everyone, use **Admin > Due Diligence > Background checks for all users > Start N background checks**. Pending, approved and rejected registered accounts are included; admins are excluded. The default queues only users without a completed report. Select **Include users with completed reports** for fresh checks on everyone. The page shows the exact users, account status, check status, recommendations and individual reports. A new batch waits for active checks to finish, and duplicate active jobs are prevented. Failures remain visible and can be retried with the default mode. This uses the existing `agent_runs` table and requires no additional SQL migration.

**Reports & Audit** links to **Due Diligence > Users and results > View report** for completed background checks and to **AI Operations > Completed runs > Result** for saved agent output within the latest 100 runs. The user/results list is expanded by default. Payment records and administrator audit entries remain below the AI report links. Database migrations create the required structures; they do not generate AI reports. After starting Docker with `docker compose up -d`, closing the terminal or pressing Ctrl+C in `docker compose logs -f` only closes the log viewer; the container keeps running.

Background checks now share a persisted queue, including new signups and manual retries. A persistent Node/Docker server processes checks sequentially per server, continues after individual failures, and checks saved work every ten seconds after restart. If providers are not configured, new signup checks stay queued until setup is completed. Interrupted running jobs are marked failed after ten minutes and can be retried. On Vercel/serverless, one check is processed per invocation; keep Agent Activity open so it sends the next processing request, or reopen it to resume the saved queue. Hosting execution-duration limits still apply. Closing the page does not delete queued work. Each check uses AI and web-search credits.

A new registration queues the same background check automatically after the general profile is saved. It uses the registration name and requested roles to build web queries; the AI receives the name, roles, bio, location and retrieved snippets. Detailed startup/investor/advisor profile fields are not merged into this check, and editing those profiles does not automatically rerun it. Search uses Tavily (up to five results per query, deduplicated by URL, with snippets capped at 500 characters), then the configured Groq/Anthropic provider generates the report. Sources are public search results rather than direct LinkedIn, company-register or credential-issuer integrations.

The recommendation criteria are consistent professional evidence (`accept`), limited/unclear or inconsistent evidence (`review`), or identified adverse evidence such as fraud/scam allegations, regulatory concerns or suspected impersonation (`reject`). The admin must confirm identity and source reliability before acting, especially for common names and allegations. Scores/confidence are model estimates with no fixed weighted formula; the background evidence score is separate from prediction-based advisor credibility. No-evidence/search failures are shown as failed runs requiring retry or manual review. The **How background checks work** panel documents these criteria in the app.

The separate **Startup due diligence** agent reviews only a saved startup profile's strengths, gaps and risks; it does not perform external background searches. Document verification is triggered by a credential upload, separately from registration.

On 2026-11-01, a live read-only check found the updated agent API and required database schema available, but `providers: []`, `searchConfigured: false`, and zero background-verification reports. Production must be configured with `GROQ_API_KEY` or `ANTHROPIC_API_KEY` and `TAVILY_API_KEY`, followed by a server restart/redeployment. Database readiness alone does not mean AI providers are configured.

| Agent | Trigger | Visible result |
| --- | --- | --- |
| Six industry research agents | Investor > AI Agents > View Insights > Run research, or admin research control | Source-linked report, opportunities, risks and research signals; `/activity` and admin activity |
| Background verification | New profile application; admin retry or backlog Run | Admin verification report and agent execution steps |
| Signal sentiment | Publish a signal; admin backlog/retry | Signal sentiment/risk labels and saved run result |
| Prediction extraction | Publish a signal; admin backlog/retry | Stored ticker, direction, original baseline and due date |
| Prediction checker | Daily 09:00 Asia/Karachi on the persistent Node server; admin Check due predictions | Prediction accuracy/history after a prediction is due |
| Credibility scoring | Daily 09:30 Asia/Karachi; advisor recalculation or admin control | Advisor credibility page and tracked run result |
| Document verification | Upload at `/verify` | Live steps, verification history and admin review queue |
| Startup due diligence | Startup > Agent Activity > Analyze my startup, or admin selects a user | Review of the saved startup profile with evidence gaps |
| Profile quality | User > Agent Activity > Review my profile, or admin selects a user | Strengths, gaps and suggestions from the saved profile |

The persistent Node server also checks predictions and recalculates credibility at startup. Vercel/serverless deployments do not run `node-cron`; use the admin controls there until a separately authenticated external scheduler is configured. Background requests use Vercel `waitUntil`, but the hosting plan's execution-duration limit still applies.

Runs persist real execution steps and timestamps. The UI polls every three seconds, shows failures and skipped work, and supports retries. Queued jobs interrupted by a restart can be resumed; interrupted document uploads need re-upload or manual review. Only admins see all users' runs. Other users see their own history. Following a research agent persists a selection; it does not create a paid subscription or schedule reports.

Historical signals with no original baseline are analyzed without inventing an accuracy score. Credibility requires at least five checked predictions for an advisor, so four unanalyzed signals cannot produce a genuine credibility score. Signals with recorded prediction schedules/results cannot be rewritten; publish a new signal instead. Research requires available sources, and provider failures produce an error rather than a fabricated report. A provider rate limit gets one bounded retry; avoid starting every research agent simultaneously on a limited provider plan.

### Multiple Groq keys

Set a comma-separated list in the server environment, then restart the backend:

```env
AI_PROVIDER=groq
GROQ_API_KEYS=your_first_key,your_second_key,your_third_key
```

The non-empty list takes precedence over `GROQ_API_KEY`; the original single-key setting still works when the list is empty. Duplicate keys and surrounding whitespace are removed. Repeating `GROQ_API_KEY=` on several lines does not create a pool.

Concurrent text, image-reading and prediction-explanation requests share a pool. Each request uses the least-busy ready key; ties rotate evenly. Three concurrent requests can therefore use all three keys. HTTP 401, 403, 408, 413, 429, 5xx and SDK connection errors/timeouts automatically try the next ready key, at most once per key in that request sequence. This applies regardless of which organization owns the keys. Invalid keys (HTTP 401) are skipped until the server restarts or the key list changes. Attempts divide the remaining Groq request timeout: 45 seconds by default, or 30 seconds for prediction explanations. Later provider fallback and the JSON workflow's rate-limit wait can extend the overall run duration.

HTTP 429 pauses only the affected key for the provider's `Retry-After` duration; another ready key is tried immediately. If every remaining key is cooling down, the JSON workflow can wait for its bounded retry, then use configured provider fallback if needed. HTTP 400 and 422 stop attempts across keys. A 413 response tries the next key with the same input; the failover logic does not silently shorten the prompt. Every key can still reject an oversized request, especially when they share a quota. If that happens, reduce the input or use Auto with another configured provider. The app's **No limit** option cannot remove provider quotas or request-size limits.

Use `AI_PROVIDER=auto` to try configured providers in order: Groq, Gemini, then Anthropic, including document images. Configure `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` for those fallback options. Selecting a specific provider disables cross-provider fallback. Token-limit, usage-storage and other internal AI errors stop retries and fallback. Each attempt remains in token accounting without storing keys; a timeout or missing token count does not establish zero billing. The admin readiness endpoint reports `groqKeyCount`. Routing and cooldown state are per Node process, not a distributed global limit.

Keys distribute requests that are already concurrent; they do not change the background-verification queue's sequential scheduling. Local `.env` settings must also be configured on the production server when deploying.

## Validation and demo walkthrough

Run `npm ci`, `npm test`, and `npm run build` before deploying. Tests cover SQL repair idempotence/data preservation, cookie authentication, run ownership, duplicate dispatch, failures, actual PDF extraction, signal processing, provider fallback/retry, and prediction-to-credibility persistence. Tests use isolated data and do not load local provider keys.

For the demo, open an investor session and an admin session in separate browser profiles. Start one investor research report, keep `/admin/agents` open to watch its progress, then expand **Result** to inspect sources. Refresh the investor page to demonstrate persistence. Publish a fresh BTC signal and follow its sentiment/extraction runs; the prediction score appears only when due. Use a real readable credential to demonstrate document review, or clearly explain a test document's rejected/manual-review outcome.

Local validation used isolated in-memory fixtures plus real Groq/Tavily/CoinGecko calls. All six research agents, sentiment, prediction extraction, profile review, startup analysis, PDF analysis, image reading and background verification were exercised. The browser check confirmed admin visibility of an investor run, cookie-based reloads and persisted Follow selections without browser errors. SQL was validated with an isolated PostgreSQL-compatible PGlite instance. On 2026-11-01, the user applied both repairs and confirmed the audit was ready. A subsequent read-only live check confirmed Supabase storage, available agent APIs and required schema, but no configured AI/search providers and no background-verification reports. Production provider configuration and deployment of the additional admin background-check controls remain necessary before verifying real background checks in production.

## Role-specific registration (2026-11-04)

`/apply` collects required phone, city and country alongside role-specific Startup, Investor and Financial Advisor applications. Registration and the API share field definitions in `shared/registrationFields.js`. The account, selected role profiles and private application snapshot are inserted in one transaction. Uploaded evidence is linked to its original entry and is available only through authenticated owner/reviewer downloads.

Deploy the frontend and server together after applying `supabase/migrations/20261104130001_profile_registration.sql` (included in `auto-migrations.json`, after the enhanced advisor migration). Existing accounts remain intact. The server creates the private `registration-documents` storage bucket on the first evidence upload; its service role needs Storage permissions. It refuses a public bucket with that name. In memory mode, records and files are temporary.

The supplied nginx configuration permits 22 MB request bodies for the form's 20 MB aggregate document limit plus multipart overhead. Apply the equivalent limit to the actual reverse proxy when deploying; editing this repository alone does not reload a live proxy. Production deployment and live database/storage changes are not part of this local implementation.

Validation: `EMAIL_OTP_ENABLED=false npm test -- --maxWorkers=2` passed 295 tests (2 live-search tests skipped). `npm run build` passed. The existing optional authenticator login was also aligned with the installed OTP library after its regression test exposed an API mismatch. `node scripts/check-registration-browser.mjs` checks mobile required fields, Investor registration, a multi-role application with repeated education/evidence, admin review and the approved profile gate using an isolated in-memory server with outbound provider requests blocked.

## Profile due diligence for all roles (2026-11-04)

The `due-diligence` agent reviews Startup, Investor and Financial Advisor roles together using the private registration snapshot, current professional profiles, associated documents and available public search evidence. The existing `agent_runs.result` JSON stores the field assessments, quoted evidence, source references, document reading outcomes and limitations; no additional schema migration is needed beyond the existing registration/agent migrations.

Start it from **Admin > Users > View details > Run profile due diligence** or **AI Operations > Profile due diligence**. Approved owners can run it from **Agent Activity**. Admins can review pending applicants. It remains an explicitly requested review and does not change approval, verification badges or credibility scores. Reports are restricted to the owner and authorized admin reviewers.

Configure Groq or Anthropic for assessment, Tavily for public search, and an image-capable provider for image documents. PDFs use the existing text reader. Missing search results/configuration, unreadable documents, extraction truncation and omitted model assessments are disclosed. Supported/inconsistent findings require a supplied source ID and matching excerpt. Document authenticity, current registry standing, phone/email ownership and references still need independent confirmation; preferences are self-reported. Passwords, payment settings and tax IDs are excluded.

Due-diligence assessment requests review at most three fields sequentially. The complete instructions and serialized input are capped at 5,000 UTF-8 bytes, with a separate 2,500-token Groq completion allowance (including reasoning). This bounds individual requests; it is not a per-user token quota. All retained evidence is processed in overlapping excerpts with original source IDs, and quotes are checked against the excerpt actually sent. Contradictions and incomplete assessments remain visible when results are combined. Indivisible oversized claims/context/metadata are preserved in the report for explicit manual review. Existing document extraction limits still apply. Large profiles can require many requests and take longer; provider per-minute quotas and hosting execution limits still apply. This change prevents the previous oversized 12-field requests but does not promise unlimited throughput.

Validation: `EMAIL_OTP_ENABLED=false npm test -- --maxWorkers=2` passes 312 tests with 2 live-search tests skipped, including 17 due-diligence cases. `npm run build` passes. `node scripts/check-due-diligence-browser.mjs` checks pending admin review, all three owner roles, report filters, PDF extraction and mobile layout using synthetic accounts and mocked AI/search HTTP responses. These checks do not establish live provider accuracy. Deploy the frontend and server together to enable this on the live site.

## Per-run AI token usage (2026-11-04)

Agent cards now show input/output/total tokens and an expandable explanation of each AI request's purpose, model, retry/fallback and supplied field/source/document counts. Usage remains visible on failed runs. The shared card covers admin operations, user activity, investor research and document activity.

`server/services/aiUsage.js` scopes collection to each tracked run, including concurrent batches, and serializes incremental persistence to `agent_runs.usage`. The provider boundary records a response before JSON parsing/validation so unusable responses and provider fallbacks are counted. Image readers and prediction explanations use the same collector. When a parallel request fails, the run waits for its in-flight sibling requests before saving final usage. No prompts, document contents, credentials or raw provider errors are stored in usage metadata.

Counts follow [Groq's usage response](https://console.groq.com/docs/api-reference) and [Anthropic's input/cache accounting](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): Anthropic's uncached input, cache reads and cache writes are summed once; Groq cached input and both providers' reported reasoning counts are subsets of the displayed input/output totals. Unknown counters stay null. Partial totals, unreported requests, interrupted requests and older unrecorded runs are labeled explicitly. PDF extraction and search do not themselves add model tokens; evidence included in a model prompt does. This is usage for tracked runs, not a billing invoice or account-wide spend report.

Deploy server and frontend together after applying `supabase/migrations/20261104182053_agent_token_usage.sql`, included in the automatic migration manifest. The nullable JSON column preserves historical runs and existing access controls. New measured non-AI runs record zero; old runs retain null. Usage persistence failures stop further requests in that run instead of spending additional tokens without recording them.

Validation includes provider normalization, cache/reasoning accounting, malformed responses, retries/fallback, image reading, concurrency, interrupted runs, storage failures, ownership checks and PostgreSQL migration/JSON round trips. The isolated browser check uses synthetic usage values supplied through mocked provider HTTP responses and checks displayed totals, request purposes, mobile layout, legacy states and failed-run visibility. Live provider billing was not exercised.

### AI settings, automatic switching, and token limits

Super admins can open **Admin > AI Config** (`/admin/ai-config`). The page shows every configured Groq key as a separate masked entry and lists Gemini and Anthropic separately. It never returns saved keys in full. A configured key is not proof that credentials or a model work; use Agent Activity to inspect actual runs.

Apply the checked-in migrations (`npm run db:migrate`) before using database settings, then restart the backend. Environment-only installations can view keys but cannot persist edits from the page. The new migration adds Gemini settings while retaining encryption and service-role-only database access.

```env
AI_PROVIDER=auto
GROQ_API_KEYS=first_groq_key,second_groq_key,third_groq_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.8-flash
```

Do not repeat `GROQ_API_KEY=`: dotenv retains only one value for a repeated name. Saved keys override environment keys for that provider. Removing a saved override restores its environment configuration. Groq replacement replaces the whole pool; enter all keys you want to keep in the new pool.

Auto tries Groq, then Gemini, then Anthropic when configured. Selecting one provider disables cross-provider fallback; Groq's key pool still distributes concurrent calls. JSON assessments, image reading, and prediction explanations use the same saved configuration. Settings refresh immediately in the saving process and within 60 seconds in other processes. In-flight calls may finish using their previous settings. OpenAI settings from older versions remain stored but are not routed by these agents.

Gemini uses the native [generateContent API](https://ai.google.dev/api/generate-content). Its reported thinking tokens are included in output totals; blocked or truncated replies are not accepted as completed assessments. Keep the chosen model available in your provider account. Use a stable `AI_CONFIG_ENCRYPTION_KEY` (64 hex characters or a passphrase of at least 32 characters); otherwise the encryption key derives from `JWT_SECRET`. Changing that encryption secret makes previously saved credentials unreadable.

Daily, monthly, and per-agent limits can be raised or lowered in AI Config:
- **No limit** saves a null global threshold or removes the agent's override.
- **0** stops new AI requests for that threshold.
- Global thresholds count recorded input and output tokens from all tracked runs, including failed and running work. Day and month boundaries use UTC and request start timestamps.
- Per-agent thresholds count tokens within one tracked run, including retries and provider fallback. They do not affect token-free calculations.
- Checks run before each provider call. These are usage thresholds, not exact billing caps: requests already in flight, or responses with unreported token counts, may exceed the configured value.
- With thresholds enabled, untracked AI calls are blocked; launch the action through Agent Activity. A limit or usage-storage error does not trigger another provider to bypass the check.
- No limit does not remove the provider's own quotas.

**Admin > AI Operations** (`/admin/agents`) includes an agent results table based on the latest 100 runs. It distinguishes completed workflows, failures, skipped work, and no recent evidence, and lets an admin show the corresponding run cards. Review the saved report, source links, extracted document fields, checked prices, and recorded provider responses. Credibility uses deterministic calculations and needs five eligible checked predictions. AI content moderation is not implemented; content controls are manual.

Validate UI behavior with `node scripts/check-ai-settings-browser.mjs` in an isolated source copy after building. It uses synthetic credentials and storage without provider calls.

### Temporarily disable request limits for local testing

Set `RATE_LIMITS_ENABLED=false` in your local `.env` and restart the API. This bypasses the application's login, email OTP request, and agent-trigger request limits only when `NODE_ENV` is `development` or `test`. Production and other environments always enforce them. Set it back to `true` (or remove it) and restart to restore normal limits.

Authentication, OTP verification, AI token budgets, and upstream provider quotas remain separate controls. If the API uses memory storage, restarting discards its temporary records.
