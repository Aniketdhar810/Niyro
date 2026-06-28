// src/controllers/settingsController.js
// Handles user settings directly on the users/{uid} document (e.g. workHours).
// Does NOT use a separate settings/profile subcollection.

import { db } from '../lib/firestoreClient.js';

export async function getSettings(req, res) {
  try {
    const uid = req.user.uid;
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.json({ success: true, settings: {} });
    }

    const data = snap.data();
    // Return all fields except internal ones like fcmToken, momentum, estimationProfile if desired,
    // or just return everything. We'll return everything for now.
    res.json({ success: true, settings: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const uid = req.user.uid;
    const updates = req.body; // Body is validated by settingsUpdateSchema (passthrough)

    const userRef = db.collection('users').doc(uid);
    await userRef.set(updates, { merge: true });

    res.json({ success: true, settings: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
