import { db } from './firestoreClient.js';
import { encrypt, decrypt } from '../utils/encrypt.js';
import logger from './logger.js';

export function generateSlackAuthUrl(state) {
  const scopes = [
    'chat:write',
    'im:history',
    'im:read',
    'im:write',
    'app_mentions:read',
    'users:read',
    'users:read.email',
  ].join(',');
  
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: scopes,
    redirect_uri: process.env.SLACK_CALLBACK_URL,
    state,
  });
  
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code) {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: process.env.SLACK_CALLBACK_URL,
  });
  
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }
  
  return {
    botToken: data.access_token,
    botUserId: data.bot_user_id,
    teamId: data.team.id,
    teamName: data.team.name,
    scopes: data.scope,
    slackUserId: data.authed_user.id,
  };
}

export async function getSlackUserEmail(botToken, slackUserId) {
  const response = await fetch(
    `https://slack.com/api/users.info?user=${slackUserId}`,
    {
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  if (!data.ok) return null;
  return data.user?.profile?.email || null;
}

export async function sendSlackMessage(botToken, channelId, text) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channelId,
      text,
    }),
  });
  
  const data = await response.json();
  if (!data.ok) {
    logger.warn(`[Slack] Failed to send message: ${data.error}`);
  }
  return data;
}

export async function getDecryptedBotToken(uid) {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc('slack')
    .get();
  
  if (!snap.exists) {
    throw new Error(`No Slack integration found for uid=${uid}`);
  }
  
  const { encryptedBotToken } = snap.data();
  if (!encryptedBotToken) {
    throw new Error(`No encrypted bot token for uid=${uid}`);
  }
  
  const token = decrypt(encryptedBotToken);
  if (!token) {
    throw new Error(`Failed to decrypt Slack bot token for uid=${uid}`);
  }
  
  return token;
}
