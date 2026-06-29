import { createSignedState, verifySignedState } from '../lib/stateSigner.js';
import { generateSlackAuthUrl, exchangeSlackCode, getSlackUserEmail } from '../lib/slackOAuthService.js';
import { db } from '../lib/firestoreClient.js';
import { encrypt } from '../utils/encrypt.js';
import logger from '../lib/logger.js';
import { AppError } from '../errors/AppError.js';

/**
 * GET /api/v1/auth/slack/login
 * Initiates the Slack OAuth flow.
 * Requires Firebase auth middleware — user must already be signed in to Niyro.
 */
export async function startSlackOAuth(req, res) {
  if (!req.user?.uid) throw new AppError('Unauthenticated request', 401);
  
  const uid = req.user.uid;
  
  // Create a signed state JWT (same pattern as Google OAuth)
  // Payload: { uid, nonce }, signed with ENCRYPTION_KEY, expires in 5 minutes
  const state = createSignedState(uid);
  
  const authUrl = generateSlackAuthUrl(state);
  // Return the URL instead of redirecting — frontend will redirect
  res.json({ authUrl });
}

/**
 * GET /api/v1/auth/slack/callback
 * Handles the Slack OAuth callback.
 * No Firebase auth middleware — Slack redirects here, not the user's browser 
 * with a token. The UID comes from the verified state JWT.
 */
export async function handleSlackCallback(req, res) {
  const { code, state, error } = req.query;
  
  // Handle user cancellation
  if (error === 'access_denied') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/settings?slackError=cancelled`);
  }
  
  if (!code || !state) {
    throw new AppError('Missing code or state parameter', 400);
  }
  
  // Verify the state JWT to get the uid
  // This is the same verifySignedState used by the Google OAuth callback
  const uid = verifySignedState(state);
  if (!uid) throw new AppError('Invalid or expired state token', 400);
  
  let slackData;
  try {
    // Exchange the code for tokens
    slackData = await exchangeSlackCode(code);
  } catch (err) {
    logger.error(`[SlackAuth] OAuth exchange failed: ${err.message}`);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/settings?slackError=exchange_failed`);
  }

  const {
    botToken,
    botUserId,
    teamId,
    teamName,
    scopes,
    slackUserId,
  } = slackData;
  
  // Optional: verify the Slack user's email matches the Niyro user's email
  try {
    const slackEmail = await getSlackUserEmail(botToken, slackUserId);
    const userSnap = await db.collection('users').doc(uid).get();
    const niyroEmail = userSnap.data()?.email;
    
    if (slackEmail && niyroEmail && slackEmail !== niyroEmail) {
      logger.warn(
        `[SlackAuth] Email mismatch for uid=${uid}: ` +
        `Niyro=${niyroEmail}, Slack=${slackEmail} — proceeding anyway`
      );
    }
  } catch (emailErr) {
    logger.warn(`[SlackAuth] Could not verify Slack email: ${emailErr.message}`);
  }
  
  // Encrypt the bot token before storing
  const encryptedBotToken = encrypt(botToken);
  const now = new Date().toISOString();
  
  // Write to integrations subcollection
  await db
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc('slack')
    .set({
      encryptedBotToken,
      botUserId,
      teamId,
      teamName,
      slackUserId,
      scopes,
      connectedAt: now,
    });
  
  // Write denormalized fields to user document
  await db.collection('users').doc(uid).set(
    {
      slackUserId,
      slackTeamId: teamId,
      connectedChannels: { slack: true },
    },
    { merge: true }
  );
  
  logger.info(`[SlackAuth] Slack connected for uid=${uid}, team=${teamName}`);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/settings?slackConnected=true`);
}

/**
 * POST /api/v1/auth/slack/disconnect
 * Disconnects Slack for the authenticated user.
 */
export async function disconnectSlack(req, res) {
  const uid = req.user.uid;
  
  await db
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc('slack')
    .delete();
  
  await db.collection('users').doc(uid).set(
    {
      slackUserId: null,
      slackTeamId: null,
      connectedChannels: { slack: false },
    },
    { merge: true }
  );
  
  logger.info(`[SlackAuth] Slack disconnected for uid=${uid}`);
  res.json({ success: true });
}
