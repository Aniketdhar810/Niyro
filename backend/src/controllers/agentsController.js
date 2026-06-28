// src/controllers/agentsController.js
// Handles HTTP requests to manually trigger agents for a specific task.
// Extracts uid from req.user and passes it to the agents.

import { assessRisk } from '../agents/riskAgent.js';
import { planTask } from '../agents/plannerAgent.js';
import { prioritizeTasks } from '../agents/prioritizerAgent.js';
import { scheduleTask } from '../agents/schedulerAgent.js';
import { executeTask } from '../agents/executorAgent.js';
import { processLastMinute } from '../agents/lastMinuteAgent.js';

export async function runRiskAgent(req, res) {
  try {
    const { taskId } = req.params;
    const uid = req.user.uid;
    const result = await assessRisk(uid, taskId);
    res.json({ success: true, risk: result.riskLevel, details: result.riskDetails });
  } catch (error) {
    console.error('Agent Error in runRiskAgent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runPlanner(req, res) {
  try {
    const { taskId } = req.params;
    const uid = req.user.uid;
    const steps = await planTask(uid, taskId);
    res.json({ success: true, steps });
  } catch (error) {
    console.error('Agent Error in runPlanner:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runPrioritizer(req, res) {
  try {
    const uid = req.user.uid;
    // Prioritizer runs across all tasks, no taskId needed
    const ranked = await prioritizeTasks(uid);
    res.json({ success: true, ranked });
  } catch (error) {
    console.error('Agent Error in runPrioritizer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runScheduler(req, res) {
  try {
    const { taskId } = req.body;
    const uid = req.user.uid;
    const result = await scheduleTask(uid, taskId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Agent Error in runScheduler:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runExecutor(req, res) {
  try {
    const { taskId } = req.body;
    const uid = req.user.uid;
    const result = await executeTask(uid, taskId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Agent Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function runLastMinute(req, res) {
  try {
    const { taskId } = req.params;
    const uid = req.user.uid;
    const result = await processLastMinute(uid, taskId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
