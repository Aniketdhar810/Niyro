import { verifySlackSignature } from '../lib/slackVerifier.js';
import { getUserIdBySlackUserId } from '../lib/userLookup.js';
import { ingestMessage } from '../agents/ingestion.js';
import { getDecryptedBotToken, sendSlackMessage } from '../lib/slackOAuthService.js';
import logger from '../lib/logger.js';

/**
 * POST /api/v1/ingest/slack
 * 
 * Receives all Slack events. Handles:
 *   1. URL verification challenge (one-time, when setting up Event Subscriptions)
 *   2. message.im events (DMs to the bot)
 *   3. app_mention events (bot @mentioned in a channel)
 */
export async function handleSlackWebhook(req, res) {
  // Retrieve the raw body saved by express.json() verify function
  const rawBody = req.rawBody;
  
  if (!rawBody) {
    logger.warn('[Slack] Webhook missing raw body');
    return res.status(400).json({ error: 'Missing raw body' });
  }
  
  // Verify the signature FIRST before parsing
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  if (!verifySlackSignature(rawBody, signature, timestamp)) {
    logger.warn('[Slack] Webhook signature verification failed');
    return res.status(403).json({ error: 'Invalid signature' });
  }
  
  // Parse the body now that we've verified it
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  
  // ── 1. URL Verification Challenge ──────────────────────────────────────────
  if (payload.type === 'url_verification') {
    logger.info('[Slack] URL verification challenge received');
    return res.json({ challenge: payload.challenge });
  }
  
  // ── 2. Event callbacks ─────────────────────────────────────────────────────
  if (payload.type !== 'event_callback') {
    return res.sendStatus(200);
  }
  
  // Always acknowledge immediately — Slack expects a 200 within 3 seconds
  res.sendStatus(200);
  
  // Process the event asynchronously (don't block the 200 response)
  processSlackEvent(payload).catch(err => {
    logger.error(`[Slack] Event processing error: ${err.message}`);
  });
}

/**
 * Process a Slack event asynchronously after the 200 is sent.
 */
async function processSlackEvent(payload) {
  const event = payload.event;
  const teamId = payload.team_id;
  
  if (!event || !teamId) return;
  
  // Skip bot messages to avoid infinite loops
  if (event.bot_id || event.subtype === 'bot_message') {
    logger.info('[Slack] Skipping bot message');
    return;
  }
  
  // Skip message edits, deletions, and other subtypes
  if (event.subtype && event.subtype !== 'file_share') {
    logger.info(`[Slack] Skipping message with subtype: ${event.subtype}`);
    return;
  }
  
  const slackUserId = event.user;
  const channelId = event.channel;
  const eventTs = event.ts; // Slack event timestamp — used as sourceRef
  
  if (!slackUserId || !channelId || !eventTs) {
    logger.warn('[Slack] Missing required event fields');
    return;
  }
  
  // ── Handle message.im (DM to the bot) ─────────────────────────────────────
  if (event.type === 'message' && event.channel_type === 'im') {
    await handleDirectMessage(event, teamId);
    return;
  }
  
  // ── Handle app_mention (@bot in a channel) ─────────────────────────────────
  if (event.type === 'app_mention') {
    await handleAppMention(event, teamId);
    return;
  }
  
  logger.info(`[Slack] Unhandled event type: ${event.type}`);
}

/**
 * Handle a direct message sent to the Niyro bot.
 */
async function handleDirectMessage(event, teamId) {
  const { user: slackUserId, text, channel: channelId, ts: eventTs } = event;
  
  if (!text?.trim()) {
    logger.info('[Slack] Empty DM — ignoring');
    return;
  }
  
  // Look up the Niyro user by their Slack user ID
  const uid = await getUserIdBySlackUserId(slackUserId, teamId);
  if (!uid) {
    logger.warn(`[Slack] No Niyro user found for slackUserId=${slackUserId} teamId=${teamId}`);
    return;
  }
  
  logger.info(`[Slack] DM received from uid=${uid}: "${text.substring(0, 50)}..."`);
  
  const rawContent = `[Slack Direct Message]\n\n${text.trim()}`;
  
  // Ingest
  await ingestMessage(uid, 'slack', rawContent, eventTs);
  
  // Send confirmation back to the user in Slack
  try {
    const botToken = await getDecryptedBotToken(uid);
    await sendSlackMessage(
      botToken,
      channelId,
      `✅ Got it! I've added that as a task in Niyro. I'll track the deadline for you.`
    );
  } catch (confirmErr) {
    logger.warn(`[Slack] Could not send confirmation: ${confirmErr.message}`);
  }
}

/**
 * Handle an @mention of the Niyro bot in a channel.
 */
async function handleAppMention(event, teamId) {
  const { user: slackUserId, text, channel: channelId, ts: eventTs } = event;
  
  if (!text?.trim()) return;
  
  // Strip the @bot mention from the text
  const cleanText = text.replace(/<@[A-Z0-9]+>/g, '').trim();
  
  if (!cleanText) {
    logger.info('[Slack] App mention with no text after stripping bot mention');
    return;
  }
  
  const uid = await getUserIdBySlackUserId(slackUserId, teamId);
  if (!uid) {
    logger.warn(`[Slack] No Niyro user for mention: slackUserId=${slackUserId}`);
    return;
  }
  
  logger.info(`[Slack] App mention from uid=${uid}: "${cleanText.substring(0, 50)}..."`);
  
  const rawContent = `[Slack Channel Message]\n\n${cleanText}`;
  
  await ingestMessage(uid, 'slack', rawContent, eventTs);
  
  try {
    const botToken = await getDecryptedBotToken(uid);
    await sendSlackMessage(
      botToken,
      channelId,
      `✅ <@${slackUserId}> Task added to Niyro! I'll track the deadline.`
    );
  } catch (confirmErr) {
    logger.warn(`[Slack] Could not send channel confirmation: ${confirmErr.message}`);
  }
}
