import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Sparkles } from 'lucide-react';

const ringVariants = cva(
  'relative inline-flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface IntensityRingProps extends VariantProps<typeof ringVariants> {
  value: number;
  max: number;
  color?: 'cyan' | 'pink' | 'amber' | 'success';
  showValue?: boolean;
  label?: string;
  className?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  animate?: boolean;
  onComplete?: () => void;
}

const colorMap = {
  cyan: {
    ring: 'stroke-[hsl(var(--primary))]',
    glow: 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]',
  },
  pink: {
    ring: 'stroke-[hsl(var(--accent-hot))]',
    glow: 'drop-shadow-[0_0_8px_hsl(var(--accent-hot)/0.4)]',
  },
  amber: {
    ring: 'stroke-[hsl(var(--warning))]',
    glow: 'drop-shadow-[0_0_8px_hsl(var(--warning)/0.4)]',
  },
  success: {
    ring: 'stroke-[hsl(var(--success))]',
    glow: 'drop-shadow-[0_0_8px_hsl(var(--success)/0.4)]',
  },
};

export function IntensityRing({
  value,
  max,
  color: propColor,
  size,
  showValue = true,
  label,
  className,
  urgency: propUrgency,
  animate = true,
  onComplete,
}: IntensityRingProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isComplete, setIsComplete] = useState(false);

  // Animated value transitions
  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, animate]);

  // Completion detection
  useEffect(() => {
    if (value >= max && !isComplete) {
      setIsComplete(true);
      onComplete?.();

      // Reset after animation
      const timer = setTimeout(() => setIsComplete(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [value, max, isComplete, onComplete]);

  const percentage = max > 0 ? Math.min((displayValue / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Auto-detect urgency based on percentage if not provided
  const urgency = propUrgency || (() => {
    if (percentage < 20) return 'critical';
    if (percentage < 40) return 'high';
    if (percentage < 70) return 'medium';
    return 'low';
  })();

  // Auto-select color based on urgency if not provided
  const color = propColor || (() => {
    if (urgency === 'critical') return 'pink';
    if (urgency === 'high') return 'amber';
    if (urgency === 'medium') return 'cyan';
    return 'success';
  })();

  // Glow intensity scales with percentage
  const glowOpacity = Math.min(0.6, (percentage / 100) * 0.6);
  const isPulseNeeded = urgency === 'critical';

  const sizeMap = {
    sm: { fontSize: 'text-xs', strokeWidth: 6 },
    md: { fontSize: 'text-sm', strokeWidth: 5 },
    lg: { fontSize: 'text-2xl', strokeWidth: 4 },
    xl: { fontSize: 'text-3xl', strokeWidth: 3 },
  };

  const currentSize = sizeMap[size || 'md'];

  return (
    <div className={ringVariants({ size, className })}>
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--border-default))"
          strokeWidth={currentSize.strokeWidth}
        />
        {/* Progress ring with glow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth={currentSize.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colorMap[color].ring} transition-all duration-500 ease-out`}
          style={{
            filter: `drop-shadow(0 0 8px hsl(var(--${color === 'cyan' ? 'primary' : color === 'pink' ? 'accent-hot' : color === 'amber' ? 'warning' : 'success'})/${glowOpacity}))`,
          }}
        />
      </svg>

      {/* Pulse animation for critical state */}
      {isPulseNeeded && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
             style={{ backgroundColor: `hsl(var(--${color === 'cyan' ? 'primary' : color === 'pink' ? 'accent-hot' : color === 'amber' ? 'warning' : 'success'}))` }} />
      )}

      {/* Sparkle effect on completion */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
          <Sparkles
            className="w-1/2 h-1/2 animate-[spin_1s_ease-in-out]"
            style={{ color: `hsl(var(--${color === 'cyan' ? 'primary' : color === 'pink' ? 'accent-hot' : color === 'amber' ? 'warning' : 'success'}))` }}
          />
        </div>
      )}

      {showValue && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className={`font-semibold tabular-nums tracking-tight ${currentSize.fontSize}`}>
            {displayValue}
          </span>
          {label && (
            <span className="text-xs text-tertiary mt-0.5">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}
