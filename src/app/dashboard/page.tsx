'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import {
  Card,
  Button,
  Badge,
  Skeleton,
  Spinner,
} from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { MonthDayPicker } from '../../components/calendar/MonthDayPicker';
import BikeSelectionModal from '../../components/BikeSelectionModal';
import { toast } from '../../lib/toast';
import { format, addDays, isSameDay, isPast, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  User,
  Bike,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

// From GET /users/me/stats (subset of fields used by new dashboard)
interface UserStats {
  availableCredits: number;
  totalCredits: number;
  daysUntilExpiry: number | null;
}

// From GET /packages (reuses existing shape in packages/page.tsx)
interface UserPackage {
  id: string;
  type: string;
  status: string; // 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'DEPLETED'
  totalTickets: number;
  remainingTickets: number;
  expiresAt: string; // ISO date string
}

// Booking detail for a selected day — defined locally to avoid cross-page coupling
interface DayBooking {
  id: string;
  status: string;
  bikeNumber: number | null;
  canCancel: boolean;
  cancellationDeadline: string;
  class: {
    id: string;
    title: string | null;
    startTime: string;
    duration: number;
    difficultyLevel: string;
    room: { name: string; location: string | null };
    instructor: { user: { firstName: string; lastName: string } };
  };
  ticket: { package: { type: string } };
}

// Classes available for a day — copied from classes/page.tsx shape, no cross-page import
interface ClassWithAvailability {
  id: string;
  title: string | null;
  description: string | null;
  startTime: string;
  duration: number;
  difficultyLevel: string;
  maxCapacity: number;
  currentCapacity: number;
  musicTheme: string | null;
  room: {
    id: string;
    name: string;
    location: string | null;
    capacity: number;
  };
  instructor: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  spotsAvailable: number;
  isFull: boolean;
  fewSpotsLeft: boolean;
  waitlistCount: number;
}

// Generic pagination response wrapper
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Packages state
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesExpanded, setPackagesExpanded] = useState(false);

  // Calendar / day-detail state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayBooking, setDayBooking] = useState<DayBooking | null>(null);
  const [dayClasses, setDayClasses] = useState<ClassWithAvailability[]>([]);

  // Month-scoped booking dots state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [monthBookingDates, setMonthBookingDates] = useState<string[]>([]);

  // Bike selection modal state (same pattern as classes/page.tsx)
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [pendingMaxCapacity, setPendingMaxCapacity] = useState<number>(0);
  const [bookingClass, setBookingClass] = useState<string | null>(null);

  useEffect(() => {
    // Fire fetches in parallel — no await between them
    loadStats();
    loadPackages();
    loadMonthBookings(new Date());
  }, []);

  // Re-fetch month booking dots whenever the visible calendar month changes
  useEffect(() => {
    loadMonthBookings(calendarMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarMonth]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await api.get<UserStats>('/users/me/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setStatsError(
        error.response?.data?.message ||
          'No pudimos cargar tus estadísticas. Por favor intenta nuevamente.'
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      const response = await api.get<UserPackage[]>('/packages');
      setPackages(response.data);
    } catch (error: any) {
      console.error('Error loading packages:', error);
      // Don't block the page on package load failure — just show empty
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Fetch booking dots for the full visible calendar month.
  // Tries date-range params first; falls back to fetching upcoming + past and merging.
  const loadMonthBookings = async (month: Date) => {
    const startDate = format(startOfMonth(month), "yyyy-MM-dd'T'00:00:00");
    const endDate = format(endOfMonth(month), "yyyy-MM-dd'T'23:59:59");

    try {
      // Attempt date-range query
      const response = await api.get<PaginatedResponse<DayBooking>>('/bookings', {
        params: { startDate, endDate, limit: 200 },
      });
      const confirmed = response.data.data.filter((b) => b.status === 'CONFIRMED');
      const dates = confirmed.map((b) => format(new Date(b.class.startTime), 'yyyy-MM-dd'));
      setMonthBookingDates([...new Set(dates)]);
    } catch {
      // Fallback: fetch upcoming + past and merge
      try {
        const [upcomingResponse, pastResponse] = await Promise.all([
          api.get<PaginatedResponse<DayBooking>>('/bookings', {
            params: { upcoming: true, limit: 200 },
          }),
          api.get<PaginatedResponse<DayBooking>>('/bookings', {
            params: { past: true, limit: 200 },
          }),
        ]);

        const allBookings = [
          ...upcomingResponse.data.data,
          ...pastResponse.data.data,
        ];

        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const confirmed = allBookings.filter((b) => {
          if (b.status !== 'CONFIRMED') return false;
          const d = new Date(b.class.startTime);
          return d >= monthStart && d <= monthEnd;
        });

        const dates = confirmed.map((b) =>
          format(new Date(b.class.startTime), 'yyyy-MM-dd')
        );
        setMonthBookingDates([...new Set(dates)]);
      } catch {
        // Silently fail — dots simply won't render
        setMonthBookingDates([]);
      }
    }
  };

  // Reload day data whenever selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      loadDayData(selectedDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const loadDayData = async (date: Date) => {
    setDayLoading(true);
    setDayBooking(null);
    setDayClasses([]);

    const startDate = format(date, "yyyy-MM-dd'T'00:00:00");
    const endDate = format(addDays(date, 1), "yyyy-MM-dd'T'00:00:00");

    try {
      // Attempt date-range booking query first.
      // RISK: if the API does not support startDate/endDate, fall back to upcoming=true + client filter.
      let foundBooking: DayBooking | null = null;

      try {
        const bookingResponse = await api.get<PaginatedResponse<DayBooking>>('/bookings', {
          params: { startDate, endDate },
        });
        const confirmed = bookingResponse.data.data.filter(
          (b) => b.status === 'CONFIRMED'
        );
        if (confirmed.length > 0) {
          foundBooking = confirmed[0];
        }
      } catch {
        // Fallback: fetch upcoming + past bookings and filter client-side by date
        try {
          const [upcomingResponse, pastResponse] = await Promise.all([
            api.get<PaginatedResponse<DayBooking>>('/bookings', {
              params: { upcoming: true, limit: 100 },
            }),
            api.get<PaginatedResponse<DayBooking>>('/bookings', {
              params: { past: true, limit: 100 },
            }),
          ]);
          const allBookings = [
            ...upcomingResponse.data.data,
            ...pastResponse.data.data,
          ];
          const matched = allBookings.filter(
            (b) =>
              b.status === 'CONFIRMED' &&
              isSameDay(new Date(b.class.startTime), date)
          );
          if (matched.length > 0) {
            foundBooking = matched[0];
          }
        } catch {
          // Silently fail — show empty state
        }
      }

      if (foundBooking) {
        setDayBooking(foundBooking);
        return;
      }

      // No booking found — fetch available classes for the day
      try {
        const classesResponse = await api.get<PaginatedResponse<ClassWithAvailability>>('/classes', {
          params: { startDate, endDate, limit: 100 },
        });
        setDayClasses(classesResponse.data.data);
      } catch {
        // Silently fail — show "no classes" empty state
        setDayClasses([]);
      }
    } finally {
      setDayLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Reserva cancelada');
      if (selectedDay) {
        loadDayData(selectedDay);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? 'Error al cancelar'
      );
    }
  };

  const handleBookClass = (classItem: ClassWithAvailability) => {
    if (classItem.isFull) {
      toast.error('Clase llena — ya no hay spots disponibles');
      return;
    }

    // Client-side credit guard: block booking if the member has no available credits
    if (stats === null || stats.availableCredits === 0) {
      toast.error('No tienes créditos disponibles para reservar');
      return;
    }
    // Also block if all non-PENDING packages have been depleted
    const nonPendingPackages = packages.filter((p) => p.status !== 'PENDING');
    if (
      nonPendingPackages.length > 0 &&
      nonPendingPackages.every((p) => p.remainingTickets === 0)
    ) {
      toast.error('No tienes créditos disponibles para reservar');
      return;
    }

    setPendingClassId(classItem.id);
    setPendingMaxCapacity(classItem.maxCapacity);
    setShowBikeModal(true);
  };

  const handleBikeSelected = async (bikeNumber: number | null) => {
    if (!pendingClassId) return;

    setBookingClass(pendingClassId);
    setShowBikeModal(false);

    try {
      await api.post('/bookings', {
        classId: pendingClassId,
        bikeNumber,
      });
      toast.success('Reserva confirmada');
      if (selectedDay) {
        loadDayData(selectedDay);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? 'Error al reservar'
      );
    } finally {
      setBookingClass(null);
      setPendingClassId(null);
      setPendingMaxCapacity(0);
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge variant="success">Principiante</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="primary">Intermedio</Badge>;
      case 'ADVANCED':
        return <Badge variant="hot">Avanzado</Badge>;
      case 'ALL_LEVELS':
        return <Badge variant="default">Todos los niveles</Badge>;
      default:
        return <Badge variant="default">{level}</Badge>;
    }
  };

  // Derived package lists
  const activePackages = packages.filter(
    (p) => p.status === 'ACTIVE' && p.remainingTickets > 0
  );
  const pendingPackages = packages.filter((p) => p.status === 'PENDING');

  // Expiry badge urgency from stats.daysUntilExpiry
  const getExpiryBadgeVariant = (days: number): 'destructive' | 'warning' | 'default' => {
    if (days <= 7) return 'destructive';
    if (days <= 14) return 'warning';
    return 'default';
  };

  return (
    <AppLayout>
      <PageHeader
        title="Inicio"
        description={`Bienvenido de vuelta, ${user?.firstName}`}
        showDate
      />

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">

        {/* ────────────────────────────────────────────────────── */}
        {/* Section 1: Créditos disponibles                       */}
        {/* ────────────────────────────────────────────────────── */}
        <Card variant="elevated">
          <h2 className="text-title mb-4">Créditos disponibles</h2>

          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: credit count + expiry */}
            <div className="space-y-2">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ) : statsError ? (
                <div className="space-y-1">
                  <p className="text-sm text-[hsl(var(--error))]">{statsError}</p>
                  <button
                    onClick={loadStats}
                    className="text-xs text-[hsl(var(--primary))] underline"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  {stats && stats.availableCredits > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[hsl(var(--primary))]">
                        {stats.availableCredits}
                      </span>
                      <span className="text-sm text-secondary">créditos disponibles</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-secondary">Sin paquetes activos</p>
                      <p className="text-sm text-tertiary">
                        Compra un paquete para empezar a reservar clases
                      </p>
                    </div>
                  )}

                  {/* Soonest expiry date */}
                  {stats && stats.daysUntilExpiry !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary">Vence el</span>
                      <Badge variant={getExpiryBadgeVariant(stats.daysUntilExpiry)}>
                        {format(
                          addDays(new Date(), stats.daysUntilExpiry),
                          'dd/MM/yyyy',
                          { locale: es }
                        )}
                      </Badge>
                    </div>
                  )}

                  {/* Pending packages notice */}
                  {pendingPackages.length > 0 && (
                    <p className="text-xs text-secondary mt-1">
                      {pendingPackages.length === 1
                        ? 'Tienes 1 paquete con pago pendiente de confirmación'
                        : `Tienes ${pendingPackages.length} paquetes con pago pendiente de confirmación`}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Right: CTA */}
            <Link
              href="/packages"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--control-focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_0_16px_hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-[0.98] h-10 px-4 text-sm rounded-[var(--radius-md)] whitespace-nowrap"
            >
              Comprar paquetes
            </Link>
          </div>

          {/* Expandable per-package breakdown */}
          {packagesLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : activePackages.length > 1 ? (
            <div className="mt-4 border-t border-[hsl(var(--border-default))] pt-4">
              <button
                onClick={() => setPackagesExpanded((v) => !v)}
                className="flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
              >
                {packagesExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Ocultar detalle
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Ver detalle por paquete
                  </>
                )}
              </button>

              {packagesExpanded && (
                <div className="mt-3 space-y-2">
                  {activePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-default))] last:border-0 text-sm"
                    >
                      <span className="font-medium">{pkg.type}</span>
                      <span className="text-secondary">
                        {pkg.remainingTickets}/{pkg.totalTickets} créditos
                      </span>
                      <span className="text-tertiary text-xs">
                        Vence {format(new Date(pkg.expiresAt), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </Card>

        {/* ────────────────────────────────────────────────────── */}
        {/* Section 2: Calendario                                 */}
        {/* ────────────────────────────────────────────────────── */}
        <Card variant="elevated">
          <h2 className="text-title mb-4">Calendario</h2>

          <MonthDayPicker
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            bookingDates={monthBookingDates}
            onMonthChange={setCalendarMonth}
          />

          {/* Day Detail Panel — renders when a day is selected */}
          {selectedDay && (
            <div className="mt-6 border-t border-[hsl(var(--border-default))] pt-6">
              {dayLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner message="Cargando..." />
                </div>
              ) : dayBooking ? (
                /* ── Booking detail view ── */
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">
                        {dayBooking.class.title ?? 'Spinning'}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getDifficultyBadge(dayBooking.class.difficultyLevel)}
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Confirmada
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-tertiary" />
                      <span className="text-secondary">Hora:</span>
                      <span className="font-medium">
                        {format(new Date(dayBooking.class.startTime), 'HH:mm', { locale: es })}
                      </span>
                      <span className="text-tertiary">({dayBooking.class.duration} min)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-tertiary" />
                      <span className="text-secondary">Instructor:</span>
                      <span className="font-medium">
                        {dayBooking.class.instructor.user.firstName}{' '}
                        {dayBooking.class.instructor.user.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-tertiary" />
                      <span className="text-secondary">Sala:</span>
                      <span className="font-medium">{dayBooking.class.room.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-tertiary" />
                      <span className="text-secondary">Bicicleta:</span>
                      <span className="font-medium">
                        {dayBooking.bikeNumber != null
                          ? `#${dayBooking.bikeNumber}`
                          : 'Sin asignar'}
                      </span>
                    </div>
                  </div>

                  {/* Cancel button — only for future days where cancellation is allowed */}
                  {dayBooking.canCancel && !isPast(selectedDay) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.1)]"
                      onClick={() => handleCancelBooking(dayBooking.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar reserva
                    </Button>
                  )}
                </div>
              ) : dayClasses.length > 0 ? (
                /* ── Available classes list ── */
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-secondary">
                    Clases disponibles para este día
                  </h3>
                  {dayClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]"
                    >
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{cls.title ?? 'Spinning'}</span>
                          {getDifficultyBadge(cls.difficultyLevel)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-secondary flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(cls.startTime), 'HH:mm', { locale: es })} · {cls.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {cls.instructor.user.firstName} {cls.instructor.user.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cls.room.name}
                          </span>
                        </div>
                        <div className="text-xs text-tertiary">
                          {cls.isFull ? (
                            <Badge variant="default">Completo</Badge>
                          ) : cls.fewSpotsLeft ? (
                            <Badge variant="warning">{cls.spotsAvailable} lugares</Badge>
                          ) : (
                            <Badge variant="success">{cls.spotsAvailable} lugares</Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleBookClass(cls)}
                        disabled={isPast(selectedDay) || bookingClass === cls.id}
                        className="shrink-0"
                      >
                        {bookingClass === cls.id ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                            Reservando...
                          </>
                        ) : (
                          'Reservar'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── No classes / no booking empty state ── */
                <p className="text-secondary text-sm text-center py-4">
                  No hay clases disponibles para este día.
                </p>
              )}
            </div>
          )}

          {/* Prompt when no day is selected */}
          {!selectedDay && (
            <p className="text-secondary text-sm text-center py-4 mt-4">
              Selecciona un día para ver clases disponibles.
            </p>
          )}
        </Card>

      </div>

      {/* Bike Selection Modal */}
      <BikeSelectionModal
        isOpen={showBikeModal}
        classId={pendingClassId ?? ''}
        maxCapacity={pendingMaxCapacity}
        onSelect={handleBikeSelected}
        onClose={() => {
          setShowBikeModal(false);
          setPendingClassId(null);
        }}
      />
    </AppLayout>
  );
}
