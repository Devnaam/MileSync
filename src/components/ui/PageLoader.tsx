// src/components/ui/PageLoader.tsx
import React from 'react';

interface PageLoaderProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'branded';
}

export default function PageLoader({
  message = 'Loading...',
  variant = 'default',
}: PageLoaderProps) {
  if (variant === 'minimal') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          {/* Outer circle */}
          <div className="h-16 w-16 rounded-full border-4 border-lightGray animate-pulse" />
          {/* Inner spinning circle */}
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-accentBlue animate-spin" />
        </div>
      </div>
    );
  }

  if (variant === 'branded') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-cream">
        <div className="text-center">
          {/* Animated logo placeholder */}
          <div className="mb-6 inline-block">
            <div className="relative h-20 w-20">
              {/* Pulsing background */}
              <div className="absolute inset-0 rounded-2xl bg-accentBlue opacity-20 animate-ping" />
              {/* Logo container */}
              <div className="relative flex items-center justify-center h-20 w-20 rounded-2xl bg-accentBlue shadow-lg">
                <span className="text-3xl font-bold text-white">M</span>
              </div>
            </div>
          </div>
          
          {/* Brand name */}
          <h2 className="text-2xl font-bold text-charcoal mb-2 animate-pulse">
            MileSync
          </h2>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-accentBlue animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-accentBlue animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-accentBlue animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          
          <p className="mt-4 text-sm text-mediumGray">{message}</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Multi-layer spinner */}
        <div className="relative inline-block">
          <div className="h-16 w-16 rounded-full border-4 border-lightGray" />
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-accentBlue animate-spin" />
          <div className="absolute top-2 left-2 h-12 w-12 rounded-full border-4 border-transparent border-t-cream animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        
        <p className="mt-4 text-mediumGray font-medium">{message}</p>
      </div>
    </div>
  );
}
