import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    throw new Error("SHOPIFY_API_SECRET is required for token encryption");
  }
  // SHA-256 hash of the secret to ensure exactly 32 bytes for AES-256
  const { createHash } = require("node:crypto");
  return createHash("sha256").update(secret).digest();
}

/**
 * AES-256-GCM でアクセストークンを暗号化する。
 * 返り値は `iv:authTag:encrypted` のBase64形式。
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // iv + authTag + encrypted を単一バッファにまとめてBase64化
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * AES-256-GCM で暗号化されたトークンを復号する。
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(ciphertext, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
