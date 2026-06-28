// src/agents/plannerAgent.js
// Planner Agent: planTask(uid, taskId) and generateMVPSteps(uid, taskId).
// Steps are stored as an array field on the task document (not a subcollection).
// Each step: { id, title, isMicrotask, ifThenTrigger, scheduledAt?, calendarEventId?, done }

import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';
import { callGemini } from '../lib/geminiClient.js';
import { randomUUID } from 'crypto';

/**
 * Generate a step-by-step plan for a task.
 * First step is scoped under 15 minutes, every step has an ifThenTrigger.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 * @returns {Promise<Array>} Array of step objects stored on the task.
 */
export async function planTask(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  const prompt = `Break the following task into an ordered list of micro-tasks. Return a JSON array where each element has:
{
  "title": "string",
  "isMicrotask": true/false,
  "ifThenTrigger": "string (e.g. 'If I finish reading chapter 1, then I start the summary')"
}

Rules:
- The FIRST step must be completable in under 15 minutes.
- Every step must have a concrete ifThenTrigger.
- Mark steps as isMicrotask: true if they take under 15 minutes.

Task title: ${task.title}
Description: ${task.description || 'none'}
Due: ${task.dueAt || 'no deadline'}
Estimated total: ${task.estimatedMinutes || 'unknown'} minutes`;

  const result = await callGemini(prompt, { structured: true });
  let rawSteps;
  try {
    rawSteps = Array.isArray(result) ? result : JSON.parse(result);
  } catch {
    rawSteps = [{ title: task.title, isMicrotask: false, ifThenTrigger: 'If I start, then I work on it.' }];
  }

  // Build steps with required fields.
  const steps = rawSteps.map((s) => ({
    id: randomUUID(),
    title: s.title || 'Untitled step',
    isMicrotask: s.isMicrotask ?? false,
    ifThenTrigger: s.ifThenTrigger || null,
    scheduledAt: null,
    calendarEventId: null,
    done: false,
  }));

  await taskRef.update({
    steps,
    updatedAt: new Date().toISOString(),
  });

  await logActivity(uid, 'task_planned', { taskId, stepsCount: steps.length }, {
    agent: 'planner',
    action: 'planTask',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Planner created ${steps.length} steps for task ${taskId}`);
  return steps;
}

/**
 * Generate MVP steps for a critical/last-minute task.
 * A distinct, scoped-down branch called by Last-Minute agent.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 * @param {number} [maxSteps=3] - Maximum MVP steps.
 * @returns {Promise<Array>} MVP step objects stored on the task.
 */
export async function generateMVPSteps(uid, taskId, maxSteps = 3) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  const prompt = `Break the following task into at most ${maxSteps} essential steps that represent the minimum viable deliverable. Return a JSON array where each element has:
{
  "title": "string",
  "isMicrotask": true/false,
  "ifThenTrigger": "string"
}

The first step must be completable in under 15 minutes.

Task title: ${task.title}
Description: ${task.description || 'none'}
Due: ${task.dueAt || 'no deadline'}`;

  const result = await callGemini(prompt, { structured: true });
  let rawSteps;
  try {
    rawSteps = Array.isArray(result) ? result : JSON.parse(result);
  } catch {
    rawSteps = [{ title: task.title, isMicrotask: true, ifThenTrigger: 'Start immediately.' }];
  }

  const steps = rawSteps.slice(0, maxSteps).map((s) => ({
    id: randomUUID(),
    title: s.title || 'MVP step',
    isMicrotask: s.isMicrotask ?? true,
    ifThenTrigger: s.ifThenTrigger || null,
    scheduledAt: null,
    calendarEventId: null,
    done: false,
  }));

  await taskRef.update({
    steps,
    updatedAt: new Date().toISOString(),
  });

  await logActivity(uid, 'task_planned_mvp', { taskId, stepsCount: steps.length }, {
    agent: 'planner',
    action: 'generateMVPSteps',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Planner created MVP ${steps.length} steps for task ${taskId}`);
  return steps;
}
