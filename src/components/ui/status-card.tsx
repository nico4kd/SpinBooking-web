import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';

interface StatusCardProps {
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: LucideIcon;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * StatusCard - Shows status with colored icon and badge
 *
 * Used for: Alerts, notifications, status updates, info messages
 *
 * @example
 * <StatusCard
 *   title="Paquete próximo a vencer"
 *   description="Tu paquete Regular expira en 7 días. Renueva ahora para no perder tus clases."
 *   status="warning"
 *   icon={AlertTriangle}
 *   badge="Urgente"
 *   action={{ label: 'Renovar Paquete', onClick: () => router.push('/packages') }}
 * />
 */
export function StatusCard({
  title,
  description,
  status,
  icon: Icon,
  badge,
  action,
  className,
}: StatusCardProps) {
  const statusConfig = {
    success: {
      bg: 'hsl(var(--success) / 0.15)',
      color: 'hsl(var(--success))',
      badgeVariant: 'success' as const,
    },
    warning: {
      bg: 'hsl(var(--warning) / 0.15)',
      color: 'hsl(var(--warning))',
      badgeVariant: 'warning' as const,
    },
    error: {
      bg: 'hsl(var(--destructive) / 0.15)',
      color: 'hsl(var(--destructive))',
      badgeVariant: 'destructive' as const,
    },
    info: {
      bg: 'hsl(var(--primary) / 0.15)',
      color: 'hsl(var(--primary))',
      badgeVariant: 'primary' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Card
      variant="default"
      className={`p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon in colored circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: config.bg,
            color: config.color,
          }}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-title text-primary">{title}</h3>

            {badge && (
              <Badge variant={config.badgeVariant}>
                {badge}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-secondary mb-4">
            {description}
          </p>

          {/* Optional Action */}
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-1 text-sm font-medium hover:underline transition-colors"
              style={{ color: config.color }}
            >
              {action.label}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
