// src/agents/executorAgent.js
// Executor Agent: executeTask(uid, taskId)
// Creates calendar events for scheduled steps, sends FCM reminders.
// Throws if asked to act on anyone but the task owner.
// Uses Firestore-backed undo registry.

import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';
import { createEvent } from '../lib/calendarClient.js';
import { sendNotification } from '../lib/fcmClient.js';
import { registerUndo } from '../lib/undoRegistry.js';

/**
 * Execute a task: create calendar events for scheduled steps and send reminders.
 * @param {string} uid - Firebase UID (must match task owner).
 * @param {string} taskId - Task document ID.
 * @returns {Promise<Object>} { taskId, executedAt, createdEvents }
 */
export async function executeTask(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  // Steps are an array field on the task document.
  const steps = task.steps || [];
  const createdEvents = [];
  const updatedSteps = [...steps];

  for (let i = 0; i < updatedSteps.length; i++) {
    const step = updatedSteps[i];
    // Only process steps that have scheduledAt but no calendarEventId yet.
    if (!step.scheduledAt || step.calendarEventId || step.done) continue;

    const durationMs = (step.isMicrotask ? 15 : 30) * 60000;
    const event = {
      summary: step.title || 'Task step',
      start: { dateTime: step.scheduledAt },
      end: {
        dateTime: new Date(
          new Date(step.scheduledAt).getTime() + durationMs
        ).toISOString(),
      },
    };

    const created = await createEvent(uid, event);
    updatedSteps[i] = { ...step, calendarEventId: created.id };
    createdEvents.push({ stepId: step.id, eventId: created.id });

    // Send FCM notification about the scheduled block.
    try {
      // Look up user's FCM token (stored on user doc).
      const userSnap = await db.collection('users').doc(uid).get();
      const fcmToken = userSnap.data()?.fcmToken;
      if (fcmToken) {
        await sendNotification(fcmToken, {
          title: 'Upcoming task block',
          body: `Step "${step.title}" scheduled at ${step.scheduledAt}`,
          data: { taskId, stepId: step.id },
        });
      }
    } catch (e) {
      console.warn('FCM notification failed:', e.message);
    }
  }

  const executedAt = new Date().toISOString();
  const previousStatus = task.status;
  await taskRef.update({
    steps: updatedSteps,
    status: 'in_progress',
    updatedAt: executedAt,
  });

  // Log activity and register Firestore-backed undo.
  const activityId = await logActivity(uid, 'task_executed', { taskId, eventsCreated: createdEvents.length }, {
    agent: 'executor',
    action: 'executeTask',
    relatedTaskId: taskId,
    undoable: true,
  });

  // Register undo action in Firestore (survives restarts).
  if (createdEvents.length > 0) {
    await registerUndo(uid, activityId, {
      type: 'delete_calendar_events',
      events: createdEvents,
      taskId,
      previousStatus,
    });
  }

  console.log(`Executed task ${taskId}: ${createdEvents.length} calendar events created`);
  return { taskId, executedAt, createdEvents };
}
