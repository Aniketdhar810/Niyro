import express from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { goalCreateSchema, goalUpdateSchema, goalIdSchema } from '../lib/schemas.js';
import { getGoals, createGoal, updateGoal, deleteGoal, completeGoal } from '../controllers/goalsController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getGoals);
router.post('/', validateRequest(goalCreateSchema), createGoal);
router.patch('/:goalId', validateRequest(goalIdSchema, { source: 'params' }), validateRequest(goalUpdateSchema), updateGoal);
router.delete('/:goalId', validateRequest(goalIdSchema, { source: 'params' }), deleteGoal);
router.post('/:goalId/complete', validateRequest(goalIdSchema, { source: 'params' }), completeGoal);

export default router;
