import express from 'express';
import { authMiddleware } from '../lib/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { taskCreateSchema, taskUpdateSchema, taskIdSchema } from '../lib/schemas.js';
import { db } from '../lib/firestoreClient.js';
import { logActivity } from '../lib/activityLogger.js';
import { completeTask } from '../controllers/taskCompletionController.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/v1/tasks — list all non-deleted tasks for the user
router.get('/', async (req, res) => {
  const uid = req.user.uid;
  const snap = await db.collection('users').doc(uid).collection('tasks')
    .orderBy('createdAt', 'desc').get();
  const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, tasks });
});

// POST /api/v1/tasks — create a new task manually
router.post('/', validateRequest(taskCreateSchema), async (req, res) => {
  const uid = req.user.uid;
  const { title, description, dueAt, estimatedMinutes } = req.body;
  const now = new Date().toISOString();
  
  let embeddingVector = [];
  try {
    const { getEmbedding } = await import('../lib/vertexEmbeddingClient.js');
    const { FieldValue } = await import('firebase-admin/firestore');
    const textToEmbed = `${title} ${description || ''}`.trim();
    const embedding = await getEmbedding(textToEmbed);
    embeddingVector = FieldValue.vector(embedding);
  } catch (e) {
    console.error('Failed to generate embedding for manual task', e);
  }
  
  const taskRef = db.collection('users').doc(uid).collection('tasks').doc();
  const task = {
    title,
    description: description || '',
    dueAt: dueAt || null,
    estimatedMinutes: estimatedMinutes || null,
    source: 'manual',
    sourceRef: null,
    createdAt: now,
    status: 'pending',
    riskLevel: 'on_track',
    steps: [],
    ...(embeddingVector.length !== 0 || embeddingVector.type ? { embedding: embeddingVector } : {})
  };
  await taskRef.set(task);
  await logActivity(uid, 'task_created', { taskId: taskRef.id, title }, { undoable: false });
  res.status(201).json({ success: true, taskId: taskRef.id });
});

// PATCH /api/v1/tasks/:taskId — update task fields
router.patch('/:taskId', validateRequest(taskIdSchema, { source: 'params' }), validateRequest(taskUpdateSchema), async (req, res) => {
  const uid = req.user.uid;
  const { taskId } = req.params;
  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const snap = await taskRef.get();
  if (!snap.exists) throw new NotFoundError('Task not found');
  await taskRef.update({ ...req.body, updatedAt: new Date().toISOString() });
  res.json({ success: true });
});

// DELETE /api/v1/tasks/:taskId
router.delete('/:taskId', validateRequest(taskIdSchema, { source: 'params' }), async (req, res) => {
  const uid = req.user.uid;
  const { taskId } = req.params;
  const taskRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  const snap = await taskRef.get();
  if (!snap.exists) throw new NotFoundError('Task not found');
  await taskRef.delete();
  await logActivity(uid, 'task_deleted', { taskId }, { undoable: false });
  res.json({ success: true });
});

// POST /api/v1/tasks/:taskId/complete — mark done, trigger momentum loop
router.post('/:taskId/complete', validateRequest(taskIdSchema, { source: 'params' }), completeTask);

export default router;
