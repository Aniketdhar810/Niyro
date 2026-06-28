// src/lib/undoRegistry.js
// Firestore-backed undo registry — survives restarts and works across instances.
// Undo actions are stored as serializable descriptors at users/{uid}/undoActions/{entryId}.

import { db } from './firestoreClient.js';

/**
 * Register an undo action for a specific activity entry.
 * The action is stored as a JSON-serializable descriptor in Firestore.
 * @param {string} uid - User UID (for data path scoping).
 * @param {string} entryId - The activityFeed document ID.
 * @param {object} descriptor - Serializable undo descriptor, e.g.:
 *   { type: 'delete_calendar_events', events: [{eventId, uid}] }
 *   { type: 'revert_task_status', taskId, previousStatus }
 */
export async function registerUndo(uid, entryId, descriptor) {
  if (!uid || !entryId || !descriptor) {
    throw new Error('registerUndo requires uid, entryId, and descriptor');
  }
  await db
    .collection('users')
    .doc(uid)
    .collection('undoActions')
    .doc(entryId)
    .set({
      ...descriptor,
      createdAt: new Date().toISOString(),
    });
}

/**
 * Dispatch (execute) an undo action. Reads the descriptor from Firestore,
 * performs the reversal, marks the activity entry as undone, then deletes
 * the undo action document.
 * @param {string} uid - User UID.
 * @param {string} entryId - The activity entry ID.
 */
export async function dispatchUndo(uid, entryId) {
  const undoRef = db
    .collection('users')
    .doc(uid)
    .collection('undoActions')
    .doc(entryId);
  const snap = await undoRef.get();
  if (!snap.exists) {
    throw new Error('No undo action registered for this entry');
  }
  const descriptor = snap.data();

  // Execute the undo based on descriptor type.
  // Import dynamically to avoid circular dependencies.
  switch (descriptor.type) {
    case 'delete_calendar_events': {
      const { deleteEvent } = await import('./calendarClient.js');
      for (const ev of descriptor.events || []) {
        try {
          await deleteEvent(uid, ev.eventId);
        } catch (e) {
          console.error(`Failed to delete calendar event ${ev.eventId}:`, e.message);
        }
      }
      break;
    }
    case 'revert_task_status': {
      const taskRef = db
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .doc(descriptor.taskId);
      await taskRef.update({
        status: descriptor.previousStatus,
        updatedAt: new Date().toISOString(),
      });
      break;
    }
    default:
      throw new Error(`Unknown undo type: ${descriptor.type}`);
  }

  // Mark the activity entry as undone.
  const activityRef = db
    .collection('users')
    .doc(uid)
    .collection('activityFeed')
    .doc(entryId);
  await activityRef.update({ undone: true });

  // Clean up the undo action.
  await undoRef.delete();
}

/**
 * Check if an undo action exists for a given entry.
 * @param {string} uid - User UID.
 * @param {string} entryId - Activity entry ID.
 * @returns {Promise<boolean>}
 */
export async function hasUndo(uid, entryId) {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('undoActions')
    .doc(entryId)
    .get();
  return snap.exists;
}
