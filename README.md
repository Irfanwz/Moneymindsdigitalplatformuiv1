
  # MoneyMinds Digital Platform UI

  This is a code bundle for MoneyMinds Digital Platform UI. The original project is available at https://www.figma.com/design/i1YkmFFH5Sq3edAe6xbb8n/MoneyMinds-Digital-Platform-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Deploying the agent repair

The live database reported `ai_verifications` missing, four signals without saved AI analysis, three advisor profiles, and no document-verification or credibility-history rows. Empty tables are different from missing tables. The audit below checks all 22 expected application tables and their columns.

1. In Supabase project `ievzkvvidsdrlytvitup`, run the entire file [repair_agent_runtime.sql](supabase/migrations/20261101084337_repair_agent_runtime.sql) in the SQL Editor. It preserves existing rows, creates missing tables, adds agent columns, and creates `agent_runs` and `agent_follows`. It requires the existing `platform_users` table. Apply this specific repair; do not blindly replay the old `001_initial_schema.sql`, which targets a different `users` schema.
2. Run [repair_profile_photo_columns.sql](supabase/migrations/20261101090525_repair_profile_photo_columns.sql), then [agent_database_audit.sql](supabase/agent_database_audit.sql). The live audit after the first repair found all 22 tables present, with only `photo_url` missing from the existing advisor, investor and startup profile tables. This follow-up adds those three columns without replacing profiles or existing photos. Check that every table reports `READY` with no `missing_columns`; row counts can legitimately be zero before agents run.
3. Configure the **server's** production environment using `.env.production.example`. Use `SUPABASE_URL=https://ievzkvvidsdrlytvitup.supabase.co` and the service-role key for that same project. Set `GROQ_API_KEY` or `ANTHROPIC_API_KEY`, plus `TAVILY_API_KEY` for research/background verification. Keep keys on the server. Local `.env` keys do not automatically configure the deployed server.
4. Keep `VITE_API_BASE_URL` empty for this repository's same-origin deployment. For a separately hosted API, set its public HTTPS origin at build time. The production client ignores inherited localhost development URLs.
5. Deploy the updated server and frontend together. For the included Docker Compose deployment, run `docker compose up -d --build moneyminds`, then inspect `docker compose logs --tail=100 moneyminds`. This change has not been deployed automatically.
6. Open **Admin > Agent Activity** (`/admin/agents`). Storage must say `supabase`, and required tables/columns must be available. Provider badges check configuration presence; a completed run verifies a working request. Use **Existing records awaiting processing** to run analysis on the four older signals and background checks for existing applicants.

Text agents use configurable model names. The Groq defaults were checked against the account's available models: `openai/gpt-oss-20b` for text and `qwen/qwen3.8-27b` for image reading. The previous hardcoded Llama models were unavailable. See [Groq text model](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [vision documentation](https://console.groq.com/docs/vision). Anthropic is supported as an alternative; its live credentials were not available for this local validation.

`ALPHA_VANTAGE_KEY` or `FINNHUB_API_KEY` enables stock baselines and checks. Crypto prices use CoinGecko. Credential uploads also require the existing Supabase Storage `uploads` bucket used by the app; provider configuration alone does not create storage. A scanned PDF with no extractable text needs a readable PDF or image upload/manual review.

## Where agents run and where to see them

### Background checks for registered users

Use **Admin Dashboard > All registered users > Run background check** for any existing applicant, or select a user under **Admin > Agent Activity** and click **Background check**. The dashboard action opens Agent Activity to follow the run. **View report** opens that user's latest verification report. The backlog lists pending/approved users with missing, failed or skipped reports; rejected users can be selected explicitly. These checks do not change account approval.

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

## Validation and demo walkthrough

Run `npm ci`, `npm test`, and `npm run build` before deploying. Tests cover SQL repair idempotence/data preservation, cookie authentication, run ownership, duplicate dispatch, failures, actual PDF extraction, signal processing, provider fallback/retry, and prediction-to-credibility persistence. Tests use isolated data and do not load local provider keys.

For the demo, open an investor session and an admin session in separate browser profiles. Start one investor research report, keep `/admin/agents` open to watch its progress, then expand **Result** to inspect sources. Refresh the investor page to demonstrate persistence. Publish a fresh BTC signal and follow its sentiment/extraction runs; the prediction score appears only when due. Use a real readable credential to demonstrate document review, or clearly explain a test document's rejected/manual-review outcome.

Local validation used isolated in-memory fixtures plus real Groq/Tavily/CoinGecko calls. All six research agents, sentiment, prediction extraction, profile review, startup analysis, PDF analysis, image reading and background verification were exercised. The browser check confirmed admin visibility of an investor run, cookie-based reloads and persisted Follow selections without browser errors. SQL was validated with an isolated PostgreSQL-compatible PGlite instance. On 2026-11-01, the user applied both repairs and confirmed the audit was ready. A subsequent read-only live check confirmed Supabase storage, available agent APIs and required schema, but no configured AI/search providers and no background-verification reports. Production provider configuration and deployment of the additional admin background-check controls remain necessary before verifying real background checks in production.
