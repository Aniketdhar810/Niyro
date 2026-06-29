import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { getRecommendations, refreshRecommendations } from '../controllers/recommendationsController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRecommendations);
router.post('/refresh', refreshRecommendations);

export default router;
