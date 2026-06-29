// src/agents/schedulerAgent.js
// Scheduler Agent: real constraint-solving against calendar free/busy data.
// Writes scheduledAt per step within workHours.

import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';
import { solveBatch } from '../lib/schedulerSolver.js';
import { planTask } from './plannerAgent.js';

/**
 * Schedule a task's steps against the user's real calendar.
 * @param {string} uid - Firebase UID.
 * @param {string} taskId - Task document ID.
 * @returns {Promise<Object>} { taskId, scheduledSteps }
 */
export async function scheduleTask(uid, taskId) {
  if (!uid) throw new Error('uid is required');
  if (!taskId) throw new Error('taskId is required');

  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new Error(`Task ${taskId} not found`);
  const task = taskSnap.data();

  let steps = task.steps || [];
  if (steps.length === 0) {
    // Auto-run planner if no steps exist
    console.log(`Task ${taskId} has no steps. Auto-running planner...`);
    steps = await planTask(uid, taskId);
    if (!steps || steps.length === 0) {
      throw new Error('Task has no steps and planner could not generate any.');
    }
  }

  // Only schedule steps that aren't already scheduled and aren't done.
  const unscheduled = steps
    .map((s, i) => ({ ...s, _index: i }))
    .filter((s) => !s.scheduledAt && !s.done);

  if (unscheduled.length === 0) {
    return { taskId, scheduledSteps: [] };
  }

  // Solve against real calendar free/busy data.
  const slotsNeeded = unscheduled.map((s) => ({
    durationMinutes: s.isMicrotask ? 15 : 30,
  }));

  const userSnap = await db.collection('users').doc(uid).get();
  const notificationPrefs = userSnap.exists ? userSnap.data()?.notificationPrefs || {} : {};

  const solved = await solveBatch(uid, slotsNeeded, { 
    windowHours: 24, 
    autonomousActions: notificationPrefs.autonomousActions 
  });
  // Map solved slots back to steps.
  const updatedSteps = [...steps];
  for (const { index: solvedIdx, scheduledAt } of solved) {
    const stepIndex = unscheduled[solvedIdx]._index;
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      scheduledAt,
    };
  }

  await taskRef.update({
    steps: updatedSteps,
    updatedAt: new Date().toISOString(),
  });

  await logActivity(uid, 'task_scheduled', {
    taskId,
    scheduledCount: solved.length,
  }, {
    agent: 'scheduler',
    action: 'scheduleTask',
    relatedTaskId: taskId,
    undoable: false,
  });

  console.log(`Scheduled ${solved.length} steps for task ${taskId}`);
  return { taskId, scheduledSteps: solved };
}
