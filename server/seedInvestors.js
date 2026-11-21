/**
 * Seed 100 dummy investor accounts from allfiles/ seed data.
 * Uploads investor identity documents to Supabase Storage.
 * Safe to re-run: skips emails that already exist.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "allfiles", "investors_data");
const JSON_PATH = join(DATA_DIR, "investors_dummy_100.json");
const DOCS_DIR = DATA_DIR;  // doc paths already include "documents/" prefix

function formatUSD(amount) {
  if (!amount) return "";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function normalizeStage(raw) {
  const map = {
    "pre-seed": "pre-seed", "seed": "seed", "early stage": "seed",
    "series a": "series-a", "series b": "series-b", "series b+": "series-b",
    "growth": "growth", "late stage": "growth",
  };
  return (raw || "").split(",").map(s => map[s.trim().toLowerCase()] || s.trim().toLowerCase()).join(", ");
}

async function uploadDoc(store, userId, filename, key, label) {
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) return null;
  const buffer = readFileSync(filePath);
  const id = randomUUID();
  const path = `${userId}/${id}`;
  await store.uploadApplicationDocument(path, { buffer, mimetype: "application/pdf", originalname: filename, size: buffer.length });
  return { id, path, key, label, name: filename, type: "application/pdf", size: buffer.length };
}

export async function seedInvestorAccounts(store) {
  let raw;
  try { raw = readFileSync(JSON_PATH, "utf-8"); } catch {
    console.log("  Investor seed file not found — skipping.");
    return { created: 0, skipped: 0 };
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const investors = JSON.parse(raw);
  const passwordHash = await hashPassword("Test@12345");
  const hasDocs = existsSync(DOCS_DIR);
  let created = 0, skipped = 0, docsUploaded = 0;

  for (const inv of investors) {
    const existing = await store.findUserByEmail(inv.email.toLowerCase());
    if (existing) { skipped++; continue; }

    const user = await store.createUserProfile({
      fullName: inv.full_name,
      email: inv.email.toLowerCase(),
      passwordHash,
      phone: inv.phone || "",
      location: `${inv.city}, ${inv.country}`,
      bio: inv.introduction || "",
      requestedRoles: ["investor"],
    });

    await store.updateApproval(user.id, {
      status: "approved",
      approvedRoles: ["investor"],
      adminNotes: "Bulk-seeded investor account",
      approvedBy: null,
    });

    const industries = (inv.preferred_industries || "").split(",").map(s => s.trim()).filter(Boolean);

    await store.upsertInvestorProfile(user.id, {
      investorType: (inv.investor_type || "angel").toLowerCase(),
      preferredStage: normalizeStage(inv.preferred_stages),
      minInvestment: formatUSD(inv.min_investment_usd),
      maxInvestment: formatUSD(inv.max_investment_usd),
      portfolioSize: "",
      investmentThesis: inv.introduction || "",
      industries,
      otherInterests: "",
      geographicFocus: inv.country || "",
      firmName: inv.company_name || "",
      title: inv.occupation || "",
      website: inv.website || "",
      linkedin: inv.linkedin_url || "",
      twitter: "",
      contactEmail: inv.email,
      bio: inv.introduction || "",
      isPrivate: false,
      anonymousBrowsing: false,
      showInvestmentPreferences: true,
      allowConnectionRequests: true,
      showContactInfo: true,
    });

    // Upload document if available
    if (hasDocs && inv.document_file) {
      try {
        const documents = [];
        const doc = await uploadDoc(store, user.id, inv.document_file, "investor.identity", "Investor Identity Document");
        if (doc) { documents.push(doc); docsUploaded++; }
        if (documents.length > 0) {
          await store.upsertProfileApplication(user.id, {
            version: 1, city: inv.city, country: inv.country,
            profiles: { investor: { investorType: inv.investor_type, firmName: inv.company_name, occupation: inv.occupation } },
            documents,
          });
        }
      } catch (err) {
        console.warn(`  Warning: docs for ${inv.full_name}: ${err.message}`);
      }
    }

    created++;
    if (created % 20 === 0) console.log(`  ... seeded ${created} investor accounts`);
  }

  console.log(`  Investor seed done: ${created} created, ${skipped} existed, ${docsUploaded} docs uploaded.`);
  return { created, skipped, docsUploaded };
}

if (process.argv[1]?.includes("seedInvestors")) {
  (async () => {
    const { store } = await import("./store/index.js");
    await seedInvestorAccounts(store);
    process.exit(0);
  })();
}
