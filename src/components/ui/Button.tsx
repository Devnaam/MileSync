// src/components/ui/Button.tsx
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-accentBlue text-white hover:bg-opacity-90',
    secondary: 'bg-lightGray text-charcoal hover:bg-mediumGray hover:text-white',
    outline: 'border-2 border-accentBlue text-accentBlue hover:bg-accentBlue hover:text-white',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" color={variant === 'primary' ? 'cream' : 'blue'} />}
      {children}
    </button>
  );
}
