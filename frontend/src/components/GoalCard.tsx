import React, { useState } from 'react';
import type { Goal } from '../lib/apiClient';
import { format, parseISO } from 'date-fns';
import { Target, Check } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onComplete: (id: string) => Promise<boolean>;
  onMomentumBoost: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onComplete, onMomentumBoost }) => {
  const [loading, setLoading] = useState(false);
  
  const isCompleted = goal.status === 'completed';

  const handleComplete = async () => {
    if (isCompleted || loading) return;
    setLoading(true);
    const success = await onComplete(goal.id);
    setLoading(false);
    if (success) {
      onMomentumBoost(); // Massive boost
    }
  };

  return (
    <div className={`p-5 border-4 border-on-surface mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isCompleted ? 'bg-secondary/20' : 'bg-surface'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Target className={isCompleted ? 'text-secondary' : 'text-tertiary'} size={24} />
          <h3 className={`font-sans font-black text-xl uppercase ${isCompleted ? 'line-through text-on-surface/60' : 'text-on-surface'}`}>
            {goal.title}
          </h3>
        </div>
        {!isCompleted && (
          <button 
            onClick={handleComplete}
            disabled={loading}
            className="px-3 py-1 border-2 border-on-surface bg-secondary text-on-surface font-mono font-bold hover:bg-secondary/80 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
          >
            <Check size={16} /> DONE
          </button>
        )}
      </div>
      
      {goal.description && (
        <p className="font-mono text-sm mb-4 text-on-surface/80">
          {goal.description}
        </p>
      )}
      
      {goal.targetDate && (
        <div className="inline-block px-2 py-1 border-2 border-on-surface bg-primary/20 text-on-surface font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          TARGET: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
};
