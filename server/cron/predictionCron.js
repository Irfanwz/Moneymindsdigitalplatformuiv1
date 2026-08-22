/**
 * predictionCron.js
 * Daily cron job that checks all advisor signal predictions that are due.
 * Runs every day at 9:00 AM server time.
 *
 * Usage: startPredictionCron(store) — call once from app startup.
 */

import { checkDuePredictions } from "../services/predictionCheckerService.js";

/**
 * Start the prediction checker cron job.
 * Uses setInterval as a lightweight alternative to node-cron (no extra dependency).
 *
 * @param {object} store - the app store (memory or supabase)
 */
export function startPredictionCron(store) {
  // Run once at startup (in case server was down during a scheduled check)
  runCheck(store);

  // Schedule daily: calculate ms until next 9:00 AM, then repeat every 24h
  const now = new Date();
  const next9am = new Date(now);
  next9am.setHours(9, 0, 0, 0);
  if (next9am <= now) {
    // Already past 9 AM today — schedule for 9 AM tomorrow
    next9am.setDate(next9am.getDate() + 1);
  }

  const msUntilFirst = next9am - now;
  const msPerDay = 24 * 60 * 60 * 1000;

  console.log(`[PredictionCron] First check in ${Math.round(msUntilFirst / 60000)} minutes (${next9am.toISOString()})`);

  // Fire at next 9 AM, then every 24 hours
  setTimeout(() => {
    runCheck(store);
    setInterval(() => runCheck(store), msPerDay);
  }, msUntilFirst);
}

async function runCheck(store) {
  console.log(`[PredictionCron] Running scheduled check — ${new Date().toISOString()}`);
  try {
    const count = await checkDuePredictions(store);
    console.log(`[PredictionCron] Done — ${count} prediction(s) checked`);
  } catch (err) {
    console.error("[PredictionCron] Error during check:", err.message);
  }
}
