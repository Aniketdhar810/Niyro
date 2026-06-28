import React from 'react';

interface SourceBadgeProps {
  source: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  return (
    <span className="bg-surface-container-highest text-on-background font-label-mono-sm text-label-mono-sm px-2 py-1 border-border-width border-on-background uppercase font-bold">
      [{source}]
    </span>
  );
};
