// src/components/ui/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'cream' | 'charcoal';
  className?: string;
}

export default function Spinner({
  size = 'md',
  color = 'blue',
  className = '',
}: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colors = {
    blue: 'border-accentBlue',
    cream: 'border-cream',
    charcoal: 'border-charcoal',
  };

  return (
    <div
      className={`${sizes[size]} ${className} animate-spin rounded-full border-4 border-lightGray ${colors[color]} border-t-transparent`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
