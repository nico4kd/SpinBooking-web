import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ConsoleMetricProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  intensity?: 'low' | 'medium' | 'high' | 'peak';
  className?: string;
}

export function ConsoleMetric({
  label,
  value,
  icon: Icon,
  trend,
  intensity = 'medium',
  className = '',
}: ConsoleMetricProps) {
  // Console glow based on intensity
  const glowColor = {
    low: 'hsl(var(--primary))',
    medium: 'hsl(var(--primary))',
    high: '38 92% 50%', // amber
    peak: 'hsl(var(--accent-hot))',
  }[intensity];

  const glowIntensity = {
    low: '0.15',
    medium: '0.25',
    high: '0.35',
    peak: '0.5',
  }[intensity];

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-[var(--radius-lg)]
        border border-[hsl(var(--border-default))]
        bg-[hsl(var(--surface-1))]
        p-6
        ${className}
      `}
      style={{
        boxShadow: `0 0 24px hsl(${glowColor}/${glowIntensity})`,
      }}
    >
      {/* Console label - uppercase, tracked */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-tertiary">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `hsl(${glowColor}/0.15)`,
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: `hsl(${glowColor})` }}
            />
          </div>
        )}
      </div>

      {/* Metric value - tabular, bold */}
      <div className="mb-2">
        <span className="text-4xl font-bold tabular-nums tracking-tight">
          {value}
        </span>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1 text-xs font-medium
              ${trend.direction === 'up' ? 'text-[hsl(var(--success))]' : ''}
              ${trend.direction === 'down' ? 'text-[hsl(var(--destructive))]' : ''}
              ${trend.direction === 'neutral' ? 'text-secondary' : ''}
            `}
          >
            {trend.direction === 'up' && <span>↗</span>}
            {trend.direction === 'down' && <span>↘</span>}
            {trend.direction === 'neutral' && <span>→</span>}
            <span>{trend.value}</span>
          </div>
        </div>
      )}

      {/* Subtle scan line effect (console aesthetic) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px)',
        }}
      />
    </div>
  );
}
