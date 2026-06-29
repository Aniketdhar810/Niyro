import { db } from '../lib/firestoreClient.js';
import { updateMomentum } from '../lib/userMetrics.js';
import { logActivity } from '../lib/activityLogger.js';
import { NotFoundError } from '../errors/AppError.js';

export async function getGoals(req, res) {
  const uid = req.user.uid;
  const snap = await db.collection('users').doc(uid).collection('goals')
    .orderBy('createdAt', 'desc').get();
  
  const goals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, goals });
}

export async function createGoal(req, res) {
  const uid = req.user.uid;
  const { title, description, targetDate } = req.body;
  const now = new Date().toISOString();

  const goalRef = db.collection('users').doc(uid).collection('goals').doc();
  const goal = {
    title,
    description: description || '',
    targetDate: targetDate || null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  await goalRef.set(goal);
  await logActivity(uid, 'goal_created', { goalId: goalRef.id, title }, { undoable: false });
  res.status(201).json({ success: true, goalId: goalRef.id });
}

export async function updateGoal(req, res) {
  const uid = req.user.uid;
  const { goalId } = req.params;
  const goalRef = db.collection('users').doc(uid).collection('goals').doc(goalId);
  const snap = await goalRef.get();
  if (!snap.exists) throw new NotFoundError('Goal not found');
  
  await goalRef.update({ ...req.body, updatedAt: new Date().toISOString() });
  res.json({ success: true });
}

export async function deleteGoal(req, res) {
  const uid = req.user.uid;
  const { goalId } = req.params;
  const goalRef = db.collection('users').doc(uid).collection('goals').doc(goalId);
  const snap = await goalRef.get();
  if (!snap.exists) throw new NotFoundError('Goal not found');
  
  await goalRef.delete();
  await logActivity(uid, 'goal_deleted', { goalId }, { undoable: false });
  res.json({ success: true });
}

export async function completeGoal(req, res) {
  const uid = req.user.uid;
  const { goalId } = req.params;
  const goalRef = db.collection('users').doc(uid).collection('goals').doc(goalId);
  const snap = await goalRef.get();
  
  if (!snap.exists) throw new NotFoundError('Goal not found');
  const goal = snap.data();
  
  if (goal.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Goal is already completed' });
  }

  // Major momentum boost for completing a goal (e.g. hitting it on time = big boost)
  await updateMomentum(uid, true);
  // We can call it multiple times for a bigger boost, or modify updateMomentum to take a weight later. 
  // Let's call it twice for a "massive boost" as per requirements.
  await updateMomentum(uid, true);

  await goalRef.update({
    status: 'completed',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await logActivity(uid, 'goal_completed', { goalId, title: goal.title }, { undoable: false });
  res.json({ success: true, goalId, status: 'completed' });
}
