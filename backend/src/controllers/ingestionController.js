// src/controllers/ingestionController.js
// Handles generic POST to /api/v1/ingest (manual ingestion).
// Webhooks (Gmail, Telegram) use their own route handlers directly in ingest.js because they don't have req.user.

import { ingestMessage } from '../agents/ingestion.js';

export async function runIngestion(req, res) {
  try {
    const uid = req.user.uid;
    const { source = 'manual', rawContent, sourceRef } = req.body;

    if (!rawContent) {
      return res.status(400).json({ success: false, error: 'rawContent is required' });
    }

    const taskId = await ingestMessage(uid, source, rawContent, sourceRef);
    if (!taskId) {
      return res.status(200).json({ success: true, message: 'No actionable task detected.' });
    }

    res.status(201).json({ success: true, taskId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
