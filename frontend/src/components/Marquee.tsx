import React from 'react';

interface MarqueeProps {
  text?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  text = "✦ COMPONENT LIBRARY v1.0 ✦ DESIGN SYSTEM DOCUMENTATION ✦ EDITORIAL NEO-BRUTALIST ",
  className = "border-b-border-width-heavy bg-secondary-container"
}) => {
  return (
    <div className={`w-full border-on-background overflow-hidden py-4 marquee-container font-label-mono text-lg uppercase tracking-widest font-black ${className}`}>
      <div className="marquee-content items-center">
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
      </div>
    </div>
  );
};
