/**
 * profileVerificationService.js
 * AI pipeline that cross-checks an uploaded document against a user's profile claims.
 *
 * Confidence thresholds:
 *   >= 90  → auto-approve (set isVerified = true on profile)
 *   60–89  → manual_review (admin queue)
 *   < 60   → rejected (notify user)
 */

import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { config } from "../config.js";
import { readDocument } from "./documentReaderService.js";

const AUTO_APPROVE_THRESHOLD = 90;
const MANUAL_REVIEW_THRESHOLD = 60;

const anthropicClient = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

const groqClient = config.groqApiKey
  ? new Groq({ apiKey: config.groqApiKey })
  : null;

// --- Prompt builder ---

const DOC_TYPE_LABELS = {
  certificate:   "professional certificate or certification",
  degree:        "academic degree or diploma",
  business_reg:  "business registration or company incorporation document",
  linkedin:      "LinkedIn profile screenshot",
  other:         "professional credential document",
};

function buildPrompt(docText, profile, docType, claimToVerify) {
  const docLabel = DOC_TYPE_LABELS[docType] || "document";

  return `You are a credential verification AI for MoneyMinds, a professional financial platform. A user has uploaded a ${docLabel} to verify their profile.

DOCUMENT CONTENT (extracted text):
"""
${docText || "(no text could be extracted)"}
"""

USER PROFILE CLAIMS:
- Name: ${profile.name || "Not provided"}
- Title / Role: ${profile.title || "Not provided"}
- Company / Organisation: ${profile.company || "Not provided"}
- Certifications claimed: ${profile.certifications || "Not provided"}
- Years of experience: ${profile.yearsExperience || "Not provided"}
- Claim being verified: "${claimToVerify}"

TASK:
1. Read the document text carefully.
2. Check whether the document supports the claim being verified and is consistent with the profile.
3. Extract any key facts from the document (name on document, issuing body, date issued, credential title).
4. Return ONLY a valid JSON object — no markdown fences, no extra text outside the JSON.

JSON STRUCTURE:
{
  "verified": <true | false>,
  "confidence": <integer 0-100>,
  "reasoning": "<one or two sentences explaining your decision>",
  "extracted": {
    "name_on_doc": "<name found in document or null>",
    "issuer": "<issuing organisation or null>",
    "credential_title": "<title or degree or cert name or null>",
    "issue_date": "<date string or null>",
    "matches_claim": <true | false>
  }
}

DECISION RULES:
- confidence >= 90: document clearly and directly proves the claimed credential
- confidence 60-89: document is related but there are minor inconsistencies or missing details
- confidence < 60: document does not support the claim, is unreadable, or appears unrelated
- If the extracted name does not match the profile name, lower confidence significantly
- If no text was extracted, set confidence to 0 and verified to false`;
}

// --- AI provider callers ---

async function callGroq(prompt) {
  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.1,
  });
  return completion.choices[0]?.message?.content ?? null;
}

async function callAnthropic(prompt) {
  const message = await anthropicClient.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0]?.text ?? null;
}

function getProviderChain() {
  const providers = [];
  const setting = (config.aiProvider || "auto").toLowerCase();

  if (setting === "groq" && groqClient) {
    providers.push({ name: "groq", call: callGroq });
  } else if (setting === "anthropic" && anthropicClient) {
    providers.push({ name: "anthropic", call: callAnthropic });
  } else {
    if (groqClient) providers.push({ name: "groq", call: callGroq });
    if (anthropicClient) providers.push({ name: "anthropic", call: callAnthropic });
  }

  return providers;
}

function parseAIResponse(text) {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Determine the outcome status based on confidence score.
 */
function outcomeFromConfidence(confidence) {
  if (confidence >= AUTO_APPROVE_THRESHOLD) return "verified";
  if (confidence >= MANUAL_REVIEW_THRESHOLD) return "manual_review";
  return "rejected";
}

/**
 * Run the full verification pipeline for one document.
 *
 * @param {object} params
 * @param {string}  params.verificationId  - record ID in profile_verifications
 * @param {Buffer}  params.fileBuffer      - raw file bytes
 * @param {string}  params.mimeType        - e.g. "application/pdf"
 * @param {string}  params.docType         - certificate | degree | business_reg | linkedin | other
 * @param {string}  params.claimToVerify   - text description of what is being verified
 * @param {object}  params.userProfile     - { name, title, company, certifications, yearsExperience }
 * @param {string}  params.userId
 * @param {object}  params.store           - active data store
 */
export async function runVerification({
  verificationId,
  fileBuffer,
  mimeType,
  docType,
  claimToVerify,
  userProfile,
  userId,
  store,
}) {
  console.log(`[ProfileVerification] Starting for verification ${verificationId}`);

  try {
    // Mark as analyzing
    await store.updateProfileVerification(verificationId, { status: "analyzing" });

    // Step 1: Extract text from document
    let docText = "";
    let readMethod = "unknown";
    try {
      const result = await readDocument(fileBuffer, mimeType);
      docText = result.text;
      readMethod = result.method;
      console.log(`[ProfileVerification] Extracted ${docText.length} chars via ${readMethod}`);
    } catch (readErr) {
      console.warn(`[ProfileVerification] Document read failed: ${readErr.message}`);
      // Continue with empty text — AI will return low confidence
    }

    // Step 2: AI cross-check
    const providers = getProviderChain();
    if (providers.length === 0) {
      console.warn("[ProfileVerification] No AI provider configured.");
      await store.updateProfileVerification(verificationId, { status: "manual_review", aiReasoning: "No AI provider available — manual review required." });
      return;
    }

    const prompt = buildPrompt(docText, userProfile, docType, claimToVerify);

    let rawText = null;
    for (const provider of providers) {
      try {
        rawText = await provider.call(prompt);
        if (rawText) break;
      } catch (err) {
        console.warn(`[ProfileVerification] ${provider.name} failed: ${err.message}`);
      }
    }

    if (!rawText) {
      await store.updateProfileVerification(verificationId, { status: "manual_review", aiReasoning: "All AI providers failed — manual review required." });
      return;
    }

    // Step 3: Parse result
    let report;
    try {
      report = parseAIResponse(rawText);
    } catch (parseErr) {
      console.error(`[ProfileVerification] Parse failed: ${parseErr.message}`);
      await store.updateProfileVerification(verificationId, { status: "manual_review", aiReasoning: "AI response could not be parsed — manual review required." });
      return;
    }

    const confidence = Math.max(0, Math.min(100, report.confidence ?? 0));
    const status = outcomeFromConfidence(confidence);

    // Step 4: Save result
    await store.updateProfileVerification(verificationId, {
      status,
      aiConfidence: confidence,
      aiReasoning: report.reasoning || "",
      aiExtracted: report.extracted || {},
    });

    // Step 5: If auto-approved, mark profile as verified
    if (status === "verified") {
      await store.setProfileVerified(userId, verificationId);
      console.log(`[ProfileVerification] Auto-approved ${verificationId} (confidence: ${confidence}%)`);
    } else {
      console.log(`[ProfileVerification] Status: ${status} (confidence: ${confidence}%) — ${report.reasoning}`);
    }
  } catch (err) {
    console.error(`[ProfileVerification] Unexpected error for ${verificationId}:`, err.message);
    try {
      await store.updateProfileVerification(verificationId, { status: "manual_review", aiReasoning: "Unexpected error — manual review required." });
    } catch { /* ignore */ }
  }
}
