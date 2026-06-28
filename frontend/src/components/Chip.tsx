import React from 'react';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, active = false, onClick }) => {
  const activeClasses = 'bg-on-background text-background border-on-background';
  const inactiveClasses = 'bg-surface text-on-background border-on-background hover:bg-surface-container';

  return (
    <span 
      onClick={onClick}
      className={`font-label-mono-sm text-label-mono-sm px-3 py-1 rounded-full border-border-width uppercase cursor-pointer transition-colors ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </span>
  );
};
