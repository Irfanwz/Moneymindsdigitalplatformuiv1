import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { config } from "../config.js";

// --- AI Provider Clients (lazy — only created if key exists) ---

const groqClient = config.groqApiKey
  ? new Groq({ apiKey: config.groqApiKey })
  : null;

const anthropicClient = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

// --- Prompt ---

function buildSentimentPrompt(signal) {
  const title = signal.title || "";
  const content = signal.content || "";
  const signalType = signal.signalType || signal.postType || "post";
  const tags = (signal.tags ?? []).join(", ") || "none";
  const timeHorizon = signal.timeHorizon || "not specified";

  return `You are a financial signal analyst for MoneyMinds, a platform connecting investors and advisors. Analyze the following signal/post and provide a comprehensive structured analysis.

SIGNAL:
Title: ${title}
Type: ${signalType}
Time Horizon: ${timeHorizon}
Tags: ${tags}
Content: ${content || "(no content — title only)"}

Return ONLY a valid JSON object — no markdown fences, no explanation outside the JSON:

{
  "sentiment": "bullish" | "bearish" | "neutral",
  "sentimentConfidence": <integer 0-100>,
  "sentimentReasoning": "<one sentence why>",
  "riskLevel": "low" | "medium" | "high",
  "riskReasoning": "<one sentence why>",
  "actionability": "high" | "medium" | "low",
  "actionabilityReasoning": "<one sentence why>",
  "entities": [
    { "name": "<ticker or asset>", "type": "stock|crypto|commodity|index|sector", "direction": "bullish|bearish|neutral" }
  ],
  "sectors": ["<sector1>"],
  "keyPoints": ["<point1>", "<point2>", "<point3>"]
}

Classification rules:
- "bullish": positive outlook, buy/long recommendation, upside expected
- "bearish": negative outlook, sell/short/avoid recommendation, downside expected
- "neutral": no clear direction, informational, wait-and-see, general discussion
- riskLevel: "low" = blue chip/stable, "medium" = moderate volatility, "high" = speculative/volatile
- actionability: "high" = clear entry/exit/price target, "medium" = directional but vague, "low" = commentary only
- Extract ALL mentioned assets/tickers/coins/companies from the text (max 10)
- sectors: identify relevant financial sectors (crypto, fintech, healthtech, cleantech, ai, saas, etc.)
- keyPoints: 2-3 most important takeaways (max 3)
- If content is a general discussion post with no financial content, return sentiment:"neutral", actionability:"low"
- Never fabricate — only classify based on the actual text`;
}

// --- Response Parser ---

function parseAIResponse(text) {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

// --- Provider Callers ---

async function callGroq(prompt) {
  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.1,
  });
  return completion.choices[0]?.message?.content ?? null;
}

async function callAnthropic(prompt) {
  const message = await anthropicClient.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0]?.text ?? null;
}

function getProviderChain() {
  const providers = [];
  const setting = config.aiProvider.toLowerCase();

  if (setting === "groq" && groqClient) {
    providers.push({ name: "groq", call: callGroq });
  } else if (setting === "anthropic" && anthropicClient) {
    providers.push({ name: "anthropic", call: callAnthropic });
  } else {
    if (groqClient) providers.push({ name: "groq", call: callGroq });
    if (anthropicClient) providers.push({ name: "anthropic", call: callAnthropic });
  }

  return providers;
}

// --- Main Function ---

/**
 * Analyze a signal's sentiment, risk, actionability, entities, and sectors.
 * Fire-and-forget — never throws. Updates the signal record in the store.
 *
 * @param {string} signalId
 * @param {object} signal - the signal object (title, content, signalType, tags, etc.)
 * @param {object} store - the active data store
 */
export async function analyzeSignal(signalId, signal, store) {
  try {
    const providers = getProviderChain();
    if (providers.length === 0) {
      console.warn("[SentimentAnalysis] No AI provider configured — skipping.");
      return;
    }

    const prompt = buildSentimentPrompt(signal);

    // Try each provider
    let rawText = null;
    let usedProvider = null;

    for (const provider of providers) {
      try {
        rawText = await provider.call(prompt);
        if (rawText) {
          usedProvider = provider.name;
          break;
        }
      } catch (err) {
        console.warn(`[SentimentAnalysis] ${provider.name} failed: ${err.message}`);
      }
    }

    if (!rawText) {
      console.warn(`[SentimentAnalysis] All providers failed for signal "${signal.title}"`);
      return;
    }

    // Parse response
    let result;
    try {
      result = parseAIResponse(rawText);
    } catch (parseErr) {
      console.error(`[SentimentAnalysis] Failed to parse ${usedProvider} response:`, parseErr.message);
      return;
    }

    // Store the result
    await store.updateSignalSentiment(signalId, {
      sentiment: result.sentiment ?? null,
      sentimentConfidence: result.sentimentConfidence ?? null,
      sentimentReasoning: result.sentimentReasoning ?? null,
      riskLevel: result.riskLevel ?? null,
      riskReasoning: result.riskReasoning ?? null,
      actionability: result.actionability ?? null,
      actionabilityReasoning: result.actionabilityReasoning ?? null,
      entities: (result.entities ?? []).slice(0, 10),
      sectors: result.sectors ?? [],
      keyPoints: (result.keyPoints ?? []).slice(0, 3),
      analyzedAt: new Date().toISOString(),
    });

    console.log(
      `[SentimentAnalysis] "${signal.title}" via ${usedProvider}: ${result.sentiment} (${result.sentimentConfidence}%) · risk:${result.riskLevel} · action:${result.actionability} · entities:[${(result.entities ?? []).map((e) => e.name).join(",")}]`
    );
  } catch (err) {
    console.error(`[SentimentAnalysis] Error for signal ${signalId}:`, err.message);
  }
}
