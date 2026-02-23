'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import {
  Card,
  Button,
  ProgressCard,
  StatCard,
  StatusCard,
  Spinner,
} from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import {
  Calendar,
  Package,
  User,
  TrendingUp,
  CheckCircle2,
  Flame,
  Target,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  availableCredits: number;
  totalCredits: number;
  classesThisMonth: number;
  classesLastMonth: number;
  currentStreak: number;
  longestStreak: number;
  weeklyHistory: number[];
  monthlyGoal: number;
  totalClassesAttended: number;
  daysUntilExpiry: number | null;
  percentileRank: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<UserStats>('/users/me/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      const errorMessage = error.response?.data?.message ||
        'No pudimos cargar tus estadísticas. Por favor intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader
          title="Dashboard"
          description={`Bienvenido de vuelta, ${user?.firstName}`}
          showDate
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner message="Cargando estadísticas..." />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Dashboard"
          description={`Bienvenido de vuelta, ${user?.firstName}`}
          showDate
        />
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--error)/0.15)] flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-[hsl(var(--error))]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                Error al cargar estadísticas
              </h3>
              <p className="text-sm text-secondary">
                {error}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Cargando...' : 'Reintentar'}
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return (
      <AppLayout>
        <PageHeader
          title="Dashboard"
          description={`Bienvenido de vuelta, ${user?.firstName}`}
          showDate
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-secondary">No hay estadísticas disponibles.</p>
        </div>
      </AppLayout>
    );
  }

  // Calculate trend for classes
  const classesTrend = stats.classesLastMonth > 0
    ? Math.round(((stats.classesThisMonth - stats.classesLastMonth) / stats.classesLastMonth) * 100)
    : stats.classesThisMonth > 0 ? 100 : 0;

  // Calculate trend for credits
  const creditsTrend = stats.totalCredits > 0
    ? Math.round(((stats.totalCredits - stats.availableCredits) / stats.totalCredits) * 100)
    : 0;

  // Calculate streak progress
  const streakProgress = stats.longestStreak > 0
    ? Math.round((stats.currentStreak / stats.longestStreak) * 100)
    : 100;

  // Determine comparison text
  const comparisonText = stats.percentileRank >= 75
    ? `Top ${100 - stats.percentileRank}% de usuarios`
    : stats.percentileRank >= 50
    ? 'Por encima del promedio'
    : 'Continúa así';

  // Format expiry description
  const expiryDescription = stats.daysUntilExpiry !== null
    ? `${stats.daysUntilExpiry === 0 ? 'Expira hoy' : `Expira en ${stats.daysUntilExpiry} día${stats.daysUntilExpiry !== 1 ? 's' : ''}`}`
    : 'Sin paquetes activos';

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description={`Bienvenido de vuelta, ${user?.firstName}`}
        showDate
      />

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Success Status Card */}
          {/* <StatusCard
            title="Fase 2 & 3 Completadas"
            description="Authentication system implementado + UI/UX mejorado con nuevos componentes especializados, estados vacíos, navegación responsive y micro-interacciones."
            status="success"
            icon={CheckCircle2}
            badge="Actualizado"
          /> */}

          {/* Stats with Specialized Cards */}
          <div>
            <h2 className="text-title mb-6">Tu Actividad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Credits - ProgressCard */}
              <ProgressCard
                title="Créditos Disponibles"
                value={stats.availableCredits}
                max={stats.totalCredits || stats.availableCredits}
                description={expiryDescription}
                color="cyan"
                trend={{
                  direction: creditsTrend > 50 ? 'down' : creditsTrend > 25 ? 'neutral' : 'up',
                  value: creditsTrend,
                  label: 'usados del paquete'
                }}
                action={{
                  label: 'Ver Paquetes',
                  href: '/packages'
                }}
                urgency={stats.daysUntilExpiry !== null && stats.daysUntilExpiry <= 7 ? 'high' : stats.daysUntilExpiry !== null && stats.daysUntilExpiry <= 14 ? 'medium' : 'low'}
              />

              {/* Classes this month - StatCard */}
              <StatCard
                label="Clases Este Mes"
                value={stats.classesThisMonth}
                icon={Calendar}
                change={{
                  value: Math.abs(classesTrend),
                  period: 'vs mes pasado'
                }}
                sparkline={stats.weeklyHistory}
                comparison={comparisonText}
                color="pink"
              />

              {/* Streak - ProgressCard */}
              <ProgressCard
                title="Racha Actual"
                value={stats.currentStreak}
                max={Math.max(stats.longestStreak, stats.currentStreak)}
                description={stats.currentStreak >= stats.longestStreak ? '¡Nuevo récord personal!' : `Récord: ${stats.longestStreak} días`}
                color="success"
                trend={{
                  direction: stats.currentStreak >= stats.longestStreak ? 'up' : 'neutral',
                  value: streakProgress,
                  label: 'vs mejor racha'
                }}
                urgency={stats.currentStreak >= stats.longestStreak ? 'high' : 'low'}
              />
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-label text-tertiary">Meta Mensual</p>
                  <p className="text-data text-2xl">{stats.classesThisMonth}/{stats.monthlyGoal}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <p className="text-label text-tertiary">Calorías Quemadas</p>
                  <p className="text-data text-2xl">{stats.classesThisMonth * 600}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--accent-hot))]" />
                </div>
                <div>
                  <p className="text-label text-tertiary">Intensidad Prom.</p>
                  <p className="text-data text-2xl">{stats.classesThisMonth > 0 ? Math.round(80 + (stats.percentileRank / 10)) : 0}%</p>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--warning)/0.15)] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[hsl(var(--warning))]" />
                </div>
                <div>
                  <p className="text-label text-tertiary">Total Clases</p>
                  <p className="text-data text-2xl">{stats.totalClassesAttended}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Próximas funcionalidades */}
          <div>
            <h2 className="text-title mb-6">Próximamente en Fase 4</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="interactive" className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--primary)/0.25)] transition-colors">
                    <Calendar className="w-6 h-6 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Sistema de Reservas</h3>
                    <p className="text-sm text-secondary">
                      Calendario de clases, reserva tu spot favorito, lista de espera automática
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="interactive" className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--accent-hot)/0.25)] transition-colors">
                    <Package className="w-6 h-6 text-[hsl(var(--accent-hot))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Gestión de Paquetes</h3>
                    <p className="text-sm text-secondary">
                      Compra paquetes, ve tus créditos, recibe notificaciones de expiración
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="interactive" className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--success)/0.25)] transition-colors">
                    <TrendingUp className="w-6 h-6 text-[hsl(var(--success))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Dashboard de Métricas</h3>
                    <p className="text-sm text-secondary">
                      Estadísticas personales, progreso mensual, rachas y logros
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="interactive" className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--warning)/0.15)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--warning)/0.25)] transition-colors">
                    <User className="w-6 h-6 text-[hsl(var(--warning))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Perfil y Preferencias</h3>
                    <p className="text-sm text-secondary">
                      Gestiona tu información, preferencias de notificaciones y más
                    </p>
                  </div>
                </div>
              </Card>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
