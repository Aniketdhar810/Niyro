import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { ingestMessage } from '../agents/ingestion.js';
import { runIngestion } from '../controllers/ingestionController.js';
import { getUserIdByTelegramChatId } from '../lib/userLookup.js';
import { db } from '../lib/firestoreClient.js';
import logger from '../lib/logger.js';

const router = express.Router();

// ── Manual ingestion (authenticated user) ──────────────────────────────────
router.post('/', authMiddleware, runIngestion);

// ── Telegram: register chat ID for the current Firebase user ───────────────
// Called from the frontend/Settings after user clicks "Connect Telegram"
// and sends /start to the bot. Body: { chatId: string }
router.post('/telegram/register', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ error: 'chatId is required' });
    await db.collection('users').doc(uid).set(
      { integrations: { telegram: { chatId: chatId.toString(), connectedAt: new Date().toISOString() } } },
      { merge: true }
    );
    await db.collection('users').doc(uid).set(
      { connectedChannels: { telegram: true } },
      { merge: true }
    );
    res.json({ success: true });
  } catch (err) {
    logger.error('Telegram register error', err);
    res.status(500).json({ error: 'Failed to register Telegram chat ID' });
  }
});

// ── Telegram webhook: receives updates from Telegram servers ───────────────
// Register this URL in BotFather: https://your-backend/api/v1/ingest/telegram
router.post('/telegram', async (req, res) => {
  // Always respond 200 immediately so Telegram doesn't retry
  res.sendStatus(200);
  try {
    // Verify the secret token Telegram sends in the header
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      logger.warn('Telegram webhook: invalid secret token');
      return;
    }
    const update = req.body;
    const message = update?.message;
    if (!message || !message.text) return; // ignore non-text updates (stickers, photos, etc.)

    const chatId = message.chat?.id?.toString();
    const text = message.text;
    const messageId = message.message_id?.toString();

    if (!chatId || !text) return;

    // Intercept Deep Link /start command
    if (text.startsWith('/start ')) {
      const startPayload = text.replace('/start ', '').trim();
      // startPayload should be the Niyro user ID (uid)
      
      // Save it to firestore
      await db.collection('users').doc(startPayload).set({
        integrations: { telegram: { chatId: chatId, connectedAt: new Date().toISOString() } },
        connectedChannels: { telegram: true }
      }, { merge: true });
      
      logger.info(`Telegram connected for user ${startPayload} via deep link!`);
      
      // Send confirmation message to Telegram
      if (process.env.TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '✅ Welcome to Niyro! Your account is connected. What do you need to get done today?'
          })
        });
      }
      return; // Stop here, do not ingest this as a task
    }

    // Look up which Niyro user owns this Telegram chat
    const uid = await getUserIdByTelegramChatId(chatId);
    if (!uid) {
      logger.warn(`Telegram webhook: no user found for chatId ${chatId}`);
      return;
    }

    // Run ingestion — Gemini will extract title, description, dueAt, estimatedMinutes
    await ingestMessage(uid, 'telegram', text, messageId);
    logger.info(`Telegram message ingested for uid=${uid}, messageId=${messageId}`);
  } catch (err) {
    logger.error('Telegram webhook error', err);
  }
});

// ── Gmail Pub/Sub push (optional — for now, users trigger manually) ────────
router.post('/gmail', async (req, res) => {
  res.sendStatus(200); // Always 200 to Pub/Sub
  try {
    const body = req.body?.message;
    if (!body) return;
    // Gmail push sends base64-encoded data containing the historyId
    // For MVP: trigger a manual poll from the frontend instead
    // Full implementation: decode, look up user by email, call gmailClient.listMessages
    logger.info('Gmail push received — manual poll recommended for MVP');
  } catch (err) {
    logger.error('Gmail webhook error', err);
  }
});

export default router;
