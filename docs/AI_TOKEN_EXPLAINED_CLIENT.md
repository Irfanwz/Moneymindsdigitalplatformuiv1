# MoneyMinds — AI Analysis & Tokens Explained

### How Our AI Thinks, Searches, and Reports

> **Project:** MoneyMinds Digital Platform
> **Document:** AI Token & Search Usage — Client Guide
> **Date:** November 2026
> **Prepared by:** MoneyMinds Development Team

---

## What Is a Token?

When our AI reads or writes anything, it works in small pieces called **tokens**.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Think of tokens like LEGO blocks of text:                │
│                                                             │
│   "Hello"           =   1 token                            │
│   "Background"      =   1 token                            │
│   "Background check"=   2 tokens                           │
│   One paragraph     ≈   100–150 tokens                     │
│   One full page     ≈   400–500 tokens                     │
│                                                             │
│   The AI reads tokens (INPUT) and writes tokens (OUTPUT).   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Simple analogy:** Just like a lawyer charges per page read and per page written — our AI is charged per token read and per token written.

---

## Two Services Working Together

Every analysis in MoneyMinds uses **two separate services**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SERVICE 1: Tavily (Web Search)                            │
│   ─────────────────────────────                             │
│   • Searches the internet for real information              │
│   • Charged per SEARCH CREDIT (not tokens)                  │
│   • Like Google — it finds web pages                        │
│                                                             │
│   SERVICE 2: Groq AI (Analysis)                             │
│   ──────────────────────────────                            │
│   • Reads the search results                                │
│   • Writes the final report                                 │
│   • Charged per TOKEN (reading + writing)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## How One Analysis Works — Step by Step

### Example: Background Verification of a New User

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 1 — User Applies                                      │
│  ┌──────────────────────────────────┐                       │
│  │  Name: Ali Khan                  │                       │
│  │  Role: Investor                  │                       │
│  │  Bio:  Fund manager, Karachi     │                       │
│  └──────────────────┬───────────────┘                       │
│                     │                                       │
│                     ▼                                       │
│  STEP 2 — Tavily Searches Internet (3–6 searches)           │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Search 1: "Ali Khan" LinkedIn profile           │       │
│  │  Search 2: "Ali Khan" professional background    │       │
│  │  Search 3: "Ali Khan" fraud OR scam OR lawsuit   │       │
│  │  Search 4: "Ali Khan" angel investor venture     │       │
│  │  ...                                             │       │
│  └──────────────────┬───────────────────────────────┘       │
│                     │  Returns web results (5 per search)   │
│                     ▼                                       │
│  STEP 3 — All Results Sent to AI (~3,000 input tokens)      │
│  ┌──────────────────────────────────────────────────┐       │
│  │  AI reads: User profile + all search results     │       │
│  │  AI writes: Full due diligence report            │       │
│  │  (~2,000 output tokens)                          │       │
│  └──────────────────┬───────────────────────────────┘       │
│                     │                                       │
│                     ▼                                       │
│  STEP 4 — Report Ready                                      │
│  ┌──────────────────────────────────────────────────┐       │
│  │  ✅ Recommendation: Accept / Review / Reject     │       │
│  │  📋 Full markdown report with evidence           │       │
│  │  🔍 Sources cited from real web pages            │       │
│  │  🚩 Red flags (if any)                           │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Token Usage Per Feature

### 1. Background Verification

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BACKGROUND VERIFICATION — TOKEN BREAKDOWN                  │
│                                                             │
│  Tavily Searches:     3 to 6 searches per user             │
│                                                             │
│  AI Input Tokens:                                           │
│  ┌────────────────────────────────────┬──────────────┐     │
│  │  What goes IN to the AI            │  Tokens      │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  System instructions               │  ~200        │     │
│  │  User profile (name, bio, role)    │  ~100        │     │
│  │  Search results (20 results)       │  ~2,500      │     │
│  │  Output format instructions        │  ~200        │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  TOTAL INPUT                       │  ~3,000      │     │
│  └────────────────────────────────────┴──────────────┘     │
│                                                             │
│  AI Output Tokens:                                          │
│  ┌────────────────────────────────────┬──────────────┐     │
│  │  What comes OUT from the AI        │  Tokens      │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  Recommendation + confidence score │  ~50         │     │
│  │  Summary paragraph                 │  ~200        │     │
│  │  Findings (LinkedIn, company etc.) │  ~150        │     │
│  │  Full due diligence report (3–5    │  ~1,500      │     │
│  │  paragraphs in markdown)           │              │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  TOTAL OUTPUT                      │  ~2,000      │     │
│  └────────────────────────────────────┴──────────────┘     │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  TOTAL PER VERIFICATION:  ~5,000 tokens                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Investor Research Report

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  INVESTOR RESEARCH REPORT — TOKEN BREAKDOWN                 │
│                                                             │
│  Tavily Searches:     1 search per report                  │
│                                                             │
│  AI Input Tokens:                                           │
│  ┌────────────────────────────────────┬──────────────┐     │
│  │  What goes IN to the AI            │  Tokens      │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  System instructions               │  ~150        │     │
│  │  Industry + investor preferences   │  ~200        │     │
│  │  Search results (5 web pages)      │  ~800        │     │
│  │  Market data (prices, coins etc.)  │  ~300        │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  TOTAL INPUT                       │  ~1,450      │     │
│  └────────────────────────────────────┴──────────────┘     │
│                                                             │
│  AI Output Tokens:                                          │
│  ┌────────────────────────────────────┬──────────────┐     │
│  │  What comes OUT from the AI        │  Tokens      │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  Market summary                    │  ~300        │     │
│  │  Opportunities (up to 8)           │  ~400        │     │
│  │  Risks (up to 8, with severity)    │  ~400        │     │
│  │  Trading signals (up to 10)        │  ~300        │     │
│  ├────────────────────────────────────┼──────────────┤     │
│  │  TOTAL OUTPUT                      │  ~1,400      │     │
│  └────────────────────────────────────┴──────────────┘     │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  TOTAL PER REPORT:  ~2,850 tokens                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary Table

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   FEATURE              TAVILY      GROQ AI      TOTAL       │
│   ─────────────────────────────────────────────────────    │
│   Background Check     3–6 calls   ~5,000 tok   Heaviest   │
│   Investor Report      1 call      ~2,850 tok   Medium     │
│   Profile Review       0 calls     ~2,000 tok   Lightest   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cost to the Platform

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   GROQ AI (Current Plan: Free Tier)                         │
│   ─────────────────────────────────                         │
│   Cost per token:         $0.00                             │
│   Monthly limit:          ~15 million tokens/month          │
│   100 verifications/mo:   ~500,000 tokens   ✅ Well within  │
│                                                             │
│   TAVILY SEARCH                                             │
│   ─────────────                                             │
│   Cost per search:        ~$0.005 per call                  │
│   100 verifications/mo:   500 searches = ~$2.50/month       │
│                                                             │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│   Estimated total cost at 100 users/month: ~$2–5            │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways for the Client

1. **Tokens = the AI's reading and writing units** — not visible to users, happen in the background.

2. **Every analysis is two-step:** Tavily finds the information, Groq AI reads and writes the report.

3. **Background Verification is the most token-heavy** (~5,000 tokens) because it includes full web search results plus a detailed markdown report.

4. **Investor Research Reports are lighter** (~2,850 tokens) — one search, structured output.

5. **Current cost is minimal** — Groq free tier handles up to 15 million tokens/month. At 100 users, we use roughly 500,000 tokens. Well within limits.

6. **As the platform scales**, we can switch to a paid Groq plan at a fraction of a cent per analysis — still negligible per user.

---

## AI Models — What We Use, Why, and What's Better

This section explains which AI models power MoneyMinds, how they differ, and what upgrade path looks like as the platform grows.

---

### How Our AI Provider System Works

MoneyMinds uses a **smart fallback system** controlled by one ENV variable:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   AI_PROVIDER=auto   (default setting)                      │
│                                                             │
│   1st try → Groq  (fast, cheap, generous free tier)        │
│   2nd try → Anthropic Claude  (if Groq key not set)        │
│                                                             │
│   AI_PROVIDER=groq       → always use Groq                 │
│   AI_PROVIDER=anthropic  → always use Claude               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This means you can switch providers just by changing one line in `.env` — no code changes needed.

---

### Currently Configured Models

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   PURPOSE            MODEL                   PROVIDER       │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   Main AI tasks      openai/gpt-oss-20b      Groq          │
│   (verification,                                            │
│   reports, signals)                                         │
│                                                             │
│   Vision / Images    qwen/qwen3.8-27b         Groq          │
│   (document scan,                                           │
│   chart reading)                                            │
│                                                             │
│   Fallback model     claude-haiku-4-5         Anthropic     │
│   (if Groq is down                                          │
│   or key missing)                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**ENV variables that control this:**
```
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=qwen/qwen3.8-27b
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

---

### Understanding Each Model

#### 1. Groq — The Speed Engine

Groq is NOT an AI model company. Groq is a **hardware + inference company**.
They built a custom chip (LPU — Language Processing Unit) that runs AI models
**10–20x faster** than regular cloud GPUs.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Normal AI cloud (AWS/Azure):  ~30–60 tokens/second        │
│   Groq LPU:                     ~300–750 tokens/second      │
│                                                             │
│   Same model. Same quality. Just much faster.               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Groq hosts many open-source models on their fast hardware. We rent the speed,
not the model itself.

---

#### 2. openai/gpt-oss-20b (Current Main Model)

A **20 billion parameter** model served via Groq's infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Parameters:    20 billion                                 │
│   Speed:         Very fast on Groq LPU                     │
│   Cost:          Free tier / very cheap paid                │
│   Best for:      Text analysis, reports, structured output  │
│   Context:       Large (can read long documents)            │
│   Quality:       Good — suitable for business reports       │
│                                                             │
│   Think of "parameters" like neurons in a brain:           │
│   More = smarter, but also slower and more expensive.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. qwen/qwen3.8-27b (Vision Model — Image/Document Reading)

Made by **Alibaba Cloud**. Used when the AI needs to read uploaded images,
certificates, or charts.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Parameters:    27 billion                                 │
│   Special:       Can read and understand images + text      │
│   Used for:      Profile document uploads, certificates,    │
│                  chart interpretation                        │
│   Cost:          Free / very cheap on Groq                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### 4. claude-haiku-4-5 (Fallback — by Anthropic)

Made by **Anthropic** — the same company that makes Claude (the AI assistant
used to build MoneyMinds itself). Haiku is Anthropic's fastest and cheapest model.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Parameters:    Not publicly disclosed                     │
│   Speed:         Very fast                                  │
│   Cost:          ~$0.00025 per 1,000 input tokens           │
│                  ~$0.00125 per 1,000 output tokens          │
│   Best for:      Structured extraction, classification,     │
│                  summaries, quick responses                  │
│   Context:       200,000 tokens (can read entire books)     │
│                                                             │
│   Only used when Groq key is not configured.                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Model Comparison — Good, Better, Best

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   TIER        MODEL                   QUALITY   SPEED   COST        │
│   ─────────────────────────────────────────────────────────────    │
│                                                                      │
│   CURRENT                                                            │
│   ────────                                                           │
│   Main        gpt-oss-20b (Groq)      ★★★☆☆    ★★★★★   Free        │
│   Vision      qwen3.8-27b (Groq)      ★★★☆☆    ★★★★★   Free        │
│   Fallback    claude-haiku-4-5        ★★★★☆    ★★★★☆   ~$2/mo      │
│                                                                      │
│   UPGRADE OPTIONS                                                    │
│   ───────────────                                                    │
│   Better      llama-3.3-70b (Groq)   ★★★★☆    ★★★★☆   Free tier   │
│   Better      claude-sonnet-4-6      ★★★★★    ★★★★☆   ~$15/mo     │
│   Best        claude-opus-4-6        ★★★★★    ★★★☆☆   ~$75/mo     │
│   Best        gpt-4o (OpenAI)        ★★★★★    ★★★☆☆   ~$20/mo     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

> **Our recommendation for growth:** Keep Groq for speed and free tier.
> When upgrading, switch `ANTHROPIC_MODEL` to `claude-sonnet-4-6` for
> significantly better report quality at ~$15/month for 100 users.

---

### Available Models on Groq (Free Tier)

These are all available right now — just change one ENV line:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   MODEL                        PARAMS    BEST FOR          │
│   ─────────────────────────────────────────────────────   │
│   llama-3.3-70b-versatile      70B       Best quality      │
│   llama-3.1-8b-instant         8B        Fastest/cheapest  │
│   openai/gpt-oss-20b           20B       Current (balanced)│
│   mixtral-8x7b-32768           56B eff.  Long documents    │
│   gemma2-9b-it                 9B        Fast, lightweight  │
│   qwen/qwen3.8-27b             27B       Vision + text     │
│                                                             │
│   To upgrade main model:                                   │
│   GROQ_MODEL=llama-3.3-70b-versatile                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Available Anthropic Models (Paid)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   MODEL                    SPEED     COST/1M tokens    USE CASE     │
│   ──────────────────────────────────────────────────────────────   │
│   claude-haiku-4-5         ★★★★★    $0.25 in           Quick tasks │
│   (current fallback)                 $1.25 out                      │
│                                                                      │
│   claude-sonnet-4-6        ★★★★☆    $3 in              Best value  │
│   (recommended upgrade)              $15 out            for reports │
│                                                                      │
│   claude-opus-4-6          ★★★☆☆    $15 in             Complex     │
│   (most powerful)                    $75 out            reasoning   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Real cost example at 100 users/month:**
- Haiku: ~$2–3/month total
- Sonnet: ~$15–20/month total
- Opus: ~$75–100/month total

---

### How to Switch Models (No Code Change Needed)

Just update `.env.production` on the server:

```bash
# Upgrade to best free Groq model (recommended first step)
GROQ_MODEL=llama-3.3-70b-versatile

# Switch to Claude Sonnet for best report quality
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=your-key-here

# Then restart:
docker compose restart
```

---

### Why We Chose This Stack

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   REQUIREMENT           OUR CHOICE         REASON          │
│   ──────────────────────────────────────────────────────  │
│   Low cost at launch    Groq free tier      $0/month        │
│   Fast responses        Groq LPU hardware   <2 sec reports  │
│   High quality backup   Claude Haiku        Best fallback   │
│   Web search            Tavily              Real-time data  │
│   Easy to upgrade       ENV-driven switch   No code change  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The system is designed so the client can **start free** and **upgrade
progressively** as the user base grows — without any development work.

---

*Document prepared by MoneyMinds Development Team — November 2026*
*For internal and client communication use only.*
