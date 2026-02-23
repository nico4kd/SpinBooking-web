'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import { Card, Button, Badge, IntensityRing } from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { toast } from '../../lib/toast';
import {
  Package as PackageIcon,
  ShoppingCart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PackageConfig {
  type: string;
  name: string;
  tickets: number;
  price: number;
  validityDays: number;
  description: string;
}

interface UserPackage {
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
    method: string;
    paidAt: string;
  };
}

export default function PackagesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [packageTypes, setPackageTypes] = useState<PackageConfig[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [typesRes, packagesRes] = await Promise.all([
        api.get('/packages/types'),
        api.get('/packages'),
      ]);
      setPackageTypes(typesRes.data);
      setUserPackages(packagesRes.data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePurchase = async (type: string) => {
    setPurchasing(type);
    try {
      const response = await api.post('/packages/purchase', { type });
      const packageId = response.data.id;

      // Redirect to checkout page
      router.push(`/packages/checkout/${packageId}`);
    } catch (error: any) {
      console.error('Error purchasing package:', error);
      toast.error(
        'Error al crear el paquete',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
      setPurchasing(null);
    }
  };

  const getPackageStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Activo</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pendiente de pago</Badge>;
      case 'EXPIRED':
        return <Badge variant="default">Expirado</Badge>;
      case 'DEPLETED':
        return <Badge variant="default">Agotado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const activePackages = userPackages.filter(
    (pkg) => pkg.status === 'ACTIVE' && pkg.remainingTickets > 0
  );

  const totalCredits = activePackages.reduce(
    (sum, pkg) => sum + pkg.remainingTickets,
    0
  );

  return (
    <AppLayout>
      <PageHeader
        title="Paquetes"
        description="Gestiona tus paquetes y compra nuevos créditos"
        actions={
          <div className="text-right">
            <p className="text-2xl font-bold text-[hsl(var(--primary))]">
              {totalCredits}
            </p>
            <p className="text-xs text-secondary">Créditos disponibles</p>
          </div>
        }
      />

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCredits}</p>
                  <p className="text-sm text-secondary">Créditos totales</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                  <PackageIcon className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activePackages.length}</p>
                  <p className="text-sm text-secondary">Paquetes activos</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[hsl(var(--accent-hot))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userPackages.length}</p>
                  <p className="text-sm text-secondary">Total histórico</p>
                </div>
              </div>
            </Card>
          </div>

          {/* My Active Packages */}
          {activePackages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Mis Paquetes Activos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePackages.map((pkg) => {
                  const daysRemaining = getDaysRemaining(pkg.expiresAt);
                  const progress = (pkg.remainingTickets / pkg.totalTickets) * 100;

                  return (
                    <Card key={pkg.id} variant="elevated">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{pkg.type}</h3>
                          {getPackageStatusBadge(pkg.status)}
                        </div>
                        <IntensityRing
                          value={pkg.remainingTickets}
                          max={pkg.totalTickets}
                          color="cyan"
                          size="md"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary">Créditos restantes</span>
                          <span className="font-semibold">
                            {pkg.remainingTickets} de {pkg.totalTickets}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary">Días restantes</span>
                          <span
                            className={`font-semibold ${
                              daysRemaining <= 7
                                ? 'text-[hsl(var(--warning))]'
                                : ''
                            }`}
                          >
                            {daysRemaining} días
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary">Vence el</span>
                          <span className="font-semibold">
                            {formatDate(pkg.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buy New Package */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Comprar Nuevo Paquete</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {packageTypes.map((pkgType) => {
                const pricePerClass = Math.round(pkgType.price / pkgType.tickets);
                const isPopular = pkgType.type === 'REGULAR';

                return (
                  <Card
                    key={pkgType.type}
                    variant={isPopular ? 'elevated' : 'default'}
                    className={
                      isPopular
                        ? 'border-[hsl(var(--primary))] border-2 relative'
                        : ''
                    }
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="hot">Más Popular</Badge>
                      </div>
                    )}

                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-lg font-bold">{pkgType.name}</h3>
                        <p className="text-xs text-tertiary mt-1">
                          {pkgType.description}
                        </p>
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                          ${pkgType.price.toLocaleString()}
                        </div>
                        <p className="text-xs text-secondary mt-1">
                          ${pricePerClass.toLocaleString()} por clase
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Clases</span>
                          <span className="font-semibold">
                            {pkgType.tickets === 999
                              ? 'Ilimitadas'
                              : pkgType.tickets}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary">Validez</span>
                          <span className="font-semibold">
                            {pkgType.validityDays} días
                          </span>
                        </div>
                      </div>

                      <Button
                        variant={isPopular ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => handlePurchase(pkgType.type)}
                        disabled={purchasing === pkgType.type}
                      >
                        {purchasing === pkgType.type ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                            Comprando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Comprar
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All Packages History */}
          {userPackages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Historial de Paquetes</h2>
              <Card variant="default">
                <div className="divide-y divide-[hsl(var(--border-default))]">
                  {userPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
                      data-testid="package-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[hsl(var(--surface-2))] flex items-center justify-center">
                          <PackageIcon className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" data-testid="package-type">{pkg.type}</h3>
                            {getPackageStatusBadge(pkg.status)}
                          </div>
                          <p className="text-sm text-secondary" data-testid="package-tickets">
                            Comprado el {formatDate(pkg.createdAt)} •{' '}
                            {pkg.remainingTickets} de {pkg.totalTickets} créditos
                            restantes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${pkg.price.toLocaleString()} {pkg.currency}
                        </p>
                        <p className="text-sm text-secondary">
                          {pkg.payment?.status === 'COMPLETED'
                            ? 'Pagado'
                            : pkg.payment?.status === 'PENDING'
                            ? 'Pendiente'
                            : 'Sin pagar'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {userPackages.length === 0 && (
            <Card variant="elevated" className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center">
                  <PackageIcon className="w-8 h-8 text-tertiary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Aún no tienes paquetes
                  </h3>
                  <p className="text-sm text-secondary">
                    Compra tu primer paquete para comenzar a reservar clases
                  </p>
                </div>
              </div>
            </Card>
          )}
      </div>
    </AppLayout>
  );
}
