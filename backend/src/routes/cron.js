import express from 'express';
import { schedulerAuth } from './riskBatch.js';
import { runDailyBriefing } from '../cron/dailyBriefing.js';

const router = express.Router();

router.post('/daily-briefing', schedulerAuth, async (req, res) => {
  await runDailyBriefing();
  res.json({ success: true });
});

export default router;
