/**
 * Upload documents for existing seeded investor + advisor accounts.
 * Users already exist — this only uploads PDFs and creates application records.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function uploadDoc(store, userId, basePath, filename, key, label) {
  const filePath = join(basePath, filename);
  if (!existsSync(filePath)) return null;
  const buffer = readFileSync(filePath);
  const id = randomUUID();
  const path = `${userId}/${id}`;
  await store.uploadApplicationDocument(path, { buffer, mimetype: "application/pdf", originalname: filename.split("/").pop(), size: buffer.length });
  return { id, path, key, label, name: filename.split("/").pop(), type: "application/pdf", size: buffer.length };
}

async function uploadInvestorDocs(store) {
  const dataDir = join(__dirname, "..", "allfiles", "investors_data");
  const jsonPath = join(dataDir, "investors_dummy_100.json");
  if (!existsSync(jsonPath)) { console.log("  No investor data found."); return; }

  let raw = readFileSync(jsonPath, "utf-8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const investors = JSON.parse(raw);
  let uploaded = 0;

  for (const inv of investors) {
    const user = await store.findUserByEmail(inv.email.toLowerCase());
    if (!user) continue;

    // Check if already has application
    const existing = await store.getProfileApplication(user.id);
    if (existing) continue;

    if (!inv.document_file) continue;

    try {
      const doc = await uploadDoc(store, user.id, dataDir, inv.document_file, "investor.identity", "Investor Identity Document");
      if (doc) {
        await store.upsertProfileApplication(user.id, {
          version: 1, city: inv.city, country: inv.country,
          profiles: { investor: { investorType: inv.investor_type, firmName: inv.company_name } },
          documents: [doc],
        });
        uploaded++;
        if (uploaded % 20 === 0) console.log(`  ... uploaded ${uploaded} investor docs`);
      }
    } catch (err) {
      console.warn(`  Warning: ${inv.full_name}: ${err.message}`);
    }
  }
  console.log(`  Investor docs: ${uploaded} uploaded.`);
}

async function uploadAdvisorDocs(store) {
  const dataDir = join(__dirname, "..", "allfiles", "advisors_data");
  const jsonPath = join(dataDir, "financial_advisors_dummy_100.json");
  if (!existsSync(jsonPath)) { console.log("  No advisor data found."); return; }

  let raw = readFileSync(jsonPath, "utf-8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const advisors = JSON.parse(raw);
  let uploaded = 0;

  for (const adv of advisors) {
    const user = await store.findUserByEmail(adv.email.toLowerCase());
    if (!user) continue;

    const existing = await store.getProfileApplication(user.id);
    if (existing) continue;

    try {
      const documents = [];

      for (const edu of (adv.education || [])) {
        if (edu.document_file) {
          const doc = await uploadDoc(store, user.id, dataDir, edu.document_file, "advisor.qualification", edu.document_label || "Qualification");
          if (doc) documents.push(doc);
        }
      }
      for (const cert of (adv.certifications || [])) {
        if (cert.document_file) {
          const doc = await uploadDoc(store, user.id, dataDir, cert.document_file, "advisor.certification", cert.document_label || "Certificate");
          if (doc) documents.push(doc);
        }
      }
      for (const lic of (adv.licenses || [])) {
        if (lic.document_file) {
          const doc = await uploadDoc(store, user.id, dataDir, lic.document_file, "advisor.license", lic.document_label || "License");
          if (doc) documents.push(doc);
        }
      }
      for (const reg of (adv.regulatory_registrations_entries || [])) {
        if (reg.document_file) {
          const doc = await uploadDoc(store, user.id, dataDir, reg.document_file, "advisor.registration", reg.document_label || "Registration");
          if (doc) documents.push(doc);
        }
      }

      if (documents.length > 0) {
        await store.upsertProfileApplication(user.id, {
          version: 1, city: adv.city, country: adv.country,
          profiles: {
            advisor: {
              title: adv.professional_title,
              specialization: adv.advisory_specialization,
              yearsExperience: adv.years_experience,
            },
          },
          documents,
        });
        uploaded += documents.length;
        if (uploaded % 50 === 0) console.log(`  ... uploaded ${uploaded} advisor docs`);
      }
    } catch (err) {
      console.warn(`  Warning: ${adv.full_name}: ${err.message}`);
    }
  }
  console.log(`  Advisor docs: ${uploaded} uploaded.`);
}

const { store } = await import("./store/index.js");
console.log("Uploading investor documents...");
await uploadInvestorDocs(store);
console.log("Uploading advisor documents...");
await uploadAdvisorDocs(store);
console.log("Done!");
process.exit(0);
