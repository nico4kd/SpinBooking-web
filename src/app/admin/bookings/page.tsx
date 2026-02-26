'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import { BookingStatus } from '../../../lib/api';
import { getBookingStatusBadge } from '../../../lib/utils/status-badges';
import { AdminLayout, AdminPageHeader, ConsoleMetric } from '../../../components/admin';
import { Card, Button, Badge, DatePicker, Select, SkeletonTable } from '../../../components/ui';
import { getDifficultyBadge } from '../../../lib/utils/difficulty';
import {
  Package,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Check,
  X,
  Eye,
  MapPin,
  User,
} from 'lucide-react';
import { toast } from '../../../lib/toast';

interface BookingData {
  id: string;
  status: string;
  bikeNumber: number | null;
  bookedAt: string;
  cancelledAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  class: {
    id: string;
    title: string;
    startTime: string;
    duration: number;
    difficultyLevel: string;
    instructor: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    room: {
      name: string;
      location: string | null;
    };
  };
  ticket: {
    package: {
      type: string;
    };
  };
}

interface BookingsStats {
  total: number;
  confirmed: number;
  attended: number;
  noShow: number;
  cancelled: number;
  attendanceRate: number;
}

export default function AdminBookingsPage() {
  const { user, isAuthenticated, logout } = useAuth();

  // Data state
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingsStats>({
    total: 0,
    confirmed: 0,
    attended: 0,
    noShow: 0,
    cancelled: 0,
    attendanceRate: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadBookings();
    }
  }, [isAuthenticated, user, page, startDate, endDate, statusFilter]);

  const loadBookings = async () => {
    setLoadingData(true);
    setError(null);
    try {
      // Admin view: get all bookings from all users
      const params: any = {
        page,
        limit: 20,
        adminView: 'true', // This tells the API to return all bookings instead of just the user's
      };

      if (startDate) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.endDate = new Date(endDate).toISOString();
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      // For now, we'll fetch all bookings without filters since the endpoint doesn't exist yet
      // In production, create /admin/bookings endpoint
      const response = await api.get('/bookings', { params });

      const bookingsData = response.data.data || [];
      setBookings(bookingsData);

      // Calculate stats
      const total = bookingsData.length;
      const confirmed = bookingsData.filter((b: BookingData) => b.status === BookingStatus.CONFIRMED).length;
      const attended = bookingsData.filter((b: BookingData) => b.status === BookingStatus.ATTENDED).length;
      const noShow = bookingsData.filter((b: BookingData) => b.status === BookingStatus.NO_SHOW).length;
      const cancelled = bookingsData.filter((b: BookingData) => b.status === BookingStatus.CANCELLED).length;
      const attendanceRate = attended + noShow > 0 ? (attended / (attended + noShow)) * 100 : 0;

      setStats({
        total,
        confirmed,
        attended,
        noShow,
        cancelled,
        attendanceRate,
      });
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      setError(error.response?.data?.message || 'Error al cargar reservas');
    } finally {
      setLoadingData(false);
    }
  };

  const handleMarkAttended = async (bookingId: string) => {
    if (!confirm('¿Marcar esta reserva como asistida?')) {
      return;
    }

    setActionInProgress(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: 'ATTENDED',
      });

      toast.success('Reserva marcada como asistida');
      await loadBookings();
    } catch (error: any) {
      console.error('Error marking attended:', error);
      toast.error(
        'Error al marcar asistencia',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (!confirm('¿Marcar esta reserva como no asistida?')) {
      return;
    }

    setActionInProgress(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: 'NO_SHOW',
      });

      toast.success('Reserva marcada como no asistida');
      await loadBookings();
    } catch (error: any) {
      console.error('Error marking no-show:', error);
      toast.error(
        'Error al marcar no show',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const getStatusBadge = getBookingStatusBadge;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  return (
    <AdminLayout>
        {/* Header */}
        <header className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-between pl-16 pr-4 sm:px-6 lg:px-8 bg-[hsl(var(--surface-0))]">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">Gestión de Reservas</h1>
            <p className="text-sm text-secondary truncate">
              {stats.total} reservas en total
            </p>
          </div>
          <Button variant="outline" size="sm" disabled className="flex-shrink-0">
            <Package className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </header>

        {/* Statistics Cards */}
        <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card variant="default">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-secondary mt-1">Total</p>
              </div>
            </Card>

            <Card variant="default">
              <div className="text-center">
                <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.confirmed}</p>
                <p className="text-xs text-secondary mt-1">Confirmadas</p>
              </div>
            </Card>

            <Card variant="default">
              <div className="text-center">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{stats.attended}</p>
                <p className="text-xs text-secondary mt-1">Asistieron</p>
              </div>
            </Card>

            <Card variant="default">
              <div className="text-center">
                <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.noShow}</p>
                <p className="text-xs text-secondary mt-1">No Asistieron</p>
              </div>
            </Card>

            <Card variant="default">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
                <p className="text-xs text-secondary mt-1">Tasa Asistencia</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
              {(startDate || endDate || statusFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setStatusFilter('');
                    setPage(1);
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border-default))]">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Desde</label>
                  <DatePicker
                    value={startDate ? new Date(startDate) : undefined}
                    onChange={(date) => {
                      setStartDate(date?.toISOString().split('T')[0] || '');
                      setPage(1);
                    }}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
                  <DatePicker
                    value={endDate ? new Date(endDate) : undefined}
                    onChange={(date) => {
                      setEndDate(date?.toISOString().split('T')[0] || '');
                      setPage(1);
                    }}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: 'Todos los estados' },
                      { value: BookingStatus.CONFIRMED, label: 'Confirmada' },
                      { value: BookingStatus.ATTENDED, label: 'Asistió' },
                      { value: BookingStatus.NO_SHOW, label: 'No Asistió' },
                      { value: BookingStatus.CANCELLED, label: 'Cancelada' },
                    ]}
                    placeholder="Seleccionar estado"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {error && (
            <Card variant="elevated" className="mb-6 bg-[hsl(var(--error)/0.08)] border-[hsl(var(--error)/0.3)]">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[hsl(var(--error))]" />
                <p className="text-sm text-[hsl(var(--error))]">{error}</p>
              </div>
            </Card>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                <p className="text-secondary">Cargando reservas...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Bookings Table */}
              <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-default))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Clase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Fecha/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Bike
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border-default))]">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <CheckCircle2 className="w-12 h-12 text-tertiary" />
                              <p className="text-sm text-secondary">No se encontraron reservas</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="hover:bg-[hsl(var(--surface-1))] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium">
                                  {booking.user.firstName} {booking.user.lastName}
                                </p>
                                <p className="text-xs text-secondary">{booking.user.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium">{booking.class.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getDifficultyBadge(booking.class.difficultyLevel)}
                                  <span className="text-xs text-secondary">
                                    {booking.class.room.name}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDateTime(booking.class.startTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {booking.bikeNumber ? `#${booking.bikeNumber}` : 'Auto'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(booking)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                                {booking.status === BookingStatus.CONFIRMED && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMarkAttended(booking.id)}
                                      disabled={actionInProgress === booking.id}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Asistió
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMarkNoShow(booking.id)}
                                      disabled={actionInProgress === booking.id}
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      No Show
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalles de la Reserva</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Estado</h3>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-semibold mb-3">Usuario</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">
                      {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">{selectedBooking.user.email}</span>
                  </div>
                  {selectedBooking.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-tertiary" />
                      <span className="text-sm">{selectedBooking.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Info */}
              <div>
                <h3 className="font-semibold mb-3">Clase</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{selectedBooking.class.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getDifficultyBadge(selectedBooking.class.difficultyLevel)}
                      <span className="text-xs text-secondary">
                        {selectedBooking.class.duration} minutos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">{formatDateTime(selectedBooking.class.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">
                      Instructor: {selectedBooking.class.instructor.user.firstName}{' '}
                      {selectedBooking.class.instructor.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">
                      {selectedBooking.class.room.name}
                      {selectedBooking.class.room.location && ` - ${selectedBooking.class.room.location}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h3 className="font-semibold mb-3">Información de Reserva</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-secondary">Bicicleta</p>
                    <p className="font-medium">
                      {selectedBooking.bikeNumber ? `#${selectedBooking.bikeNumber}` : 'Asignación automática'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Tipo de Paquete</p>
                    <p className="font-medium">{selectedBooking.ticket.package.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Fecha de Reserva</p>
                    <p className="font-medium">{formatDate(selectedBooking.bookedAt)}</p>
                  </div>
                  {selectedBooking.cancelledAt && (
                    <div>
                      <p className="text-sm text-secondary">Fecha de Cancelación</p>
                      <p className="font-medium">{formatDate(selectedBooking.cancelledAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleMarkAttended(selectedBooking.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar Asistió
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleMarkNoShow(selectedBooking.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Marcar No Show
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
