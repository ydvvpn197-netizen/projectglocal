import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

const variants = {
  default: 'h-4 w-full rounded',
  card: 'h-32 w-full rounded-lg',
  text: 'h-4 w-full rounded',
  avatar: 'h-10 w-10 rounded-full',
  button: 'h-10 w-24 rounded'
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className,
  variant = 'default',
  lines = 1
}) => {
  if (lines === 1) {
    return (
      <div 
        className={cn(
          'animate-pulse bg-muted',
          variants[variant],
          className
        )}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-muted',
            variants[variant],
            index === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
};

// Pre-built skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4', className)}>
    <LoadingSkeleton variant="avatar" className="h-10 w-10" />
    <LoadingSkeleton variant="text" lines={2} />
    <LoadingSkeleton variant="card" className="h-32" />
  </div>
);

export const PostSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4', className)}>
    <div className="flex items-center space-x-3">
      <LoadingSkeleton variant="avatar" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton variant="text" className="w-1/4" />
        <LoadingSkeleton variant="text" className="w-1/6" />
      </div>
    </div>
    <LoadingSkeleton variant="text" lines={3} />
    <LoadingSkeleton variant="card" className="h-48" />
    <div className="flex space-x-4">
      <LoadingSkeleton variant="button" className="w-16" />
      <LoadingSkeleton variant="button" className="w-16" />
      <LoadingSkeleton variant="button" className="w-16" />
    </div>
  </div>
);

export const EventSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4', className)}>
    <LoadingSkeleton variant="card" className="h-48" />
    <div className="space-y-2">
      <LoadingSkeleton variant="text" className="w-3/4" />
      <LoadingSkeleton variant="text" lines={2} />
      <div className="flex space-x-2">
        <LoadingSkeleton variant="text" className="w-1/4" />
        <LoadingSkeleton variant="text" className="w-1/4" />
      </div>
    </div>
  </div>
);

export const CommentSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4', className)}>
    <div className="flex items-center space-x-3">
      <LoadingSkeleton variant="avatar" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton variant="text" className="w-1/4" />
        <LoadingSkeleton variant="text" lines={2} />
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
