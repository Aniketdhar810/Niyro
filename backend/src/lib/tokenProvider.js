// src/lib/tokenProvider.js
// Retrieves a Google OAuth access token for a given user UID.
// Reads the encrypted refresh token from users/{uid}/integrations/google,
// decrypts it, and refreshes via googleapis OAuth2 client.

import { db } from './firestoreClient.js';
import { decrypt } from '../utils/encrypt.js';
import { google } from 'googleapis';

/**
 * Get a valid access token for the specified user.
 * @param {string} uid - Firebase UID.
 * @returns {Promise<string>} Fresh access token.
 */
export async function getAccessToken(uid) {
  const docRef = db
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc('google');
  const snap = await docRef.get();
  if (!snap.exists) {
    throw new Error('No Google integration found for user');
  }
  const data = snap.data();
  // Decrypt stored refresh token.
  const refreshToken = decrypt(data.refreshToken);
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  // Force token refresh to get a fresh access token.
  const { token } = await oauth2Client.getAccessToken();
  return token;
}
