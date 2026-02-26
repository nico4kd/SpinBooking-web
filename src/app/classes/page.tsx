'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/auth-context';
import { bookingsApi, classesApi, BookingStatus } from '../../lib/api';
import type { ClassWithAvailability, Booking, PaginatedResponse } from '../../lib/api';
import api from '../../lib/api-client';
import {
  Card,
  Button,
  Badge,
  DatePicker,
  Select,
  EmptyState,
  NoClassesIllustration,
  IntensityRing,
} from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { CalendarView } from '../../components/calendar/CalendarView';
import BikeSelectionModal from '../../components/BikeSelectionModal';
import { toast } from '../../lib/toast';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Users,
  Filter,
  List,
} from 'lucide-react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { getDifficultyBadge } from '../../lib/utils/difficulty';
type ViewMode = 'calendar' | 'list';

export default function ClassesPage() {
  const { isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<ClassWithAvailability[]>([]);
  const [userBookings, setUserBookings] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassWithAvailability | null>(null);
  const [bookingClass, setBookingClass] = useState<string | null>(null);
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [pendingMaxCapacity, setPendingMaxCapacity] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  // Filters
  const [startDate, setStartDate] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        await Promise.all([
          loadClasses(abortController.signal),
          loadUserBookings(abortController.signal),
        ]);
      } catch (error: any) {
        // Ignore abort errors
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Error loading data:', error);
        }
      }
    };

    fetchData();

    // Cleanup function to abort requests if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, startDate, difficultyFilter, viewMode, currentWeekDate]);

  const loadClasses = async (signal?: AbortSignal) => {
    setLoadingData(true);
    try {
      const params: Record<string, string | number | boolean> = {};

      // For calendar view, load current week
      if (viewMode === 'calendar') {
        const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn: 1 });
        params.startDate = weekStart.toISOString();
        params.endDate = weekEnd.toISOString();
        params.limit = 100;
      } else {
        // For list view, use filters
        if (startDate) {
          params.startDate = new Date(startDate).toISOString();
        } else {
          // Default: show classes from today onwards
          params.startDate = new Date().toISOString();
        }
      }

      if (difficultyFilter) {
        params.difficultyLevel = difficultyFilter;
      }

      const response = await api.get<PaginatedResponse<ClassWithAvailability>>('/classes', {
        params,
        signal,
      });
      setClasses(response.data.data);
    } catch (error: any) {
      // Don't log abort errors
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error loading classes:', error);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const loadUserBookings = async (signal?: AbortSignal) => {
    try {
      const response = await api.get<PaginatedResponse<Booking>>('/bookings', {
        params: {
          upcoming: true,
          limit: 100,
        },
        signal,
      });
      const bookingClassIds = response.data.data
        .filter((b) => b.status === BookingStatus.CONFIRMED)
        .map((b) => b.classId);
      setUserBookings(bookingClassIds);
    } catch (error: any) {
      // Don't log abort errors
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error loading bookings:', error);
      }
    }
  };

  const handleBookClass = useCallback((classItem: ClassWithAvailability) => {
    // Open bike selection modal
    setPendingClassId(classItem.id);
    setPendingMaxCapacity(classItem.maxCapacity);
    setShowBikeModal(true);
  }, []);

  const handleBikeSelected = useCallback(async (bikeNumber: number | null) => {
    if (!pendingClassId) return;

    setBookingClass(pendingClassId);
    try {
      await bookingsApi.create({
        classId: pendingClassId,
        bikeNumber,
      });

      toast.success(
        '¡Reserva realizada exitosamente!',
        {
          description: bikeNumber
            ? `Bicicleta #${bikeNumber} asignada`
            : 'Tu bicicleta será asignada automáticamente',
        }
      );
      loadClasses(); // Reload to update availability
    } catch (error: any) {
      console.error('Error booking class:', error);
      toast.error(
        'Error al reservar la clase',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setBookingClass(null);
      setPendingClassId(null);
      setPendingMaxCapacity(0);
    }
  }, [pendingClassId]);

  const handleJoinWaitlist = useCallback(async (classId: string) => {
    try {
      await api.post('/waitlist', { classId });
      toast.success(
        'Agregado a lista de espera',
        {
          description: 'Te notificaremos si se libera un lugar',
        }
      );
      loadClasses();
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      toast.error(
        'Error al unirse a la lista de espera',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Memoize classes with booking status to prevent recalculation on every render
  const enrichedClasses = useMemo(
    () => classes.map((c) => ({
      ...c,
      isBooked: userBookings.includes(c.id),
    })),
    [classes, userBookings]
  );

  // Group classes by date
  const groupedClasses = useMemo(
    () => classes.reduce((acc, classItem) => {
      const date = new Date(classItem.startTime).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(classItem);
      return acc;
    }, {} as Record<string, ClassWithAvailability[]>),
    [classes]
  );

  return (
    <AppLayout>
      <PageHeader
        title="Clases Disponibles"
        description="Encuentra y reserva tu próxima clase de spinning"
        actions={
          <div className="flex items-center gap-2">
            {viewMode === 'list' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            )}
          </div>
        }
      />

        {/* Filters */}
        {showFilters && (
          <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-1))] p-4 sm:p-6">
            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha desde
                </label>
                <DatePicker
                  value={startDate ? new Date(startDate) : undefined}
                  onChange={(date) => setStartDate(date?.toISOString().split('T')[0] || '')}
                  placeholder="Seleccionar fecha"
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dificultad
                </label>
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                  options={[
                    { value: '', label: 'Todas' },
                    { value: 'BEGINNER', label: 'Principiante' },
                    { value: 'INTERMEDIATE', label: 'Intermedio' },
                    { value: 'ADVANCED', label: 'Avanzado' },
                    { value: 'ALL_LEVELS', label: 'Todos los niveles' },
                  ]}
                  placeholder="Seleccionar dificultad"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setDifficultyFilter('');
                  }}
                  className="w-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendario
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>

            {/* Week Navigation for Calendar View */}
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentWeekDate((prev) => subWeeks(prev, 1))}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentWeekDate(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentWeekDate((prev) => addWeeks(prev, 1))}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' ? (
            <CalendarView
              classes={enrichedClasses.map((c) => ({
                ...c,
              }))}
              onClassClick={(classItem) => handleBookClass(classItem as ClassWithAvailability)}
              loading={loadingData}
            />
          ) : (
            /* List View */
            <>
              {Object.keys(groupedClasses).length === 0 ? (
            <EmptyState
              illustration={<NoClassesIllustration />}
              title="No hay clases con esos filtros"
              description="Intenta expandir el rango de fechas o eliminar filtros para ver más opciones disponibles."
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setStartDate('');
                  setDifficultyFilter('');
                },
              }}
              suggestion="💡 Las clases se publican con 2 semanas de anticipación"
            />
          ) : (
            Object.entries(groupedClasses).map(([date, dayClasses]) => (
              <div key={date}>
                <h2 className="text-title mb-4 capitalize">
                  {formatDate(dayClasses[0].startTime)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dayClasses.map((classItem) => (
                    <Card
                      key={classItem.id}
                      variant="elevated"
                      className="hover:border-[hsl(var(--border-emphasis))] transition-colors"
                      data-testid="class-card"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold" data-testid="class-title">
                                {classItem.title}
                              </h3>
                              {getDifficultyBadge(classItem.difficultyLevel)}
                            </div>
                            <p className="text-sm text-secondary">
                              {classItem.description}
                            </p>
                          </div>
                        </div>

                        {/* Time and Duration */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-tertiary" />
                            <span className="font-semibold" data-testid="class-time">
                              {formatTime(classItem.startTime)}
                            </span>
                          </div>
                          <span className="text-secondary">
                            {classItem.duration} min
                          </span>
                        </div>

                        {/* Instructor and Room */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Instructor:</span>
                            <span className="font-medium">
                              {classItem.instructor.user.firstName}{' '}
                              {classItem.instructor.user.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Sala:</span>
                            <span className="font-medium">
                              {classItem.room.name}
                            </span>
                          </div>
                        </div>

                        {/* Music Theme */}
                        {classItem.musicTheme && (
                          <div className="text-sm">
                            <span className="text-secondary">Música: </span>
                            <span className="font-medium">
                              {classItem.musicTheme}
                            </span>
                          </div>
                        )}

                        {/* Availability with IntensityRing */}
                        <div className="pt-2 border-t border-[hsl(var(--border-default))]">
                          <div className="flex items-center gap-4 mb-3">
                            <IntensityRing
                              value={classItem.spotsAvailable}
                              max={classItem.maxCapacity}
                              color={
                                classItem.isFull ? 'pink' :
                                classItem.fewSpotsLeft ? 'amber' :
                                'success'
                              }
                              size="sm"
                              urgency={
                                classItem.isFull ? 'critical' :
                                classItem.fewSpotsLeft ? 'high' :
                                'low'
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-label text-tertiary">
                                  Disponibilidad
                                </span>
                                {classItem.isFull ? (
                                  <Badge variant="default">Completo</Badge>
                                ) : classItem.fewSpotsLeft ? (
                                  <Badge variant="warning">
                                    {classItem.spotsAvailable} lugares
                                  </Badge>
                                ) : (
                                  <Badge variant="success">
                                    {classItem.spotsAvailable} lugares
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-secondary mt-1">
                                {classItem.currentCapacity} de {classItem.maxCapacity} reservados
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          {classItem.isFull ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleJoinWaitlist(classItem.id)}
                              data-testid="waitlist-button"
                            >
                              Unirse a lista de espera
                              {classItem.waitlistCount > 0 &&
                                ` (${classItem.waitlistCount})`}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={() => handleBookClass(classItem)}
                              disabled={bookingClass === classItem.id}
                              data-testid="book-button"
                            >
                              {bookingClass === classItem.id ? (
                                <>
                                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                                  Reservando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Reservar Ahora
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
            </>
          )}
      </div>

      {/* Bike Selection Modal */}
      {pendingClassId && (
        <BikeSelectionModal
          classId={pendingClassId}
          maxCapacity={pendingMaxCapacity}
          onSelect={handleBikeSelected}
          onClose={() => {
            setShowBikeModal(false);
            setPendingClassId(null);
            setPendingMaxCapacity(0);
          }}
          isOpen={showBikeModal}
        />
      )}
    </AppLayout>
  );
}
