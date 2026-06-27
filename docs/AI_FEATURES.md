# MoneyMinds — AI Features (Phase 2)

> **Last Updated:** June 2026  
> **Status:** Foundation partially started — backend integration pending  
> **Platform:** MoneyMinds Digital Platform (React + Express + Supabase)

---

## Quick Summary — 8 AI Features

| # | Feature | Priority | Complexity | Est. Days | Status |
|---|---------|----------|-----------|-----------|--------|
| 1 | AI Intelligence Agents | HIGH | HIGH | 8–10 | UI done, backend pending |
| 2 | Credibility Scoring & Badges | HIGH | MEDIUM | 5–6 | Badge UI done, scoring pending |
| 3 | Smart Matching Engine | HIGH | MEDIUM-HIGH | 6–8 | Not started |
| 4 | AI Due Diligence Reports | MEDIUM | HIGH | 7–9 | Not started |
| 5 | Personalized Recommendations | MEDIUM | MEDIUM | 5–7 | Placeholder only |
| 6 | AI-Verified Profiles | MEDIUM | VERY HIGH | 8–10 | Not started |
| 7 | Sentiment Analysis on Signals | LOW | LOW | 3–4 | Not started |
| 8 | Real-Time Market Intelligence | HIGH | LOW | 3–4 | Routes built, frontend mock |

---

## Implementation Phases

| Phase | Timeline | Features |
|-------|----------|---------|
| A — Foundation | Week 1–2 | AI infrastructure, market data, database |
| B — Core AI | Week 3–4 | Agents, Credibility, Matching, Market Data live |
| C — Advanced AI | Week 5–6 | Due Diligence, Sentiment, Vector Matching |
| D — Verification & Polish | Week 7–8 | Verification, Recommendations, Testing |

---

## Feature Details

### 1. AI Intelligence Agents

**Who:** Investors | **Revenue:** $199–$349/mo per subscription

Investors subscribe to 6 industry-specific AI agents that deliver daily market analysis and investment insights.

| Agent | Price | Specialization |
|-------|-------|---------------|
| Crypto Market Expert | $299/mo | Real-time crypto analysis, token valuation |
| FinTech Intelligence | $249/mo | Startup evaluation, regulatory tracking |
| HealthTech Advisor | $279/mo | Clinical trial monitoring, FDA predictions |
| CleanTech Analyst | $229/mo | ESG scoring, carbon market analysis |
| AI/ML Investment Scout | $349/mo | AI startup evaluation, competitive mapping |
| SaaS Metrics Expert | $199/mo | Churn prediction, growth forecasting |

**Current Status:** UI complete (`/investor/ai-agents`, 675 lines), 100% mock data. Backend integration pending.

**Implementation:**
- DB: `ai_agents`, `ai_agent_subscriptions`, `ai_agent_results` tables
- Backend: `server/services/agentService.js` + `server/routes/aiAgents.js`
- Cron: Daily agent runs at 6 AM UTC via `server/jobs/agentRunner.js`
- Frontend: Replace all mock data in `AIAgentsPage.tsx` with real API calls

---

### 2. Credibility Scoring & Badges

**Who:** All roles | **Revenue:** Trust/engagement

Every profile gets an AI-calculated credibility score (0–100) and badge tier.

| Score | Badge | Color |
|-------|-------|-------|
| 90–100 | Excellent | Emerald |
| 80–89 | Good | Cyan |
| Below 80 | Standard | Amber |
| AI Verified | Verified | Teal |

**Scoring Weights:** Profile Completeness (25%) + Document Verification (25%) + Social Proof (20%) + Platform Activity (15%) + Peer Endorsements (15%)

**Current Status:** `CredibilityBadge.tsx` component built. Scoring algorithm and API pending.

---

### 3. Smart Matching Engine

**Who:** Startups ↔ Investors ↔ Advisors | **Revenue:** Freemium upsell

**Phase 1 — Rule-Based:** Score by industry (30pts) + stage (25pts) + check size (25pts) + location (20pts)

**Phase 2 — Vector Matching:** pgvector + OpenAI embeddings for thesis/pitch semantic similarity

**Current Status:** Landing page references as "Active" — no backend logic.

---

### 4. AI Due Diligence Reports

**Who:** Investors evaluating startups | **Revenue:** Per-report or premium plan

One-click generation of comprehensive startup analysis: Team (1–10), Market (1–10), Financials (1–10), Competitors, Top 5 Risks, Overall A–F Rating.

**Legal:** Mandatory disclaimer on every report. Consider consulting fintech lawyer before launch.

**Current Status:** Not implemented. New feature.

---

### 5. Personalized Recommendations

**Who:** All roles | **Revenue:** Engagement/retention

Personalized suggestions for startups, investors, advisors, trainings, and groups based on profile preferences and platform behavior.

**Current Status:** Dashboard shows placeholder "Set your industry preferences to get personalized recommendations."

---

### 6. AI-Verified Profiles

**Who:** All roles | **Revenue:** Trust premium

Users upload documents → AI extracts text via OCR → cross-references with profile claims → auto-approve (>90% confidence) or flag for admin review.

**Legal:** HIGH risk — identity documents, GDPR, KYC/AML considerations. Strongly consider licensed KYC provider (Jumio, Onfido) instead of DIY.

**Current Status:** Not implemented.

---

### 7. Sentiment Analysis on Signals

**Who:** Investors & Advisors | **Revenue:** Indirect

When advisors post signals, Claude automatically classifies sentiment as Bullish / Bearish / Neutral with a confidence score.

**Current Status:** Signal system fully built. Automated analysis pending.

**Easiest to implement** — single Claude API call per signal, hook into existing signal creation endpoint.

---

### 8. Real-Time Market Intelligence

**Who:** All roles | **Revenue:** Platform stickiness

Live data from CoinGecko (crypto), Alpha Vantage (stocks), Finnhub (news) with 5-minute caching.

**Current Status:** `server/routes/marketData.js` built and mounted. Landing page still shows hardcoded mock data.

---

## Technology Stack

| Component | Tool | Cost |
|-----------|------|------|
| LLM | Claude API (Anthropic) | ~$3–15/1M tokens |
| Embeddings | OpenAI text-embedding-3-small | ~$0.02/1M tokens |
| Vector DB | pgvector (Supabase) | Free |
| Market Data | CoinGecko + Alpha Vantage + Finnhub | Free tier |
| Scheduling | node-cron | Free |
| Caching | node-cache | Free |
| OCR (Verification) | Tesseract.js | Free |

**Estimated Monthly Cost:** $150–$450 for ~1,000 active users

---

## Required Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-xxx
CLAUDE_MODEL=claude-sonnet-4-6-20250514
OPENAI_API_KEY=sk-xxx          # embeddings only
ALPHA_VANTAGE_API_KEY=xxx
FINNHUB_API_KEY=xxx
# CoinGecko — no key needed for free tier
```

---

## Database Tables to Create

9 new tables needed: `ai_agents`, `ai_agent_subscriptions`, `ai_agent_results`, `credibility_scores`, `due_diligence_reports`, `recommendations`, `signal_sentiment`, `verification_requests`, `user_interactions`

Plus vector columns on existing tables: `thesis_embedding`, `pitch_embedding`, `bio_embedding` (requires pgvector extension in Supabase).

Full SQL migration: `supabase/migration_ai_features.sql`

---

## Implementation Order (Recommended)

| Order | Feature | Reason |
|-------|---------|--------|
| 1st | Real-Time Market Intelligence | Easiest, zero legal risk, other features depend on it |
| 2nd | Sentiment Analysis | Quick win, adds visible AI to existing signals |
| 3rd | Credibility Scoring | High visibility across entire platform |
| 4th | Personalized Recommendations | Improves engagement on every dashboard |
| 5th | Smart Matching (Rule-Based first) | Core platform value |
| 6th | AI Intelligence Agents | Revenue generator — needs market data first |
| 7th | AI Due Diligence Reports | High value, high legal risk — get legal review first |
| 8th | AI-Verified Profiles | Most complex technically and legally |

---

## Progress Tracker

| Phase | Tasks | Done |
|-------|-------|------|
| A — Foundation | 8 | 3 (packages installed, AIService built, MarketDataService built) |
| B — Core AI | 7 | 0 |
| C — Advanced AI | 5 | 0 |
| D — Verification & Polish | 5 | 0 |

*Update `- [ ]` to `- [x]` as tasks are completed.*

### Phase A Checklist
- [x] Install NPM packages (`@anthropic-ai/sdk`, `openai`, `node-cron`, `node-cache`)
- [x] Add environment variables to `.env` and `server/config.js`
- [ ] Database migration — create all 9 AI tables + pgvector columns
- [x] Build `AIService` class (Claude API wrapper) — `server/services/aiService.js`
- [x] Build `MarketDataService` — `server/services/marketDataService.js`
- [x] Caching layer built into MarketDataService
- [ ] Job scheduler setup — `server/jobs/scheduler.js`
- [ ] Extend store with AI table methods

### Phase B Checklist
- [x] Market data routes built — `server/routes/marketData.js`
- [x] Market data mounted in `server/app.js`
- [ ] Connect `LandingPage.tsx` to real market data
- [ ] Connect investor/startup dashboards to market widget
- [ ] Build CredibilityService + routes
- [ ] Wire CredibilityBadge to real API
- [ ] Build AI Agent CRUD + subscription routes
- [ ] Connect AIAgentsPage.tsx to real API
- [ ] Build rule-based matching service + routes
- [ ] Show "Recommended" sections on dashboards

### Phase C–D Checklist
- [ ] AI agent insight generation with real market data (RAG)
- [ ] AI Due Diligence report generation
- [ ] Sentiment analysis on signal creation
- [ ] Vector matching with pgvector
- [ ] Document verification pipeline
- [ ] Personalized recommendation engine
- [ ] Admin verification review queue
- [ ] Rate limiting + cost monitoring + error handling
- [ ] End-to-end testing
