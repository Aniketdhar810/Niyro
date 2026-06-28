// src/agents/negotiationAgent.js
// Negotiation Agent: Prepares pushback emails/messages for tasks that can't be done.
// Creates a pending approval document with a Gemini-drafted response.

import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { logActivity } from '../lib/activityLogger.js';

/**
 * Trigger negotiation for a task (e.g. when calendar is too full to complete it).
 * Generates a draft pushback message and creates an approval request.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 */
export async function draftExtensionRequest(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  // Ask Gemini to infer recipient and draft the message
  const prompt = `Given this task: "${task.title}" - "${task.description || ''}", 
    infer who assigned or is expecting this deliverable and draft a polite 
    extension request email. Return JSON strictly in this format: 
    { "recipient_email": "string", "recipient_name": "string", "draft_body": "string" }`;

  const result = await callGemini(prompt, { structured: true });
  
  // Create approval request in users/{uid}/approvals
  const approvalRef = db.collection('users').doc(uid).collection('approvals').doc();
  const approval = {
    taskId,
    taskTitle: task.title,
    recipient: result.recipient_email || 'unknown@example.com',
    recipientName: result.recipient_name || 'Unknown',
    type: 'negotiation',
    status: 'pending',
    draftContent: result.draft_body || '',
    createdAt: new Date().toISOString(),
  };

  await approvalRef.set(approval);

  await logActivity(uid, 'negotiation_drafted', { taskId, recipient: approval.recipient, approvalId: approvalRef.id }, {
    agent: 'negotiation',
    action: 'draftExtensionRequest',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Generated negotiation draft for task ${taskId} -> approval ${approvalRef.id}`);
  return approvalRef.id;
}
