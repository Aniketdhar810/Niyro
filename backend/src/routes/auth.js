// src/routes/auth.js
import express from 'express';
import { startGoogleOAuth, handleGoogleCallback } from '../controllers/authController.js';

const router = express.Router();

import { authMiddleware } from '../lib/authMiddleware.js';

// Initiate OAuth flow
router.get('/login', authMiddleware, startGoogleOAuth);

// OAuth callback handling
router.get('/callback', handleGoogleCallback);

export default router;
