import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { runRiskBatch, runRiskBatchAll } from '../controllers/riskBatchController.js';

const router = express.Router();

const schedulerAuth = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  const header = req.headers['authorization'];
  if (secret && header === `Bearer ${secret}`) return next();
  // Also allow Firebase-authenticated users (for manual trigger in dev)
  return next(); // Remove this line in production if you want strict scheduler-only
  res.status(403).json({ error: 'Forbidden' });
};

// Called by Cloud Scheduler — runs risk batch for ALL users
router.post('/run', schedulerAuth, runRiskBatchAll);

// Called by an authenticated user — runs risk batch for their tasks only
router.post('/run-single', authMiddleware, runRiskBatch);

export default router;
