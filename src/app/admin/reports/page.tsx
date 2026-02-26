'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api-client';
import { PackageStatus } from '../../../lib/api';
import { getPackageStatusLabel } from '../../../lib/utils/status-badges';
import { Card, Button, Badge, Skeleton, SkeletonCard } from '../../../components/ui';
import { AdminLayout, AdminPageHeader, ConsoleMetric } from '../../../components/admin';
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  Package,
  Calendar,
  Users,
  UserCog,
  MapPin,
} from 'lucide-react';

interface DashboardOverview {
  todayRevenue: number;
  todayBookings: number;
  upcomingClassesToday: number;
  totalActiveUsers: number;
  totalInstructors: number;
  totalRooms: number;
}

interface RevenueData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalPayments: number;
  byMethod: Array<{
    method: string;
    _count: number;
    _sum: { amount: number };
  }>;
  byPackageType: Array<{
    type: string;
    _count: number;
    _sum: { amount: number };
  }>;
}

interface AttendanceData {
  totalBookings: number;
  attended: number;
  noShow: number;
  attendanceRate: string;
}

interface PopularTimesData {
  period: string;
  timeSlots: Record<string, Record<number, number>>;
  topSlots: Array<{
    day: string;
    hour: number;
    bookings: number;
  }>;
}

interface PackageSalesData {
  totalPackages: number;
  byType: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  byStatus: Array<{
    status: string;
    _count: number;
  }>;
}

export default function AdminReportsPage() {
  // Data state
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [popularTimes, setPopularTimes] = useState<PopularTimesData | null>(null);
  const [packageSales, setPackageSales] = useState<PackageSalesData | null>(null);

  // Filter state
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [attendanceStartDate, setAttendanceStartDate] = useState('');
  const [attendanceEndDate, setAttendanceEndDate] = useState('');
  const [packageSalesStartDate, setPackageSalesStartDate] = useState('');
  const [packageSalesEndDate, setPackageSalesEndDate] = useState('');

  // Loading state
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingPopularTimes, setLoadingPopularTimes] = useState(true);
  const [loadingPackageSales, setLoadingPackageSales] = useState(true);

  // Load all reports on mount
  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = () => {
    loadOverview();
    loadRevenue();
    loadAttendance();
    loadPopularTimes();
    loadPackageSales();
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const response = await api.get('/admin/reports/dashboard');
      setOverview(response.data);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const response = await api.get('/admin/reports/revenue', {
        params: { period: revenuePeriod },
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error loading revenue:', error);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const params: any = {};
      if (attendanceStartDate) params.startDate = attendanceStartDate;
      if (attendanceEndDate) params.endDate = attendanceEndDate;

      const response = await api.get('/admin/reports/attendance', { params });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadPopularTimes = async () => {
    setLoadingPopularTimes(true);
    try {
      const response = await api.get('/admin/reports/popular-times');
      setPopularTimes(response.data);
    } catch (error) {
      console.error('Error loading popular times:', error);
    } finally {
      setLoadingPopularTimes(false);
    }
  };

  const loadPackageSales = async () => {
    setLoadingPackageSales(true);
    try {
      const params: any = {};
      if (packageSalesStartDate) params.startDate = packageSalesStartDate;
      if (packageSalesEndDate) params.endDate = packageSalesEndDate;

      const response = await api.get('/admin/reports/package-sales', { params });
      setPackageSales(response.data);
    } catch (error) {
      console.error('Error loading package sales:', error);
    } finally {
      setLoadingPackageSales(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Validate that amount is a valid number
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(validAmount);
  };

  const getPackageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TRIAL: 'Trial',
      STARTER: 'Starter',
      REGULAR: 'Regular',
      PRO: 'Pro',
      UNLIMITED: 'Unlimited',
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      MERCADOPAGO: 'MercadoPago',
      CASH: 'Efectivo',
      TRANSFER: 'Transferencia',
    };
    return labels[method] || method;
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Reports & Analytics"
        subtitle="Visualiza métricas y estadísticas del negocio"
        action={
          <Button onClick={loadAllReports} variant="outline">
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualizar
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Overview Cards */}
        {loadingOverview ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : overview ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <ConsoleMetric
              label="Ingresos Hoy"
              value={formatCurrency(overview.todayRevenue)}
              icon={DollarSign}
              intensity="high"
            />
            <ConsoleMetric
              label="Reservas Hoy"
              value={overview.todayBookings || 0}
              icon={Package}
              intensity="medium"
            />
            <ConsoleMetric
              label="Clases Hoy"
              value={overview.upcomingClassesToday || 0}
              icon={Calendar}
              intensity="medium"
            />
            <ConsoleMetric
              label="Usuarios Activos"
              value={overview.totalActiveUsers || 0}
              icon={Users}
              intensity="medium"
            />
            <ConsoleMetric
              label="Instructores"
              value={overview.totalInstructors || 0}
              icon={UserCog}
              intensity="low"
            />
            <ConsoleMetric
              label="Salas"
              value={overview.totalRooms || 0}
              icon={MapPin}
              intensity="low"
            />
          </div>
        ) : null}

        {/* Revenue Report */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              <TrendingUp className="h-6 w-6 inline mr-2" />
              Reporte de Ingresos
            </h2>
            <select
              value={revenuePeriod}
              onChange={(e) => {
                setRevenuePeriod(e.target.value as 'daily' | 'weekly' | 'monthly');
                loadRevenue();
              }}
              className="px-3 py-2 border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="daily">Hoy</option>
              <option value="weekly">Esta Semana</option>
              <option value="monthly">Este Mes</option>
            </select>
          </div>

          {loadingRevenue ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : revenueData ? (
            <div className="space-y-6">
              {/* Total Revenue */}
              <div className="bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--success))] mb-1">Ingresos Totales</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(revenueData.totalRevenue)}
                </p>
                <p className="text-sm text-secondary mt-1">
                  {revenueData.totalPayments || 0} pagos
                </p>
              </div>

              {/* Revenue by Method */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Por Método de Pago
                </h3>
                <div className="space-y-3">
                  {revenueData.byMethod.map((method) => (
                    <div key={method.method} className="flex items-center">
                      <div className="w-32 text-sm text-secondary">
                        {getPaymentMethodLabel(method.method)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-[hsl(var(--surface-2))] rounded-full h-8 relative">
                          <div
                            className="bg-[hsl(var(--primary))] rounded-full h-8 flex items-center justify-end pr-3"
                            style={{
                              width: `${
                                revenueData.totalRevenue > 0
                                  ? ((method._sum.amount || 0) / revenueData.totalRevenue) *
                                    100
                                  : 0
                              }%`,
                            }}
                          >
                            <span className="text-white text-sm font-medium">
                              {formatCurrency(method._sum.amount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-tertiary">
                        {method._count || 0} pagos
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Package Type */}
              <div>
                <h3 className="text-sm font-medium mb-3">Por Tipo de Paquete</h3>
                <div className="space-y-3">
                  {revenueData.byPackageType.map((pkg) => (
                    <div key={pkg.type} className="flex items-center">
                      <div className="w-32 text-sm text-secondary">
                        {getPackageTypeLabel(pkg.type)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-[hsl(var(--surface-2))] rounded-full h-8 relative">
                          <div
                            className="bg-[hsl(var(--accent-hot))] rounded-full h-8 flex items-center justify-end pr-3"
                            style={{
                              width: `${
                                revenueData.totalRevenue > 0
                                  ? ((pkg._sum.amount || 0) / revenueData.totalRevenue) * 100
                                  : 0
                              }%`,
                            }}
                          >
                            <span className="text-white text-sm font-medium">
                              {formatCurrency(pkg._sum.amount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-tertiary">
                        {pkg._count || 0} ventas
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Attendance Report */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              <CheckCircle className="h-6 w-6 inline mr-2" />
              Reporte de Asistencia
            </h2>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={attendanceStartDate}
                  onChange={(e) => setAttendanceStartDate(e.target.value)}
                  className="px-3 py-2 border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={attendanceEndDate}
                  onChange={(e) => setAttendanceEndDate(e.target.value)}
                  className="px-3 py-2 border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div className="pt-6">
                <Button onClick={loadAttendance} size="sm">
                  Filtrar
                </Button>
              </div>
            </div>
          </div>

          {loadingAttendance ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : attendanceData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--primary))] mb-1">Total Reservas</p>
                <p className="text-3xl font-bold">
                  {attendanceData.totalBookings || 0}
                </p>
              </div>

              <div className="bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--success))] mb-1">Asistieron</p>
                <p className="text-3xl font-bold">{attendanceData.attended || 0}</p>
              </div>

              <div className="bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--destructive))] mb-1">No Asistieron</p>
                <p className="text-3xl font-bold">{attendanceData.noShow || 0}</p>
              </div>

              <div className="bg-[hsl(var(--accent-hot)/0.1)] border border-[hsl(var(--accent-hot)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--accent-hot))] mb-1">Tasa de Asistencia</p>
                <p className="text-3xl font-bold">
                  {attendanceData.attendanceRate || '0%'}
                </p>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Popular Times Report */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">
            <Clock className="h-6 w-6 inline mr-2" />
            Horarios Más Populares
            <span className="text-sm font-normal text-secondary ml-2">
              (Últimos 30 días)
            </span>
          </h2>

          {loadingPopularTimes ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : popularTimes ? (
            <div className="space-y-6">
              {/* Top 10 Slots */}
              <div>
                <h3 className="text-sm font-medium mb-3">Top 10 Horarios</h3>
                <div className="space-y-2">
                  {popularTimes.topSlots.slice(0, 10).map((slot, index) => (
                    <div
                      key={`${slot.day}-${slot.hour}`}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-8 text-center">
                        <Badge variant={index === 0 ? 'hot' : 'default'}>{index + 1}</Badge>
                      </div>
                      <div className="w-32 text-sm text-secondary">
                        {slot.day} {formatHour(slot.hour)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-[hsl(var(--surface-2))] rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-[hsl(var(--accent-hot))] to-[hsl(var(--accent-hot))] rounded-full h-6 flex items-center justify-end pr-2"
                            style={{
                              width: `${
                                popularTimes.topSlots[0]?.bookings > 0
                                  ? ((slot.bookings || 0) / popularTimes.topSlots[0].bookings) * 100
                                  : 0
                              }%`,
                            }}
                          >
                            <span className="text-white text-xs font-medium">
                              {slot.bookings || 0} reservas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Package Sales Report */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              <Package className="h-6 w-6 inline mr-2" />
              Ventas de Paquetes
            </h2>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={packageSalesStartDate}
                  onChange={(e) => setPackageSalesStartDate(e.target.value)}
                  className="px-3 py-2 border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={packageSalesEndDate}
                  onChange={(e) => setPackageSalesEndDate(e.target.value)}
                  className="px-3 py-2 border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div className="pt-6">
                <Button onClick={loadPackageSales} size="sm">
                  Filtrar
                </Button>
              </div>
            </div>
          </div>

          {loadingPackageSales ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ) : packageSales ? (
            <div className="space-y-6">
              {/* Total Packages */}
              <div className="bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--primary))] mb-1">Total Paquetes Vendidos</p>
                <p className="text-3xl font-bold">
                  {packageSales.totalPackages || 0}
                </p>
              </div>

              {/* By Type */}
              <div>
                <h3 className="text-sm font-medium mb-3">Por Tipo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {packageSales.byType.map((pkg) => (
                    <div
                      key={pkg.type}
                      className="bg-[hsl(var(--surface-0))] border border-[hsl(var(--border-default))] rounded-lg p-4"
                    >
                      <p className="text-lg font-bold">{pkg.count || 0}</p>
                      <p className="text-sm text-secondary mb-2">
                        {getPackageTypeLabel(pkg.type)}
                      </p>
                      <p className="text-sm font-medium text-[hsl(var(--success))]">
                        {formatCurrency(pkg.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Status */}
              <div>
                <h3 className="text-sm font-medium mb-3">Por Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packageSales.byStatus.map((status) => (
                    <div
                      key={status.status}
                      className="bg-[hsl(var(--surface-0))] border border-[hsl(var(--border-default))] rounded-lg p-4"
                    >
                      <p className="text-2xl font-bold">{status._count || 0}</p>
                      <p className="text-sm text-secondary">
                        {getPackageStatusLabel(status.status)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </AdminLayout>
  );
}
