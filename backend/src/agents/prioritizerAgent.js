// src/agents/prioritizerAgent.js
// Prioritizer Agent: ranks tasks RELATIVE TO EACH OTHER
// (urgency × effort × calendar load), not isolated per-task buckets.

import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import { queryFreeBusy } from '../lib/calendarClient.js';
import { logActivity } from '../lib/activityLogger.js';

/**
 * Prioritize all pending/in_progress tasks for a user.
 * Returns a ranked list and writes `priority` (rank order) to each task.
 * @param {string} uid - Firebase UID.
 * @returns {Promise<Array<{taskId: string, rank: number, title: string}>>} Ranked tasks.
 */
export async function prioritizeTasks(uid) {
  if (!uid) throw new Error('uid is required');

  // Get all non-done tasks.
  const tasksSnap = await db
    .collection('users')
    .doc(uid)
    .collection('tasks')
    .where('status', 'in', ['pending', 'in_progress'])
    .get();

  if (tasksSnap.empty) return [];

  const tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Get calendar load for context.
  let busyCount = 0;
  try {
    const now = new Date();
    const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const freebusy = await queryFreeBusy(uid, now.toISOString(), weekOut.toISOString());
    busyCount = freebusy.calendars?.primary?.busy?.length || 0;
  } catch (e) {
    console.warn('Calendar query failed for prioritization:', e.message);
  }

  // Build Gemini prompt for relative ranking.
  const taskSummaries = tasks.map((t, i) =>
    `[${i}] "${t.title}" — due: ${t.dueAt || 'none'}, est: ${t.estimatedMinutes || '?'} min, risk: ${t.riskLevel || 'on_track'}`
  ).join('\n');

  const prompt = `Rank the following tasks by priority (most urgent first). Consider:
- Urgency (time until deadline)
- Effort required (estimated minutes)
- Calendar load: ${busyCount} busy slots this week
- Risk level

Return a JSON array of indices in priority order (most important first), e.g. [2, 0, 1].

Tasks:
${taskSummaries}`;

  let ranking;
  try {
    const result = await callGemini(prompt, { structured: true });
    ranking = Array.isArray(result) ? result : JSON.parse(result);
  } catch {
    // Fallback: rank by due date, then by risk.
    ranking = tasks
      .map((_, i) => i)
      .sort((a, b) => {
        const da = tasks[a].dueAt ? new Date(tasks[a].dueAt).getTime() : Infinity;
        const db_ = tasks[b].dueAt ? new Date(tasks[b].dueAt).getTime() : Infinity;
        return da - db_;
      });
  }

  // Write rank to each task.
  const batch = db.batch();
  const ranked = [];
  for (let rank = 0; rank < ranking.length; rank++) {
    const idx = ranking[rank];
    if (idx < 0 || idx >= tasks.length) continue;
    const task = tasks[idx];
    const taskRef = db.collection('users').doc(uid).collection('tasks').doc(task.id);
    batch.update(taskRef, { priority: rank + 1, updatedAt: new Date().toISOString() });
    ranked.push({ taskId: task.id, rank: rank + 1, title: task.title });
  }
  await batch.commit();

  await logActivity(uid, 'tasks_prioritized', { count: ranked.length }, {
    agent: 'prioritizer',
    action: 'prioritizeTasks',
    undoable: false,
  });

  console.log(`Prioritized ${ranked.length} tasks for user ${uid}`);
  return ranked;
}
