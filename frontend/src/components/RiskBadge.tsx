import React from 'react';

interface RiskBadgeProps {
  level: string;
  description: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, description }) => {
  return (
    <div className="bg-surface-container-lowest border-border-width border-on-background p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
      <span className="font-label-mono-sm text-label-mono-sm text-outline uppercase z-10">Risk Assessment</span>
      
      <div className="text-center z-10">
        <div className="font-display-xl text-headline-lg text-tertiary">{level}</div>
        <div className="font-label-mono text-label-mono text-on-background uppercase bg-tertiary-fixed-dim border-border-width border-on-background px-3 py-1 mt-2 inline-block">
          {description}
        </div>
      </div>
    </div>
  );
};
