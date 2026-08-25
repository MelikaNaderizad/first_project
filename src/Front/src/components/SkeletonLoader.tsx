import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rect';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'card':
        return 'rounded-2xl glass-card p-5';
      case 'text':
        return 'rounded-md h-4';
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-white/[0.03] border border-white/[0.06] ${getVariantStyles()} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,183,209,0.08)] to-transparent" />
    </div>
  );
};

export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-7 animate-pulse">
    {/* 3 Main Featured KPI Boxes */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-6 h-64 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Skeleton className="w-28 h-5" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
          <div className="flex items-center justify-center my-3">
            <Skeleton className="w-40 h-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-full h-3 rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Supplementary Skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-card p-4 h-28 space-y-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-7" />
        </div>
      ))}
    </div>
  </div>
);

export const CommentsSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Summary Bar */}
    <div className="glass-card p-5 h-24 flex items-center justify-between">
      <Skeleton className="w-48 h-8" />
      <Skeleton className="w-64 h-6" />
    </div>

    {/* 21 Comments Grid (7 rows x 3 cols) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="glass-card p-5 h-56 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-16 h-5" />
          </div>
          <Skeleton className="w-full h-12" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
