// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
