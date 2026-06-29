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

// ── Chrome Extension: ingest a specific Gmail message by ID ────────
// The extension sends just the message ID — backend fetches the full email
router.post('/gmail/message', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ success: false, error: 'messageId is required' });
    }
    
    // Use the existing service to fetch and ingest this specific message
    const { processGmailMessage } = await import('../lib/gmailIngestionService.js');
    const result = await processGmailMessage(uid, messageId);
    
    if (!result) {
      return res.json({ 
        success: false, 
        error: 'Email does not appear to contain an actionable task' 
      });
    }
    
    res.json({ success: true, taskId: result.taskId });
  } catch (err) {
    logger.error('Gmail message ingest error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Gmail Label Sync: manually triggered by the user ────────
router.post('/gmail/sync', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Import dynamically to avoid circular dependencies if any
    const { ensureNiyroLabel, getMessagesByLabel, removeLabelFromMessage } = await import('../lib/gmailClient.js');
    const { processGmailMessage } = await import('../lib/gmailIngestionService.js');
    
    // 1. Ensure the "Niyro" label exists and get its ID
    const labelId = await ensureNiyroLabel(uid);
    
    // 2. Fetch all messages that have this label
    const messages = await getMessagesByLabel(uid, labelId);
    
    if (!messages || messages.length === 0) {
      return res.json({ success: true, processed: 0, message: 'No labeled emails found' });
    }
    
    let processedCount = 0;
    
    // 3. Process each message and remove the label
    for (const msg of messages) {
      try {
        const result = await processGmailMessage(uid, msg.id);
        if (result) {
          // Task successfully created, remove the label
          await removeLabelFromMessage(uid, msg.id, labelId);
          processedCount++;
        }
      } catch (err) {
        logger.error(`Error processing message ${msg.id} during sync`, err);
        // We do not remove the label if there was a critical failure, 
        // so it can be retried later.
      }
    }
    
    res.json({ success: true, processed: processedCount });
  } catch (err) {
    logger.error('Gmail sync error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
