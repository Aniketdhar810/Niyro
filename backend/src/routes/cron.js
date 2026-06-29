import express from 'express';
import { schedulerAuth } from './riskBatch.js';
import { runDailyBriefing } from '../cron/dailyBriefing.js';
import { runGmailPolling } from '../cron/gmailPolling.js';

const router = express.Router();

router.post('/daily-briefing', schedulerAuth, async (req, res) => {
  await runDailyBriefing();
  res.json({ success: true });
});

router.post('/gmail-poll', schedulerAuth, async (req, res) => {
  await runGmailPolling();
  res.json({ success: true });
});

export default router;
