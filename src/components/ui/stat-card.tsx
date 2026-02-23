import React from 'react';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import { Card } from './card';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  change?: {
    value: number;
    period: string;
  };
  sparkline?: number[];
  comparison?: string;
  color?: 'cyan' | 'pink' | 'amber' | 'success';
  className?: string;
}

/**
 * StatCard - Large number display with sparkline and comparison
 *
 * Used for: Totals, counts, averages, KPIs
 *
 * @example
 * <StatCard
 *   label="Clases Este Mes"
 *   value={12}
 *   icon={Calendar}
 *   change={{ value: 20, period: 'vs mes pasado' }}
 *   sparkline={[8, 10, 9, 12, 11, 12, 12]}
 *   comparison="Top 15% de usuarios"
 * />
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  sparkline,
  comparison,
  color = 'cyan',
  className,
}: StatCardProps) {
  const changeDirection = change ? (
    change.value > 0 ? 'up' :
    change.value < 0 ? 'down' :
    'neutral'
  ) : null;

  const TrendIcon = changeDirection === 'up' ? ArrowUp :
                    changeDirection === 'down' ? ArrowDown :
                    Minus;

  const trendColor = changeDirection === 'up' ? 'text-[hsl(var(--success))]' :
                     changeDirection === 'down' ? 'text-[hsl(var(--destructive))]' :
                     'text-tertiary';

  const accentColor = color === 'cyan' ? 'primary' :
                      color === 'pink' ? 'accent-hot' :
                      color === 'amber' ? 'warning' :
                      'success';

  return (
    <Card
      variant="default"
      className={`p-6 flex flex-col gap-4 ${className || ''}`}
    >
      {/* Header with Icon and Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                backgroundColor: `hsl(var(--${accentColor}) / 0.15)`,
                color: `hsl(var(--${accentColor}))`,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-label text-tertiary">{label}</span>
        </div>

        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>

      {/* Large Value */}
      <div className="flex items-end gap-3">
        <span className="text-data text-5xl tabular-nums">
          {value}
        </span>
      </div>

      {/* Change Label */}
      {change && (
        <p className="text-xs text-secondary -mt-2">
          {change.period}
        </p>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="h-12 -mx-2">
          <Sparkline data={sparkline} color={accentColor} />
        </div>
      )}

      {/* Comparison */}
      {comparison && (
        <div
          className="px-2 py-1 rounded text-xs text-center font-medium"
          style={{
            backgroundColor: `hsl(var(--${accentColor}) / 0.1)`,
            color: `hsl(var(--${accentColor}))`,
          }}
        >
          {comparison}
        </div>
      )}
    </Card>
  );
}

/**
 * Sparkline - Miniature line chart for trends
 */
function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Create SVG path points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsl(var(--${color}))`} stopOpacity="0.3" />
          <stop offset="100%" stopColor={`hsl(var(--${color}))`} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area under line */}
      <path
        d={`${pathData} L 100,100 L 0,100 Z`}
        fill={`url(#sparkline-gradient-${color})`}
      />

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={`hsl(var(--${color}))`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* Dots at data points */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="1.5"
            fill={`hsl(var(--${color}))`}
          />
        );
      })}
    </svg>
  );
}
