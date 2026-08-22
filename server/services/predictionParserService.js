import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { config } from "../config.js";

const groqClient = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey }) : null;
const anthropicClient = config.anthropicApiKey ? new Anthropic({ apiKey: config.anthropicApiKey }) : null;

// --- Prompt ---

function buildParserPrompt(signal) {
  const title = signal.title || "";
  const content = signal.content || "";
  const timeHorizon = signal.timeHorizon || "";
  const targetPrice = signal.targetPrice || "";

  return `You are a financial prediction extractor for MoneyMinds. Extract structured prediction data from this advisor signal.

SIGNAL:
Title: ${title}
Time Horizon: ${timeHorizon}
Target Price Field: ${targetPrice}
Content: ${content || "(no content)"}

Extract and return ONLY a valid JSON object — no markdown fences, no text outside the JSON:

{
  "ticker": "<stock symbol or asset name, e.g. AAPL, BTC, GOLD — null if not found>",
  "direction": "up" | "down" | "neutral",
  "targetPrice": <number or null>,
  "timeframe": "<human label: '1day', '3days', '1week', '2weeks', '1month', '3months'>",
  "timeframeDays": <integer — number of days until check>,
  "hasPricePrediction": <true | false>
}

Rules:
- direction: "up" = bullish/buy/long/expect rise, "down" = bearish/sell/short/expect drop, "neutral" = no clear direction
- targetPrice: parse from content or targetPrice field — return null if no specific price mentioned
- timeframe detection (use these exact labels):
    "today" / "by close" / "intraday"         → timeframe: "1day",   timeframeDays: 1
    "tomorrow" / "next day"                   → timeframe: "2days",  timeframeDays: 2
    "3 days" / "72 hours" / "few days"        → timeframe: "3days",  timeframeDays: 3
    "5 days" / "5-day"                        → timeframe: "5days",  timeframeDays: 5
    "this week" / "weekly" / "week"           → timeframe: "1week",  timeframeDays: 7
    "next week" / "2 weeks" / "fortnight"     → timeframe: "2weeks", timeframeDays: 14
    "month" / "30 days" / "monthly"           → timeframe: "1month", timeframeDays: 30
    "quarter" / "3 months" / "90 days"        → timeframe: "3months",timeframeDays: 90
    timeHorizon field = "short" / "near"      → timeframe: "1week",  timeframeDays: 7
    timeHorizon field = "medium"              → timeframe: "1month", timeframeDays: 30
    timeHorizon field = "long"                → timeframe: "3months",timeframeDays: 90
    nothing found                             → timeframe: "1week",  timeframeDays: 7
- If targetPrice field has a value like "$200" or "200", use that number
- ticker: look for stock symbols (AAPL, TSLA), crypto (BTC, ETH), commodities (GOLD, OIL), indices (SPY, QQQ)
- hasPricePrediction: true only if a specific numeric price target exists`;
}

// --- AI Call ---

async function callGroq(prompt) {
  const res = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 300,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function callClaude(prompt) {
  const res = await anthropicClient.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  return res.content[0]?.text ?? "";
}

function parseJSON(raw) {
  const text = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(text);
}

function validateResult(parsed) {
  const direction = ["up", "down", "neutral"].includes(parsed.direction) ? parsed.direction : "neutral";
  const targetPrice = typeof parsed.targetPrice === "number" && parsed.targetPrice > 0 ? parsed.targetPrice : null;
  const timeframeDays = typeof parsed.timeframeDays === "number" && parsed.timeframeDays > 0 ? Math.min(parsed.timeframeDays, 365) : 7;
  const timeframe = typeof parsed.timeframe === "string" && parsed.timeframe.length > 0 ? parsed.timeframe : "1week";

  return {
    ticker: typeof parsed.ticker === "string" && parsed.ticker.length > 0 ? parsed.ticker.toUpperCase() : null,
    direction,
    targetPrice,
    timeframe,
    timeframeDays,
    hasPricePrediction: !!targetPrice,
  };
}

// --- Main Export ---

/**
 * Parse a signal and extract prediction fields.
 * Never throws — returns a safe default on any error.
 *
 * @param {object} signal - the signal object from the store
 * @returns {Promise<{ticker, direction, targetPrice, timeframe, timeframeDays, hasPricePrediction}>}
 */
export async function parseSignalPrediction(signal) {
  const DEFAULT = {
    ticker: null,
    direction: "neutral",
    targetPrice: null,
    timeframe: "1week",
    timeframeDays: 7,
    hasPricePrediction: false,
  };

  // If signal has no meaningful text, return default
  const text = `${signal.title || ""} ${signal.content || ""}`.trim();
  if (text.length < 5) return DEFAULT;

  // If no AI configured, try to use existing targetPrice field as fallback
  if (!groqClient && !anthropicClient) {
    console.warn("[PredictionParser] No AI provider configured — returning default");
    const price = parseFloat(signal.targetPrice);
    return {
      ...DEFAULT,
      targetPrice: Number.isFinite(price) ? price : null,
      hasPricePrediction: Number.isFinite(price),
    };
  }

  const prompt = buildParserPrompt(signal);

  // Try Groq first
  if (groqClient && (config.aiProvider === "auto" || config.aiProvider === "groq")) {
    try {
      const raw = await callGroq(prompt);
      if (raw && raw.trim().length > 0) {
        return validateResult(parseJSON(raw));
      }
    } catch (err) {
      console.warn("[PredictionParser] Groq failed:", err.message);
    }
  }

  // Fallback to Claude
  if (anthropicClient && (config.aiProvider === "auto" || config.aiProvider === "anthropic")) {
    try {
      const raw = await callClaude(prompt);
      if (raw && raw.trim().length > 0) {
        return validateResult(parseJSON(raw));
      }
    } catch (err) {
      console.warn("[PredictionParser] Claude failed:", err.message);
    }
  }

  console.warn("[PredictionParser] All providers failed — returning default");
  return DEFAULT;
}
