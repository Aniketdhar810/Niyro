// src/utils/encrypt.js
// AES-256-GCM encryption/decryption helpers using a key from .env
// The key must be a 32‑byte (256‑bit) base64 string or 64‑character hex string.
import crypto from 'crypto';

// Helper to parse the ENCRYPTION_KEY environment variable
let keyCache = null;

function getKey() {
  if (keyCache) return keyCache;
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required for token encryption');
  }
  // Accept base64 or hex representation
  const buffer = Buffer.from(
    rawKey,
    rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey) ? 'hex' : 'base64'
  );
  if (buffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must resolve to 32 bytes (256 bits)');
  }
  keyCache = buffer;
  return keyCache;
}

const algorithm = 'aes-256-gcm';

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96‑bit IV recommended for GCM
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store iv:authTag:ciphertext in base64 for easy transport
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(ciphertext) {
  const [ivB64, tagB64, dataB64] = ciphertext.split(':');
  if (!ivB64 || !tagB64 || !dataB64) return null;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
