// src/routes/activityFeed.js
import express from 'express';
import { undoActivity } from '../controllers/activityFeedController.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Update an activity‑feed entry (e.g., mark undone, set agent/action info)
// Undo an activity‑feed entry
router.post('/:id/undo', undoActivity);

export default router;
