// src/routes/chat.js
import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { postChat } from '../controllers/chatController.js';

const router = express.Router();
router.use(authMiddleware);

// POST /api/v1/chat
router.post('/', postChat);

export default router;
