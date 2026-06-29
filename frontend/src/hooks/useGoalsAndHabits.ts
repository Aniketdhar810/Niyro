import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/apiClient';
import type { Goal, Habit } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

export function useGoalsAndHabits() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [goalsRes, habitsRes] = await Promise.all([
        api.getGoals(),
        api.getHabits()
      ]);
      if (goalsRes.success) setGoals(goalsRes.goals);
      if (habitsRes.success) setHabits(habitsRes.habits);
    } catch (e) {
      console.error('Failed to fetch goals and habits', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addGoal = async (title: string, description?: string, targetDate?: string) => {
    const res = await api.createGoal({ title, description, targetDate });
    if (res.success) {
      await fetchAll();
    }
  };

  const markGoalCompleted = async (goalId: string) => {
    const res = await api.completeGoal(goalId);
    if (res.success) {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'completed' } : g));
      return true; // Used to trigger local UI re-fetches for momentum
    }
    return false;
  };

  const addHabit = async (title: string) => {
    const res = await api.createHabit({ title, frequency: 'daily' });
    if (res.success) {
      await fetchAll();
    }
  };

  const markHabitCompleted = async (habitId: string) => {
    const res = await api.completeHabit(habitId);
    if (res.success) {
      const now = new Date().toISOString();
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, streak: res.newStreak, lastCompletedDate: now } : h));
      return true; // Used to trigger local UI re-fetches for momentum
    }
    return false;
  };

  return {
    goals,
    habits,
    loading,
    addGoal,
    markGoalCompleted,
    addHabit,
    markHabitCompleted,
    refresh: fetchAll
  };
}
