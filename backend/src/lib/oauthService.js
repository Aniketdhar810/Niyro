// src/lib/oauthService.js
// Google OAuth2 service for Calendar + Gmail scopes ONLY.
// This is NOT user authentication — the user is already authenticated via Firebase.

import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

/**
 * Generate the Google OAuth consent URL.
 * Scopes are limited to Calendar and Gmail — no userinfo scopes.
 * @param {string} state - Signed JWT state value containing the Firebase UID.
 * @returns {string} The consent URL to redirect the user to.
 */
export function generateAuthUrl(state) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent',
  });
}

/**
 * Exchange an authorization code for tokens.
 * @param {string} code - The authorization code from Google.
 * @returns {Promise<Object>} Tokens object.
 */
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
