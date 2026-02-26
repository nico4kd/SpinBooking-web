'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UserStats, UserPackage } from '../../../lib/api';
import { Card, Badge, Skeleton } from '../../../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreditsCardProps {
  stats: UserStats | null;
  statsLoading: boolean;
  statsError: string | null;
  onRetryStats: () => void;
  activePackages: UserPackage[];
  pendingPackages: UserPackage[];
  packagesLoading: boolean;
}

const getExpiryBadgeVariant = (days: number): 'destructive' | 'warning' | 'default' => {
  if (days <= 7) return 'destructive';
  if (days <= 14) return 'warning';
  return 'default';
};

export function CreditsCard({
  stats,
  statsLoading,
  statsError,
  onRetryStats,
  activePackages,
  pendingPackages,
  packagesLoading,
}: CreditsCardProps) {
  const [packagesExpanded, setPackagesExpanded] = useState(false);

  return (
    <Card variant="elevated">
      <h2 className="text-title mb-4">Créditos disponibles</h2>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: credit count + expiry */}
        <div className="space-y-2">
          {statsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : statsError ? (
            <div className="space-y-1">
              <p className="text-sm text-[hsl(var(--error))]">{statsError}</p>
              <button
                onClick={onRetryStats}
                className="text-xs text-[hsl(var(--primary))] underline"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {stats && stats.availableCredits > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[hsl(var(--primary))]">
                    {stats.availableCredits}
                  </span>
                  <span className="text-sm text-secondary">créditos disponibles</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-secondary">Sin paquetes activos</p>
                  <p className="text-sm text-tertiary">
                    Compra un paquete para empezar a reservar clases
                  </p>
                </div>
              )}

              {stats && stats.daysUntilExpiry !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">Vence el</span>
                  <Badge variant={getExpiryBadgeVariant(stats.daysUntilExpiry)}>
                    {format(
                      addDays(new Date(), stats.daysUntilExpiry),
                      'dd/MM/yyyy',
                      { locale: es }
                    )}
                  </Badge>
                </div>
              )}

              {pendingPackages.length > 0 && (
                <p className="text-xs text-secondary mt-1">
                  {pendingPackages.length === 1
                    ? 'Tienes 1 paquete con pago pendiente de confirmación'
                    : `Tienes ${pendingPackages.length} paquetes con pago pendiente de confirmación`}
                </p>
              )}
            </>
          )}
        </div>

        {/* Right: CTA */}
        <Link
          href="/packages"
          className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--control-focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_0_16px_hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-[0.98] h-10 px-4 text-sm rounded-[var(--radius-md)] whitespace-nowrap"
        >
          Comprar paquetes
        </Link>
      </div>

      {/* Expandable per-package breakdown */}
      {packagesLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : activePackages.length > 1 ? (
        <div className="mt-4 border-t border-[hsl(var(--border-default))] pt-4">
          <button
            onClick={() => setPackagesExpanded((v) => !v)}
            className="flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
          >
            {packagesExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar detalle
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver detalle por paquete
              </>
            )}
          </button>

          {packagesExpanded && (
            <div className="mt-3 space-y-2">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-default))] last:border-0 text-sm"
                >
                  <span className="font-medium">{pkg.type}</span>
                  <span className="text-secondary">
                    {pkg.remainingTickets}/{pkg.totalTickets} créditos
                  </span>
                  <span className="text-tertiary text-xs">
                    {pkg.expiresAt && `Vence ${format(new Date(pkg.expiresAt), 'dd/MM/yyyy', { locale: es })}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}
