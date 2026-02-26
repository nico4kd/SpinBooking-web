'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import {
  Card,
  Badge,
  SkeletonCard,
} from '../../../components/ui';
import {
  AdminLayout,
  AdminPageHeader,
  ConsoleMetric,
  PendingPaymentsCard,
} from '../../../components/admin';
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MapPin,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  upcomingClasses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activePackages: number;
  utilizationRate: number;
  recentBookings: Array<{
    id: string;
    user: { firstName: string; lastName: string };
    class: { title: string; startTime: string };
    status: string;
    bookedAt: string;
  }>;
  popularTimes: Array<{
    hour: number;
    bookingCount: number;
  }>;
  packageSales: {
    TRIAL: number;
    STARTER: number;
    REGULAR: number;
    PRO: number;
    UNLIMITED: number;
  };
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadDashboardStats();
    }
  }, [isAuthenticated, user]);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const response = await api.get<DashboardStats>('/admin/reports/dashboard');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      setError(error.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Validate that amount is a valid number
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(validAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmada</Badge>;
      case 'CANCELLED':
        return <Badge variant="default">Cancelada</Badge>;
      case 'ATTENDED':
        return <Badge variant="primary">Asistió</Badge>;
      case 'NO_SHOW':
        return <Badge variant="warning">No Asistió</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Studio Control Center"
        subtitle="Operaciones en vivo y métricas del día"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {error && (
          <Card variant="elevated" className="bg-[hsl(var(--error)/0.08)] border-[hsl(var(--error)/0.3)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--error))]" />
              <p className="text-sm text-[hsl(var(--error))]">{error}</p>
            </div>
          </Card>
        )}

        {/* Overview Metrics */}
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ConsoleMetric
              label="TOTAL USUARIOS"
              value={stats?.totalUsers || 0}
              icon={Users}
              intensity="medium"
              trend={{
                direction: 'up',
                value: `${stats?.activeUsers || 0} activos`,
              }}
            />
            <ConsoleMetric
              label="TOTAL RESERVAS"
              value={stats?.totalBookings || 0}
              icon={CheckCircle2}
              intensity="high"
              trend={{
                direction: 'neutral',
                value: `${stats?.upcomingClasses || 0} próximas`,
              }}
            />
            <ConsoleMetric
              label="INGRESOS TOTALES"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              intensity="peak"
              trend={{
                direction: 'up',
                value: `${formatCurrency(stats?.monthlyRevenue || 0)} este mes`,
              }}
            />
            <ConsoleMetric
              label="TASA OCUPACIÓN"
              value={`${stats?.utilizationRate || 0}%`}
              icon={Activity}
              intensity="medium"
              trend={{
                direction: 'neutral',
                value: `${stats?.activePackages || 0} paquetes activos`,
              }}
            />
          </div>
        )}

          {/* Pending Payments */}
          <PendingPaymentsCard />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Sales */}
            <Card variant="elevated">
              <h3 className="text-lg font-semibold mb-4">Ventas por Tipo de Paquete</h3>
              <div className="space-y-3">
                {stats?.packageSales && Object.entries(stats.packageSales).map(([type, count]) => {
                  const maxSales = Math.max(...Object.values(stats.packageSales));
                  const percentage = maxSales > 0 ? (count / maxSales) * 100 : 0;

                  const getTypeLabel = (t: string) => {
                    const labels: Record<string, string> = {
                      TRIAL: 'Trial',
                      STARTER: 'Starter',
                      REGULAR: 'Regular',
                      PRO: 'Pro',
                      UNLIMITED: 'Unlimited',
                    };
                    return labels[t] || t;
                  };

                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                        <span className="text-sm text-secondary">{count} ventas</span>
                      </div>
                      <div className="h-2 bg-[hsl(var(--surface-2))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--primary))] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Bookings */}
            <Card variant="elevated">
              <h3 className="text-lg font-semibold mb-4">Reservas Recientes</h3>
              <div className="space-y-3">
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {booking.user.firstName} {booking.user.lastName}
                        </p>
                        <p className="text-sm text-secondary truncate">
                          {booking.class.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary text-center py-4">
                    No hay reservas recientes
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Card variant="interactive" className="group h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.25)] transition-colors">
                      <Users className="w-6 h-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gestionar Usuarios</h3>
                      <p className="text-xs text-secondary">Ver y editar usuarios</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/classes">
                <Card variant="interactive" className="group h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center group-hover:bg-[hsl(var(--success)/0.25)] transition-colors">
                      <Calendar className="w-6 h-6 text-[hsl(var(--success))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Crear Clase</h3>
                      <p className="text-xs text-secondary">Programar nueva clase</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/reports">
                <Card variant="interactive" className="group h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center group-hover:bg-[hsl(var(--accent-hot)/0.25)] transition-colors">
                      <BarChart3 className="w-6 h-6 text-[hsl(var(--accent-hot))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ver Reportes</h3>
                      <p className="text-xs text-secondary">Análisis y estadísticas</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/rooms">
                <Card variant="interactive" className="group h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--warning)/0.15)] flex items-center justify-center group-hover:bg-[hsl(var(--warning)/0.25)] transition-colors">
                      <MapPin className="w-6 h-6 text-[hsl(var(--warning))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gestionar Salas</h3>
                      <p className="text-xs text-secondary">Configurar espacios</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
}
