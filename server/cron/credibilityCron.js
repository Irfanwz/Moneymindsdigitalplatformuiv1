/**
 * credibilityCron.js
 * Daily cron job that recalculates credibility scores for all advisors.
 * Runs 30 minutes after the prediction checker (9:30 AM) so new results are included.
 */

import { recalculateAll } from "../services/credibilityService.js";

export function startCredibilityCron(store) {
  // Run once at startup
  runRecalc(store);

  // Schedule daily at 9:30 AM
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 30, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  const msUntilFirst = next - now;
  const msPerDay = 24 * 60 * 60 * 1000;

  console.log(`[CredibilityCron] First recalc in ${Math.round(msUntilFirst / 60000)} minutes (${next.toISOString()})`);

  setTimeout(() => {
    runRecalc(store);
    setInterval(() => runRecalc(store), msPerDay);
  }, msUntilFirst);
}

async function runRecalc(store) {
  console.log(`[CredibilityCron] Running credibility recalculation — ${new Date().toISOString()}`);
  try {
    const count = await recalculateAll(store);
    console.log(`[CredibilityCron] Done — ${count} advisor(s) updated`);
  } catch (err) {
    console.error("[CredibilityCron] Error:", err.message);
  }
}
