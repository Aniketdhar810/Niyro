import React, { useState } from 'react';
import type { Habit } from '../lib/apiClient';
import { isToday, parseISO } from 'date-fns';
import { CheckCircle, Circle } from 'lucide-react';

interface HabitItemProps {
  habit: Habit;
  onComplete: (id: string) => Promise<boolean>;
  onMomentumBoost: () => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onComplete, onMomentumBoost }) => {
  const [loading, setLoading] = useState(false);
  
  const completedToday = habit.lastCompletedDate ? isToday(parseISO(habit.lastCompletedDate)) : false;

  const handleCheck = async () => {
    if (completedToday || loading) return;
    setLoading(true);
    const success = await onComplete(habit.id);
    setLoading(false);
    if (success) {
      onMomentumBoost();
    }
  };

  return (
    <div className={`p-4 border-b-2 border-on-surface last:border-b-0 flex items-center justify-between ${completedToday ? 'bg-secondary/10' : ''}`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleCheck}
          disabled={completedToday || loading}
          className={`transition-colors ${completedToday ? 'text-secondary' : 'text-on-surface hover:text-primary'}`}
        >
          {completedToday ? <CheckCircle size={24} /> : <Circle size={24} />}
        </button>
        <div>
          <h4 className={`font-mono font-bold ${completedToday ? 'line-through text-on-surface/50' : 'text-on-surface'}`}>
            {habit.title}
          </h4>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 border-2 border-on-surface bg-tertiary text-on-surface font-mono font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          🔥 {habit.streak}
        </span>
      </div>
    </div>
  );
};
