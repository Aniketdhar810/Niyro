// src/controllers/taskCompletionController.js
// Specialized controller for completing a task. Updates metrics and status.

import { db } from '../lib/firestoreClient.js';
import { updateMomentum, updateEstimationProfile } from '../lib/userMetrics.js';
import { logActivity } from '../lib/activityLogger.js';

export async function completeTask(req, res) {
  try {
    const uid = req.user.uid;
    const { taskId } = req.params;
    const { actualMinutes } = req.body || {};

    const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
    const snap = await taskRef.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Task not found' });

    const task = snap.data();
    if (task.status === 'done') {
      return res.status(400).json({ success: false, error: 'Task is already done' });
    }

    const now = new Date();
    const completedOnTime = task.dueAt ? now <= new Date(task.dueAt) : true;

    // Run metric updates
    await updateMomentum(uid, completedOnTime);
    if (actualMinutes && task.estimatedMinutes) {
      await updateEstimationProfile(uid, actualMinutes, task.estimatedMinutes);
    }

    // Mark all steps as done (so calendar blocks are freed conceptually)
    const steps = (task.steps || []).map(s => ({ ...s, done: true }));

    // Status is 'done' (not 'completed')
    await taskRef.update({
      status: 'done',
      steps,
      completedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    const activityDetails = { taskId };
    if (actualMinutes !== undefined) {
      activityDetails.actualMinutes = actualMinutes;
    }

    await logActivity(uid, 'task_completed', activityDetails, {
      agent: 'completion_handler',
      action: 'completeTask',
      relatedTaskId: taskId,
      undoable: false,
    });

    res.json({ success: true, taskId, status: 'done' });
  } catch (error) {
    console.error(`Error completing task ${req.params?.taskId}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
}
