// Isolated end-to-end check: real application and PDF reader, mocked provider HTTP.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import puppeteer from "puppeteer";
import PDFDocument from "pdfkit";
process.env.NODE_ENV = "test";
process.env.EMAIL_OTP_ENABLED = "false";
for (const key of Object.keys(process.env))
  if (/SUPABASE|SENDGRID|API_KEY|STRIPE/.test(key)) delete process.env[key];
const [
  { createApp },
  { createMemoryStore },
  { createToken },
  { config },
  { registrationSchema, buildRegistrationProfiles },
  express,
] = await Promise.all([
  import("../server/app.js"),
  import("../server/store/memoryStore.js"),
  import("../server/auth.js"),
  import("../server/config.js"),
  import("../server/registration.js"),
  import("express"),
]);
config.groqApiKey = "isolated-fixture";
config.anthropicApiKey = "";
config.aiProvider = "groq";
config.tavilyApiKey = "isolated-fixture";
let modelRequests = 0;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  const body = JSON.parse(init?.body || (await input.text()));
  if (url === "https://api.tavily.com/search")
    return Response.json({
      results: [
        {
          title: "Synthetic professional listing",
          url: "https://evidence.example.test/person",
          content: "Browser Applicant is a financial advisor.",
          score: 0.9,
        },
      ],
    });
  if (url === "https://api.groq.com/openai/v1/chat/completions") {
    modelRequests++;
    const prompt = JSON.parse(body.messages[1].content);
    const checks = prompt.fields.map((f) => ({
      fieldId: f.id,
      status: "insufficient_evidence",
      reasoning: "Synthetic provider: more evidence is needed.",
      evidence: [],
    }));
    return Response.json({
      choices: [{ message: { content: JSON.stringify({ checks }) } }],
    });
  }
  throw new Error(
    "Unexpected external request in isolated due diligence check",
  );
};
const store = createMemoryStore(),
  app = createApp(store, { backgroundJobs: false });
const admin = await store.ensureAdminAccount({
  fullName: "Review Admin",
  email: "admin@example.test",
  passwordHash: "unused",
});
const profileData = {
  startup: {
    companyName: "Browser Company",
    applicantPosition: "Founder",
    industry: "Technology",
    stage: "Seed",
    description: "We build useful business accounting software.",
    joiningPurpose: "Find advisors",
    businessRegistrationStatus: "Not registered",
  },
  investor: {
    investorType: "Individual",
    title: "Engineer",
    investmentThesis: "Support young technology businesses",
  },
  advisor: {
    title: "Financial Advisor",
    bio: "Independent financial professional",
    specialization: "Planning",
    yearsExperience: "5",
    linkedin: "https://www.linkedin.com/in/browser-applicant",
    employmentStatus: "No previous employment",
    educationStatus: "Qualified",
    education: [
      {
        id: "edu1",
        qualification: "Finance degree",
        institution: "Browser University",
        year: "2020",
      },
    ],
    certificationStatus: "None",
    licenseStatus: "Not applicable",
    regulatoryStatus: "Not applicable",
  },
};
const pdf = new PDFDocument(),
  chunks = [];
const pdfBuffer = new Promise((resolve) => {
  pdf.on("data", (c) => chunks.push(c));
  pdf.on("end", () => resolve(Buffer.concat(chunks)));
});
pdf.text(
  "Synthetic test evidence: Browser Applicant, Finance degree, Browser University, 2020.",
);
pdf.end();
async function applicant(roles, approved = false) {
  const id = randomUUID(),
    hasDoc = roles.includes("advisor");
  const data = registrationSchema.parse({
    fullName: "Browser Applicant",
    email: `${id}@example.test`,
    password: "Fixture-Password-123",
    phone: "+923001234567",
    city: "Lahore",
    country: "Pakistan",
    requestedRoles: roles,
    profiles: Object.fromEntries(roles.map((r) => [r, profileData[r]])),
    attachments: hasDoc ? [{ key: "advisor.education.edu1" }] : [],
  });
  const documents = hasDoc
    ? [
        {
          id: randomUUID(),
          key: "advisor.education.edu1",
          path: `${id}/evidence`,
          name: "Synthetic qualification.pdf",
          label: "Education evidence",
          type: "application/pdf",
        },
      ]
    : [];
  if (hasDoc)
    await store.uploadApplicationDocument(documents[0].path, {
      buffer: await pdfBuffer,
    });
  await store.createProfileApplication(
    {
      id,
      fullName: data.fullName,
      email: data.email,
      passwordHash: "unused",
      phone: data.phone,
      location: "Lahore, Pakistan",
      requestedRoles: roles,
    },
    buildRegistrationProfiles(data),
    {
      version: 1,
      city: data.city,
      country: data.country,
      profiles: data.profiles,
      documents,
    },
  );
  if (approved)
    await store.updateApproval(id, {
      status: "approved",
      approvedRoles: roles,
    });
  return store.findUserById(id);
}
const pending = await applicant(["startup", "investor", "advisor"]);
app.use(express.default.static(path.resolve("dist")));
app.get("/{*splat}", (_req, res) =>
  res.sendFile(path.resolve("dist/index.html")),
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const output = path.resolve("docs/due-diligence-validation");
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox"],
});
const page = await browser.newPage(),
  errors = [],
  checked = [];
page.on("pageerror", (error) => errors.push(error.message));
async function login(user, route) {
  await page.setCookie({
    name: "mm_token",
    value: createToken(user),
    url: origin,
    httpOnly: true,
    sameSite: "Strict",
  });
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle0" });
}
async function button(text) {
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll("button")].some(
        (b) => b.textContent.trim() === label && !b.disabled,
      ),
    {},
    text,
  );
  const handle = await page.evaluateHandle(
    (label) =>
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === label,
      ),
    text,
  );
  await handle.asElement().click();
  await handle.dispose();
}
try {
  await page.setViewport({ width: 1365, height: 1000 });
  await login(admin, `/admin/agents?user=${pending.id}`);
  await button("Profile due diligence");
  await button("Result");
  await page.waitForSelector(
    'select[aria-label="Filter due diligence checks"]',
  );
  const report = (
    await store.listAgentRuns({ userId: pending.id, agentKey: "due-diligence" })
  )[0];
  assert.equal(report.status, "completed");
  assert.deepEqual(report.result.roles, ["startup", "investor", "advisor"]);
  assert.equal(report.result.documents[0].status, "read");
  assert.equal((await store.findUserById(pending.id)).status, "pending");
  assert.ok(modelRequests > 0);
  await page.select(
    'select[aria-label="Filter due diligence checks"]',
    "manual_review",
  );
  await page.waitForFunction(() =>
    document.body.textContent.includes("Phone number"),
  );
  await page.$eval('select[aria-label="Filter due diligence checks"]', (el) =>
    el.scrollIntoView({ block: "start" }),
  );
  await page.screenshot({ path: path.join(output, "admin-due-diligence.png") });
  checked.push(
    "Admin runs all-role due diligence before approval; saved report includes a real parsed PDF and filterable field results",
  );
  await page.setViewport({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 2,
    ),
    false,
    "No horizontal overflow at mobile width",
  );
  await page.screenshot({
    path: path.join(output, "mobile-due-diligence.png"),
  });
  checked.push("Mobile report layout fits the viewport");
  for (const role of ["startup", "investor", "advisor"]) {
    const owner = await applicant([role], true);
    await login(owner, "/activity");
    await button("Run profile due diligence");
    await button("Result");
    await page.waitForSelector(
      'select[aria-label="Filter due diligence checks"]',
    );
    const [run] = await store.listAgentRuns({
      userId: owner.id,
      agentKey: "due-diligence",
    });
    assert.equal(run.status, "completed");
    assert.deepEqual(run.result.roles, [role]);
    checked.push(`Approved ${role} starts and reads their own report`);
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { ok: true, checked, mockedModelRequests: modelRequests, output },
      null,
      2,
    ),
  );
} catch (error) {
  await page.screenshot({
    path: path.join(output, "failure.png"),
    fullPage: true,
  });
  console.error(
    (await page.$eval("body", (body) => body.innerText)).slice(-6000),
  );
  throw error;
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
