// src/routes/agents.js
import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { taskIdSchema } from '../lib/schemas.js';
import {
  runRiskAgent,
  runPlanner,
  runPrioritizer,
  runScheduler,
  runExecutor,
  runLastMinute,
} from '../controllers/agentsController.js';

const router = express.Router();
router.use(authMiddleware);

// Risk agent (taskId in URL param)
router.post('/risk/:taskId', validateRequest(taskIdSchema, { source: 'params' }), runRiskAgent);

// Planner agent (taskId param)
router.post('/plan/:taskId', validateRequest(taskIdSchema, { source: 'params' }), runPlanner);

// Prioritizer agent (no params needed, runs across all tasks)
router.post('/prioritize', runPrioritizer);

// Scheduler agent (taskId in body)
router.post('/schedule', validateRequest(taskIdSchema), runScheduler);

// Executor agent (taskId in body)
router.post('/executor', validateRequest(taskIdSchema), runExecutor);

// Last-minute agent (taskId param)
router.post('/last-minute/:taskId', validateRequest(taskIdSchema, { source: 'params' }), runLastMinute);

export default router;
