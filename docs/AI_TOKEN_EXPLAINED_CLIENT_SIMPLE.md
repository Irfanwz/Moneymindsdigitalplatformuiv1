# MoneyMinds — AI Analysis Simply Explained

**For:** Platform Owners & Clients
**Updated:** November 2026
**Prepared by:** MoneyMinds Development Team

---

## What Does "AI" Actually Do on This Platform?

Imagine you hired a **very fast researcher** who:

- Reads someone's name and profile
- Searches Google for them in seconds
- Reads all the results
- Writes a full report for you

That is exactly what our AI does — but it does it in under **30 seconds**, for any user, any time, automatically.

---

## What Is a "Token"?

When the AI reads or writes something, it counts in small pieces called **tokens**.

> **Simple way to think about it:**
> A token is like a **small word or piece of a word**.
> "Hello" = 1 token. A full paragraph = about 100 tokens.

The platform pays for how much the AI **reads** (input) and how much it **writes back** (output).

| What you send to AI | Approx. size |
|---|---|
| One sentence | 20–30 tokens |
| One paragraph | 100–150 tokens |
| One full page | 400–500 tokens |
| Full search results | 2,000–3,000 tokens |

---

## Two Tools Working Together

Every analysis uses **two tools** working as a team:

### Tool 1 — Tavily (The Researcher)

Tavily searches the internet — like Google, but designed for AI.

- It finds real web pages, news, LinkedIn profiles, company info
- It charges per **search** (not per token)
- **Cost: about $0.005 per search** (half a cent)

### Tool 2 — Groq AI (The Writer)

Groq reads all the search results and writes the final report.

- It is **10–20x faster** than regular AI services
- It charges per token (reading + writing)
- **Currently on free plan** — costs us $0

---

## What Happens During Each Analysis?

### Background Check on a New User

This is the most important analysis — it runs when admin clicks "Run Verification."

```
User applies → AI searches internet → AI reads results → AI writes report
   (5 sec)         (10 sec, 3–6         (reads ~3,000      (writes full
                    searches)             tokens)            report in
                                                             ~2,000 words)
```

**What the report includes:**
- Is this person real? (LinkedIn found or not)
- Do they work where they say they do?
- Any news about fraud or legal cases?
- Overall recommendation: Accept / Review / Reject

**Cost per check:** ~$0.02 to $0.05 (less than one rupee)

---

### Investment Research Report

When an investor asks for a market analysis:

- AI searches for latest market news (1 search)
- Reads the results
- Writes a full report with opportunities, risks, and signals

**Cost per report:** ~$0.01 (almost nothing)

---

## How Much Does It Cost Overall?

| Situation | Monthly Cost |
|---|---|
| 50 users, light usage | ~$1–3 |
| 100 users, regular usage | ~$3–8 |
| 500 users, heavy usage | ~$15–30 |

> **Right now, at current scale, the AI costs roughly the same as a cup of chai per month.**

---

## Which AI Are We Using?

We use **three AI models** depending on the task. Think of them like different staff members — each hired for a specific job.

---

### Staff Member 1 — The Main Analyst

**Model:** GPT-20B (served by Groq)

This is the AI that does most of the work — reading search results, writing reports, analyzing signals.

| Feature | Detail |
|---|---|
| Speed | Very fast (results in 2–5 seconds) |
| Quality | Good — suitable for business reports |
| Current cost | Free (on Groq's free plan) |
| Best for | Background checks, signal analysis, reports |

---

### Staff Member 2 — The Document Reader

**Model:** Qwen Vision (served by Groq)

This AI is specially trained to **read images and documents** — like uploaded certificates, degrees, or charts.

| Feature | Detail |
|---|---|
| Special skill | Can read text inside images and photos |
| Speed | Very fast |
| Current cost | Free |
| Best for | Certificate verification, document uploads |

---

### Staff Member 3 — The Backup (Claude by Anthropic)

**Model:** Claude Haiku (by Anthropic)

This is our **backup AI** — if Groq is ever unavailable, the platform automatically switches to Claude. Claude is made by Anthropic, one of the most trusted AI safety companies in the world.

| Feature | Detail |
|---|---|
| Reliability | Extremely high — enterprise grade |
| Quality | Excellent |
| Cost | ~$2–3 per month at current usage |
| Best for | Backup, high-accuracy tasks |

> **Fun fact:** Claude is also the AI that was used to help *build* MoneyMinds itself.

---

## Can We Upgrade the AI Later?

Yes — and it is very easy. **No code changes needed.** Just update one setting.

Here is the upgrade path as the platform grows:

| Stage | AI Used | Quality | Monthly Cost |
|---|---|---|---|
| **Now (Launch)** | GPT-20B on Groq | Good | $0 |
| **Growth (100+ users)** | Llama 70B on Groq | Very Good | $0 (still free) |
| **Scale (500+ users)** | Claude Sonnet | Excellent | ~$15–20 |
| **Enterprise (1000+ users)** | Claude Opus | Best available | ~$75–100 |

The system was built to **start free and scale affordably** — the client never needs to pay for AI until the platform has hundreds of active users.

---

## Why Groq? Why Not ChatGPT or Others?

| Provider | Speed | Cost | Quality |
|---|---|---|---|
| **Groq (what we use)** | ⚡ Fastest | 💚 Free/very cheap | ✅ Good |
| OpenAI (ChatGPT) | Medium | 💰 Expensive | ✅ Excellent |
| Google Gemini | Fast | 💛 Medium | ✅ Good |
| Anthropic Claude | Fast | 💛 Medium | ✅ Excellent |

> **We chose Groq because speed matters for user experience**, and their free tier is generous enough to run the platform at no AI cost during the launch phase. When quality becomes the priority over cost, we switch to Claude — one line change.

---

## Summary in Plain English

1. **The AI is like a fast researcher** — it searches, reads, and writes reports automatically.

2. **We use three AI tools** — a main analyst, a document reader, and a backup. Each does its job without the user seeing any of it.

3. **Current cost is essentially zero** — Groq's free plan handles our current scale comfortably.

4. **Tavily (web search) costs a small amount** — about $2–5 per month for 100 users.

5. **We can upgrade any time** — better AI is available at a few dollars per month. The upgrade requires changing one setting, not rewriting the app.

6. **The platform gets smarter as profiles are more complete** — the more details a user fills in (LinkedIn, university, company), the more accurate and useful the AI reports become.

---

*Document prepared by MoneyMinds Development Team — November 2026*
*For client and stakeholder communication. No technical background required.*
