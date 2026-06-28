 // src/agents/lastMinuteAgent.js
// Last-Minute Agent: processLastMinute(uid, taskId)
// Called for tasks that are dangerously close to their deadline.
// Generates MVP steps, creates an immediate calendar block, and sends an alert.

import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { draftExtensionRequest } from './negotiationAgent.js';
import { generateMVPSteps } from './plannerAgent.js';
import { createEvent } from '../lib/calendarClient.js';
import { sendNotification } from '../lib/fcmClient.js';
import { logActivity } from '../lib/activityLogger.js';

/**
 * Handle a task that is critically close to its deadline.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 */
export async function processLastMinute(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  // 1. Evaluate salvageability via Gemini
  const prompt = `Analyze this task which is dangerously close to its deadline:
Title: "${task.title}"
Description: "${task.description || 'None'}"

Determine if this task is genuinely unsalvageable given it's due very soon (e.g. requires 5 hours of work but is due in 30 minutes, or relies on external parties who won't be available).

Respond ONLY in valid JSON format:
{
  "isSalvageable": boolean,
  "reason": string
}`;

  const evalResult = await callGemini(prompt, { structured: true });
  const isSalvageable = evalResult.isSalvageable !== false; 
  const reason = evalResult.reason || 'Insufficient time to complete the task.';

  // 2. Conditional Branch: Negotiate or MVP
  if (!isSalvageable) {
    // Unsalvageable
    console.log(`Task ${taskId} deemed unsalvageable. Triggering negotiation...`);
    
    // Trigger negotiation flow which will infer the recipient and draft the email
    const approvalId = await draftExtensionRequest(uid, taskId);
    
    // Update task status
    await taskRef.update({
      status: 'blocked',
      updatedAt: new Date().toISOString(),
    });

    // Send push notification about negotiation
    try {
      const userSnap = await db.collection('users').doc(uid).get();
      const userData = userSnap.data();
      const fcmToken = userData?.fcmToken;
      const riskAlertsEnabled = userData?.notificationPrefs?.riskAlerts !== false; // defaults to true
      if (fcmToken && riskAlertsEnabled) {
        await sendNotification(fcmToken, {
          title: '🚨 Deadline Unsalvageable',
          body: `I drafted an extension request for "${task.title}". Please review it.`,
          data: { taskId, type: 'negotiation_alert', approvalId },
        });
      }
    } catch (e) {
      console.warn('Failed to send negotiation push notification:', e.message);
    }
    
    return { taskId, action: 'negotiated', approvalId };
  }

  // 3. Salvageable (or no requester to email): Generate MVP steps
  const mvpSteps = await generateMVPSteps(uid, taskId, 3);

  // 4. Schedule the first MVP step immediately (next 15 mins).
  const now = new Date();
  const startTime = new Date(now.getTime() + 5 * 60000); // 5 mins from now
  const endTime = new Date(startTime.getTime() + 15 * 60000); // 15 min block

  let eventId = null;
  try {
    const event = {
      summary: `[MVP] ${mvpSteps[0].title}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    };
    const created = await createEvent(uid, event);
    eventId = created.id;
    mvpSteps[0].calendarEventId = eventId;
    mvpSteps[0].scheduledAt = startTime.toISOString();

    // Persist the updated step with calendar ID
    await taskRef.update({
      steps: mvpSteps,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to schedule immediate MVP block:', e.message);
    // Still update status
    await taskRef.update({
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Send high-priority push notification.
  try {
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.data();
    const fcmToken = userData?.fcmToken;
    const riskAlertsEnabled = userData?.notificationPrefs?.riskAlerts !== false; // defaults to true
    if (fcmToken && riskAlertsEnabled) {
      await sendNotification(fcmToken, {
        title: '🚨 Last Minute Action Required',
        body: `Your task "${task.title}" is critical. MVP plan created and first step scheduled.`,
        data: { taskId, type: 'last_minute_alert' },
      });
    }
  } catch (e) {
    console.warn('Failed to send last-minute push notification:', e.message);
  }

  await logActivity(uid, 'last_minute_triggered', { taskId, mvpStepsCount: mvpSteps.length }, {
    agent: 'lastMinute',
    action: 'processLastMinute',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Last-Minute protocol executed for task ${taskId} (User ${uid})`);
  return { taskId, mvpSteps, eventScheduled: !!eventId };
}
