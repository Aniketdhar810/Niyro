// src/lib/fcmClient.js
// Firebase Cloud Messaging wrapper.
// Uses admin.messaging().send() per spec §2 — never sendToDevice.

import admin from './firebaseAdmin.js';

/**
 * Send a push notification to a specific device token.
 * @param {string} token - Device registration token.
 * @param {object} payload - { title, body, data? }
 * @returns {Promise<string>} Message ID returned by FCM.
 */
export async function sendNotification(token, payload) {
  const message = {
    token,
    notification: {
      title: payload.title || '',
      body: payload.body || '',
    },
    data: payload.data || {},
  };
  const response = await admin.messaging().send(message);
  return response; // message ID
}
