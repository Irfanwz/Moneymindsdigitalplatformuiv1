/**
 * documentReaderService.js
 * Extracts readable text from uploaded documents (PDF or image).
 * - PDF  → pdf-parse (pure JS, no binary deps)
 * - Image → Claude Vision API (base64 encode → multimodal message)
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const PDF_MIME_TYPE = "application/pdf";

const anthropicClient = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

/**
 * Extract text from a PDF buffer using pdf-parse.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractFromPdf(buffer) {
  const { default: pdfParse } = await import("pdf-parse");
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

/**
 * Extract text from an image buffer by sending it to Claude Vision.
 * @param {Buffer} buffer
 * @param {string} mimeType  e.g. "image/jpeg"
 * @returns {Promise<string>}
 */
async function extractFromImage(buffer, mimeType) {
  if (!anthropicClient) {
    throw new Error("ANTHROPIC_API_KEY is required for image document reading.");
  }

  const base64 = buffer.toString("base64");

  const message = await anthropicClient.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType, data: base64 },
          },
          {
            type: "text",
            text: "Extract and return all readable text from this document image. Include names, dates, titles, institutions, and any other legible information. Return only the extracted text — no commentary.",
          },
        ],
      },
    ],
  });

  return (message.content[0]?.text || "").trim();
}

/**
 * Main entry point — reads a document buffer and returns its text content.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<{ text: string, method: string }>}
 */
export async function readDocument(buffer, mimeType) {
  const type = (mimeType || "").toLowerCase();

  if (type === PDF_MIME_TYPE) {
    const text = await extractFromPdf(buffer);
    return { text, method: "pdf-parse" };
  }

  if (IMAGE_MIME_TYPES.includes(type)) {
    const text = await extractFromImage(buffer, type);
    return { text, method: "claude-vision" };
  }

  throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF, JPG, or PNG.`);
}
