// src/routes/approvals.js
import express from 'express';
import { listPending, approve, reject } from '../controllers/approvalsController.js';
import { authMiddleware } from '../lib/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listPending);
router.post('/:id/approve', approve);
router.post('/:id/reject', reject);

export default router;
