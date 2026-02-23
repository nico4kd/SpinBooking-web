import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-[var(--radius-md)]
        bg-[hsl(var(--surface-1))]
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r
        before:from-transparent
        before:via-[hsl(var(--surface-2))]
        before:to-transparent
        ${className || ''}
      `}
      {...props}
    />
  );
}

// Specialized skeleton variants for common patterns
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className || ''}`} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-lg)]
        border border-[hsl(var(--border-default))]
        bg-[hsl(var(--surface-1))]
        p-6
        ${className || ''}
      `}
      {...props}
    >
      <div className="space-y-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex gap-4 pb-3 border-b border-[hsl(var(--border-default))]">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-48 flex-1" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}
