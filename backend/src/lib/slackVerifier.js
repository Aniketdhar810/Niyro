import crypto from 'crypto';
import logger from './logger.js';

/**
 * Verify a Slack webhook request signature.
 * 
 * Slack sends:
 *   X-Slack-Signature: v0=<hex_digest>
 *   X-Slack-Request-Timestamp: <unix_timestamp>
 * 
 * The signature is: HMAC-SHA256(
 *   key=SLACK_SIGNING_SECRET,
 *   message=`v0:${timestamp}:${rawBody}`
 * )
 * 
 * @param {string} rawBody - The raw request body as a string (NOT parsed)
 * @param {string} signature - The X-Slack-Signature header value
 * @param {string} timestamp - The X-Slack-Request-Timestamp header value
 * @returns {boolean}
 */
export function verifySlackSignature(rawBody, signature, timestamp) {
  if (!process.env.SLACK_SIGNING_SECRET) {
    logger.warn('[Slack] SLACK_SIGNING_SECRET not set — skipping verification');
    return true; // In dev without the secret, allow through (but warn)
  }
  
  // Reject requests older than 5 minutes to prevent replay attacks
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 5 * 60) {
    logger.warn('[Slack] Request timestamp too old — possible replay attack');
    return false;
  }
  
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest('hex');
  const computedSig = `v0=${hmac}`;
  
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSig, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}
