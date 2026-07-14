import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { searchService } from "./searchService.js";
import { buildQueriesForUser } from "./queryBuilder.js";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

function buildPrompt(user, searchResults) {
  const name = user.fullName;
  const roles = (user.requestedRoles ?? []).join(", ") || "unspecified";
  const bio = user.bio || "Not provided";
  const location = user.location || "Not provided";

  const resultsText =
    searchResults.length > 0
      ? searchResults
          .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`)
          .join("\n\n")
      : "No search results were found for this user.";

  return `You are an AI due diligence analyst for MoneyMinds, a financial platform that connects startups, investors, and advisors. Review the following search results for a user who has applied to join the platform.

USER PROFILE:
Name: ${name}
Role applied for: ${roles}
Bio: ${bio}
Location: ${location}

WEB SEARCH RESULTS (${searchResults.length} results):
${resultsText}

Analyze the above and return ONLY a valid JSON object — no markdown fences, no explanation outside the JSON. Use exactly this structure:

{
  "recommendation": "accept" | "review" | "reject",
  "confidence": <integer 0-100>,
  "credibility_score": <integer 0-100>,
  "summary": "<one paragraph summary of findings>",
  "findings": {
    "linkedin_found": <boolean>,
    "linkedin_url": "<url string or null>",
    "company_verified": <boolean>,
    "company_url": "<url string or null>",
    "news_mentions": <integer>,
    "red_flags": ["<flag>" ...],
    "positive_signals": ["<signal>" ...]
  },
  "sources": [
    { "url": "<url>", "title": "<title>", "relevance": <float 0.0-1.0> }
  ],
  "report_markdown": "<full due diligence report in markdown, 3-5 paragraphs>"
}

Decision rules:
- "accept": verifiable professional online presence, claims are consistent with search results, no red flags
- "review": limited or unclear online presence, minor inconsistencies, or insufficient data to make a confident call
- "reject": clear red flags found — fraud allegations, scam reports, criminal activity, regulatory violations, or strong evidence of impersonation
- If no search results were found at all, return "review" with confidence ≤ 40
- Never fabricate information — only report what is visible in the search results above
- The report_markdown must include sections: ## Identity, ## Professional Credibility, ## Risk Assessment, ## Recommendation`;
}

function parseClaudeResponse(text) {
  // Strip any accidental markdown fences
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Run the full AI due diligence pipeline for a user.
 * @param {string} userId
 * @param {object} store - the active data store (memory or supabase)
 */
export async function runForUser(userId, store) {
  let user;

  try {
    user = await store.findUserById(userId);
    if (!user) {
      console.warn(`[VerificationAgent] User ${userId} not found — skipping.`);
      return;
    }

    // Build search queries — skip if not enough data
    const queries = buildQueriesForUser(user);
    if (!queries) {
      console.log(`[VerificationAgent] Not enough data for ${user.fullName} — skipping.`);
      await store.updateVerification(userId, { status: "skipped" });
      return;
    }

    // Mark as running
    await store.createVerification(userId);
    console.log(`[VerificationAgent] Starting verification for ${user.fullName} (${queries.length} queries)`);

    // Run web searches
    const searchResults = await searchService.batchSearch(queries);
    console.log(`[VerificationAgent] Got ${searchResults.length} results for ${user.fullName}`);

    // No Anthropic key → mark failed gracefully
    if (!config.anthropicApiKey) {
      console.warn("[VerificationAgent] ANTHROPIC_API_KEY not set — marking as failed.");
      await store.updateVerification(userId, { status: "failed", searchQueriesRun: queries.length });
      return;
    }

    // Send to Claude for analysis
    const prompt = buildPrompt(user, searchResults);
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0]?.text ?? "";
    let report;

    try {
      report = parseClaudeResponse(rawText);
    } catch (parseErr) {
      console.error(`[VerificationAgent] Failed to parse Claude response for ${user.fullName}:`, parseErr.message);
      await store.updateVerification(userId, { status: "failed", searchQueriesRun: queries.length });
      return;
    }

    // Store the complete report
    await store.updateVerification(userId, {
      status: "complete",
      recommendation: report.recommendation,
      confidence: report.confidence,
      credibilityScore: report.credibility_score,
      summary: report.summary,
      findings: report.findings,
      reportMarkdown: report.report_markdown,
      sources: report.sources ?? [],
      redFlags: report.findings?.red_flags ?? [],
      searchQueriesRun: queries.length,
    });

    console.log(
      `[VerificationAgent] Done for ${user.fullName}: ${report.recommendation} (confidence: ${report.confidence}%)`
    );
  } catch (err) {
    console.error(`[VerificationAgent] Error for userId ${userId}:`, err.message);
    try {
      await store.updateVerification(userId, { status: "failed" });
    } catch {
      // ignore secondary error
    }
  }
}
