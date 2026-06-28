// src/controllers/activityFeedController.js
// Handles undo via the Firestore-backed registry.

import { dispatchUndo, hasUndo } from '../lib/undoRegistry.js';

export async function undoActivity(req, res) {
  try {
    const uid = req.user.uid;
    const { id: entryId } = req.params;

    const exists = await hasUndo(uid, entryId);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'No undo action available for this entry' });
    }

    await dispatchUndo(uid, entryId);
    res.json({ success: true, message: 'Action undone successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
