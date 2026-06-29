import { db } from '../lib/firestoreClient.js';
import { ensureNiyroLabel, getMessagesByLabel, removeLabelFromMessage } from '../lib/gmailClient.js';
import { processGmailMessage } from '../lib/gmailIngestionService.js';
import logger from '../lib/logger.js';

export async function runGmailPolling() {
  logger.info('Running Gmail Polling Job...');
  try {
    const usersSnap = await db.collection('users').get();
    
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();
      
      // Only process users who have explicitly connected Gmail
      if (!userData?.connectedChannels?.gmail) continue;

      try {
        const labelId = await ensureNiyroLabel(uid);
        const messages = await getMessagesByLabel(uid, labelId);
        
        if (messages.length === 0) continue;
        logger.info(`Found ${messages.length} Niyro-labeled emails for user ${uid}.`);

        for (const msg of messages) {
          try {
            const result = await processGmailMessage(uid, msg.id);
            // Remove the label if we successfully processed it into a task, 
            // or if it was intentionally skipped but processed without throwing (if processGmailMessage handled it).
            // Currently processGmailMessage returns {taskId} on success, or null if empty.
            // If it returns a taskId, we know it's safe to remove the label.
            if (result && result.taskId) {
              await removeLabelFromMessage(uid, msg.id, labelId);
              logger.info(`Successfully processed and removed label for message ${msg.id}`);
            } else if (result === null) {
              // If it was completely empty/invalid, remove label so we don't keep polling it
              await removeLabelFromMessage(uid, msg.id, labelId);
              logger.info(`Message ${msg.id} was empty/invalid, removed label to prevent loop.`);
            }
          } catch (msgErr) {
            logger.error(`Error processing individual message ${msg.id} for user ${uid}:`, msgErr);
          }
        }
      } catch (userErr) {
        logger.error(`Failed to poll Gmail for user ${uid}:`, userErr);
      }
    }
  } catch (e) {
    logger.error('Failed to run Gmail polling job:', e);
  }
}
