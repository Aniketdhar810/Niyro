// src/lib/userMetrics.js
// Momentum and estimation profile updates per NIYRO_CONTEXT.md §4/§5.
import { db } from './firestoreClient.js';

/**
 * Update user's momentum metrics after task completion.
 * Fields: streakCount, lastCompletionDate, focusScore
 * @param {string} uid - Firebase UID.
 * @param {boolean} completedOnTime - Whether the task was completed before dueAt.
 */
export async function updateMomentum(uid, completedOnTime) {
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  const data = snap.data() || {};
  const momentum = data.momentum || { streakCount: 0, lastCompletionDate: null, focusScore: 0 };
  const now = new Date().toISOString();

  if (completedOnTime) {
    momentum.streakCount = (momentum.streakCount || 0) + 1;
  } else {
    momentum.streakCount = 0;
  }
  momentum.lastCompletionDate = now;
  // focusScore: proportion-based (simple heuristic — capped at 100)
  momentum.focusScore = Math.min(100, (momentum.streakCount || 0) * 7);

  await userRef.update({ momentum });
  return momentum;
}

/**
 * Update user's estimation profile after task completion.
 * Maintains a running average via globalAdjustmentFactor and sampleCount.
 * @param {string} uid - Firebase UID.
 * @param {number} actualMinutes - Actual time spent.
 * @param {number} estimatedMinutes - Original estimate.
 */
export async function updateEstimationProfile(uid, actualMinutes, estimatedMinutes) {
  if (!estimatedMinutes || estimatedMinutes <= 0) return;

  const ratio = actualMinutes / estimatedMinutes;
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  const data = snap.data() || {};
  const profile = data.estimationProfile || { globalAdjustmentFactor: 1.0, sampleCount: 0 };

  // Running average: new_avg = (old_avg * n + new_value) / (n + 1)
  const n = profile.sampleCount || 0;
  const oldFactor = profile.globalAdjustmentFactor || 1.0;
  const newFactor = (oldFactor * n + ratio) / (n + 1);

  profile.globalAdjustmentFactor = Math.round(newFactor * 1000) / 1000; // 3 decimal places
  profile.sampleCount = n + 1;

  await userRef.update({ estimationProfile: profile });
  return profile;
}
