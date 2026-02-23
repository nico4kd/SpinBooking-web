import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  period?: string;
  inverse?: boolean; // true if down is good (e.g., costs, errors)
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * TrendIndicator - Shows directional change with color coding
 *
 * Displays percentage change with appropriate color (green=up, red=down)
 * Set inverse=true when down is good (costs, errors, etc.)
 *
 * @example
 * <TrendIndicator
 *   value={20}
 *   period="vs mes pasado"
 *   showIcon
 * />
 *
 * // For metrics where down is good
 * <TrendIndicator
 *   value={-15}
 *   period="vs semana pasada"
 *   inverse
 * />
 */
export function TrendIndicator({
  value,
  period,
  inverse = false,
  size = 'md',
  showIcon = true,
  className,
}: TrendIndicatorProps) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  // Determine if trend is positive based on direction and inverse flag
  const isPositive = inverse
    ? direction === 'down'
    : direction === 'up';

  const isNegative = inverse
    ? direction === 'up'
    : direction === 'down';

  const TrendIcon =
    direction === 'up' ? ArrowUp :
    direction === 'down' ? ArrowDown :
    Minus;

  const colorClass = isPositive
    ? 'text-[hsl(var(--success))]'
    : isNegative
    ? 'text-[hsl(var(--destructive))]'
    : 'text-tertiary';

  const sizeMap = {
    sm: { icon: 'w-3 h-3', text: 'text-xs' },
    md: { icon: 'w-4 h-4', text: 'text-sm' },
    lg: { icon: 'w-5 h-5', text: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`flex items-center gap-1 font-medium ${colorClass} ${className || ''}`}
    >
      {showIcon && (
        <TrendIcon className={currentSize.icon} strokeWidth={2.5} />
      )}

      <span className={currentSize.text}>
        {direction === 'neutral' ? '0' : `${value > 0 ? '+' : ''}${value}`}%
      </span>

      {period && (
        <span className={`${currentSize.text} opacity-75`}>
          {period}
        </span>
      )}
    </div>
  );
}

/**
 * TrendBadge - Compact badge version for inline use
 */
export function TrendBadge({
  value,
  inverse = false,
  className,
}: {
  value: number;
  inverse?: boolean;
  className?: string;
}) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  const isPositive = inverse ? direction === 'down' : direction === 'up';
  const isNegative = inverse ? direction === 'up' : direction === 'down';

  const TrendIcon =
    direction === 'up' ? ArrowUp :
    direction === 'down' ? ArrowDown :
    Minus;

  const bgColor = isPositive
    ? 'bg-[hsl(var(--success)/0.15)]'
    : isNegative
    ? 'bg-[hsl(var(--destructive)/0.15)]'
    : 'bg-[hsl(var(--surface-2))]';

  const textColor = isPositive
    ? 'text-[hsl(var(--success))]'
    : isNegative
    ? 'text-[hsl(var(--destructive))]'
    : 'text-tertiary';

  return (
    <div
      className={`
        inline-flex items-center gap-1
        px-2 py-1 rounded-full
        text-xs font-medium
        ${bgColor} ${textColor}
        ${className || ''}
      `}
    >
      <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
      <span>
        {direction === 'neutral' ? '0' : `${value > 0 ? '+' : ''}${value}`}%
      </span>
    </div>
  );
}
