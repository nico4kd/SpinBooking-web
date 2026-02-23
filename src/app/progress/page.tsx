'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import { AppLayout, PageHeader } from '../../components/Layout';
import { ActivityHeatmap } from '../../components/progress/ActivityHeatmap';
import { Spinner, Card, StatCard, ProgressCard } from '../../components/ui';
import {
  TrendingUp,
  Calendar,
  Flame,
  Target,
  Award,
  Activity,
} from 'lucide-react';

interface ActivityDay {
  date: string;
  count: number;
  intensity: 'low' | 'medium' | 'high' | 'peak';
}

interface UserActivity {
  year: number;
  activities: ActivityDay[];
  totalClasses: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

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

export default function ProgressPage() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [activityResponse, statsResponse] = await Promise.all([
        api.get<UserActivity>('/users/me/activity', {
          params: { year: selectedYear },
        }),
        api.get<UserStats>('/users/me/stats'),
      ]);

      setActivity(activityResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader
          title="Mi Progreso"
          description="Visualiza tu actividad y logros"
          showDate
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner message="Cargando datos de progreso..." />
        </div>
      </AppLayout>
    );
  }

  if (!activity || !stats) {
    return (
      <AppLayout>
        <PageHeader
          title="Mi Progreso"
          description="Visualiza tu actividad y logros"
          showDate
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-secondary">No se pudieron cargar los datos de progreso.</p>
        </div>
      </AppLayout>
    );
  }

  // Calculate progress percentage for monthly goal
  const monthlyProgress = stats.monthlyGoal > 0
    ? Math.round((stats.classesThisMonth / stats.monthlyGoal) * 100)
    : 0;

  // Calculate year progress
  const yearProgress = 365 > 0
    ? Math.round((activity.activeDays / 365) * 100)
    : 0;

  // Calculate consistency score (active days / days in year * 100)
  const consistencyScore = Math.round((activity.activeDays / 365) * 100);

  return (
    <AppLayout>
      <PageHeader
        title="Mi Progreso"
        description={`Tu actividad en ${selectedYear}`}
        showDate
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Year Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-title">Resumen Anual</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-1))] hover:bg-[hsl(var(--surface-2))] transition-colors"
          >
            {[2026, 2025, 2024].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Classes */}
          <StatCard
            label="Total Clases"
            value={activity.totalClasses}
            icon={Activity}
            change={{
              value: stats.classesThisMonth,
              period: 'este mes'
            }}
            color="cyan"
          />

          {/* Active Days */}
          <StatCard
            label="Días Activos"
            value={activity.activeDays}
            icon={Calendar}
            comparison={`${consistencyScore}% del año`}
            color="success"
          />

          {/* Current Streak */}
          <ProgressCard
            title="Racha Actual"
            value={activity.currentStreak}
            max={Math.max(activity.longestStreak, activity.currentStreak)}
            description={activity.currentStreak >= activity.longestStreak ? '¡Nuevo récord!' : `Récord: ${activity.longestStreak} días`}
            color="amber"
            trend={{
              direction: activity.currentStreak >= activity.longestStreak ? 'up' : 'neutral',
              value: Math.round((activity.currentStreak / Math.max(activity.longestStreak, 1)) * 100),
              label: 'vs récord'
            }}
            urgency={activity.currentStreak >= activity.longestStreak ? 'high' : 'low'}
          />

          {/* Monthly Goal */}
          <ProgressCard
            title="Meta Mensual"
            value={stats.classesThisMonth}
            max={stats.monthlyGoal}
            description={`${stats.monthlyGoal - stats.classesThisMonth} clases restantes`}
            color="cyan"
            trend={{
              direction: monthlyProgress >= 100 ? 'up' : monthlyProgress >= 50 ? 'neutral' : 'down',
              value: monthlyProgress,
              label: 'completado'
            }}
            urgency={monthlyProgress >= 100 ? 'low' : monthlyProgress >= 75 ? 'medium' : 'high'}
          />
        </div>

        {/* Activity Heatmap */}
        <div>
          <h2 className="text-title mb-6">Mapa de Actividad {selectedYear}</h2>
          <ActivityHeatmap
            data={activity.activities}
            year={selectedYear}
          />
        </div>

        {/* Additional Stats */}
        <div>
          <h2 className="text-title mb-6">Estadísticas Adicionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Longest Streak Card */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--warning)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Flame className="w-6 h-6 text-[hsl(var(--warning))]" />
                </div>
                <div className="flex-1">
                  <p className="text-label text-tertiary mb-1">Racha Máxima</p>
                  <p className="text-data text-3xl mb-1">{activity.longestStreak}</p>
                  <p className="text-xs text-secondary">días consecutivos</p>
                </div>
              </div>
            </Card>

            {/* Consistency Score */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--success)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div className="flex-1">
                  <p className="text-label text-tertiary mb-1">Consistencia</p>
                  <p className="text-data text-3xl mb-1">{consistencyScore}%</p>
                  <p className="text-xs text-secondary">{activity.activeDays} de 365 días</p>
                </div>
              </div>
            </Card>

            {/* Average per Week */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <p className="text-label text-tertiary mb-1">Promedio Semanal</p>
                  <p className="text-data text-3xl mb-1">
                    {activity.activeDays > 0 ? (activity.totalClasses / 52).toFixed(1) : 0}
                  </p>
                  <p className="text-xs text-secondary">clases por semana</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-title mb-6">Logros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 10 Classes Achievement */}
            {stats.totalClassesAttended >= 10 && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Primera Decena</p>
                    <p className="text-xs text-secondary">10 clases completadas</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 50 Classes Achievement */}
            {stats.totalClassesAttended >= 50 && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Medio Centenar</p>
                    <p className="text-xs text-secondary">50 clases completadas</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 100 Classes Achievement */}
            {stats.totalClassesAttended >= 100 && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[hsl(var(--accent-hot))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Centurión</p>
                    <p className="text-xs text-secondary">100 clases completadas</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 7 Day Streak */}
            {activity.longestStreak >= 7 && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[hsl(var(--warning))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Una Semana</p>
                    <p className="text-xs text-secondary">7 días consecutivos</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 30 Day Streak */}
            {activity.longestStreak >= 30 && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--warning)/0.15)] flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[hsl(var(--warning))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Un Mes</p>
                    <p className="text-xs text-secondary">30 días consecutivos</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Perfect Month */}
            {stats.classesThisMonth >= stats.monthlyGoal && (
              <Card variant="interactive" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="font-semibold">Meta Cumplida</p>
                    <p className="text-xs text-secondary">Objetivo mensual alcanzado</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
