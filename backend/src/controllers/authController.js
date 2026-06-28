// src/controllers/authController.js
// Controller for Google OAuth flow with UID‑keyed token storage and signed state handling.

import { generateAuthUrl, getTokens } from '../lib/oauthService.js';
import { createSignedState, verifySignedState } from '../lib/stateSigner.js';
import { db } from '../lib/firestoreClient.js';
import { encrypt } from '../utils/encrypt.js';
import { AppError, GoogleOAuthError } from '../errors/AppError.js';

/** Initiate Google OAuth – requires authenticated user */
export async function startGoogleOAuth(req, res) {
  if (!req.user || !req.user.uid) {
    throw new AppError('Unauthenticated request', 401);
  }
  const uid = req.user.uid;
  const state = createSignedState(uid); // JWT containing uid
  const url = generateAuthUrl(state);
  res.json({ authUrl: url });
}

/** Callback endpoint – exchanges code for tokens, encrypts the refresh token and stores it under the user's document */
export async function handleGoogleCallback(req, res) {
  const { code, state } = req.query;
  if (!code || !state) {
    throw new AppError('Missing code or state', 400);
  }
  let uid;
  try {
    uid = verifySignedState(state);
  } catch (e) {
    throw new AppError(`Invalid state token: ${e.message}`, 400);
  }
  try {
    const tokens = await getTokens(code);
    if (tokens.refresh_token) {
      const encryptedRefresh = encrypt(tokens.refresh_token);
      await db
        .collection('users')
        .doc(uid)
        .collection('integrations')
        .doc('google')
        .set(
          {
            accessToken: tokens.access_token,
            refreshToken: encryptedRefresh,
            expiry: tokens.expiry_date,
            scopes: tokens.scope,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      
      // Also update the root user doc so the frontend UI updates instantly
      await db.collection('users').doc(uid).set(
        { connectedChannels: { gmail: true } },
        { merge: true }
      );
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings`);
  } catch (e) {
    console.error('OAuth callback error:', e);
    throw new GoogleOAuthError(e.message);
  }
}
