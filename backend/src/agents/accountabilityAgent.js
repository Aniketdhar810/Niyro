// src/agents/accountabilityAgent.js
// Accountability Agent: Escalates critical tasks to a designated buddy.
// Creates a pending approval document in users/{uid}/approvals.

import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';

/**
 * Check and escalate a critical task to an accountability buddy.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 */
export async function checkAccountabilityEscalation(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return;
  const settings = userSnap.data()?.settings || {};

  const buddyEmail = settings.accountabilityBuddyEmail;
  if (!buddyEmail) {
    console.log(`No accountability buddy configured for user ${uid}, skipping escalation.`);
    return;
  }

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) return;
  const task = taskSnap.data();

  // Create an approval request for the buddy to review the task extension/risk.
  const approvalRef = db.collection('users').doc(uid).collection('approvals').doc();
  const approval = {
    taskId,
    taskTitle: task.title,
    recipient: buddyEmail,
    type: 'escalation',
    status: 'pending',
    message: `Task "${task.title}" is at critical risk. Please review.`,
    createdAt: new Date().toISOString(),
  };

  await approvalRef.set(approval);

  await logActivity(uid, 'accountability_escalated', { taskId, buddyEmail, approvalId: approvalRef.id }, {
    agent: 'accountability',
    action: 'escalate',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Escalated task ${taskId} to buddy ${buddyEmail} via approvals/${approvalRef.id}`);
  return approvalRef.id;
}
