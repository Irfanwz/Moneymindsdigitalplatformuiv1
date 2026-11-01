// Isolated browser regression check. Uses generated fixtures and blocks server
// provider requests; never connects to the production database or sends email.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
process.env.NODE_ENV = "test";
for (const key of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SENDGRID_API_KEY",
  "GROQ_API_KEY",
  "ANTHROPIC_API_KEY",
  "TAVILY_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
])
  delete process.env[key];
const [{ createApp }, { createMemoryStore }, { createToken }, express] =
  await Promise.all([
    import("../server/app.js"),
    import("../server/store/memoryStore.js"),
    import("../server/auth.js"),
    import("express"),
  ]);
globalThis.fetch = async () => {
  throw new Error("Unexpected outbound request in browser fixture test");
};
const store = createMemoryStore();
const admin = await store.ensureAdminAccount({
  fullName: "Platform Admin",
  email: "admin@example.test",
  passwordHash: "unused",
});
const people = [];
for (let i = 0; i < 15; i++) {
  const user = await store.createUserProfile({
    fullName:
      i === 0 ? "Fixture Investor" : `Applicant ${String(i).padStart(2, "0")}`,
    email: `fixture-${i}@example.test`,
    passwordHash: "unused",
    requestedRoles: [i % 2 ? "startup" : "investor"],
    location: "Lahore",
    bio: "A synthetic account for isolated interface validation.",
  });
  if (i % 3 !== 1)
    await store.updateApproval(user.id, {
      status: i % 3 === 0 ? "approved" : "rejected",
      approvedRoles: ["investor"],
      rejectionReason: "Fixture only",
    });
  people.push(await store.findUserById(user.id));
}
const finance = await store.createUserProfile({
  fullName: "Finance Admin",
  email: "finance@example.test",
  passwordHash: "unused",
  requestedRoles: ["investor"],
});
await store.updateApproval(finance.id, {
  status: "approved",
  approvedRoles: ["investor"],
});
await store.adminMutate(admin.id, "user.admin_role", finance.id, {
  role: "finance",
});
await store.upsertStartupProfile(people[0].id, {
  companyName: "Fixture company",
  description: "A generated business profile.",
  industry: "Technology",
  stage: "Seed",
  categories: [],
  teamMembers: [],
});
const group = await store.createGroup(admin.id, {
  name: "Fixture discussion group",
  description: "Synthetic group for moderation checks.",
  isPaid: false,
  isPrivate: false,
  category: "general",
});
const training = await store.createTraining(admin.id, {
  title: "Fixture training",
  description: "Synthetic training for interface checks.",
  type: "paid",
  price: 25,
  topics: [],
  targetAudience: [],
  capacity: 10,
  enrolled: 0,
  format: "online",
  duration: "2 hours",
  schedule: "2026-12-01",
  status: "upcoming",
  level: "beginner",
  location: "Online",
});
const checkoutTraining = await store.createTraining(admin.id, {
  title: "Checkout fixture training",
  description: "A synthetic paid training.",
  type: "paid",
  price: 15,
  topics: ["Planning"],
  targetAudience: ["Investors"],
  capacity: 10,
  enrolled: 0,
  format: "online",
  duration: "2 hours",
  schedule: "2026-12-01",
  status: "upcoming",
  level: "beginner",
  location: "Online",
});
const payment = await store.createPayment(people[0].id, {
  itemType: "training",
  itemId: training.id,
  amount: 25,
  currency: "USD",
  paymentMethod: "card",
});
await store.completePayment(payment.id, "SIM-browser-fixture");
await store.adminMutate(admin.id, "review.update", people[0].id, {
  assignedTo: admin.id,
  state: "in_review",
  notes: "Initial fixture review",
});
const app = createApp(store, { backgroundJobs: false });
app.use(express.default.static(path.resolve("dist")));
app.get("/{*splat}", (_req, res) =>
  res.sendFile(path.resolve("dist/index.html")),
);
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const output = path.resolve("docs/admin-validation");
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
  args: ["--no-sandbox"],
});
const failures = [],
  checked = [];
const observedRequests = new WeakMap();
async function newPage(user) {
  const context = await browser.createBrowserContext();
  await context.setCookie({
    name: "mm_token",
    value: createToken(user),
    url: origin,
    httpOnly: true,
    sameSite: "Strict",
  });
  const page = await context.newPage();
  observedRequests.set(page,[]);
  page.on('request',req=>{if(req.url().startsWith(origin+'/api/'))observedRequests.get(page).push(new URL(req.url()).pathname);});
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (res) => {
    if (res.url().includes("/api/") && res.status() >= 500)
      failures.push(`${res.status()} ${new URL(res.url()).pathname}`);
  });
  return page;
}
async function go(page, route, heading) {
  await page.goto(origin + route, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    (t) => document.querySelector("h1")?.textContent?.includes(t),
    {},
    heading,
  );
}
async function clickText(page, text) {
  await page.waitForFunction(
    (t) =>
      [...document.querySelectorAll("button")].some(
        (b) => b.textContent.trim() === t && !b.disabled,
      ),
    {},
    text,
  );
  await page.evaluate(
    (t) =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === t)
        .click(),
    text,
  );
}
async function noOverflow(page) {
  const result = await page.evaluate(() => ({
    body: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  assert.ok(
    result.body <= result.viewport + 1,
    `Page overflow ${JSON.stringify(result)}`,
  );
}
try {
  const page = await newPage(admin);
  await page.setViewport({ width: 1440, height: 1000 });
  for (const [route, heading] of [
    ["dashboard", "Platform overview"],
    ["users", "Users"],
    ["reviews", "Due diligence"],
    ["agents", "Agent Activity"],
    ["content", "Content moderation"],
    ["payments", "Payments"],
    ["reports", "Reports & Audit"],
    ["settings", "Platform settings"],
    ["profile", "Administrator profile"],
  ]) {
    await go(page, `/admin/${route}`, heading);
    await noOverflow(page);
    checked.push(route);
    if (["dashboard", "users", "reviews"].includes(route))
      await page.screenshot({
        path: path.join(output, `${route}-desktop.png`),
        fullPage: true,
      });
  }
  await go(page, "/admin/reports", "Reports & Audit");
  await page.click('section[aria-label="AI reports"] a[href="/admin/reviews"]');
  await page.waitForFunction(() => [...document.querySelectorAll("details[open] summary")].some(el => el.textContent.includes("Users and results")));
  await go(page, "/admin/reports", "Reports & Audit");
  await page.click('section[aria-label="AI reports"] a[href="/admin/agents?status=completed"]');
  await page.waitForFunction(() => [...document.querySelectorAll("h2")].some(el => el.textContent === "Completed runs"));
  checked.push("report links open visible background results and completed agent runs");
  await go(page, "/admin/settings", "Platform settings");
  await page.click("#registrationOpen");
  await clickText(page, "Save settings");
  await page.waitForFunction(
    () =>
      document
        .querySelector("#registrationOpen")
        ?.getAttribute("data-state") === "unchecked",
  );
  await page.reload({ waitUntil: "networkidle0" });
  assert.equal(
    await page.$eval("#registrationOpen", (el) =>
      el.getAttribute("data-state"),
    ),
    "unchecked",
  );
  assert.equal((await store.getAdminSettings()).registrationOpen, false);
  checked.push("settings persist after cookie-session reload");
  await go(page, "/admin/users", "Users");
  await page.type(
    'input[aria-label="Search name or email…"]',
    "Fixture Investor",
  );
  await clickText(page, "View details");
  await page.waitForSelector('[aria-label="Internal review notes"]');
  await page.$eval('[aria-label="Internal review notes"]', (el) => {
    el.focus();
    el.select();
  });
  await page.keyboard.type("Browser verified review note");
  await clickText(page, "Save review");
  await page.waitForFunction(() =>
    document.body.textContent.includes("Changes saved."),
  );
  assert.equal(
    (await store.listAdminReviews())[0].notes,
    "Browser verified review note",
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  const client = await page.createCDPSession();
  await client.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: output,
  });
  await clickText(page, "Export view");
  checked.push("user detail, review write and CSV download");
  await go(page, "/admin/content", "Content moderation");
  await page.select('[aria-label="Content type"]', "group");
  await clickText(page, "Review content");
  await page.type(
    '[aria-label="Moderation reason"]',
    "Browser fixture moderation",
  );
  await clickText(page, "Hide content");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  assert.equal(await store.findGroupById(group.id), null);
  checked.push("content moderation");
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  });
  for (const route of [
    "dashboard",
    "users",
    "reviews",
    "agents",
    "content",
    "payments",
    "reports",
    "settings",
    "profile",
  ]) {
    await page.goto(`${origin}/admin/${route}`, { waitUntil: "networkidle0" });
    await noOverflow(page);
  }
  await page.goto(`${origin}/admin/dashboard`, { waitUntil: "networkidle0" });
  await page.select('[aria-label="Admin workspace"]', "/admin/settings");
  await page.waitForFunction(
    () => document.querySelector("h1")?.textContent === "Platform settings",
  );
  await page.select('[aria-label="Admin workspace"]', "/admin/dashboard");
  await page.waitForFunction(
    () => document.querySelector("h1")?.textContent === "Platform overview",
  );
  await page.screenshot({
    path: path.join(output, "overview-mobile.png"),
    fullPage: true,
  });
  checked.push("all admin sections at mobile width");
  const financePage = await newPage(await store.findUserById(finance.id));
  await go(financePage, "/admin/settings", "Access restricted");
  assert.equal(
    await financePage.$(
      'nav[aria-label="Admin sections"] a[href="/admin/settings"]',
    ),
    null,
  );
  await go(financePage, "/admin/payments", "Payments");
  await go(financePage, "/admin/reports", "Reports & Audit");
  assert.equal(await financePage.$('section[aria-label="AI reports"]'), null);
  checked.push("finance role navigation and denied settings route");
  const userPage = await newPage(people[0]);
  await go(userPage, "/investor/dashboard", "Investment Dashboard");
  await userPage.goto(`${origin}/investor/groups`, {
    waitUntil: "networkidle0",
  });
  assert.ok(
    !(await userPage.$eval("body", (e) => e.textContent)).includes(
      "Fixture discussion group",
    ),
  );
  checked.push("investor session and moderated group visibility");
  await go(
    userPage,
    `/investor/trainings/${checkoutTraining.id}`,
    "Checkout fixture training",
  );
  await clickText(userPage, "Enroll - $15");
  await clickText(userPage, "Continue to secure payment");
  await clickText(userPage, "Record demo payment");
  await userPage.waitForFunction(
    () => !document.querySelector('[role="dialog"]'),
  );
  assert.ok(
    (await store.listEnrollmentsByUser(people[0].id)).some(
      (e) => e.trainingId === checkoutTraining.id,
    ),
  );
  await userPage.reload({ waitUntil: "networkidle0" });
  await userPage.waitForFunction(() =>
    document.body.textContent.includes("Cancel Enrollment"),
  );
  assert.equal(await userPage.$("#card-number"), null);
  checked.push(
    "paid training checkout with cookie session, explicit demo label and persisted enrollment",
  );
  for(const role of ['investor','startup','advisor']) {
    let account=people[0];
    if(role!=='investor') {
      const created=await store.createUserProfile({fullName:`${role} fixture`,email:`${role}-browser@example.test`,passwordHash:'unused',requestedRoles:[role]});
      await store.updateApproval(created.id,{status:'approved',approvedRoles:[role]});account=await store.findUserById(created.id);
    }
    const rolePage=await newPage(account);
    for(const screen of ['dashboard','analytics','profile','edit-profile']) {
      const before=observedRequests.get(rolePage).length;
      await rolePage.goto(`${origin}/${role}/${screen}`,{waitUntil:'networkidle0'});
      await rolePage.waitForSelector('h1');
      assert.ok(observedRequests.get(rolePage).slice(before).includes(`/api/${role}/profile`),`${role}/${screen} must load data after a cookie-only reload`);
    }
    checked.push(`${role} dashboard, analytics and profile pages load actual API data after refresh`);
  }
  assert.deepEqual(failures, []);
  console.log(
    JSON.stringify(
      { ok: true, checked, browserErrors: failures, screenshots: output },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
