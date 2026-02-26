'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { packagesApi, PackageStatus } from '../../../lib/api';
import type { UserPackage } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils/currency';
import { Card, Button, Badge } from '../../../components/ui';
import {
  CheckCircle2,
  Package as PackageIcon,
  Calendar,
  Ticket,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface PackageData extends UserPackage {
  tickets?: Array<{ id: string; status: string }>;
}

// Map package types to Spanish display names
const PACKAGE_NAMES: Record<string, string> = {
  TRIAL: 'Prueba',
  STARTER: 'Inicial',
  REGULAR: 'Regular',
  PRO: 'Pro',
  UNLIMITED: 'Ilimitado',
};

function SuccessPageContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const packageId = searchParams.get('packageId');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isActivating, setIsActivating] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_ATTEMPTS = 15; // 30 seconds (15 attempts × 2 seconds)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!packageId) {
      setError('ID de paquete no encontrado');
      setIsActivating(false);
      return;
    }

    if (isAuthenticated) {
      pollPackageStatus();
    }
  }, [isAuthenticated, packageId]);

  const pollPackageStatus = async () => {
    if (!packageId) return;

    try {
      const pkg = await packagesApi.getById(packageId) as PackageData;

      setPackageData(pkg);

      // Check if package is active
      if (pkg.status === PackageStatus.ACTIVE) {
        setIsActivating(false);
        return;
      }

      // Continue polling if not activated yet
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(() => {
          setAttempts((prev) => prev + 1);
          pollPackageStatus();
        }, 2000);
      } else {
        // Max attempts reached
        setIsActivating(false);
        setError(
          'El paquete está siendo activado. Puede tomar unos minutos. Por favor, verifica en Mis Paquetes.'
        );
      }
    } catch (error: any) {
      console.error('Error loading package:', error);
      setError('Error al cargar el paquete');
      setIsActivating(false);
    }
  };

  const getValidityDays = (expiresAt: string, createdAt: string) => {
    const expires = new Date(expiresAt);
    const created = new Date(createdAt);
    const diff = expires.getTime() - created.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!packageId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="default" className="max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Pago Recibido</h2>
              <p className="text-secondary">
                Tu pago fue procesado exitosamente. Verifica tu paquete en Mis Paquetes.
              </p>
            </div>
            <Link href="/packages">
              <Button variant="primary" size="md">
                Ver Mis Paquetes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const packageName = packageData
    ? PACKAGE_NAMES[packageData.type] || packageData.type
    : '';
  const validityDays = packageData?.expiresAt
    ? getValidityDays(packageData.expiresAt, packageData.createdAt)
    : 0;
  const activeTicketsCount = packageData?.tickets?.filter(
    (t) => t.status === 'AVAILABLE'
  ).length;

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 rounded-full bg-[hsl(var(--success)/0.15)] items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[hsl(var(--success))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">¡Pago Exitoso!</h1>
            {isActivating ? (
              <p className="text-secondary">
                Estamos activando tu paquete, por favor espera un momento...
              </p>
            ) : packageData?.status === PackageStatus.ACTIVE ? (
              <p className="text-secondary">
                Tu paquete ha sido activado y está listo para usar
              </p>
            ) : (
              <p className="text-secondary">
                Tu pago fue procesado exitosamente
              </p>
            )}
          </div>
        </div>

        {/* Activating Status */}
        {isActivating && (
          <Card variant="default">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-[hsl(var(--primary))] animate-spin" />
              <span className="text-secondary">Activando tu paquete...</span>
            </div>
          </Card>
        )}

        {/* Package Details */}
        {packageData && !isActivating && (
          <Card variant="elevated">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center flex-shrink-0">
                <PackageIcon className="w-6 h-6 text-[hsl(var(--success))]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{packageName}</h2>
                  {packageData.status === PackageStatus.ACTIVE ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="warning">Procesando</Badge>
                  )}
                </div>
                <p className="text-sm text-secondary">
                  Comprado el {formatDate(packageData.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span className="text-xs text-tertiary">Créditos</span>
                </div>
                <p className="text-2xl font-bold">
                  {packageData.totalTickets === 999
                    ? 'Ilimitados'
                    : packageData.totalTickets}
                </p>
                {packageData.status === PackageStatus.ACTIVE && activeTicketsCount && (
                  <p className="text-xs text-secondary mt-1">
                    {activeTicketsCount} tickets disponibles
                  </p>
                )}
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span className="text-xs text-tertiary">Validez</span>
                </div>
                <p className="text-2xl font-bold">{validityDays}</p>
                <p className="text-xs text-secondary mt-1">días</p>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                  <span className="text-xs text-tertiary">Total Pagado</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(packageData.price)}
                </p>
              </div>
            </div>

            {paymentId && (
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border-default))]">
                <p className="text-xs text-tertiary">
                  ID de Pago: <span className="text-secondary">{paymentId}</span>
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card variant="default">
            <div className="p-4 rounded-[var(--radius-md)] bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.3)]">
              <p className="text-sm text-[hsl(var(--warning))]">{error}</p>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        {packageData?.status === PackageStatus.ACTIVE && !isActivating && (
          <Card variant="default">
            <h3 className="font-semibold mb-3">¿Qué sigue?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">
                    1
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Explora las clases disponibles</p>
                  <p className="text-xs text-secondary">
                    Revisa nuestro calendario y encuentra la clase perfecta para ti
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">
                    2
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Reserva tu lugar</p>
                  <p className="text-xs text-secondary">
                    Las clases tienen cupos limitados, reserva con anticipación
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">
                    3
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">¡Disfruta tu clase!</p>
                  <p className="text-xs text-secondary">
                    Llega 10 minutos antes y prepárate para una gran experiencia
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/packages" className="flex-1">
            <Button variant="outline" size="md" className="w-full">
              Ver Mis Paquetes
            </Button>
          </Link>
          <Link href="/classes" className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              Reservar Clase
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            <p className="text-secondary">Cargando...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
