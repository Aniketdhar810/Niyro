// src/lib/activityLogger.js

/**
 * Log an activity entry for a user.
 * @param {string} uid - User ID.
 * @param {string} type - Activity type (e.g., 'task_created', 'risk_assessed').
 * @param {object} details - Additional details to store.
 * @param {object} meta - Optional metadata: { agent, action, relatedTaskId, undoable }
 */
export async function logActivity(uid, type, details = {}, meta = {}) {
  const { db } = await import('./firestoreClient.js');
  const activityRef = db
    .collection('users')
    .doc(uid)
    .collection('activityFeed')
    .doc();
  const entry = {
    type,
    timestamp: new Date().toISOString(),
    details,
    ...meta,
    undone: false,
  };
  await activityRef.set(entry);
  return activityRef.id; // return created document ID
}
