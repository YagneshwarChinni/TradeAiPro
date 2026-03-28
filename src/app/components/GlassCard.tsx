import React from 'react';
import { cn } from './ui/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'green' | 'red' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false,
  glow = 'none' 
}) => {
  const glowClasses = {
    blue: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    purple: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    green: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    red: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-md bg-card/50 border border-border rounded-xl p-6',
        'transition-all duration-300',
        hover && 'hover:bg-card/70 hover:border-primary/50 hover:shadow-lg cursor-pointer',
        glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
};
