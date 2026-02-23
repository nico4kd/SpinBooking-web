import React from 'react';
import { Trophy, Users, Target } from 'lucide-react';

interface ComparisonProps {
  value: number;
  benchmark: {
    label: string;
    value: number;
  };
  type?: 'percentile' | 'ratio' | 'difference';
  color?: 'primary' | 'success' | 'accent-hot';
  showIcon?: boolean;
  className?: string;
}

/**
 * Comparison - Shows how a value compares to a benchmark
 *
 * Three display types:
 * - percentile: "Top 15%" (value is percentile rank)
 * - ratio: "2x promedio" (value compared to benchmark.value)
 * - difference: "+5 vs promedio" (absolute difference)
 *
 * @example
 * <Comparison
 *   value={85}
 *   benchmark={{ label: 'usuarios', value: 0 }}
 *   type="percentile"
 * />
 *
 * <Comparison
 *   value={8}
 *   benchmark={{ label: 'promedio', value: 4 }}
 *   type="ratio"
 * />
 *
 * <Comparison
 *   value={12}
 *   benchmark={{ label: 'meta mensual', value: 10 }}
 *   type="difference"
 * />
 */
export function Comparison({
  value,
  benchmark,
  type = 'percentile',
  color = 'primary',
  showIcon = true,
  className,
}: ComparisonProps) {
  const colorMap = {
    primary: {
      bg: 'bg-[hsl(var(--primary)/0.1)]',
      text: 'text-[hsl(var(--primary))]',
      icon: Trophy,
    },
    success: {
      bg: 'bg-[hsl(var(--success)/0.1)]',
      text: 'text-[hsl(var(--success))]',
      icon: Target,
    },
    'accent-hot': {
      bg: 'bg-[hsl(var(--accent-hot)/0.1)]',
      text: 'text-[hsl(var(--accent-hot))]',
      icon: Users,
    },
  };

  const config = colorMap[color];
  const Icon = config.icon;

  // Calculate display text based on type
  const displayText = (() => {
    switch (type) {
      case 'percentile':
        return `Top ${100 - value}% de ${benchmark.label}`;

      case 'ratio': {
        const ratio = benchmark.value > 0 ? value / benchmark.value : 0;
        return `${ratio.toFixed(1)}x ${benchmark.label}`;
      }

      case 'difference': {
        const diff = value - benchmark.value;
        const sign = diff > 0 ? '+' : '';
        return `${sign}${diff} vs ${benchmark.label}`;
      }

      default:
        return '';
    }
  })();

  return (
    <div
      className={`
        flex items-center justify-center gap-2
        px-3 py-2 rounded-lg
        text-sm font-medium
        ${config.bg} ${config.text}
        ${className || ''}
      `}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      <span>{displayText}</span>
    </div>
  );
}

/**
 * ComparisonBadge - Compact badge version
 */
export function ComparisonBadge({
  text,
  color = 'primary',
  className,
}: {
  text: string;
  color?: 'primary' | 'success' | 'accent-hot';
  className?: string;
}) {
  const colorMap = {
    primary: {
      bg: 'bg-[hsl(var(--primary)/0.1)]',
      text: 'text-[hsl(var(--primary))]',
    },
    success: {
      bg: 'bg-[hsl(var(--success)/0.1)]',
      text: 'text-[hsl(var(--success))]',
    },
    'accent-hot': {
      bg: 'bg-[hsl(var(--accent-hot)/0.1)]',
      text: 'text-[hsl(var(--accent-hot))]',
    },
  };

  const config = colorMap[color];

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-1 rounded-full
        text-xs font-medium
        ${config.bg} ${config.text}
        ${className || ''}
      `}
    >
      {text}
    </span>
  );
}
