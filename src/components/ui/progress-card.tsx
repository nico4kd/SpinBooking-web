import React from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { IntensityRing } from './intensity-ring';
import { Button } from './button';
import { Card } from './card';

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  description: string;
  color?: 'cyan' | 'pink' | 'amber' | 'success';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  action?: {
    label: string;
    href: string;
  };
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

/**
 * ProgressCard - Shows progress with IntensityRing, trend, and optional action
 *
 * Used for: Credits remaining, goals, attendance tracking
 *
 * @example
 * <ProgressCard
 *   title="Créditos Disponibles"
 *   value={8}
 *   max={12}
 *   description="Paquete activo expira en 45 días"
 *   color="cyan"
 *   trend={{ direction: 'down', value: 15, label: 'vs mes pasado' }}
 *   action={{ label: 'Ver Paquetes', href: '/packages' }}
 * />
 */
export function ProgressCard({
  title,
  value,
  max,
  description,
  color = 'cyan',
  trend,
  action,
  urgency,
  className,
}: ProgressCardProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  const TrendIcon = trend?.direction === 'up' ? ArrowUp :
                    trend?.direction === 'down' ? ArrowDown :
                    Minus;

  const trendColor = trend?.direction === 'up' ? 'text-[hsl(var(--success))]' :
                     trend?.direction === 'down' ? 'text-[hsl(var(--destructive))]' :
                     'text-tertiary';

  return (
    <Card
      variant="default"
      className={`p-6 flex flex-col gap-4 ${className || ''}`}
    >
      {/* Header with Ring */}
      <div className="flex items-start gap-4">
        <IntensityRing
          value={value}
          max={max}
          color={color}
          size="lg"
          urgency={urgency}
        />

        <div className="flex-1 min-w-0">
          {/* Title and Trend */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-title text-primary">{title}</h3>

            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{trend.direction === 'neutral' ? '0' : `${trend.value}`}%</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-secondary mb-3">
            {description}
          </p>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-1.5 bg-[hsl(var(--surface-2))] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: `hsl(var(--${color === 'cyan' ? 'primary' : color === 'pink' ? 'accent-hot' : color === 'amber' ? 'warning' : 'success'}))`,
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-tertiary">
                {value} de {max}
              </span>
              <span className="text-xs font-medium text-secondary">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Action */}
      {action && (
        <Link href={action.href} className="mt-auto">
          <Button
            variant="outline"
            className="w-full justify-center"
            size="sm"
          >
            {action.label}
          </Button>
        </Link>
      )}

      {/* Trend Label */}
      {trend?.label && (
        <p className="text-xs text-tertiary text-right -mt-2">
          {trend.label}
        </p>
      )}
    </Card>
  );
}
