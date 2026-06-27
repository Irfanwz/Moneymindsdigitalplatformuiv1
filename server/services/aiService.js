/**
 * AIService — Claude API wrapper
 * Gracefully falls back to mock responses when ANTHROPIC_API_KEY is not set.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config, isAIConfigured } from "../config.js";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

let client = null;

function getClient() {
  if (!client && isAIConfigured) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

/**
 * Core method — send a prompt to Claude and get a text response.
 */
async function ask(systemPrompt, userPrompt, maxTokens = MAX_TOKENS) {
  const ai = getClient();

  if (!ai) {
    console.log("[AI - not configured] ANTHROPIC_API_KEY not set. Returning mock response.");
    return null;
  }

  const message = await ai.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return message.content[0]?.text ?? null;
}

/**
 * Ask Claude and parse the response as JSON.
 * Returns null if AI not configured or parsing fails.
 */
async function askJSON(systemPrompt, userPrompt, maxTokens = MAX_TOKENS) {
  const text = await ask(systemPrompt, userPrompt, maxTokens);
  if (!text) return null;

  // Extract JSON from response (Claude sometimes wraps it in ```json)
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const raw = match ? match[1] ?? match[0] : text;

  try {
    return JSON.parse(raw.trim());
  } catch {
    console.warn("[AI] Failed to parse JSON response:", raw.slice(0, 200));
    return null;
  }
}

/**
 * Generate daily insights for an AI agent.
 * @param {object} agent - Agent config (name, industry, systemPrompt)
 * @param {object} marketData - Live market data to inject as context
 * @param {object} investorPrefs - Investor's portfolio preferences
 */
async function generateAgentInsights(agent, marketData = {}, investorPrefs = {}) {
  const systemPrompt = `You are ${agent.name}, an AI investment intelligence agent on the MoneyMinds platform.
Your specialization: ${agent.industry}.
You provide actionable, data-driven investment insights to investors.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Generate daily investment insights based on the following:

LIVE MARKET DATA:
${JSON.stringify(marketData, null, 2)}

INVESTOR PREFERENCES:
${JSON.stringify(investorPrefs, null, 2)}

Return JSON with this exact structure:
{
  "summary": "2-3 sentence market overview",
  "opportunities": [
    { "title": "", "description": "", "risk": "low|medium|high", "rating": 1-10 }
  ],
  "risks": [
    { "title": "", "description": "", "severity": "low|medium|high" }
  ],
  "signals": [
    { "asset": "", "action": "buy|hold|sell|watch", "reason": "", "confidence": 1-100 }
  ],
  "sentiment": "bullish|bearish|neutral",
  "generatedAt": "${new Date().toISOString()}"
}`;

  const result = await askJSON(systemPrompt, userPrompt, 1500);

  // Fallback mock when AI not configured
  if (!result) {
    return {
      summary: `${agent.name} analysis is pending API configuration. Add ANTHROPIC_API_KEY to enable live insights.`,
      opportunities: [],
      risks: [],
      signals: [],
      sentiment: "neutral",
      generatedAt: new Date().toISOString(),
      simulated: true,
    };
  }

  return result;
}

/**
 * Generate a due diligence report for a startup.
 * @param {object} startupData - Full startup profile data
 */
async function generateDueDiligence(startupData) {
  const systemPrompt = `You are a senior investment analyst conducting due diligence on a startup.
Provide objective, data-driven analysis based only on the information provided.
Always respond with valid JSON only.`;

  const userPrompt = `Conduct due diligence on this startup:

${JSON.stringify(startupData, null, 2)}

Return JSON with this exact structure:
{
  "executiveSummary": "2-3 sentence overview",
  "team": { "score": 1-10, "findings": "", "strengths": [], "gaps": [] },
  "market": { "score": 1-10, "size": "", "trends": [], "timing": "" },
  "financials": { "score": 1-10, "analysis": "", "concerns": [] },
  "competitive": { "competitors": [], "differentiation": "", "position": "" },
  "risks": [{ "title": "", "severity": "low|medium|high", "mitigation": "" }],
  "overallRating": "A|B|C|D|F",
  "overallScore": 1-100,
  "recommendation": "invest|watch|pass",
  "justification": ""
}`;

  const result = await askJSON(systemPrompt, userPrompt, 2000);

  if (!result) {
    return {
      executiveSummary: "Due diligence requires ANTHROPIC_API_KEY to be configured.",
      team: { score: 0, findings: "Pending AI configuration", strengths: [], gaps: [] },
      market: { score: 0, size: "Unknown", trends: [], timing: "" },
      financials: { score: 0, analysis: "Pending", concerns: [] },
      competitive: { competitors: [], differentiation: "", position: "" },
      risks: [],
      overallRating: "N/A",
      overallScore: 0,
      recommendation: "watch",
      justification: "AI analysis not available — add ANTHROPIC_API_KEY",
      simulated: true,
    };
  }

  return result;
}

/**
 * Analyze sentiment of an investment signal.
 * @param {string} signalText - The signal content
 * @param {string} signalType - buy|sell|hold|alert
 */
async function analyzeSignalSentiment(signalText, signalType) {
  const systemPrompt = `You are a financial sentiment analyzer. Analyze investment signals and return JSON only.`;

  const userPrompt = `Analyze the sentiment of this investment signal:
Type: ${signalType}
Content: ${signalText}

Return JSON:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0-100,
  "keyEntities": ["asset or company names mentioned"],
  "timeHorizon": "short|medium|long",
  "summary": "one sentence summary"
}`;

  const result = await askJSON(systemPrompt, userPrompt, 500);

  if (!result) {
    return {
      sentiment: signalType === "buy" ? "bullish" : signalType === "sell" ? "bearish" : "neutral",
      confidence: 50,
      keyEntities: [],
      timeHorizon: "medium",
      summary: "Automated sentiment analysis unavailable — add ANTHROPIC_API_KEY",
      simulated: true,
    };
  }

  return result;
}

/**
 * Calculate AI credibility enhancement for a profile.
 * @param {object} profile - User profile data (bio, pitch, thesis etc.)
 */
async function analyzeProfileCredibility(profile) {
  const systemPrompt = `You are a credibility analyst for a financial intelligence platform.
Analyze profile quality and return JSON only.`;

  const userPrompt = `Analyze the credibility of this profile:
${JSON.stringify(profile, null, 2)}

Return JSON:
{
  "qualityScore": 0-100,
  "flags": ["any red flags or inconsistencies"],
  "strengths": ["what looks credible and strong"],
  "suggestions": ["improvements to increase credibility"],
  "aiVerified": true|false
}`;

  const result = await askJSON(systemPrompt, userPrompt, 800);

  if (!result) {
    return {
      qualityScore: 50,
      flags: [],
      strengths: [],
      suggestions: ["Add ANTHROPIC_API_KEY to enable AI profile analysis"],
      aiVerified: false,
      simulated: true,
    };
  }

  return result;
}

export const aiService = {
  isConfigured: isAIConfigured,
  ask,
  askJSON,
  generateAgentInsights,
  generateDueDiligence,
  analyzeSignalSentiment,
  analyzeProfileCredibility,
};
