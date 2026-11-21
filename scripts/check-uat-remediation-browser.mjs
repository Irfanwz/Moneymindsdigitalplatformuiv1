// Isolated, synthetic browser checks. Run after npm run build.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
process.env.NODE_ENV = "test";
process.env.EMAIL_OTP_ENABLED = "false";
for (const key of Object.keys(process.env)) if (/SUPABASE|SENDGRID|API_KEY|STRIPE/.test(key)) delete process.env[key];
const [{ createApp }, { createMemoryStore }, express] = await Promise.all([
  import("../server/app.js"), import("../server/store/memoryStore.js"), import("express"),
]);
globalThis.fetch = async () => { throw new Error("External services disabled during UAT browser checks"); };
const app = createApp(createMemoryStore(), { backgroundJobs: false });
app.use(express.default.static(path.resolve("dist")));
app.get("/{*splat}", (_req, res) => res.sendFile(path.resolve("dist/index.html")));
const server = app.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
let browser;
const checked = [], errors = [];
try {
  browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on("request", req => /^(file:|data:|http:\/\/127\.0\.0\.1:)/.test(req.url()) ? req.continue() : req.abort());
  for (const role of ["advisor", "startup", "investor"]) {
    await page.goto(`http://127.0.0.1:${server.address().port}/${role}/dashboard`, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => location.pathname === "/login");
    assert.equal(await page.evaluate(() => document.body.textContent.includes("Loading your session")), false);
    checked.push(`${role}: signed-out dashboard redirects to login`);
  }
  const report = path.resolve("MoneyMinds_Consolidated_UAT_Execution_Report (can be shared with Developers).html");
  await page.goto(pathToFileURL(report).href, { waitUntil: "networkidle0" });
  await page.waitForSelector("#remediation-2026-11-21");
  assert.equal(await page.$$eval("[data-review-group]", nodes => nodes.length), 484);
  assert.equal(await page.$$eval("img[src^='data:image/']", nodes => nodes.length), 22);
  assert.equal(await page.$$eval(".rm-inline", nodes => nodes.length), 78);
  assert.equal(await page.$$eval(".rm-entry", nodes => nodes.length), 25);
  const broken = await page.$$eval("#remediation-2026-11-21 a[href^='#']", nodes => nodes.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
  assert.deepEqual(broken, []);
  await page.select("#rm-status-filter", "fixed");
  assert.equal(await page.$$eval(".rm-entry:not([hidden])", nodes => nodes.length), 14);
  await page.select("#rm-status-filter", "all");
  checked.push("HTML: 484 original cases, 22 images, 78 status annotations, 25 fix groups, anchor links and status filter");
  await page.setViewport({ width: 1365, height: 1000 });
  await fs.mkdir(path.resolve("docs/uat-remediation"), { recursive: true });
  await page.screenshot({ path: path.resolve("docs/uat-remediation/report-desktop.png") });
  await page.setViewport({ width: 390, height: 844 });
  const fits = await page.$eval("#remediation-2026-11-21", node => node.getBoundingClientRect().right <= innerWidth && node.scrollWidth <= node.clientWidth);
  assert.equal(fits, true);
  checked.push("HTML remediation section fits mobile viewport");
  await page.screenshot({ path: path.resolve("docs/uat-remediation/report-mobile.png") });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ok: true, checked, pageErrors: errors }, null, 2));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
