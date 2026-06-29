import express from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../lib/authMiddleware.js';
import { habitCreateSchema, habitUpdateSchema, habitIdSchema } from '../lib/schemas.js';
import { getHabits, createHabit, updateHabit, deleteHabit, completeHabit } from '../controllers/habitsController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getHabits);
router.post('/', validateRequest(habitCreateSchema), createHabit);
router.patch('/:habitId', validateRequest(habitIdSchema, { source: 'params' }), validateRequest(habitUpdateSchema), updateHabit);
router.delete('/:habitId', validateRequest(habitIdSchema, { source: 'params' }), deleteHabit);
router.post('/:habitId/complete', validateRequest(habitIdSchema, { source: 'params' }), completeHabit);

export default router;
