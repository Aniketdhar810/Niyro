import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { startSlackOAuth, handleSlackCallback, disconnectSlack } from '../controllers/slackAuthController.js';

const router = express.Router();

// Initiate Slack OAuth — user must be signed in to Niyro first
router.get('/login', authMiddleware, startSlackOAuth);

// OAuth callback from Slack — no Firebase auth middleware
// The UID comes from the verified signed state JWT
router.get('/callback', handleSlackCallback);

// Disconnect Slack — requires auth
router.post('/disconnect', authMiddleware, disconnectSlack);

export default router;
