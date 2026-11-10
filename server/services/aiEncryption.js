/**
 * AES-256-GCM encryption for AI provider API keys stored in the database.
 * Keys are never stored in plain text — only the encrypted ciphertext is persisted.
 *
 * The encryption key is derived from AI_CONFIG_ENCRYPTION_KEY env var.
 * Falls back to a scrypt derivation of JWT_SECRET if not set, so the system
 * works out of the box in development without an extra env var.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 12;   // 96-bit IV recommended for GCM
const TAG_LEN = 16;

function deriveKey() {
  const raw = process.env.AI_CONFIG_ENCRYPTION_KEY;
  if (raw && raw.length >= 32) {
    return /^[a-f0-9]{64}$/i.test(raw)
      ? Buffer.from(raw, "hex")
      : scryptSync(raw, "moneyminds-ai-config-v1", KEY_LEN);
  }
  // Derive from JWT_SECRET using scrypt — deterministic, no salt stored needed
  const secret = process.env.JWT_SECRET ?? "moneyminds-dev-secret";
  return scryptSync(secret, "moneyminds-ai-config-v1", KEY_LEN);
}

// Lazy singleton — derived once per process
let _key = null;
function getKey() {
  if (!_key) _key = deriveKey();
  return _key;
}

/**
 * Encrypt a plain-text API key.
 * Returns a base64 string: <iv (12 bytes)><tag (16 bytes)><ciphertext>
 */
export function encryptKey(plaintext) {
  if (!plaintext) return null;
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypt a previously encrypted key string.
 * Returns the original plain-text API key, or null on failure.
 */
export function decryptKey(ciphertext) {
  if (!ciphertext) return null;
  try {
    const key = getKey();
    const buf = Buffer.from(ciphertext, "base64");
    const iv  = buf.slice(0, IV_LEN);
    const tag = buf.slice(IV_LEN, IV_LEN + TAG_LEN);
    const enc = buf.slice(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(enc) + decipher.final("utf8");
  } catch {
    // The settings resolver treats decryption failure as a configuration error.
    return null;
  }
}

/**
 * Mask a plain-text key for safe display in the UI.
 * "sk-gsk_abc123XYZ" → "sk-g...XYZ"
 */
export function maskKey(plaintext) {
  if (!plaintext || plaintext.length < 8) return "***";
  return `${plaintext.slice(0, 4)}...${plaintext.slice(-3)}`;
}
