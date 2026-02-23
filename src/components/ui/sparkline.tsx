import React from 'react';

interface SparklineProps {
  data: number[];
  color?: 'primary' | 'accent-hot' | 'success' | 'warning';
  showDots?: boolean;
  showArea?: boolean;
  height?: number;
  className?: string;
}

/**
 * Sparkline - Miniature line chart for showing trends
 *
 * Compact visualization for displaying data patterns inline
 *
 * @example
 * <Sparkline
 *   data={[2, 3, 2, 4, 3, 4, 4]}
 *   color="primary"
 *   showDots
 *   height={48}
 * />
 */
export function Sparkline({
  data,
  color = 'primary',
  showDots = true,
  showArea = true,
  height = 48,
  className,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Create SVG path points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y };
  });

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const colorMap = {
    primary: 'hsl(var(--primary))',
    'accent-hot': 'hsl(var(--accent-hot))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
  };

  const strokeColor = colorMap[color];
  const gradientId = `sparkline-gradient-${color}`;

  return (
    <div className={`w-full ${className || ''}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        {showArea && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Area under line */}
        {showArea && (
          <path
            d={`${pathData} L 100,100 L 0,100 Z`}
            fill={`url(#${gradientId})`}
          />
        )}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots at data points */}
        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={strokeColor}
            />
          ))}
      </svg>
    </div>
  );
}

/**
 * SparkBar - Miniature bar chart alternative
 */
export function SparkBar({
  data,
  color = 'primary',
  height = 48,
  className,
}: {
  data: number[];
  color?: 'primary' | 'accent-hot' | 'success' | 'warning';
  height?: number;
  className?: string;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);

  const colorMap = {
    primary: 'hsl(var(--primary))',
    'accent-hot': 'hsl(var(--accent-hot))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
  };

  const barColor = colorMap[color];

  return (
    <div
      className={`flex items-end gap-1 w-full ${className || ''}`}
      style={{ height }}
    >
      {data.map((value, index) => {
        const barHeight = max > 0 ? (value / max) * 100 : 0;

        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all duration-300"
            style={{
              height: `${barHeight}%`,
              backgroundColor: barColor,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
}
