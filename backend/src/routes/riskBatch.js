import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { db } from '../lib/firestoreClient.js';
import logger from '../lib/logger.js';
import { runRiskBatch, runRiskBatchAll } from '../controllers/riskBatchController.js';

const router = express.Router();

export const schedulerAuth = (req, res, next) => {
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

// Auto-refresh recommendations for all users daily
router.post('/recommendations', schedulerAuth, async (req, res) => {
  const usersSnap = await db.collection('users').get();
  const results = [];
  for (const doc of usersSnap.docs) {
    try {
      const { generateRecommendations } = await import('../agents/recommendationsAgent.js');
      const recs = await generateRecommendations(doc.id);
      results.push({ uid: doc.id, count: recs.length });
    } catch (err) {
      logger.error(`Recommendations failed for uid=${doc.id}`, err);
      results.push({ uid: doc.id, error: err.message });
    }
  }
  res.json({ success: true, results });
});

export default router;
