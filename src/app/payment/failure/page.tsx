'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { packagesApi } from '../../../lib/api';
import type { UserPackage } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils/currency';
import { Card, Button, Badge } from '../../../components/ui';
import {
  XCircle,
  Package as PackageIcon,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// Map package types to Spanish display names
const PACKAGE_NAMES: Record<string, string> = {
  TRIAL: 'Prueba',
  STARTER: 'Inicial',
  REGULAR: 'Regular',
  PRO: 'Pro',
  UNLIMITED: 'Ilimitado',
};

function FailurePageContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const packageId = searchParams.get('packageId');
  const paymentId = searchParams.get('payment_id');

  const [packageData, setPackageData] = useState<UserPackage | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && packageId) {
      loadPackageData();
    } else {
      setLoadingData(false);
    }
  }, [isAuthenticated, packageId]);

  const loadPackageData = async () => {
    if (!packageId) return;

    try {
      const data = await packagesApi.getById(packageId);
      setPackageData(data);
    } catch (error: any) {
      console.error('Error loading package:', error);
      // Don't show error, just proceed without package data
    } finally {
      setLoadingData(false);
    }
  };

  const getValidityDays = (expiresAt: string, createdAt: string) => {
    const expires = new Date(expiresAt);
    const created = new Date(createdAt);
    const diff = expires.getTime() - created.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading || loadingData) {
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

  const packageName = packageData
    ? PACKAGE_NAMES[packageData.type] || packageData.type
    : 'Paquete';
  const validityDays = packageData?.expiresAt
    ? getValidityDays(packageData.expiresAt, packageData.createdAt)
    : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Failure Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 rounded-full bg-[hsl(var(--destructive)/0.15)] items-center justify-center">
            <XCircle className="w-10 h-10 text-[hsl(var(--destructive))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Pago Rechazado</h1>
            <p className="text-secondary">
              No te preocupes, tu pago no fue procesado y no se realizó ningún cargo
            </p>
          </div>
        </div>

        {/* Package Details (if available) */}
        {packageData && (
          <Card variant="elevated">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--surface-2))] flex items-center justify-center flex-shrink-0">
                <PackageIcon className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{packageName}</h2>
                  <Badge variant="warning">Pendiente de pago</Badge>
                </div>
                <p className="text-sm text-secondary">
                  {packageData.totalTickets === 999
                    ? 'Ilimitadas clases'
                    : `${packageData.totalTickets} clases`}{' '}
                  • {validityDays} días •{' '}
                  {formatCurrency(packageData.price)}
                </p>
              </div>
            </div>

            {paymentId && (
              <div className="pt-4 border-t border-[hsl(var(--border-default))]">
                <p className="text-xs text-tertiary">
                  ID de Intento: <span className="text-secondary">{paymentId}</span>
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Common Reasons */}
        <Card variant="default">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
            Razones comunes de rechazo
          </h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Fondos insuficientes en la tarjeta</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tarjeta de crédito/débito rechazada o vencida</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Datos de la tarjeta ingresados incorrectamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Límite de compra excedido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Problemas de seguridad con el banco emisor (puede requerir validación)
              </span>
            </li>
          </ul>
        </Card>

        {/* What to do */}
        <Card variant="default">
          <h3 className="font-semibold mb-3">¿Qué puedes hacer?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Verifica los datos de tu tarjeta</p>
                <p className="text-xs text-secondary">
                  Asegúrate de que el número, fecha de vencimiento y código de seguridad
                  sean correctos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Contacta a tu banco</p>
                <p className="text-xs text-secondary">
                  Si el problema persiste, tu banco puede estar bloqueando la transacción
                  por seguridad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Intenta con otro método de pago</p>
                <p className="text-xs text-secondary">
                  MercadoPago acepta múltiples tarjetas y métodos de pago
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/packages" className="flex-1">
            <Button variant="outline" size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Paquetes
            </Button>
          </Link>
          {packageId ? (
            <Link href={`/packages/checkout/${packageId}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Button>
            </Link>
          ) : (
            <Link href="/packages" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                Elegir Paquete
              </Button>
            </Link>
          )}
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-secondary">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@spinbooking.com"
              className="text-primary hover:underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FailurePage() {
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
      <FailurePageContent />
    </Suspense>
  );
}
