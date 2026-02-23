'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api-client';
import { formatCurrency } from '../../../../lib/utils/currency';
import { Card, Button, Badge } from '../../../../components/ui';
import {
  CreditCard,
  Package as PackageIcon,
  Calendar,
  Ticket,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

interface PackageData {
  id: string;
  type: string;
  status: string;
  totalTickets: number;
  remainingTickets: number;
  price: number;
  currency: string;
  expiresAt: string;
  createdAt: string;
  payment?: {
    status: string;
  };
}

// Map package types to Spanish display names
const PACKAGE_NAMES: Record<string, string> = {
  TRIAL: 'Prueba',
  STARTER: 'Inicial',
  REGULAR: 'Regular',
  PRO: 'Pro',
  UNLIMITED: 'Ilimitado',
};

// Map package types to descriptions
const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  TRIAL: 'Perfecto para probar nuestras clases',
  STARTER: 'Ideal para comenzar tu rutina de spinning',
  REGULAR: 'El paquete más popular para entrenar regularmente',
  PRO: 'Para usuarios comprometidos con su entrenamiento',
  UNLIMITED: 'Acceso sin límites a todas nuestras clases',
};

export default function CheckoutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && packageId) {
      loadPackageData();
    }
  }, [isAuthenticated, packageId]);

  const loadPackageData = async () => {
    try {
      setError(null);
      const response = await api.get(`/packages/${packageId}`);
      const pkg = response.data;

      // If package is already paid/active, redirect to packages page
      if (pkg.status === 'ACTIVE' || pkg.payment?.status === 'COMPLETED') {
        router.push('/packages');
        return;
      }

      setPackageData(pkg);
    } catch (error: any) {
      console.error('Error loading package:', error);
      if (error.response?.status === 404) {
        setError('Paquete no encontrado. El paquete puede haber sido eliminado.');
      } else {
        setError(
          error.response?.data?.message || 'Error al cargar el paquete'
        );
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!packageData) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Create payment preference
      const response = await api.post(`/payments/preference/${packageId}`);
      const { initPoint } = response.data;

      // Redirect to MercadoPago
      window.location.href = initPoint;
    } catch (error: any) {
      console.error('Error creating payment preference:', error);

      if (error.response?.status === 400) {
        // Package already paid or invalid state
        setError(
          error.response?.data?.message ||
            'Este paquete ya ha sido pagado o no está disponible para pago.'
        );
        setTimeout(() => {
          router.push('/packages');
        }, 3000);
      } else if (error.response?.status === 404) {
        setError('Paquete no encontrado.');
      } else {
        setError(
          'Error al procesar el pago. Por favor, intenta nuevamente.'
        );
      }
      setProcessingPayment(false);
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

  if (!user || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="default" className="max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--destructive)/0.15)] flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Error al cargar paquete</h2>
              <p className="text-secondary">{error || 'Paquete no encontrado'}</p>
            </div>
            <Link href="/packages">
              <Button variant="outline" size="md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Paquetes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const packageName = PACKAGE_NAMES[packageData.type] || packageData.type;
  const packageDescription =
    PACKAGE_DESCRIPTIONS[packageData.type] || 'Paquete de clases de spinning';
  const validityDays = getValidityDays(
    packageData.expiresAt,
    packageData.createdAt
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-base))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/packages"
            className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Paquetes
          </Link>
          <h1 className="text-2xl font-bold">Confirmar Compra</h1>
          <p className="text-secondary mt-1">
            Revisa los detalles de tu paquete antes de proceder al pago
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Card */}
            <Card variant="elevated">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <PackageIcon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{packageName}</h2>
                    <Badge variant="warning">Pendiente de pago</Badge>
                  </div>
                  <p className="text-secondary">{packageDescription}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
                    <Ticket className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <div>
                      <p className="text-xs text-tertiary">Créditos</p>
                      <p className="font-semibold">
                        {packageData.totalTickets === 999
                          ? 'Ilimitados'
                          : `${packageData.totalTickets} clases`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
                    <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <div>
                      <p className="text-xs text-tertiary">Validez</p>
                      <p className="font-semibold">{validityDays} días</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
                    <CreditCard className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <div>
                      <p className="text-xs text-tertiary">Precio</p>
                      <p className="font-semibold">
                        {formatCurrency(packageData.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {packageData.totalTickets !== 999 && (
                  <div className="p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">
                        Precio por clase
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          Math.round(packageData.price / packageData.totalTickets)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Security Info */}
            <Card variant="default">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    Pago seguro con MercadoPago
                  </h3>
                  <p className="text-sm text-secondary">
                    Tu pago será procesado de forma segura por MercadoPago. Aceptamos
                    tarjetas de crédito, débito y otros métodos de pago.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Summary & Payment */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card variant="elevated">
              <h3 className="font-semibold mb-4">Resumen de Compra</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Paquete</span>
                  <span className="font-semibold">{packageName}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Créditos</span>
                  <span className="font-semibold">
                    {packageData.totalTickets === 999
                      ? 'Ilimitados'
                      : packageData.totalTickets}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Validez</span>
                  <span className="font-semibold">{validityDays} días</span>
                </div>

                <div className="border-t border-[hsl(var(--border-default))] pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(packageData.price)}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)]">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[hsl(var(--destructive))] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full mt-6"
                onClick={handleProceedToPayment}
                disabled={processingPayment || !!error}
              >
                {processingPayment ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                    Redirigiendo...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceder al Pago
                  </>
                )}
              </Button>

              {error && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full mt-2"
                  onClick={loadPackageData}
                  disabled={processingPayment}
                >
                  Reintentar
                </Button>
              )}
            </Card>

            {/* Terms */}
            <Card variant="default">
              <h3 className="font-semibold text-sm mb-3">Términos y Condiciones</h3>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>
                    Los créditos son válidos por {validityDays} días desde la activación
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>
                    Puedes cancelar reservas hasta 2 horas antes de la clase
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>
                    Los créditos no utilizados expiran al finalizar el período de
                    validez
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>Los paquetes no son reembolsables</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
