import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'font-label-mono text-label-mono px-6 py-3 uppercase rounded-full w-full flex items-center justify-center gap-2 transition-all';
  
  const variants = {
    primary: 'bg-primary text-on-primary border-border-width border-on-background neo-brutalist-shadow neo-brutalist-shadow-hover',
    secondary: 'bg-surface-container-lowest text-on-background border-border-width border-on-background neo-brutalist-shadow neo-brutalist-shadow-hover',
    ghost: 'text-on-background hover:bg-surface-container group relative'
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
      {variant === 'ghost' && (
        <svg 
          className="w-6 h-6 absolute -right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-tertiary" 
          fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      )}
    </button>
  );
};
