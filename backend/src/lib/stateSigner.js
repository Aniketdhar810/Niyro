// src/lib/stateSigner.js
// Signed JWT state token for the Google OAuth2 flow (Calendar/Gmail scopes).
// The state token embeds {uid, nonce} and is HMAC-signed with a server secret.
// No in-memory nonce store — the JWT's short expiry (5 min) provides replay protection.
// The callback verifies the JWT signature and expiry; a consumed nonce is not tracked
// because the OAuth code itself is single-use at Google's end.

import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

function getSecret() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable is strictly required for security.');
  }
  return secret;
}

/**
 * Create a signed state token embedding the Firebase UID.
 * @param {string} uid - Firebase UID of the authenticated user.
 * @returns {string} Signed JWT to use as the OAuth `state` parameter.
 */
export function createSignedState(uid) {
  const nonce = randomUUID();
  const payload = { uid, nonce };
  // 5-minute expiry — short enough to prevent replay, long enough for the OAuth round-trip.
  return jwt.sign(payload, getSecret(), { expiresIn: '5m' });
}

/**
 * Verify a signed state token and extract the UID.
 * @param {string} token - The JWT from the `state` query parameter.
 * @returns {string} uid from the token payload.
 * @throws {Error} If the token is invalid or expired.
 */
export function verifySignedState(token) {
  try {
    const decoded = jwt.verify(token, getSecret());
    return decoded.uid;
  } catch (err) {
    throw new Error(`Invalid state token: ${err.message}`);
  }
}
