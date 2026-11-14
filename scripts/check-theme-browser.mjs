// Run after `npm run build`. Synthetic data only; no live database or AI calls.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "docs/theme-validation");
const roleFilter = process.argv[2];
assert.ok(!roleFilter || ["admin", "startup", "investor", "advisor"].includes(roleFilter), "Optional argument must be an account role");
await fs.mkdir(output, { recursive: true });
// Even an accidental dotenv load must not read the project's credentials.
const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), "moneyminds-theme-"));
process.chdir(sandbox);
process.env.NODE_ENV = "test";
process.env.RATE_LIMITS_ENABLED = "false";
for (const key of Object.keys(process.env)) {
  if (/SUPABASE|SENDGRID|API_KEY|STRIPE/.test(key)) delete process.env[key];
}
globalThis.fetch = async () => { throw new Error("Outbound provider call blocked in theme test"); };
const [{ createApp }, { createMemoryStore }, { createToken }, { default: express }] = await Promise.all([
  import("../server/app.js"), import("../server/store/memoryStore.js"), import("../server/auth.js"), import("express"),
]);
const store = createMemoryStore();
const users = { admin: await store.ensureAdminAccount({ fullName: "Theme Admin", email: "admin@example.test", passwordHash: "unused" }) };
for (const role of ["startup", "investor", "advisor"]) {
  const user = await store.createUserProfile({ fullName: `Theme ${role}`, email: `${role}@example.test`, passwordHash: "unused", requestedRoles: [role], location: "Lahore", bio: "Synthetic profile for theme validation." });
  await store.updateApproval(user.id, { status: "approved", approvedRoles: [role] });
  users[role] = await store.findUserById(user.id);
}
await store.upsertStartupProfile(users.startup.id, { companyName: "Theme Company", industry: "Technology", stage: "Seed", description: "Synthetic startup profile", categories: ["Technology"], teamMembers: [], isPublic: true });
await store.upsertInvestorProfile(users.investor.id, { investorType: "Individual", title: "Investor", industries: ["Technology"], investmentThesis: "Synthetic investment thesis", preferredStage: "Seed" });
await store.upsertAdvisorProfile(users.advisor.id, { title: "Financial Advisor", linkedin: "https://www.linkedin.com/in/theme-fixture", specialization: "Planning", yearsExperience: "5", bio: "Synthetic advisor profile", expertiseAreas: [{ area: "Planning", level: 80 }], certifications: [], industries: ["Technology"], primaryTickers: [], languages: ["English"], availability: "available", typicalRate: "$100/hour", isPublic: true });
await store.createProfileVerification({ userId: users.advisor.id, docType: "degree", docUrl: "fixture.pdf", claimToVerify: "Synthetic degree", status: "pending" });
const group = await store.createGroup(users.advisor.id, { name: "Theme group", description: "Synthetic group", isPaid: false, isPrivate: false, category: "general" });
const training = await store.createTraining(users.advisor.id, { title: "Theme training", description: "Synthetic training", type: "paid", price: 25, topics: ["Planning"], targetAudience: ["Investors"], capacity: 10, enrolled: 2, format: "online", duration: "2 hours", schedule: "2026-12-01", status: "upcoming", level: "beginner", location: "Online" });

const app = createApp(store, { backgroundJobs: false });
app.use(express.static(path.join(root, "dist")));
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(root, "dist/index.html")));
const server = app.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined), args: ["--no-sandbox"] });
const errors = [], checked = [], observations = [];
let currentPage;

async function newPage(user, init) {
  const context = await browser.createBrowserContext();
  if (user) await context.setCookie({ name: "mm_token", value: createToken(user), url: origin, httpOnly: true, sameSite: "Strict" });
  const page = await context.newPage();
  currentPage = page;
  await page.setViewport({ width: 1440, height: 1000 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  page.on("pageerror", error => errors.push({ url: page.url(), message: error.message }));
  await page.setRequestInterception(true);
  page.on("request", request => {
    if (request.url().startsWith(origin) || /^(data|blob):/.test(request.url())) request.continue();
    else request.abort();
  });
  if (init) await page.evaluateOnNewDocument(init);
  return page;
}
async function go(page, route) {
  currentPage = page;
  await page.goto(origin + route, { waitUntil: "networkidle0", timeout: 45000 }).catch(error => {
    error.message += ` (${route})`;
    throw error;
  });
  assert.equal(new URL(page.url()).pathname, route.split("?")[0], `Unexpected redirect from ${route}`);
  await page.waitForFunction(() => document.querySelector("h1, h2, h3, h4, main"));
}
async function clickText(page, text) {
  const handle = await page.evaluateHandle(text => [...document.querySelectorAll("button")].find(el => el.textContent.trim() === text), text);
  assert.ok(handle.asElement(), `Missing button: ${text}`);
  await handle.asElement().click();
  await handle.dispose();
}
async function settle(page) {
  await page.evaluate(async () => {
    getComputedStyle(document.body).color;
    await Promise.all(document.getAnimations()
      .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
      .map(animation => animation.finished.catch(() => {})));
  });
}
async function theme(page, value) {
  // Simulate a preference update from another same-origin tab. Separate tests
  // below use the actual UI toggle and a real second tab as well.
  await page.evaluate(value => {
    localStorage.setItem("moneyminds-theme", value);
    window.dispatchEvent(new StorageEvent("storage", { key: "moneyminds-theme", newValue: value }));
  }, value);
  await page.waitForFunction(value => document.documentElement.classList.contains("dark") === (value === "dark") && getComputedStyle(document.documentElement).colorScheme === value, {}, value);
  // Wait for the real CSS color transitions, including on background tabs.
  // Sampling half-way through a transition produces a false contrast failure.
  await settle(page);
}
async function inspect(page, label, value) {
  const result = await page.evaluate(() => {
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    const rgba = color => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].map((v, i) => i === 3 ? v / 255 : v); };
    const over = (a, b) => a.slice(0, 3).map((v, i) => v * a[3] + b[i] * (1 - a[3])).concat(1);
    const background = el => {
      if (!el) return [255, 255, 255, 1];
      const color = rgba(getComputedStyle(el).backgroundColor);
      return color[3] === 1 ? color : over(color, background(el.parentElement));
    };
    const luminance = color => color.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const ratio = (fg, bg) => { const a = luminance(fg), b = luminance(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
    const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
    const controls = [...document.querySelectorAll('select,input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),textarea,[data-slot="select-trigger"]')].filter(el => visible(el) && !el.matches(":disabled") && getComputedStyle(el).opacity === "1").map(el => ({ id: el.id || el.getAttribute("aria-label") || el.tagName, contrast: ratio(rgba(getComputedStyle(el).color), background(el)), background: getComputedStyle(el).backgroundColor }));
    const options = [...document.querySelectorAll("select option:not(:disabled)")].map(el => ({ contrast: ratio(rgba(getComputedStyle(el).color), rgba(getComputedStyle(el).backgroundColor)) }));
    const popover = document.createElement("span"); popover.style.backgroundColor = "var(--popover)"; document.body.append(popover);
    const expectedPopover = getComputedStyle(popover).backgroundColor; popover.remove();
    return { controls, options, bodyBackground: getComputedStyle(document.body).backgroundColor, expectedPopover, toasterTheme: document.querySelector("[data-sonner-toaster]")?.getAttribute("data-sonner-theme"), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  for (const control of result.controls) assert.ok(control.contrast >= 4.5, `${label} ${value}: low contrast ${control.id} (${control.contrast.toFixed(2)})`);
  for (const option of result.options) assert.ok(option.contrast >= 4.5, `${label} ${value}: unreadable native option`);
  if (result.toasterTheme) assert.equal(result.toasterTheme, value, `${label}: toast uses a different theme`);
  assert.equal(result.overflow, false, `${label} ${value}: page overflows viewport`);
  observations.push({ label, theme: value, ...result });
  return result;
}
async function both(page, label, screenshot = false) {
  for (const value of ["light", "dark"]) {
    await theme(page, value);
    await inspect(page, label, value);
    if (screenshot) await page.screenshot({ path: path.join(output, `${label.replace(/[^a-z0-9]+/gi, "-")}-${value}.png`), fullPage: true });
  }
  checked.push(label);
  if (checked.length % 10 === 0) console.log(`Passed ${checked.length} theme scenarios; latest: ${label}`);
}

try {
  if (!roleFilter) {
  const publicPage = await newPage();
  for (const route of ["/", "/login", "/forgot-password", "/reset-password", "/apply"]) { await go(publicPage, route); await both(publicPage, `public${route}`); }
  await publicPage.click('[aria-label="Toggle color theme"]');
  await publicPage.waitForFunction(() => !document.documentElement.classList.contains("dark"));
  await publicPage.reload({ waitUntil: "networkidle0" });
  assert.equal(await publicPage.evaluate(() => getComputedStyle(document.documentElement).colorScheme), "light");
  const secondTab = await publicPage.browserContext().newPage();
  await secondTab.goto(origin + "/apply", { waitUntil: "networkidle0" });
  await secondTab.click('[aria-label="Toggle color theme"]');
  await publicPage.waitForFunction(() => document.documentElement.classList.contains("dark"));
  await secondTab.close();
  checked.push("UI toggle, reload persistence and cross-tab synchronization");

  for (const role of ["Startup", "Investor", "Financial Advisor"]) await publicPage.click(`input[aria-label="${role}"]`);
  for (const [id, value] of Object.entries({ fullName: "Theme Applicant", email: "applicant@example.test", password: "Password123!", phone: "+923001234567", city: "Lahore", country: "Pakistan" })) await publicPage.type(`[id="${id}"]`, value);
  await publicPage.click('button[type="submit"]');
  await publicPage.waitForSelector('[id="startup.stage"]');
  await publicPage.select('[id="startup.stage"]', "Seed");
  await both(publicPage, "registration-all-role-fields", true);
  await publicPage.$eval('[id="startup.stage"]', el => el.scrollIntoView({ block: "center" }));
  await publicPage.focus('[id="startup.stage"]');
  await publicPage.keyboard.down("Alt");
  await publicPage.keyboard.press("ArrowDown");
  await publicPage.keyboard.up("Alt");
  await publicPage.screenshot({ path: path.join(output, "startup-stage-dropdown-dark.png") });
  await publicPage.keyboard.press("Escape");
  await publicPage.focus('[id="startup.stage"]');
  await publicPage.keyboard.press("ArrowDown");
  assert.ok(await publicPage.$eval('[id="startup.stage"]', el => el.value !== "Seed"), "Native select keyboard interaction");
  await publicPage.setViewport({ width: 390, height: 844 });
  await both(publicPage, "registration-mobile", true);
  await publicPage.browserContext().close();

  for (const init of [
    () => localStorage.setItem("moneyminds-theme", "invalid"),
    () => { Storage.prototype.getItem = () => { throw new Error("storage blocked"); }; Storage.prototype.setItem = () => { throw new Error("storage blocked"); }; },
  ]) {
    const page = await newPage(null, init);
    await go(page, "/apply");
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), true);
    await page.click('[aria-label="Toggle color theme"]');
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
    await page.browserContext().close();
  }
  checked.push("Invalid and unavailable browser storage");
  }

  const routes = {
    admin: ["dashboard", "users", "reviews", "agents", "agents/verification", "agents/due-diligence", "agents/documents", "agents/signals", "agents/predictions", "agents/research", "content", "payments", "reports", "settings", "ai-config", "token-report", "profile"],
    startup: ["dashboard", "analytics", "profile", "edit-profile", "trainings", `trainings/${training.id}`, "find-advisors", "groups"],
    investor: ["dashboard", "analytics", "profile", "edit-profile", "ai-agents", "trainings", `trainings/${training.id}`, "find-advisors", "groups"],
    advisor: ["dashboard", "analytics", "profile", "edit-profile", "sessions", "groups", `groups/${group.id}/create-signal`, `groups/${group.id}/predictions`, "trainings", `trainings/${training.id}`, "credibility"],
  };
  const checkRole = async ([role, sections]) => {
    const page = await newPage(users[role]);
    for (const section of sections) {
      await go(page, `/${role}/${section}`);
      await both(page, `${role}-${section}`, ["ai-config", "edit-profile", "profile", "analytics"].includes(section));
      if (role === "admin" && section === "settings") {
        await page.click("#requireBackgroundCheck");
        await clickText(page, "Save settings");
        await page.waitForSelector("[data-sonner-toast]");
        await page.hover("[data-sonner-toast]"); // Pause dismissal while taking screenshots.
        for (const value of ["light", "dark"]) {
          await theme(page, value);
          await page.waitForFunction(value => document.querySelector("[data-sonner-toaster]")?.dataset.sonnerTheme === value, {}, value);
          assert.equal(await page.$eval("[data-sonner-toaster]", el => el.dataset.sonnerTheme), value);
          await page.screenshot({ path: path.join(output, `toast-${value}.png`) });
        }
        checked.push("Visible toast follows app theme with opposite OS preference");
      }
      if (role === "admin" && section === "profile") {
        await page.click('[aria-label="Notifications"]');
        await page.waitForSelector('[role="menu"]');
        await both(page, "notification-portal", true);
        await page.keyboard.press("Escape");
        await page.setViewport({ width: 390, height: 844 });
        await page.click('[aria-label="Toggle color theme"]');
        await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
        await both(page, "admin-mobile", true);
        await page.setViewport({ width: 1440, height: 1000 });
      }
      if (role === "advisor" && section === "groups") {
        await clickText(page, "Create Group");
        await page.waitForSelector('[role="dialog"]');
        await both(page, "group-dialog", true);
        for (const value of ["light", "dark"]) {
          await theme(page, value);
          await page.click("#create-category");
          await page.waitForSelector('[role="listbox"]', { visible: true });
          await settle(page);
          const portalColors = await inspect(page, "radix-select-portal", value);
          assert.equal(await page.$eval('[role="listbox"]', el => getComputedStyle(el).backgroundColor), portalColors.expectedPopover);
          await page.screenshot({ path: path.join(output, `radix-select-portal-${value}.png`) });
          await page.keyboard.press("Escape");
        }
        checked.push("radix-select-portal");
        await page.keyboard.press("Escape");
      }
      if (section === "analytics" && role === "advisor") {
        const chart = await page.$(".recharts-wrapper");
        assert.ok(chart, "Populated advisor chart must render");
        for (const value of ["light", "dark"]) {
          await theme(page, value);
          const box = await chart.boundingBox();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForFunction(() => [...document.querySelectorAll(".recharts-tooltip-wrapper")].some(el => getComputedStyle(el).visibility === "visible"));
          assert.equal(await page.$eval(".recharts-default-tooltip", el => getComputedStyle(el).backgroundColor), await page.evaluate(() => { const el = document.createElement("div"); el.style.backgroundColor = "var(--popover)"; document.body.append(el); const c = getComputedStyle(el).backgroundColor; el.remove(); return c; }));
          await page.screenshot({ path: path.join(output, `chart-tooltip-${value}.png`) });
        }
      }
    }
    if (role === "advisor") {
      for (const route of ["/verify", "/activity", "/choose-role", `/advisors/${users.advisor.id}/profile`, `/startups/${users.startup.id}/profile`]) { await go(page, route); await both(page, route); }
    }
    await page.browserContext().close();
  };
  const roleResults = [];
  const roleEntries = Object.entries(routes).filter(([role]) => !roleFilter || role === roleFilter);
  // Bound parallel Chrome contexts on development machines.
  for (let index = 0; index < roleEntries.length; index += 2) {
    roleResults.push(...await Promise.allSettled(roleEntries.slice(index, index + 2).map(checkRole)));
  }
  const failedRole = roleResults.find(result => result.status === "rejected");
  if (failedRole) throw failedRole.reason;
  assert.deepEqual(errors, [], "No browser runtime errors");
  await fs.writeFile(path.join(output, roleFilter ? `results-${roleFilter}.json` : "results.json"), JSON.stringify({ checked, errors, observations }, null, 2));
  console.log(JSON.stringify({ passed: checked.length, checked, output }, null, 2));
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    await currentPage.screenshot({ path: path.join(output, "failure.png"), fullPage: true }).catch(() => {});
    console.error("Failed page:", currentPage.url());
  }
  await fs.writeFile(path.join(output, "results.json"), JSON.stringify({ checked, errors, observations }, null, 2));
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  process.chdir(root);
  await fs.rm(sandbox, { recursive: true, force: true });
}
