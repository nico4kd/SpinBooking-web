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
  Banknote,
  Building2,
  ChevronRight,
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

interface TransferDetails {
  alias: string;
  holderName: string;
  bankName?: string;
}

type PaymentMethod = 'ONLINE_MERCADOPAGO' | 'BANK_TRANSFER' | 'IN_PERSON_CASH';
type Step = 'select' | 'confirm' | 'submitting';

const PACKAGE_NAMES: Record<string, string> = {
  TRIAL: 'Prueba',
  STARTER: 'Inicial',
  REGULAR: 'Regular',
  PRO: 'Pro',
  UNLIMITED: 'Ilimitado',
};

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
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('ONLINE_MERCADOPAGO');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && packageId) {
      loadData();
    }
  }, [isAuthenticated, packageId]);

  const loadData = async () => {
    try {
      setError(null);
      const [pkgRes, transferRes] = await Promise.allSettled([
        api.get(`/packages/${packageId}`),
        api.get('/system-config/public/transfer-details'),
      ]);

      if (pkgRes.status === 'fulfilled') {
        const pkg = pkgRes.value.data;
        if (pkg.status === 'ACTIVE' || pkg.payment?.status === 'COMPLETED') {
          router.push('/packages');
          return;
        }
        setPackageData(pkg);
      } else {
        const err = pkgRes.reason;
        if (err.response?.status === 404) {
          setError('Paquete no encontrado.');
        } else {
          setError(err.response?.data?.message || 'Error al cargar el paquete');
        }
      }

      if (transferRes.status === 'fulfilled' && transferRes.value.data) {
        setTransferDetails(transferRes.value.data);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleConfirm = async () => {
    if (!packageData) return;
    setStep('submitting');
    setError(null);

    try {
      if (selectedMethod === 'ONLINE_MERCADOPAGO') {
        const response = await api.post(`/payments/preference/${packageId}`);
        const { initPoint } = response.data;
        window.location.href = initPoint;
        return;
      }

      if (selectedMethod === 'BANK_TRANSFER') {
        const response = await api.post(`/payments/bank-transfer/${packageId}`);
        const { reference, amount, currency, transferDetails: td } = response.data;
        const params = new URLSearchParams({
          ref: reference,
          amount: String(amount),
          alias: td.alias,
          holder: td.holderName,
          ...(td.bankName ? { bank: td.bankName } : {}),
        });
        router.push(`/payment/transfer-pending?${params.toString()}`);
        return;
      }

      if (selectedMethod === 'IN_PERSON_CASH') {
        await api.post(`/payments/cash/${packageId}`);
        router.push('/payment/cash-pending');
        return;
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago. Intentá nuevamente.');
      setStep('confirm');
    }
  };

  const getValidityDays = (expiresAt: string, createdAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date(createdAt).getTime();
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
  const packageDescription = PACKAGE_DESCRIPTIONS[packageData.type] || 'Paquete de clases de spinning';
  const validityDays = getValidityDays(packageData.expiresAt, packageData.createdAt);

  const METHOD_OPTIONS = [
    {
      id: 'ONLINE_MERCADOPAGO' as PaymentMethod,
      label: 'MercadoPago',
      description: 'Tarjeta de crédito, débito y más. Procesado de forma segura.',
      icon: CreditCard,
      available: true,
    },
    {
      id: 'BANK_TRANSFER' as PaymentMethod,
      label: 'Transferencia bancaria',
      description: transferDetails
        ? `Transferí al alias ${transferDetails.alias}`
        : null,
      icon: Building2,
      available: !!transferDetails,
    },
    {
      id: 'IN_PERSON_CASH' as PaymentMethod,
      label: 'Efectivo en el lugar',
      description: 'Abonás en efectivo cuando llegues al estudio. Tu paquete se activa de inmediato.',
      icon: Banknote,
      available: true,
    },
  ].filter((m) => m.available);

  const selectedOption = METHOD_OPTIONS.find((m) => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-base))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {step === 'confirm' ? (
            <button
              onClick={() => { setStep('select'); setError(null); }}
              className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cambiar método de pago
            </button>
          ) : (
            <Link
              href="/packages"
              className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Paquetes
            </Link>
          )}
          <h1 className="text-2xl font-bold">Confirmar Compra</h1>
          <p className="text-secondary mt-1">
            {step === 'select'
              ? 'Elegí cómo querés pagar'
              : 'Revisá el resumen antes de confirmar'}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Package details + payment selection */}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]">
                  <Ticket className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-xs text-tertiary">Créditos</p>
                    <p className="font-semibold">
                      {packageData.totalTickets === 999 ? 'Ilimitados' : `${packageData.totalTickets} clases`}
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
                    <p className="font-semibold">{formatCurrency(packageData.price)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step: select payment method */}
            {step === 'select' && (
              <Card variant="elevated">
                <h3 className="font-semibold mb-4">Método de pago</h3>
                <div className="space-y-3">
                  {METHOD_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedMethod === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedMethod(option.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[var(--radius-md)] border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                            : 'border-[hsl(var(--border-default))] hover:border-[hsl(var(--primary)/0.5)]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-[hsl(var(--primary)/0.15)]' : 'bg-[hsl(var(--surface-1))]'
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-secondary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{option.label}</p>
                          {option.description && (
                            <p className="text-sm text-secondary mt-0.5">{option.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]'
                            : 'border-[hsl(var(--border-default))]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-6"
                  onClick={() => setStep('confirm')}
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            )}

            {/* Step: confirm */}
            {(step === 'confirm' || step === 'submitting') && selectedOption && (
              <Card variant="elevated">
                <h3 className="font-semibold mb-4">Confirmar método de pago</h3>
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]">
                  <selectedOption.icon className="w-5 h-5 text-[hsl(var(--primary))] flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{selectedOption.label}</p>
                    {selectedOption.description && (
                      <p className="text-sm text-secondary">{selectedOption.description}</p>
                    )}
                  </div>
                </div>

                {selectedMethod === 'BANK_TRANSFER' && transferDetails && (
                  <div className="mt-4 p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Alias</span>
                      <span className="font-mono font-semibold">{transferDetails.alias}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Titular</span>
                      <span className="font-semibold">{transferDetails.holderName}</span>
                    </div>
                    {transferDetails.bankName && (
                      <div className="flex justify-between">
                        <span className="text-secondary">Banco</span>
                        <span>{transferDetails.bankName}</span>
                      </div>
                    )}
                    <p className="text-xs text-tertiary pt-2 border-t border-[hsl(var(--border-default))]">
                      Incluí la referencia de pago en el concepto de la transferencia.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[hsl(var(--destructive))] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right: Summary + action */}
          <div className="space-y-6">
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
                    {packageData.totalTickets === 999 ? 'Ilimitados' : packageData.totalTickets}
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

              {(step === 'confirm' || step === 'submitting') && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-6"
                  onClick={handleConfirm}
                  disabled={step === 'submitting'}
                >
                  {step === 'submitting' ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar pago
                    </>
                  )}
                </Button>
              )}
            </Card>

            <Card variant="default">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Compra segura</h3>
                  <p className="text-sm text-secondary">
                    Tus datos están protegidos. Los pagos online son procesados por MercadoPago.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <h3 className="font-semibold text-sm mb-3">Términos y Condiciones</h3>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>Los créditos son válidos por {validityDays} días desde la activación</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>Podés cancelar reservas hasta 2 horas antes de la clase</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span>Los créditos no utilizados expiran al finalizar el período</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
