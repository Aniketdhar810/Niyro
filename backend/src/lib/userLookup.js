// src/lib/userLookup.js

import { db } from './firestoreClient.js';

/**
 * Retrieves the Firestore user document ID for a given phone number (E.164 format).
 * Returns the user document ID if found, otherwise null.
 *
 * @param {string} e164Phone - Phone number in E.164 format.
 * @returns {Promise<string|null>} - User document ID or null if not found.
 */
export async function getUserIdByPhone(e164Phone) {
  if (!db) {
    console.error('Firestore not initialized – cannot lookup user by phone');
    return null;
  }
  try {
    const snapshot = await db
      .collection('users')
      .where('phone', '==', e164Phone)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  } catch (err) {
    console.error('Error fetching user by phone:', err);
    return null;
  }
}

/**
 * Retrieves the Firestore user document ID for a given Telegram Chat ID.
 * Returns the user document ID if found, otherwise null.
 *
 * @param {string} chatId - Telegram Chat ID.
 * @returns {Promise<string|null>} - User document ID or null if not found.
 */
export async function getUserIdByTelegramChatId(chatId) {
  if (!db) {
    console.error('Firestore not initialized – cannot lookup user by telegram chat id');
    return null;
  }
  try {
    const snapshot = await db
      .collection('users')
      .where('integrations.telegram.chatId', '==', chatId.toString())
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  } catch (err) {
    console.error('Error fetching user by telegram chat id:', err);
    return null;
  }
}
