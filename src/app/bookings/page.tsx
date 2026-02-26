'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { bookingsApi, systemConfigApi } from '../../lib/api';
import type { Booking, PaginatedResponse } from '../../lib/api';
import { BookingStatus } from '../../lib/api';
import { getDifficultyLabel } from '../../lib/utils/difficulty';
import { getBookingStatusBadge } from '../../lib/utils/status-badges';
import { Card, Button, Badge } from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { toast } from '../../lib/toast';
import {
  Clock,
  MapPin,
  User,
  XCircle,
  UserCheck,
  Bike,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
type FilterType = 'all' | 'upcoming' | 'past';

export default function BookingsPage() {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, filter]);

  useEffect(() => {
    systemConfigApi.getCancellationDeadline()
      .then((data) => setCancellationDeadlineHours(data.hours))
      .catch(() => setCancellationDeadlineHours(null));
  }, []);

  const loadBookings = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: { upcoming?: boolean; past?: boolean } = {};

      if (filter === 'upcoming') {
        params.upcoming = true;
      } else if (filter === 'past') {
        params.past = true;
      }

      const result = await bookingsApi.list(params);
      setBookings(result.data);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      const errorMessage = error.response?.data?.message ||
        'No pudimos cargar tus reservas. Por favor intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const result = await bookingsApi.cancel(bookingId);
      toast.success(
        'Reserva cancelada',
        {
          description: result.ticketRestored
            ? 'Tu crédito ha sido restaurado'
            : 'El crédito no se puede restaurar (cancelación tardía)',
        }
      );
      loadBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(
        'Error al cancelar la reserva',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = getBookingStatusBadge;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Mis Reservas"
          description="Gestiona tus clases reservadas"
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
                Error al cargar reservas
              </h3>
              <p className="text-sm text-secondary">
                {error}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={loadBookings}
              disabled={loadingData}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              {loadingData ? 'Cargando...' : 'Reintentar'}
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
    attended: bookings.filter((b) => b.status === BookingStatus.ATTENDED).length,
  };

  return (
    <AppLayout>
      <PageHeader
        title="Mis Reservas"
        description="Gestiona tus clases reservadas"
      />

      {/* Content */}
      <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-secondary">Total reservas</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--success)/0.15)] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-sm text-secondary">Confirmadas</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[hsl(var(--accent-hot)/0.15)] flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-[hsl(var(--accent-hot))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.attended}</p>
                  <p className="text-sm text-secondary">Asistidas</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-[hsl(var(--border-default))]">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'upcoming'
                  ? 'border-[hsl(var(--primary))] text-primary'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'past'
                  ? 'border-[hsl(var(--primary))] text-primary'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              Pasadas
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-[hsl(var(--primary))] text-primary'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <Card variant="elevated" className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center">
                  <CalendarIcon className="w-8 h-8 text-tertiary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">No hay reservas</h3>
                  <p className="text-sm text-secondary mb-4">
                    {filter === 'upcoming'
                      ? 'No tienes próximas clases reservadas'
                      : filter === 'past'
                      ? 'No tienes historial de clases'
                      : 'No tienes reservas'}
                  </p>
                  <Link href="/classes">
                    <Button variant="primary" size="sm">
                      Reservar una clase
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isPast = new Date(booking.class.startTime) < new Date();

                return (
                  <Card
                    key={booking.id}
                    variant="elevated"
                    className="hover:border-[hsl(var(--border-emphasis))] transition-colors"
                    data-testid="booking-card"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Class Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg" data-testid="booking-title">
                                {booking.class.title}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-secondary capitalize">
                              {formatDate(booking.class.startTime)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Hora:</span>
                            <span className="font-medium">
                              {formatTime(booking.class.startTime)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Instructor:</span>
                            <span className="font-medium">
                              {booking.class.instructor.user.firstName}{' '}
                              {booking.class.instructor.user.lastName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Sala:</span>
                            <span className="font-medium">
                              {booking.class.room.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Nivel:</span>
                            <span className="font-medium">
                              {getDifficultyLabel(booking.class.difficultyLevel)}
                            </span>
                          </div>

                          {booking.bikeNumber && (
                            <div className="flex items-center gap-2">
                              <Bike className="w-4 h-4 text-tertiary" />
                              <span className="text-secondary">Bici:</span>
                              <span className="font-medium">
                                #{booking.bikeNumber}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-tertiary" />
                            <span className="text-secondary">Paquete:</span>
                            <span className="font-medium">
                              {booking.ticket?.package.type}
                            </span>
                          </div>
                        </div>

                        {/* Cancellation Info */}
                        {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
                          <div className="flex items-start gap-2 p-3 bg-[hsl(var(--surface-2))] rounded-[var(--radius-md)] text-sm">
                            <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5" />
                            <div>
                              <p className="font-medium text-secondary">
                                Motivo de cancelación:
                              </p>
                              <p className="text-tertiary">
                                {booking.cancellationReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col justify-between lg:w-48">
                        {booking.status === BookingStatus.CONFIRMED && !isPast && (
                          <>
                            {booking.canCancel ? (
                              <div className="space-y-2">
                                <p className="text-xs text-secondary">
                                  Puedes cancelar hasta{' '}
                                  {booking.cancellationDeadline && formatTime(booking.cancellationDeadline)}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.1)]"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={cancellingId === booking.id}
                                  data-testid="cancel-button"
                                >
                                  {cancellingId === booking.id ? (
                                    <>
                                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                                      Cancelando...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancelar Reserva
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 p-3 bg-[hsl(var(--warning)/0.1)] rounded-[var(--radius-md)] text-sm">
                                <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5" />
                                <p className="text-secondary">
                                  Ya no se puede cancelar (menos de {cancellationDeadlineHours ?? 1} hora{(cancellationDeadlineHours ?? 1) !== 1 ? 's' : ''})
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {booking.status === BookingStatus.CONFIRMED && isPast && (
                          <div className="text-sm text-tertiary">
                            Clase finalizada
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
      </div>
    </AppLayout>
  );
}
