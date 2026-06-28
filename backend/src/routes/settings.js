import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { settingsUpdateSchema } from '../lib/schemas.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getSettings);
router.patch('/', validateRequest(settingsUpdateSchema), updateSettings);

export default router;
