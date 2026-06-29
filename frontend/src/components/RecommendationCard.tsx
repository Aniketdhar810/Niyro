import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recommendation } from '../lib/apiClient';

interface RecommendationCardProps {
  rec: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
  const navigate = useNavigate();
  
  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/5',
    medium: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-blue-500/30 bg-blue-500/5',
  };

  return (
    <div className={`rounded-xl border p-4 ${priorityColors[rec.priority] || priorityColors.medium}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-on-surface mb-1">{rec.title}</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">{rec.body}</p>
          {rec.actionLabel && rec.actionRoute && (
            <button
              onClick={() => navigate(rec.actionRoute!)}
              className="mt-3 text-xs font-medium text-primary hover:text-primary-variant 
                         flex items-center gap-1 transition-colors"
            >
              {rec.actionLabel} →
            </button>
          )}
        </div>
        {rec.priority === 'high' && (
          <span className="text-xs bg-red-500/20 text-red-700 border border-red-500/30 
                          px-2 py-0.5 rounded-full shrink-0 font-bold uppercase tracking-wider">
            High
          </span>
        )}
      </div>
    </div>
  );
};
