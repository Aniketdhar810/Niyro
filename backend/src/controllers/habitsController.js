import { db } from '../lib/firestoreClient.js';
import { updateMomentum } from '../lib/userMetrics.js';
import { logActivity } from '../lib/activityLogger.js';
import { NotFoundError } from '../errors/AppError.js';
import { isToday, parseISO } from 'date-fns';

export async function getHabits(req, res) {
  const uid = req.user.uid;
  const snap = await db.collection('users').doc(uid).collection('habits')
    .orderBy('createdAt', 'desc').get();
  
  const habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, habits });
}

export async function createHabit(req, res) {
  const uid = req.user.uid;
  const { title, frequency } = req.body;
  const now = new Date().toISOString();

  const habitRef = db.collection('users').doc(uid).collection('habits').doc();
  const habit = {
    title,
    frequency: frequency || 'daily',
    streak: 0,
    lastCompletedDate: null,
    createdAt: now,
    updatedAt: now,
  };
  await habitRef.set(habit);
  await logActivity(uid, 'habit_created', { habitId: habitRef.id, title }, { undoable: false });
  res.status(201).json({ success: true, habitId: habitRef.id });
}

export async function updateHabit(req, res) {
  const uid = req.user.uid;
  const { habitId } = req.params;
  const habitRef = db.collection('users').doc(uid).collection('habits').doc(habitId);
  const snap = await habitRef.get();
  if (!snap.exists) throw new NotFoundError('Habit not found');
  
  await habitRef.update({ ...req.body, updatedAt: new Date().toISOString() });
  res.json({ success: true });
}

export async function deleteHabit(req, res) {
  const uid = req.user.uid;
  const { habitId } = req.params;
  const habitRef = db.collection('users').doc(uid).collection('habits').doc(habitId);
  const snap = await habitRef.get();
  if (!snap.exists) throw new NotFoundError('Habit not found');
  
  await habitRef.delete();
  await logActivity(uid, 'habit_deleted', { habitId }, { undoable: false });
  res.json({ success: true });
}

export async function completeHabit(req, res) {
  const uid = req.user.uid;
  const { habitId } = req.params;
  const habitRef = db.collection('users').doc(uid).collection('habits').doc(habitId);
  const snap = await habitRef.get();
  
  if (!snap.exists) throw new NotFoundError('Habit not found');
  const habit = snap.data();
  
  if (habit.lastCompletedDate && isToday(parseISO(habit.lastCompletedDate))) {
    return res.status(400).json({ success: false, error: 'Habit already completed today' });
  }

  // Calculate new streak
  const newStreak = (habit.streak || 0) + 1;
  const now = new Date().toISOString();

  // Trigger momentum loop for hitting a habit
  await updateMomentum(uid, true);

  await habitRef.update({
    streak: newStreak,
    lastCompletedDate: now,
    updatedAt: now,
  });

  await logActivity(uid, 'habit_completed', { habitId, title: habit.title, newStreak }, { undoable: false });
  res.json({ success: true, habitId, newStreak });
}
