import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { config } from "../config.js";
import { parseSignalPrediction } from "./predictionParserService.js";
import { getStockPrice, getCryptoPrice } from "./marketPriceFetcher.js";
import { trackAIRequest } from "./aiUsage.js";

const groqClient = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey, timeout:30000, maxRetries:0 }) : null;
const anthropicClient = config.anthropicApiKey ? new Anthropic({ apiKey: config.anthropicApiKey, timeout:30000, maxRetries:0 }) : null;

// ─── Accuracy Calculation ─────────────────────────────────────────────────────

/**
 * Score a prediction against the actual price.
 *
 * Scoring:
 *   Direction correct → 50 pts base
 *   Price accuracy (only if direction correct):
 *     0–2% off   → +50 pts  (total 100 — Perfect)
 *     2–5% off   → +35 pts  (total 85  — Good)
 *     5–10% off  → +20 pts  (total 70  — Partial)
 *     10%+ off   → +0 pts   (total 50  — Direction only)
 *   Direction wrong → 0 pts total
 *
 * @param {object} params
 * @param {number} params.baselinePrice
 * @param {number} params.targetPrice
 * @param {number} params.actualPrice
 * @param {'up'|'down'|'neutral'} params.direction
 * @returns {{ score: number, result: string, priceDiffPct: number|null, directionCorrect: boolean }}
 */
export function calculateAccuracy({ baselinePrice, targetPrice, actualPrice, direction }) {
  const actualMoved = actualPrice - baselinePrice;
  const directionCorrect =
    direction === "neutral" ||
    (direction === "up" && actualMoved >= 0) ||
    (direction === "down" && actualMoved <= 0);

  if (!directionCorrect) {
    return { score: 0, result: "incorrect", priceDiffPct: null, directionCorrect: false };
  }

  // Direction only — no price target
  if (targetPrice === null || targetPrice === undefined) {
    return { score: 50, result: "partial", priceDiffPct: null, directionCorrect: true };
  }

  const priceDiffPct = Math.abs((actualPrice - targetPrice) / targetPrice) * 100;
  let pricePoints;
  if (priceDiffPct <= 2) pricePoints = 50;
  else if (priceDiffPct <= 5) pricePoints = 35;
  else if (priceDiffPct <= 10) pricePoints = 20;
  else pricePoints = 0;

  const score = 50 + pricePoints;
  const result = score >= 90 ? "correct" : score >= 70 ? "partial" : score >= 50 ? "partial" : "incorrect";

  return { score, result, priceDiffPct, directionCorrect: true };
}

// ─── AI Explanation ───────────────────────────────────────────────────────────

function buildExplanationPrompt({ signal, actualPrice, score, result, priceDiffPct, directionCorrect }) {
  const ticker = signal.ticker || signal.predictionDirection || "the asset";
  const baseline = signal.baselinePrice;
  const target = signal.predictionTargetPrice;
  const direction = signal.predictionDirection;
  const timeframe = signal.predictionTimeframe || "the period";
  const pricePct = baseline ? (((actualPrice - baseline) / baseline) * 100).toFixed(1) : "N/A";

  return `You are a financial analyst reviewing a prediction accuracy result. Write a 2-sentence plain English explanation.
Be honest, concise, and educational. Do not use markdown. No bullet points.

Prediction details:
- Asset: ${ticker}
- Direction predicted: ${direction} (${directionCorrect ? "CORRECT" : "WRONG"})
- Baseline price: $${baseline}
- Target price: ${target ?? "not specified"}
- Actual price after ${timeframe}: $${actualPrice} (${pricePct > 0 ? "+" : ""}${pricePct}%)
- Accuracy score: ${score}/100 (${result})
${priceDiffPct !== null ? `- Price difference from target: ${priceDiffPct.toFixed(1)}%` : ""}

Write the explanation now (2 sentences max):`;
}

async function generateExplanation(params) {
  const prompt = buildExplanationPrompt(params);
  let trigger = "initial";

  if (groqClient && (config.aiProvider === "auto" || config.aiProvider === "groq")) {
    try {
      const res = await trackAIRequest({provider:"groq",model:config.groqModel,purpose:"Explain a prediction result using checked market prices",trigger},()=>groqClient.chat.completions.create({
        model: config.groqModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }));
      const text = res.choices[0]?.message?.content?.trim();
      if (text && text.length > 0) return text;
    } catch (err) {
      if(err?.code==="AI_USAGE_SAVE_FAILED") throw err;
      console.warn("[PredictionChecker] Groq explanation failed:", err.message);
    }
    trigger = "fallback";
  }

  if (anthropicClient && (config.aiProvider === "auto" || config.aiProvider === "anthropic")) {
    try {
      const res = await trackAIRequest({provider:"anthropic",model:config.anthropicModel,purpose:"Explain a prediction result using checked market prices",trigger},()=>anthropicClient.messages.create({
        model: config.anthropicModel,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }));
      const text = res.content[0]?.text?.trim();
      if (text && text.length > 0) return text;
    } catch (err) {
      if(err?.code==="AI_USAGE_SAVE_FAILED") throw err;
      console.warn("[PredictionChecker] Claude explanation failed:", err.message);
    }
  }

  // Fallback: rule-based explanation
  const { score, result, directionCorrect } = params;
  if (!directionCorrect) return `The predicted direction was incorrect — the asset moved the opposite way. Score: ${score}/100.`;
  if (score >= 90) return `Outstanding prediction — direction and price target were both highly accurate. Score: ${score}/100.`;
  if (score >= 70) return `Good call overall — direction was correct and price was reasonably close to target. Score: ${score}/100.`;
  return `Direction was correct but price target was missed by a significant margin. Score: ${score}/100.`;
}

// ─── Market Price Fetch ───────────────────────────────────────────────────────

/**
 * Fetch the current price for a ticker.
 * Tries stock first, then crypto. Falls back to null.
 */
async function fetchCurrentPrice(ticker) {
  if (!ticker) return null;
  try {
    const stockPrice = await getStockPrice(ticker);
    if (stockPrice !== null) return stockPrice;
    const cryptoPrice = await getCryptoPrice(ticker);
    return cryptoPrice;
  } catch (err) {
    console.warn(`[PredictionChecker] Price fetch failed for ${ticker}:`, err.message);
    return null;
  }
}

// ─── Schedule Prediction ─────────────────────────────────────────────────────

/**
 * Parse a newly created signal and save prediction fields to store.
 * Called fire-and-forget after signal creation.
 *
 * @param {string} signalId
 * @param {object} signal
 * @param {object} store
 */
export async function scheduleSignalPrediction(signalId, signal, store, {strict=false}={}) {
  try {
    if(signal.predictionCheckedAt) return {summary:"This prediction has already been evaluated. Its recorded result is preserved.",eligible:false};
    const parsed=await parseSignalPrediction(signal,{strict});
    if(!parsed.ticker || parsed.direction==="neutral") {
      await store.updateSignalPrediction(signalId,{predictionDirection:"neutral",predictionTicker:parsed.ticker || null,predictionCheckDate:null});
      return {summary:"No directional, identifiable asset prediction was found in this post.",eligible:false};
    }
    const created=Date.parse(signal.createdAt || new Date().toISOString());
    const historical=Date.now()-created>60*60*1000 && !signal.baselinePrice;
    const baselinePrice=signal.baselinePrice || (historical ? null : await fetchCurrentPrice(parsed.ticker));
    const now=new Date().toISOString();
    const checkDate=new Date(created+parsed.timeframeDays*86400000).toISOString();
    const updated=await store.updateSignalPrediction(signalId,{
      predictionTicker:parsed.ticker,predictionDirection:parsed.direction,predictionTargetPrice:parsed.targetPrice,
      predictionTimeframe:parsed.timeframe,predictionTimeframeDays:parsed.timeframeDays,
      predictionCheckDate:baselinePrice ? checkDate : null,baselinePrice,
      baselineFetchedAt:signal.baselineFetchedAt || (baselinePrice ? now : null),
    });
    if(!updated) throw new Error("The extracted prediction could not be saved.");
    return {summary:historical ? "Prediction extracted. Original baseline is unavailable for this historical signal; no accuracy score will be fabricated." : baselinePrice ? `Prediction saved; evaluation is due ${checkDate}.` : "Prediction extracted, but a market price was unavailable. Check the price provider and retry while the signal is fresh.",ticker:parsed.ticker,eligible:!!baselinePrice,checkDate:baselinePrice ? checkDate : null};
  } catch(error) {
    if(strict) throw error;
    console.error("[PredictionChecker] Could not schedule:",error.message);
    return null;
  }
}

export async function checkOnePrediction(signal, store) {
  try {
    if(!signal.baselinePrice || signal.baselinePrice<=0 || !signal.predictionCheckDate || Date.parse(signal.predictionCheckDate)>Date.now()) return null;
    if(!["up","down"].includes(signal.predictionDirection)) return null;
    const effectiveTicker=signal.predictionTicker;
    if(!effectiveTicker) return null;

    const actualPrice = await fetchCurrentPrice(effectiveTicker);
    if (actualPrice === null) {
      console.warn(`[PredictionChecker] No price found for signal ${signal.id} (ticker: ${effectiveTicker}) — skipping`);
      return null;
    }

    const { score, result, priceDiffPct, directionCorrect } = calculateAccuracy({
      baselinePrice: signal.baselinePrice,
      targetPrice: signal.predictionTargetPrice,
      actualPrice,
      direction: signal.predictionDirection,
    });

    const explanation = await generateExplanation({
      signal: { ...signal, ticker: effectiveTicker },
      actualPrice,
      score,
      result,
      priceDiffPct,
      directionCorrect,
    });

    const updated = await store.updateSignalPrediction(signal.id, {
      actualPrice,
      predictionAccuracy: score,
      predictionResult: result,
      predictionCheckedAt: new Date().toISOString(),
      predictionExplanation: explanation,
    });

    console.log(`[PredictionChecker] Checked signal ${signal.id}: ${score}/100 (${result})`);
    return updated;
  } catch (err) {
    console.error(`[PredictionChecker] checkOnePrediction failed for ${signal.id}:`, err.message);
    return null;
  }
}

// ─── Check All Due Predictions ─────────────────────────────────────────────────

/**
 * Find all signals past their check date and verify them.
 * Called by the daily cron job.
 *
 * @param {object} store
 * @returns {Promise<number>} number of signals checked
 */
export async function checkDuePredictions(store) {
  let checked = 0;
  try {
    const due = await store.listSignalsDueForCheck();
    console.log(`[PredictionChecker] Found ${due.length} signal(s) due for checking`);

    for (const signal of due) {
      const result = await checkOnePrediction(signal, store);
      if (result) checked++;
    }
  } catch (err) {
    console.error("[PredictionChecker] checkDuePredictions error:", err.message);
  }
  return checked;
}
