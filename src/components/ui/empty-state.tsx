import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'hot' | 'outline';
  };
  suggestion?: string;
  className?: string;
}

/**
 * EmptyState - Engaging empty state with illustration and action
 *
 * Provides context and next steps when data is empty
 *
 * @example
 * <EmptyState
 *   illustration={<NoClassesIllustration />}
 *   title="No hay clases con esos filtros"
 *   description="Intenta expandir el rango de fechas o eliminar filtros para ver más opciones"
 *   action={{
 *     label: 'Limpiar filtros',
 *     onClick: () => clearFilters(),
 *   }}
 *   suggestion="💡 Las clases se publican con 2 semanas de anticipación"
 * />
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  suggestion,
  className,
}: EmptyStateProps) {
  return (
    <Card
      variant="default"
      className={`p-12 flex flex-col items-center text-center ${className || ''}`}
    >
      {/* Illustration */}
      <div className="mb-6 opacity-60">
        {illustration}
      </div>

      {/* Content */}
      <div className="max-w-md space-y-3 mb-6">
        <h3 className="text-title text-primary">
          {title}
        </h3>
        <p className="text-sm text-secondary">
          {description}
        </p>
      </div>

      {/* Action */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mb-4"
        >
          {action.label}
        </Button>
      )}

      {/* Suggestion */}
      {suggestion && (
        <p className="text-xs text-tertiary bg-[hsl(var(--surface-2))] px-4 py-2 rounded-full">
          {suggestion}
        </p>
      )}
    </Card>
  );
}

/**
 * Pre-built empty state illustrations using Lucide icons
 */

// No classes illustration
export function NoClassesIllustration() {
  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Calendar background */}
        <rect
          x="20"
          y="24"
          width="88"
          height="80"
          rx="8"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <line
          x1="20"
          y1="40"
          x2="108"
          y2="40"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />

        {/* X mark */}
        <line
          x1="46"
          y1="56"
          x2="82"
          y2="92"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-secondary"
        />
        <line
          x1="82"
          y1="56"
          x2="46"
          y2="92"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-secondary"
        />
      </svg>
    </div>
  );
}

// No packages illustration
export function NoPackagesIllustration() {
  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Package box */}
        <rect
          x="28"
          y="48"
          width="72"
          height="60"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <line
          x1="28"
          y1="68"
          x2="100"
          y2="68"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <path
          d="M64 48 L64 108"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />

        {/* Empty badge */}
        <circle
          cx="64"
          cy="78"
          r="16"
          fill="hsl(var(--surface-2))"
          stroke="currentColor"
          strokeWidth="2"
          className="text-secondary"
        />
        <text
          x="64"
          y="85"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          className="fill-secondary"
        >
          0
        </text>
      </svg>
    </div>
  );
}

// No bookings illustration
export function NoBookingsIllustration() {
  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bike outline */}
        <circle
          cx="40"
          cy="84"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <circle
          cx="88"
          cy="84"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <path
          d="M40 84 L64 44 L88 84"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />

        {/* Empty indicator */}
        <circle
          cx="64"
          cy="44"
          r="18"
          fill="hsl(var(--surface-2))"
          stroke="currentColor"
          strokeWidth="2"
          className="text-secondary"
        />
        <line
          x1="54"
          y1="44"
          x2="74"
          y2="44"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-secondary"
        />
      </svg>
    </div>
  );
}

// No results illustration (magnifying glass with X)
export function NoResultsIllustration() {
  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Magnifying glass */}
        <circle
          cx="52"
          cy="52"
          r="28"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tertiary opacity-30"
        />
        <line
          x1="72"
          y1="72"
          x2="96"
          y2="96"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-tertiary opacity-30"
        />

        {/* X inside */}
        <line
          x1="42"
          y1="42"
          x2="62"
          y2="62"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-secondary"
        />
        <line
          x1="62"
          y1="42"
          x2="42"
          y2="62"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-secondary"
        />
      </svg>
    </div>
  );
}

// Welcome illustration (sparkles)
export function WelcomeIllustration() {
  return (
    <div className="relative w-32 h-32">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Central sparkle */}
        <circle
          cx="64"
          cy="64"
          r="8"
          fill="currentColor"
          className="text-primary animate-pulse"
        />

        {/* Sparkle rays */}
        <line
          x1="64"
          y1="32"
          x2="64"
          y2="48"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary opacity-60"
        />
        <line
          x1="64"
          y1="80"
          x2="64"
          y2="96"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary opacity-60"
        />
        <line
          x1="32"
          y1="64"
          x2="48"
          y2="64"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary opacity-60"
        />
        <line
          x1="80"
          y1="64"
          x2="96"
          y2="64"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary opacity-60"
        />

        {/* Diagonal rays */}
        <line
          x1="45"
          y1="45"
          x2="55"
          y2="55"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary opacity-40"
        />
        <line
          x1="73"
          y1="73"
          x2="83"
          y2="83"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary opacity-40"
        />
        <line
          x1="83"
          y1="45"
          x2="73"
          y2="55"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary opacity-40"
        />
        <line
          x1="55"
          y1="73"
          x2="45"
          y2="83"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary opacity-40"
        />
      </svg>
    </div>
  );
}
