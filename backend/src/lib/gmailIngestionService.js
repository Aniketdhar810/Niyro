// src/lib/gmailIngestionService.js
import { getMessageBody } from './gmailClient.js';
import { ingestMessage } from '../agents/ingestion.js';
import logger from './logger.js';

/**
 * Fetches a Gmail message, extracts its body, and attempts to ingest it as a task.
 * @param {string} uid User ID
 * @param {string} messageId Gmail message ID
 * @returns {Promise<{taskId: string} | null>} The created task info, or null if not a task.
 */
export async function processGmailMessage(uid, messageId) {
  try {
    const rawContent = await getMessageBody(uid, messageId);
    if (!rawContent || rawContent.trim() === '') {
      logger.warn(`Gmail message ${messageId} is empty.`);
      return null;
    }

    const taskId = await ingestMessage(uid, 'gmail', rawContent, messageId);
    
    if (taskId) {
      return { taskId };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error processing Gmail message ${messageId}:`, error);
    throw error;
  }
}
