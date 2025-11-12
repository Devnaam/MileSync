// src/components/ui/ContentLoader.tsx
import React from 'react';
import Skeleton from './Skeleton';

interface ContentLoaderProps {
  type?: 'card-grid' | 'list' | 'table' | 'detail';
  count?: number;
}

export default function ContentLoader({
  type = 'card-grid',
  count = 3,
}: ContentLoaderProps) {
  if (type === 'card-grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-6 space-y-4">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="80%" height={16} />
            <div className="flex justify-between items-center pt-4">
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 card">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="70%" height={16} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rectangular" width="100%" height={200} />
        <div className="space-y-3">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </div>
      </div>
    );
  }

  return null;
}
