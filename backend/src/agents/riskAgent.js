// src/agents/riskAgent.js
// Risk Agent: assessRisk(uid, taskId) for one task,
// plus assessRiskBatch(uid) that discovers the user's own eligible tasks.
// Risk levels: 'on_track' | 'at_risk' | 'critical' (per spec §4).
// On 'critical', calls Accountability agent.

import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';
import { queryFreeBusy } from '../lib/calendarClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { checkAccountabilityEscalation } from './accountabilityAgent.js';

/**
 * Assess risk for a single task.
 * @param {string} uid - Firebase UID of the task owner.
 * @param {string} taskId - Firestore task document ID.
 * @returns {Promise<object>} Updated task data with riskLevel.
 */
export async function assessRisk(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  // Time window: now → dueAt (or +7 days if no dueAt).
  const now = new Date();
  const dueAt = task.dueAt ? new Date(task.dueAt) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const end = new Date(Math.max(dueAt.getTime(), now.getTime() + 24 * 60 * 60 * 1000));

  // Query calendar free-busy for the user.
  let busyCount = 0;
  try {
    const freebusy = await queryFreeBusy(uid, now.toISOString(), end.toISOString());
    busyCount = freebusy.calendars?.primary?.busy?.length || 0;
  } catch (e) {
    console.warn('Calendar query failed for risk assessment, proceeding without:', e.message);
  }

  // Remaining time in hours.
  const remainingHours = Math.max(0, (dueAt - now) / (1000 * 60 * 60));

  // Gemini structured risk assessment with correct risk levels.
  const prompt = `Assess the risk of the following task and return a JSON object with fields:
{
  "riskLevel": "on_track" | "at_risk" | "critical",
  "justification": "string"
}

Consider:
- Remaining time: ${remainingHours.toFixed(1)} hours
- Estimated time needed: ${task.estimatedMinutes || 'unknown'} minutes
- Calendar busy slots in the window: ${busyCount}
- Task status: ${task.status}

Task title: ${task.title}
Description: ${task.description || 'none'}`;

  const result = await callGemini(prompt, { structured: true });
  const riskLevel = ['on_track', 'at_risk', 'critical'].includes(result?.riskLevel)
    ? result.riskLevel
    : 'on_track';
  const justification = result?.justification || '';

  await taskRef.update({
    riskLevel,
    updatedAt: new Date().toISOString(),
  });

  await logActivity(uid, 'task_risk_assessed', { taskId, riskLevel }, {
    agent: 'risk',
    action: 'assessRisk',
    relatedTaskId: taskId,
    undoable: false,
  });

  // On critical, trigger accountability escalation.
  if (riskLevel === 'critical') {
    try {
      await checkAccountabilityEscalation(uid, taskId);
    } catch (e) {
      console.error('Accountability escalation failed:', e.message);
    }
  }

  console.log(`Risk assessed for task ${taskId}: ${riskLevel}`);
  return { ...task, riskLevel, riskDetails: justification };
}

/**
 * Batch risk assessment — discovers the user's own eligible tasks.
 * Called by Cloud Scheduler (doesn't require caller to supply task IDs).
 * @param {string} uid - Firebase UID.
 * @returns {Promise<Array>} Results for each assessed task.
 */
export async function assessRiskBatch(uid) {
  if (!uid) throw new Error('uid is required');

  // Find all non-done tasks for this user.
  const tasksSnap = await db
    .collection('users')
    .doc(uid)
    .collection('tasks')
    .where('status', 'in', ['pending', 'in_progress'])
    .get();

  const results = [];
  for (const doc of tasksSnap.docs) {
    try {
      const result = await assessRisk(uid, doc.id);
      results.push({ taskId: doc.id, status: 'success', riskLevel: result.riskLevel });
    } catch (e) {
      results.push({ taskId: doc.id, status: 'error', error: e.message });
    }
  }

  console.log(`Risk batch completed for user ${uid}: ${results.length} tasks assessed`);
  return results;
}
