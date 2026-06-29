// src/lib/gmailClient.js
// Gmail API wrapper.
// Provides functions to list messages, retrieve message bodies, and send drafts.

import { google } from 'googleapis';
import { getAccessToken } from './tokenProvider.js';

/**
 * Initialise a Gmail client for the given user UID.
 * @param {string} uid Firebase UID of the user.
 * @returns {Promise<gmail_v1.Gmail>} Authenticated Gmail client.
 */
async function getGmailClient(uid) {
  const accessToken = await getAccessToken(uid);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

/**
 * List the most recent messages for the user.
 * @param {string} uid Firebase UID.
 * @param {number} [maxResults=20] Number of messages to return.
 * @returns {Promise<Array>} List of message IDs and thread IDs.
 */
export async function listMessages(uid, maxResults = 20) {
  const gmail = await getGmailClient(uid);
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
  });
  return res.data.messages || [];
}

/**
 * Get the full message body (decoded) for a specific message ID.
 * @param {string} uid Firebase UID.
 * @param {string} messageId Gmail message ID.
 * @returns {Promise<string>} Plain‑text body of the message.
 */
export async function getMessageBody(uid, messageId) {
  const gmail = await getGmailClient(uid);
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });
  const parts = res.data.payload?.parts || [];
  // Find the part with mimeType text/plain
  const plainPart = parts.find(p => p.mimeType === 'text/plain');
  if (plainPart && plainPart.body?.data) {
    return Buffer.from(plainPart.body.data, 'base64').toString('utf-8');
  }
  // Fallback to raw body
  if (res.data.payload?.body?.data) {
    return Buffer.from(res.data.payload.body.data, 'base64').toString('utf-8');
  }
  return '';
}

/**
 * Send a draft (or new) email on behalf of the user.
 * @param {string} uid Firebase UID.
 * @param {object} rawMessage Raw RFC822 email string (base64url encoded).
 * @returns {Promise<object>} Sent message resource.
 */
export async function sendMessage(uid, rawMessage) {
  const gmail = await getGmailClient(uid);
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
    },
  });
  return res.data;
}

/**
 * Ensures the "Niyro" label exists for the user. Returns its ID.
 */
export async function ensureNiyroLabel(uid) {
  const gmail = await getGmailClient(uid);
  const res = await gmail.users.labels.list({ userId: 'me' });
  const labels = res.data.labels || [];
  let niyroLabel = labels.find(l => l.name === 'Niyro');
  
  if (!niyroLabel) {
    const createRes = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: 'Niyro',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }
    });
    niyroLabel = createRes.data;
  }
  return niyroLabel.id;
}

/**
 * Gets a list of message IDs that have the given label.
 */
export async function getMessagesByLabel(uid, labelId) {
  const gmail = await getGmailClient(uid);
  const res = await gmail.users.messages.list({
    userId: 'me',
    labelIds: [labelId],
    maxResults: 50,
  });
  return res.data.messages || [];
}

/**
 * Removes a specific label from a message.
 */
export async function removeLabelFromMessage(uid, messageId, labelId) {
  const gmail = await getGmailClient(uid);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: [labelId]
    }
  });
}
