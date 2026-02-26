'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { packagesApi } from '../../../lib/api';
import type { UserPackage } from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils/currency';
import { Card, Button, Badge } from '../../../components/ui';
import {
  Clock,
  Package as PackageIcon,
  Mail,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
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

function PendingPageContent() {
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
        {/* Pending Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 rounded-full bg-[hsl(var(--warning)/0.15)] items-center justify-center">
            <Clock className="w-10 h-10 text-[hsl(var(--warning))]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Pago Pendiente</h1>
            <p className="text-secondary">
              Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.
            </p>
          </div>
        </div>

        {/* Package Details (if available) */}
        {packageData && (
          <Card variant="elevated">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--warning)/0.15)] flex items-center justify-center flex-shrink-0">
                <PackageIcon className="w-6 h-6 text-[hsl(var(--warning))]" />
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
                  ID de Pago: <span className="text-secondary">{paymentId}</span>
                </p>
              </div>
            )}
          </Card>
        )}

        {/* What's happening */}
        <Card variant="default">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">¿Qué significa esto?</h3>
              <p className="text-sm text-secondary">
                Algunos métodos de pago requieren tiempo de procesamiento adicional.
                Tu pago puede tardar desde unos minutos hasta 48 horas en confirmarse,
                dependiendo del método seleccionado.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border-default))]">
            <h4 className="text-sm font-semibold mb-2">
              Métodos que pueden tomar más tiempo:
            </h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Transferencia bancaria</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Boleto bancario</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Pago en efectivo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Depósito en cuenta</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Next steps */}
        <Card variant="default">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[hsl(var(--primary))]" />
            Próximos pasos
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Completa el pago si es necesario</p>
                <p className="text-xs text-secondary">
                  Si seleccionaste boleto o transferencia, sigue las instrucciones que
                  recibiste de MercadoPago
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Revisa tu correo</p>
                <p className="text-xs text-secondary">
                  Te enviaremos un email a{' '}
                  <span className="font-medium text-primary">{user?.email}</span>{' '}
                  cuando tu pago sea confirmado
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[hsl(var(--primary))]">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Tu paquete se activará automáticamente</p>
                <p className="text-xs text-secondary">
                  Una vez confirmado el pago, podrás comenzar a reservar clases
                  inmediatamente
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Info box */}
        <Card variant="default">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Tu reserva está segura</h3>
              <p className="text-sm text-secondary">
                Tu paquete ha sido reservado y se activará automáticamente cuando se
                confirme el pago. No necesitas hacer nada más.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/packages" className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Mis Paquetes
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-secondary">
            ¿Tienes dudas sobre tu pago?{' '}
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

export default function PendingPage() {
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
      <PendingPageContent />
    </Suspense>
  );
}
