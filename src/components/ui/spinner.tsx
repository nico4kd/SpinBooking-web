import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent-hot' | 'success' | 'white';
  message?: string;
  className?: string;
}

/**
 * Spinner - Loading spinner with optional message
 *
 * Console-style loading indicator
 *
 * @example
 * {loading && <Spinner message="Cargando clases..." />}
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  message,
  className,
}: SpinnerProps) {
  const sizeMap = {
    sm: { icon: 'w-4 h-4', text: 'text-xs' },
    md: { icon: 'w-6 h-6', text: 'text-sm' },
    lg: { icon: 'w-8 h-8', text: 'text-base' },
    xl: { icon: 'w-12 h-12', text: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  const colorMap = {
    primary: 'text-[hsl(var(--primary))]',
    'accent-hot': 'text-[hsl(var(--accent-hot))]',
    success: 'text-[hsl(var(--success))]',
    white: 'text-white',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className || ''}`}
    >
      {/* Spinner icon */}
      <Loader2
        className={`${currentSize.icon} ${colorMap[color]} animate-spin`}
        strokeWidth={2.5}
      />

      {/* Optional message */}
      {message && (
        <p className={`${currentSize.text} text-secondary animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * InlineSpinner - Small spinner for inline use (buttons, inputs)
 */
export function InlineSpinner({
  className,
}: {
  className?: string;
}) {
  return (
    <Loader2
      className={`w-4 h-4 animate-spin ${className || ''}`}
      strokeWidth={2.5}
    />
  );
}
