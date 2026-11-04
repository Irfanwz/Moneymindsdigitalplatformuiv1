// Isolated UI verification with synthetic accounts and no production services.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
process.env.NODE_ENV = "test";
process.env.EMAIL_OTP_ENABLED = "false";
for (const key of Object.keys(process.env)) if (/SUPABASE|SENDGRID|API_KEY|STRIPE/.test(key)) delete process.env[key];
const [{ createApp }, { createMemoryStore }, { createToken }, express] = await Promise.all([import("../server/app.js"), import("../server/store/memoryStore.js"), import("../server/auth.js"), import("express")]);
globalThis.fetch = async () => { throw new Error("Unexpected external request in isolated registration check"); };
const store = createMemoryStore(), app = createApp(store, { backgroundJobs: false });
const admin = await store.ensureAdminAccount({ fullName: "Registration Reviewer", email: "reviewer@example.test", passwordHash: "unused" });
app.use(express.default.static(path.resolve("dist")));
app.get("/{*splat}", (_req, res) => res.sendFile(path.resolve("dist/index.html")));
const server = app.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
const origin = `http://127.0.0.1:${server.address().port}`, output = path.resolve("docs/registration-validation");
await fs.mkdir(output, { recursive: true });
const evidence = path.join(output, "synthetic-evidence.pdf");
await fs.writeFile(evidence, "%PDF-1.4\nSynthetic test evidence\n%%EOF");
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const failures = [], checked = [];
const page = await browser.newPage();
page.on("pageerror", error => failures.push(error.message));
const selector = id => `[id="${id}"]`;
async function fill(id, value) { await page.type(selector(id), value); }
async function select(id, value) { await page.select(selector(id), value); }
async function next() { await page.click('button[type="submit"]'); }
async function button(text) { const handle = await page.evaluateHandle(text => [...document.querySelectorAll("button")].find(el => el.textContent.trim() === text), text); await handle.asElement().click(); }
async function account(roles, email) {
  await page.goto(`${origin}/apply`, { waitUntil: "networkidle0" });
  for (const role of roles) await page.click(`input[aria-label="${role}"]`);
  for (const [id, value] of Object.entries({ fullName: "Browser Applicant", email, password: "Password123!", phone: "+923001234567", city: "Lahore", country: "Pakistan" })) await fill(id, value);
  await next();
  await page.waitForSelector('[id^="investor."], [id^="startup."], [id^="advisor."]');
}
async function success() {
  await page.waitForFunction(() => document.body.textContent.includes("Application submitted") || document.querySelector('[role="alert"]'));
  const alert = await page.$('[role="alert"]');
  if (alert) throw new Error(await alert.evaluate(el => el.textContent));
}
try {
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${origin}/apply`, { waitUntil: "networkidle0" });
  assert.deepEqual(await page.evaluate(() => ["phone", "city", "country"].map(id => document.getElementById(id).required)), [true, true, true]);
  await page.click('input[aria-label="Investor"]');
  for (const [id, value] of Object.entries({ fullName: "Mobile Applicant", email: "mobile@example.test", password: "Password123!", phone: "+923001234567" })) await fill(id, value);
  await next();
  assert.equal(await page.$('[id="investor.investorType"]'), null, "Missing city/country must block moving to profile details");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: path.join(output, "registration-mobile.png"), fullPage: true });
  checked.push("Mobile layout and mandatory phone/city/country");

  await account(["Investor"], "investor-browser@example.test");
  await select("investor.investorType", "Individual"); await fill("investor.title", "Engineer"); await fill("investor.investmentThesis", "Invest in early stage companies");
  await next(); await page.waitForFunction(() => document.body.textContent.includes("No supporting documents are required"));
  await next(); await page.waitForFunction(() => document.body.textContent.includes("Check your details"));
  await next(); await success();
  const investor = await store.findUserByEmail("investor-browser@example.test");
  assert.equal((await store.findInvestorProfileByUserId(investor.id)).title, "Engineer");
  checked.push("Minimal Investor registration without optional LinkedIn or documents");

  await page.setViewport({ width: 1365, height: 1000 });
  await account(["Startup", "Financial Advisor"], "multi-browser@example.test");
  for (const [id, value] of Object.entries({ "startup.companyName": "Browser Company", "startup.applicantPosition": "Founder", "startup.industry": "Technology", "startup.description": "We build technology for local businesses.", "startup.joiningPurpose": "Find professional advisors", "advisor.title": "Financial Advisor", "advisor.bio": "Independent financial professional", "advisor.specialization": "Retirement planning", "advisor.yearsExperience": "5", "advisor.linkedin": "https://www.linkedin.com/in/browser-advisor" })) await fill(id, value);
  await select("startup.stage", "Seed"); await select("startup.businessRegistrationStatus", "Not registered");
  for (const [id, value] of Object.entries({ "advisor.employmentStatus": "No previous employment", "advisor.educationStatus": "Qualified", "advisor.certificationStatus": "None", "advisor.licenseStatus": "Not applicable", "advisor.regulatoryStatus": "Not applicable" })) await select(id, value);
  await page.waitForSelector('[id^="advisor.education."]');
  const eduInputs = await page.$$eval('[id^="advisor.education."]', elements => elements.map(e => e.id));
  for (const id of eduInputs) await fill(id, id.endsWith(".qualification") ? "Finance degree" : id.endsWith(".institution") ? "Sample University" : "2020");
  await button("Add education entry");
  const moreInputs = await page.$$eval('[id^="advisor.education."]', elements => elements.filter(e => !e.value).map(e => e.id));
  for (const id of moreInputs) await fill(id, id.endsWith(".qualification") ? "Masters" : id.endsWith(".institution") ? "Second University" : "2022");
  await next(); await page.waitForSelector('input[type="file"]');
  const requiredFiles = await page.$$('input[type="file"][required]');
  assert.equal(requiredFiles.length, 2, "Each education entry needs its own evidence");
  await next(); assert.equal(await page.$('input[type="file"]') !== null, true, "Missing evidence blocks review");
  for (const input of requiredFiles) await input.uploadFile(evidence);
  await next(); await page.waitForFunction(() => document.body.textContent.includes("Check your details"));
  await page.screenshot({ path: path.join(output, "registration-review.png"), fullPage: true });
  await button("Back"); await page.waitForSelector('input[type="file"]');
  assert.equal(await page.$$eval('input[type="file"][required]', elements => elements.length), 0, "Previously selected files survive Back");
  await next(); await page.waitForFunction(() => document.body.textContent.includes("Check your details")); await next(); await success();
  const multi = await store.findUserByEmail("multi-browser@example.test"), application = await store.getProfileApplication(multi.id);
  assert.equal(application.documents.length, 2); assert.equal(application.profiles.advisor.education.length, 2);
  assert.equal((await store.findStartupProfileByUserId(multi.id)).companyName, "Browser Company");
  assert.equal((await store.findAdvisorProfileByUserId(multi.id)).educationUniversity, "Sample University");
  checked.push("Startup + Advisor application, repeatable qualifications, evidence requirements and Back navigation");

  await page.setCookie({ name: "mm_token", value: createToken(admin), url: origin, httpOnly: true, sameSite: "Strict" });
  await page.goto(`${origin}/admin/users`, { waitUntil: "networkidle0" });
  const detailButton = await page.evaluateHandle(() => {
    const row = [...document.querySelectorAll("tr")].find(el => el.textContent.includes("multi-browser@example.test"));
    return row && [...row.querySelectorAll("button")].find(el => /view details/i.test(el.textContent));
  });
  if (detailButton.asElement()) {
    await detailButton.asElement().click();
    await page.waitForFunction(() => document.body.textContent.includes("Registration application"));
    assert.ok((await page.$eval('body', el => el.textContent)).includes("Second University"));
    await page.screenshot({ path: path.join(output, "admin-registration-review.png"), fullPage: true });
  } else throw new Error("Could not open the applicant's admin review");
  checked.push("Admin sees complete application and all education entries before approval");
  await store.updateApproval(multi.id, { status: "approved", approvedRoles: ["startup", "advisor"] });
  await page.setCookie({ name: "mm_token", value: createToken(multi), url: origin, httpOnly: true, sameSite: "Strict" });
  await page.goto(`${origin}/advisor/profile`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.body.textContent.includes("Your registration submission"));
  assert.ok(page.url().endsWith("/advisor/profile"), "Completed registration must satisfy the profile gate");
  checked.push("Approved advisor reaches their profile and can inspect the original submission");
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ ok: true, checked, screenshots: output }, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(output, "failure.png"), fullPage: true });
  console.error(await page.$eval('body', el => el.textContent.slice(-2000)));
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
