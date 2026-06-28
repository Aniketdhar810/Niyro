// src/controllers/riskBatchController.js
// Triggers the batch risk assessment (assessRiskBatch) which discovers tasks automatically.
// Intended to be called by Cloud Scheduler or a cron job.

import { db } from '../lib/firestoreClient.js';
import { assessRiskBatch } from '../agents/riskAgent.js';

export async function runRiskBatch(req, res) {
  try {
    const uid = req.user.uid;
    const results = await assessRiskBatch(uid);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runRiskBatchAll(req, res) {
  try {
    const usersSnap = await db.collection('users').get();
    const results = [];
    
    for (const doc of usersSnap.docs) {
      const uid = doc.id;
      try {
        const userResults = await assessRiskBatch(uid);
        results.push({ uid, status: 'success', evaluated: userResults.length });
      } catch (err) {
        console.error(`Risk batch failed for user ${uid}:`, err);
        results.push({ uid, status: 'error', error: err.message });
      }
    }
    
    res.json({ success: true, processedUsers: usersSnap.size, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
