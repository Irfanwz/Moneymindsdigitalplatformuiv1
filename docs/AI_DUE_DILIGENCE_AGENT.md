# MoneyMinds — Automated AI Due Diligence Agent

> **Created:** June 2026  
> **Status:** Planned — Pending API key confirmation  
> **Priority:** High  
> **Timeline:** 4 Weeks (July 2026)  
> **Week 1:** Foundation & Infrastructure  
> **Week 2:** Core Agent & Search Integration  
> **Week 3:** Admin Dashboard & UI  
> **Week 4:** Testing, Polish & Go-Live

---

## What This Does

When a new user registers on the platform, an AI agent automatically runs in the background to verify their identity and online credibility. By the time the admin opens the dashboard to review the pending user, a full AI-generated report is already waiting — with a clear recommendation to Accept, Review, or Reject.

The admin never has to manually Google anyone. The AI does it first.

---

## System Flow

```
User Submits Registration
         ↓
Profile saved → status: "pending"
Registration response sent to user immediately (non-blocking)
         ↓
AI Verification Agent fires in background (async)
         ↓
┌─────────────────────────────────────────────┐
│           AI Verification Pipeline          │
│                                             │
│  Step 1 — Web Search                        │
│    • "[Name]" LinkedIn                      │
│    • "[Company]" site:crunchbase.com        │
│    • "[Name]" "[Company]" general presence  │
│    • "[Name]" fraud OR scam OR lawsuit      │
│    • "[Name]" advisor OR investor OR startup│
│                                             │
│  Step 2 — Results Collection                │
│    • URLs found                             │
│    • Content snippets                       │
│    • Relevance scores                       │
│                                             │
│  Step 3 — Claude Analysis                   │
│    • Analyze all search findings            │
│    • Cross-reference with profile claims    │
│    • Detect red flags or inconsistencies    │
│    • Generate credibility score (0–100)     │
│    • Write structured report                │
│                                             │
│  Step 4 — Store Report in DB                │
│    • ai_verifications table                 │
│    • Recommendation: accept/review/reject   │
│    • Confidence score + full findings       │
└─────────────────────────────────────────────┘
         ↓
Admin Dashboard shows AI badge on user card:
  ✅ AI: Accept (confidence: 91%)
  ⚠️  AI: Review (confidence: 67%)
  ❌ AI: Reject (confidence: 88%)
         ↓
Admin clicks → reads full report → approves or rejects
```

---

## AI Report Structure

```json
{
  "recommendation": "accept" | "review" | "reject",
  "confidence": 85,
  "credibility_score": 72,
  "summary": "One paragraph summary of findings",
  "findings": {
    "linkedin_found": true,
    "linkedin_url": "https://linkedin.com/in/...",
    "company_verified": true,
    "company_url": "https://...",
    "news_mentions": 3,
    "crunchbase_found": false,
    "red_flags": ["Mention of SEC investigation in 2023 article"],
    "positive_signals": [
      "Active LinkedIn with 500+ connections",
      "Company appears in TechCrunch article",
      "Consistent name/company across multiple sources"
    ],
    "sources_found": [
      { "url": "...", "title": "...", "relevance": 0.92 }
    ]
  },
  "report_markdown": "## Due Diligence Report\n\n### Identity...",
  "generated_at": "2026-06-27T10:30:00Z",
  "search_queries_run": 5
}
```

---

## Web Searches Run Per User

| Query | Purpose |
|-------|---------|
| `"[Full Name]" LinkedIn` | Verify LinkedIn presence |
| `"[Company Name]" site:crunchbase.com` | Startup validation (startup role) |
| `"[Full Name]" "[Company Name]"` | General online presence |
| `"[Full Name]" fraud OR scam OR lawsuit` | Red flag detection |
| `"[Full Name]" advisor OR investor OR startup` | Role claim validation |

Searches are tailored by requested role:
- **Startup** → also searches company registration, funding news
- **Investor** → also searches AngelList, fund name, portfolio
- **Advisor** → also searches certifications, professional registrations

---

## Admin Dashboard Changes

### Pending User Card (Current)
```
[Avatar] John Doe
         john@example.com
         Requested: Startup
         [Approve] [Reject]
```

### Pending User Card (After This Feature)
```
[Avatar] John Doe
         john@example.com
         Requested: Startup
         ✅ AI: Accept  Confidence: 91%  [View Report]
         [Approve] [Reject]
```

### AI Report Panel (Expanded)
- **Recommendation badge** — color-coded (green/yellow/red)
- **Credibility score** — 0–100 with breakdown
- **Key findings** — bullet list of what was found
- **Red flags** — highlighted in red if any
- **Sources** — clickable links to found profiles/articles
- **Full report** — markdown rendered
- **Admin override note** — if admin disagrees, they can note why

### Verification Status States
| State | What It Means |
|-------|--------------|
| `running` | AI is currently searching and analyzing |
| `complete` | Report ready — recommendation available |
| `failed` | Search API failed — admin reviews manually |
| `skipped` | Not enough data to search (e.g., no name/company) |

---

## 4-Week Development Plan

---

### Week 1 — Foundation & Infrastructure
> **Goal:** Everything the agent needs to run — database, config, search API connection, basic agent skeleton.

#### Day 1–2 — Environment & Database Setup
- [ ] Add `TAVILY_API_KEY` to `.env`, `.env.example`, `.env.production.example`
- [ ] Add `TAVILY_API_KEY` to `server/config.js` exports
- [ ] Write DB migration — `supabase/004_ai_verifications.sql`

```sql
CREATE TABLE ai_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'running'
    CHECK (status IN ('running', 'complete', 'failed', 'skipped')),
  recommendation TEXT
    CHECK (recommendation IN ('accept', 'review', 'reject')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  summary TEXT,
  findings JSONB,
  report_markdown TEXT,
  sources JSONB DEFAULT '[]',
  red_flags JSONB DEFAULT '[]',
  search_queries_run INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_verifications_user ON ai_verifications(user_id);
CREATE INDEX idx_ai_verifications_status ON ai_verifications(status);
CREATE INDEX idx_ai_verifications_recommendation ON ai_verifications(recommendation);
```

- [ ] Add CRUD methods to `server/store/memoryStore.js`:
  - `createVerification(userId)`
  - `updateVerification(userId, data)`
  - `findVerification(userId)`
  - `listVerifications({ status, recommendation })`

- [ ] Add same methods to `server/store/supabaseStore.js`

#### Day 3 — Tavily Search Service
- [ ] Create `server/services/searchService.js`
  - `search(query)` — single Tavily API call, returns clean results
  - `batchSearch(queries)` — runs multiple queries, collects all results
  - Error handling: timeout, rate limit, API down → returns empty array (never throws)
  - Response normalisation: `{ title, url, content, score }`

- [ ] Manual test: call Tavily with a known name, verify results format

#### Day 4–5 — Query Builder
- [ ] Create `server/services/queryBuilder.js`
  - `buildQueriesForUser(user)` — generates role-specific search queries
  - Startup queries: name, company, crunchbase, fraud check, funding news
  - Investor queries: name, firm, AngelList, portfolio, SEC/regulatory check
  - Advisor queries: name, certifications, professional registrations, publications
  - All roles: general presence, LinkedIn, red flag check

- [ ] Unit test query builder with sample user objects for each role

---

### Week 2 — Core AI Agent
> **Goal:** The agent runs end-to-end. Give it a user, it returns a complete structured report.

#### Day 6–7 — Claude Analysis Prompt
- [ ] Design and iterate the Claude prompt in `server/services/verificationAgent.js`
- [ ] Prompt structure:
  ```
  You are an AI due diligence analyst for a financial platform.
  Review the following search results for a user who has applied to join.

  USER PROFILE:
  Name: [name]
  Role applied for: [startup/investor/advisor]
  Company: [company if provided]
  Bio: [bio if provided]
  Location: [location]

  SEARCH RESULTS:
  [all search result snippets]

  Analyze the above and return a JSON report with:
  - recommendation (accept/review/reject)
  - confidence (0-100)
  - credibility_score (0-100)
  - summary (1 paragraph)
  - findings (linkedin_found, company_verified, news_mentions, red_flags[], positive_signals[])
  - sources (array of {url, title, relevance})
  - report_markdown (full human-readable report)

  Rules:
  - "accept" if strong online presence, no red flags, profile claims consistent
  - "review" if limited presence or minor inconsistencies
  - "reject" if red flags found (fraud, scam, lawsuit, regulatory action)
  - Never fabricate — only report what is in the search results
  ```

- [ ] Test prompt with 5 different user types — refine until output is consistent

#### Day 8–9 — Agent Orchestrator
- [ ] Complete `server/services/verificationAgent.js`
  - `runForUser(userId)` — full pipeline:
    1. Load user from store
    2. Set verification status to `running`
    3. Build search queries via `queryBuilder`
    4. Run batch searches via `searchService`
    5. Send results to Claude for analysis
    6. Parse and validate JSON response
    7. Store complete report
    8. Set status to `complete`
  - Error handling: any failure → set status to `failed`, log error
  - Skipping: if user has no name → set status to `skipped`

#### Day 10 — Registration Hook
- [ ] Modify `server/routes/auth.js` — add non-blocking trigger after user saved:
```js
// Fire and forget — registration response is NOT delayed
setImmediate(() => {
  verificationAgent.runForUser(newUser.id).catch(err =>
    console.error('[AI Verification] Failed:', err.message)
  );
});
```
- [ ] Confirm: register a test user, verify response is instant, check DB 30 seconds later for completed report

---

### Week 3 — Admin Dashboard UI
> **Goal:** Admin sees AI recommendations directly on the dashboard. Full report available on click.

#### Day 11–12 — Admin API Endpoints
- [ ] Add to `server/routes/admin.js`:
  ```
  GET  /api/admin/users/:id/verification         → Full AI report for one user
  GET  /api/admin/verifications/summary          → { total, accept, review, reject, running, failed }
  POST /api/admin/users/:id/verification/retry   → Re-run agent (admin only)
  ```
- [ ] Add API functions to `src/app/lib/api.ts`:
  - `getUserVerification(userId)`
  - `getVerificationSummary()`
  - `retryVerification(userId)`

#### Day 13–14 — AI Verification Report Component
- [ ] Create `src/app/components/admin/AIVerificationReport.tsx`
  - **Header:** Recommendation badge (Accept ✅ / Review ⚠️ / Reject ❌) + confidence %
  - **Credibility Score:** Visual gauge / progress bar (0–100)
  - **Summary:** AI-written paragraph
  - **Key Findings:**
    - LinkedIn found? ✅/❌ + link
    - Company verified? ✅/❌ + link
    - News mentions: count + links
    - Positive signals: green bullet list
    - Red flags: red warning cards
  - **Sources:** Clickable list of all URLs found
  - **Full Report:** Rendered markdown (collapsible)
  - **Retry button:** Re-run verification if failed
  - **Override note:** Text field — "Admin reason for overriding AI recommendation"

#### Day 15 — Admin Dashboard Integration
- [ ] Modify `src/app/components/dashboards/AdminDashboard.tsx`
  - Add AI badge to each pending user card
  - Badge shows: recommendation + confidence (e.g., `✅ Accept · 91%`)
  - Loading spinner if `status: running`
  - Grey "No AI data" badge if `status: failed` or `status: skipped`
  - "View AI Report" button → opens `AIVerificationReport` in a modal or side panel
  - Add summary bar at top: `12 pending — 8 Accept · 3 Review · 1 Reject`
  - Filter buttons: "Show All / Accept / Review / Reject"

---

### Week 4 — Testing, Polish & Go-Live
> **Goal:** Fully tested, edge cases handled, deployed on production server.

#### Day 16–17 — Functional Testing

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Real professional (strong online presence) | Register with real name + company | High credibility, Accept recommendation |
| Unknown person (no online presence) | Register with obscure/fake name | Low presence, Review recommendation |
| Known red flag name (include fraud keywords in bio for test) | Test red flag detection | Red flags found, Reject recommendation |
| Registration speed test | Register and measure response time | < 500ms — AI runs in background |
| Tavily API key missing | Remove key, register user | Status: failed, admin sees manual review prompt |
| Tavily API returns empty results | Mock empty response | Graceful — reports "no online presence found" |
| Retry failed verification | Trigger retry from admin | Re-runs and completes |
| Admin filter by recommendation | Click "Reject" filter | Only rejected AI users shown |
| Role-specific queries | Register as startup vs investor vs advisor | Different search queries generated per role |
| Supabase mode | Enable Supabase, register user | Verification persists after server restart |

#### Day 18 — Edge Cases & Error Handling
- [ ] User registers with only first name — agent handles gracefully
- [ ] User bio contains special characters / SQL injection attempts — sanitised before sending to Tavily
- [ ] Claude returns malformed JSON — fallback parser, status set to `failed`
- [ ] Network timeout on Tavily — 10 second timeout, graceful failure
- [ ] Multiple registrations at same time — no race conditions in DB writes
- [ ] Admin approves user before AI completes — works fine (approval independent of AI)

#### Day 19 — UI Polish
- [ ] Smooth loading skeleton while AI report fetches
- [ ] Mobile-responsive report panel
- [ ] Tooltip on confidence score: "How confident the AI is in this recommendation"
- [ ] Disclaimer text under every report: *"AI-generated assessment for admin guidance only. Human review is required before final decision."*
- [ ] Empty state if no verifications yet
- [ ] Toast notification when admin retries a verification

#### Day 20 — Go-Live

**Pre-Deploy Checklist:**
- [ ] `TAVILY_API_KEY` added to `/opt/moneyminds/.env.production`
- [ ] `ANTHROPIC_API_KEY` confirmed in `.env.production`
- [ ] DB migration `004_ai_verifications.sql` run on Supabase
- [ ] Docker container rebuilt and redeployed
- [ ] Register one real test user on production
- [ ] Confirm AI report appears in admin dashboard within 60 seconds
- [ ] Confirm admin can approve/reject after reading report

**Post Go-Live Monitoring (Week 4 end):**
- [ ] Check server logs daily for agent errors
- [ ] Monitor Tavily API usage (stay within free tier: 1,000/month)
- [ ] Monitor Claude token usage per verification (~1,500 tokens each)
- [ ] Review first 10 real AI reports manually — check quality and accuracy
- [ ] Adjust Claude prompt if recommendations seem off

---

## Go-Live Plan

### Environment Variables Required
```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxx        # Primary search API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx       # Already needed for other AI features
```

### Optional Fallback Search APIs
If Tavily is unavailable:
- **SerpAPI** — `SERPAPI_KEY`
- **Brave Search API** — `BRAVE_SEARCH_KEY`
- **Bing Search API** — `BING_SEARCH_KEY`

The agent is designed with a pluggable search provider — switching is a one-line config change.

### Deployment Steps
1. Add `TAVILY_API_KEY` to `/opt/moneyminds/.env.production`
2. Run DB migration to create `ai_verifications` table
3. Deploy updated Docker container
4. Test one real registration end-to-end
5. Check admin dashboard shows AI report

### Supabase vs Memory Mode
- **Memory mode:** Verification reports lost on server restart. Users still get verified on next login attempt.
- **Supabase mode (recommended):** Reports persist permanently. Full audit trail.

---

## Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| Tavily API | 5 searches × N registrations | Free tier: 1,000/month |
| Claude API | ~1,500 tokens per verification | ~$0.004 per user |
| **Per 100 new users** | | **~$0.40 + search API** |

Very low cost. Claude analysis is the main expense and it's negligible at early scale.

---

## Open Questions (Confirm Before Build)

| # | Question | Options |
|---|----------|---------|
| 1 | Which search API? | Tavily (recommended), SerpAPI, Brave, Bing |
| 2 | Block login while AI runs? | No (recommended) — admin reviews after |
| 3 | What if AI recommendation is "reject" — auto-reject? | No (recommended) — admin always has final say |
| 4 | Show AI report to the user themselves? | No — admin-only |
| 5 | Re-run verification when profile is updated? | Optional — on demand from admin |
| 6 | Store report permanently? | Yes (Supabase) or session-only (Memory mode) |

---

## Security & Privacy Notes

- Search queries use **name + company only** — no email, phone, or passwords sent to external APIs
- Claude receives search result snippets — no raw PII beyond what's publicly searchable
- Reports are **admin-only** — never shown to the user being verified
- All API keys stay server-side — never exposed to frontend
- Add disclosure in Terms of Service: *"We conduct automated online presence checks as part of our registration review process."*

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `server/services/verificationAgent.js` | **Create** — main AI agent |
| `server/routes/auth.js` | **Modify** — add hook after registration |
| `server/routes/admin.js` | **Modify** — add verification endpoints |
| `server/store/memoryStore.js` | **Modify** — add verification CRUD |
| `server/store/supabaseStore.js` | **Modify** — add verification CRUD |
| `supabase/004_ai_verifications.sql` | **Create** — DB migration |
| `src/app/components/admin/AIVerificationReport.tsx` | **Create** — report UI component |
| `src/app/components/dashboards/AdminDashboard.tsx` | **Modify** — add AI badges + report panel |
| `src/app/lib/api.ts` | **Modify** — add verification API functions |
| `.env.example` | **Modify** — add `TAVILY_API_KEY` |
