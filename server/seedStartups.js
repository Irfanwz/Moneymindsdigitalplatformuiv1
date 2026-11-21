/**
 * Seed 100 dummy startup accounts from allfiles/ seed data.
 *
 * Usage — called automatically from index.js after seedDemoProfiles,
 *         OR run standalone:  node server/seedStartups.js
 *
 * What it does:
 *   1. Creates platform_users (status = approved, role = startup)
 *   2. Creates matching startup_profiles with full company data
 *   3. Uploads pitch deck + registration evidence PDFs to storage
 *   4. Creates profile_applications with document references
 *   5. Skips any user whose email already exists (safe to re-run)
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, "..", "allfiles", "MoneyMinds_100_Startup_Seed_Data (1)");
const SEED_PATH = join(SEED_DIR, "startups_seed.json");
const DOCS_DIR = join(SEED_DIR, "documents");

/** Map CSV stage labels → values your store/form expects */
function normalizeStage(raw) {
  const map = {
    "pre-seed": "pre-seed",
    "seed": "seed",
    "series a": "series-a",
    "series b+": "series-b",
    "growth": "growth",
  };
  return map[(raw || "").toLowerCase()] || "pre-seed";
}

/** Format dollar amounts like the existing seed data */
function formatUSD(amount) {
  if (!amount) return "";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

/**
 * Upload a PDF from the seed documents folder and return its document record.
 */
async function uploadDocument(store, userId, filename, key, label) {
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) return null;

  const buffer = readFileSync(filePath);
  const id = randomUUID();
  const path = `${userId}/${id}`;

  const file = {
    buffer,
    mimetype: "application/pdf",
    originalname: filename,
    size: buffer.length,
  };

  await store.uploadApplicationDocument(path, file);

  return {
    id,
    path,
    key,
    label,
    name: filename,
    type: "application/pdf",
    size: buffer.length,
  };
}

export async function seedStartupAccounts(store) {
  let raw;
  try {
    raw = readFileSync(SEED_PATH, "utf-8");
  } catch {
    console.log("  Startup seed file not found — skipping bulk seed.");
    return { created: 0, skipped: 0 };
  }

  // Strip BOM if present
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const startups = JSON.parse(raw);

  const passwordHash = await hashPassword("MoneyMinds@Test2026");
  const hasDocuments = existsSync(DOCS_DIR);
  const hasUploadFn = typeof store.uploadApplicationDocument === "function";
  const hasAppFn = typeof store.saveProfileApplicationDirect === "function" ||
                   typeof store.createProfileApplication === "function";
  let created = 0;
  let skipped = 0;
  let docsUploaded = 0;

  for (const s of startups) {
    // Skip if already seeded
    const existing = await store.findUserByEmail(s.email.toLowerCase());
    if (existing) {
      skipped++;
      continue;
    }

    // 1. Create user account
    const user = await store.createUserProfile({
      fullName: s.full_name,
      email: s.email.toLowerCase(),
      passwordHash,
      phone: s.phone || "",
      location: `${s.city}, ${s.country}`,
      bio: s.purpose_of_joining || "",
      requestedRoles: ["startup"],
    });

    // 2. Approve immediately
    await store.updateApproval(user.id, {
      status: "approved",
      approvedRoles: ["startup"],
      adminNotes: "Bulk-seeded startup account",
      approvedBy: null,
    });

    // 3. Create startup profile
    await store.upsertStartupProfile(user.id, {
      companyName: s.company_name,
      tagline: `${s.position} at ${s.company_name}`,
      industry: s.industry,
      foundedYear: s.founding_year || null,
      location: `${s.city}, ${s.country}`,
      description: s.company_description || "",
      website: s.company_website || "",
      linkedin: s.company_linkedin || "",
      twitter: "",
      contactEmail: s.email,
      stage: normalizeStage(s.startup_stage),
      totalRaised: formatUSD(s.funding_raised_usd),
      fundingGoal: formatUSD(s.funding_sought_usd),
      valuation: "",
      pitch: s.purpose_of_joining || "",
      categories: [s.industry],
      teamMembers: (s.team_members || []).map((m) => ({
        name: m.name,
        role: m.role,
        linkedin: m.linkedin || "",
      })),
      isPublic: true,
      showContactInfo: true,
      allowAdvisorInvitations: true,
    });

    // 4. Upload documents and create application record
    if (hasDocuments && hasUploadFn) {
      try {
        const documents = [];

        // Upload pitch deck
        if (s.pitch_deck_file) {
          const doc = await uploadDocument(
            store, user.id, s.pitch_deck_file,
            "startup.pitchDeck", "Pitch Deck"
          );
          if (doc) documents.push(doc);
        }

        // Upload business registration evidence
        if (s.registration_evidence_file) {
          const doc = await uploadDocument(
            store, user.id, s.registration_evidence_file,
            "startup.registrationEvidence", "Business Registration Evidence"
          );
          if (doc) documents.push(doc);
        }

        // Save application record (with document references)
        if (documents.length > 0) {
          const application = {
            version: 1,
            city: s.city,
            country: s.country,
            profiles: {
              startup: {
                companyName: s.company_name,
                industry: s.industry,
                stage: normalizeStage(s.startup_stage),
                description: s.company_description || "",
                website: s.company_website || "",
                linkedin: s.company_linkedin || "",
                foundingYear: String(s.founding_year || ""),
                teamSize: String(s.team_size || ""),
                fundingRaised: String(s.funding_raised_usd || ""),
                fundingSought: String(s.funding_sought_usd || ""),
                businessRegistration: s.business_registration || "",
                businessRegistrationNumber: s.business_registration_number || "",
                registrationAuthorityJurisdiction: s.registration_authority_jurisdiction || "",
                teamMembers: (s.team_members || []).map((m) => ({
                  id: randomUUID(),
                  name: m.name,
                  role: m.role,
                  linkedin: m.linkedin || "",
                })),
              },
            },
            documents,
          };

          // Save application record so due diligence agent can find the docs
          await store.upsertProfileApplication(user.id, application);
          docsUploaded += documents.length;
        }
      } catch (err) {
        // Documents are non-critical — log and continue
        console.warn(`  Warning: could not upload docs for ${s.company_name}: ${err.message}`);
      }
    }

    created++;
    if (created % 20 === 0) console.log(`  ... seeded ${created} startup accounts`);
  }

  console.log(`  Startup bulk seed done: ${created} created, ${skipped} already existed, ${docsUploaded} documents uploaded.`);
  return { created, skipped, docsUploaded };
}

// Allow standalone execution: node server/seedStartups.js
if (process.argv[1] && process.argv[1].includes("seedStartups")) {
  (async () => {
    const { store } = await import("./store/index.js");
    await seedStartupAccounts(store);
    process.exit(0);
  })();
}
