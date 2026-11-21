/**
 * Seed 100 dummy financial advisor accounts from allfiles/ seed data.
 * Uploads qualification, certificate, license, and registration PDFs.
 * Safe to re-run: skips emails that already exist.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "allfiles", "advisors_data");
const JSON_PATH = join(DATA_DIR, "financial_advisors_dummy_100.json");
const DOCS_DIR = DATA_DIR;  // doc paths already include "documents/" prefix

async function uploadDoc(store, userId, filename, key, label) {
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) return null;
  const buffer = readFileSync(filePath);
  const id = randomUUID();
  const path = `${userId}/${id}`;
  await store.uploadApplicationDocument(path, { buffer, mimetype: "application/pdf", originalname: filename.split("/").pop(), size: buffer.length });
  return { id, path, key, label, name: filename.split("/").pop(), type: "application/pdf", size: buffer.length };
}

export async function seedAdvisorAccounts(store) {
  let raw;
  try { raw = readFileSync(JSON_PATH, "utf-8"); } catch {
    console.log("  Advisor seed file not found — skipping.");
    return { created: 0, skipped: 0 };
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const advisors = JSON.parse(raw);
  const passwordHash = await hashPassword("Test@12345");
  const hasDocs = existsSync(DOCS_DIR);
  let created = 0, skipped = 0, docsUploaded = 0;

  for (const adv of advisors) {
    const existing = await store.findUserByEmail(adv.email.toLowerCase());
    if (existing) { skipped++; continue; }

    const user = await store.createUserProfile({
      fullName: adv.full_name,
      email: adv.email.toLowerCase(),
      passwordHash,
      phone: adv.phone || "",
      location: `${adv.city}, ${adv.country}`,
      bio: adv.professional_biography || "",
      requestedRoles: ["advisor"],
    });

    await store.updateApproval(user.id, {
      status: "approved",
      approvedRoles: ["advisor"],
      adminNotes: "Bulk-seeded advisor account",
      approvedBy: null,
    });

    // Build specialization areas from advisory_specialization
    const specializations = (adv.advisory_specialization || "").split(",").map(s => s.trim()).filter(Boolean);
    const expertiseAreas = specializations.map((area, i) => ({
      area,
      level: Math.max(70, 95 - i * 5),
    }));

    // Build certifications from certifications array
    const certifications = (adv.certifications || []).map(c => ({
      name: c.certification_name || "",
      issuer: c.issuer || "",
      year: String(c.year_obtained || ""),
    }));

    // Build previous roles from work history
    const previousRoles = (adv.work_history_entries || [])
      .map(w => `${w.role} at ${w.employer} (${w.start_year}–${w.end_year || "present"})`)
      .join("\n");

    // Extract first license info
    const license = (adv.licenses || [])[0];
    const registration = (adv.regulatory_registrations_entries || [])[0];
    const education = (adv.education || [])[0];

    await store.upsertAdvisorProfile(user.id, {
      title: adv.professional_title || "",
      bio: adv.professional_biography || "",
      website: adv.website || "",
      linkedin: adv.linkedin_url || "",
      twitter: "",
      contactEmail: adv.email,
      yearsExperience: adv.years_experience || 0,
      clientsHelped: 0,
      specialization: specializations[0] || "",
      previousRoles,
      expertiseAreas,
      certifications,
      industries: specializations.slice(0, 4),
      preferredStage: "all",
      engagementType: "both",
      availability: "available",
      typicalRate: "",
      servicesOffered: specializations.join(", "),
      regulatoryLicenseNo: license?.license_number || "",
      regulatoryBody: license?.issuing_authority || "",
      licenseExpiryDate: license?.expiry_date || "",
      educationUniversity: education?.institution || "",
      educationDegree: education?.qualification || "",
      educationYear: String(education?.completion_year || ""),
      previousFirm: (adv.work_history_entries || [])[0]?.employer || "",
      previousRole: (adv.work_history_entries || [])[0]?.role || "",
      previousFirmDuration: "",
      primaryTickers: [],
      languages: [],
      conflictDisclosure: false,
      performanceClaim: "",
      defaultGroupType: "free",
      defaultJoiningFee: "",
      defaultMonthlyFee: "",
      autoApproveMembers: true,
      allowGroupDiscovery: true,
      enablePaymentProcessing: false,
      paymentEmail: "",
      taxId: "",
      isPublic: true,
      showContactInfo: true,
      allowConnectionRequests: true,
      showTestimonials: true,
    });

    // Upload all documents (qualifications, certificates, licenses, registrations)
    if (hasDocs) {
      try {
        const documents = [];

        for (const edu of (adv.education || [])) {
          if (edu.document_file) {
            const doc = await uploadDoc(store, user.id, edu.document_file, "advisor.qualification", edu.document_label || "Qualification");
            if (doc) documents.push(doc);
          }
        }
        for (const cert of (adv.certifications || [])) {
          if (cert.document_file) {
            const doc = await uploadDoc(store, user.id, cert.document_file, "advisor.certification", cert.document_label || "Certificate");
            if (doc) documents.push(doc);
          }
        }
        for (const lic of (adv.licenses || [])) {
          if (lic.document_file) {
            const doc = await uploadDoc(store, user.id, lic.document_file, "advisor.license", lic.document_label || "License");
            if (doc) documents.push(doc);
          }
        }
        for (const reg of (adv.regulatory_registrations_entries || [])) {
          if (reg.document_file) {
            const doc = await uploadDoc(store, user.id, reg.document_file, "advisor.registration", reg.document_label || "Registration");
            if (doc) documents.push(doc);
          }
        }

        if (documents.length > 0) {
          docsUploaded += documents.length;
          await store.upsertProfileApplication(user.id, {
            version: 1, city: adv.city, country: adv.country,
            profiles: {
              advisor: {
                title: adv.professional_title,
                specialization: adv.advisory_specialization,
                yearsExperience: adv.years_experience,
                workHistory: adv.work_history_entries || [],
                education: adv.education || [],
                certifications: adv.certifications || [],
                licenses: adv.licenses || [],
                registrations: adv.regulatory_registrations_entries || [],
              },
            },
            documents,
          });
        }
      } catch (err) {
        console.warn(`  Warning: docs for ${adv.full_name}: ${err.message}`);
      }
    }

    created++;
    if (created % 20 === 0) console.log(`  ... seeded ${created} advisor accounts`);
  }

  console.log(`  Advisor seed done: ${created} created, ${skipped} existed, ${docsUploaded} docs uploaded.`);
  return { created, skipped, docsUploaded };
}

if (process.argv[1]?.includes("seedAdvisors")) {
  (async () => {
    const { store } = await import("./store/index.js");
    await seedAdvisorAccounts(store);
    process.exit(0);
  })();
}
