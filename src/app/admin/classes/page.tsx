'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api-client';
import { ClassStatus } from '../../../lib/api';
import { getClassStatusBadge } from '../../../lib/utils/status-badges';
import { Card, Button, Badge, TimePicker, SkeletonTable, IntensityRing } from '../../../components/ui';
import { getDifficultyBadge } from '../../../lib/utils/difficulty';
import { AdminLayout, AdminPageHeader, ZoneBar } from '../../../components/admin';
import {
  Users,
  Calendar,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Eye,
  Zap,
  Home,
  UserCog,
  MapPin,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { toast } from '../../../lib/toast';

interface ClassData {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  difficultyLevel: string;
  musicTheme: string | null;
  maxCapacity: number;
  currentCapacity: number;
  status: string;
  room: {
    id: string;
    name: string;
    location: string | null;
  };
  instructor: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ClassesResponse {
  data: ClassData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Instructor {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminClassesPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Data state
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Create form state
  const [newClass, setNewClass] = useState({
    roomId: '',
    instructorId: '',
    startTime: '',
    duration: 45,
    title: '',
    description: '',
    difficultyLevel: 'ALL_LEVELS',
    musicTheme: '',
    maxCapacity: 30,
  });

  // Recurring form state
  const [recurringClass, setRecurringClass] = useState({
    roomId: '',
    instructorId: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    startTime: '',
    duration: 45,
    title: '',
    description: '',
    difficultyLevel: 'ALL_LEVELS',
    musicTheme: '',
    maxCapacity: 30,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadClasses();
      loadRoomsAndInstructors();
    }
  }, [isAuthenticated, user, page, startDate, endDate, roomFilter, instructorFilter, statusFilter]);

  const loadClasses = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 20,
      };

      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      if (roomFilter) params.roomId = roomFilter;
      if (instructorFilter) params.instructorId = instructorFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get<ClassesResponse>('/classes', { params });
      setClasses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Error loading classes:', error);
      setError(error.response?.data?.message || 'Error al cargar clases');
    } finally {
      setLoadingData(false);
    }
  };

  const loadRoomsAndInstructors = async () => {
    try {
      const [roomsRes, instructorsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/instructors'),
      ]);
      setRooms(roomsRes.data.data || roomsRes.data);
      setInstructors(instructorsRes.data.data || instructorsRes.data);
    } catch (error: any) {
      console.error('Error loading rooms/instructors:', error);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.roomId || !newClass.instructorId || !newClass.startTime || !newClass.title) {
      toast.warning('Por favor completa todos los campos requeridos');
      return;
    }

    setActionInProgress('create');
    try {
      await api.post('/classes', {
        ...newClass,
        startTime: new Date(newClass.startTime).toISOString(),
      });

      toast.success('Clase creada exitosamente');
      setShowCreateModal(false);
      resetNewClass();
      await loadClasses();
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast.error(
        'Error al crear la clase',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCreateRecurring = async () => {
    if (!recurringClass.roomId || !recurringClass.instructorId || !recurringClass.startDate ||
        !recurringClass.endDate || recurringClass.daysOfWeek.length === 0 || !recurringClass.startTime) {
      toast.warning('Por favor completa todos los campos requeridos');
      return;
    }

    setActionInProgress('recurring');
    try {
      await api.post('/classes/recurring', {
        ...recurringClass,
        startDate: new Date(recurringClass.startDate).toISOString(),
        endDate: new Date(recurringClass.endDate).toISOString(),
      });

      toast.success('Clases recurrentes creadas exitosamente');
      setShowRecurringModal(false);
      resetRecurringClass();
      await loadClasses();
    } catch (error: any) {
      console.error('Error creating recurring classes:', error);
      toast.error(
        'Error al crear clases recurrentes',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelClass = async (classId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta clase? Se notificará a todos los usuarios con reservas.')) {
      return;
    }

    const reason = prompt('Motivo de cancelación (opcional):');

    setActionInProgress(classId);
    try {
      await api.delete(`/classes/${classId}`, {
        data: { reason },
      });

      toast.success(
        'Clase cancelada exitosamente',
        {
          description: 'Se notificó a todos los usuarios con reservas',
        }
      );
      await loadClasses();
    } catch (error: any) {
      console.error('Error cancelling class:', error);
      toast.error(
        'Error al cancelar la clase',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const resetNewClass = () => {
    setNewClass({
      roomId: '',
      instructorId: '',
      startTime: '',
      duration: 45,
      title: '',
      description: '',
      difficultyLevel: 'ALL_LEVELS',
      musicTheme: '',
      maxCapacity: 30,
    });
  };

  const resetRecurringClass = () => {
    setRecurringClass({
      roomId: '',
      instructorId: '',
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      startTime: '',
      duration: 45,
      title: '',
      description: '',
      difficultyLevel: 'ALL_LEVELS',
      musicTheme: '',
      maxCapacity: 30,
    });
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurringClass(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const getStatusBadge = getClassStatusBadge;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayName = (day: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[day];
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout>
        {/* Header */}
        <header className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-between pl-16 pr-4 sm:px-6 lg:px-8 bg-[hsl(var(--surface-0))]">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">Gestión de Clases</h1>
            <p className="text-sm text-secondary truncate">
              {pagination.total} clases en total
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecurringModal(true)}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Recurrentes
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </header>

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
              {(startDate || endDate || roomFilter || instructorFilter || statusFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setRoomFilter('');
                    setInstructorFilter('');
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
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sala</label>
                  <select
                    value={roomFilter}
                    onChange={(e) => {
                      setRoomFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Todas las salas</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructor</label>
                  <select
                    value={instructorFilter}
                    onChange={(e) => {
                      setInstructorFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Todos los instructores</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.user.firstName} {instructor.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Todos los estados</option>
                    <option value="SCHEDULED">Programada</option>
                    <option value="IN_PROGRESS">En Curso</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
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
                <p className="text-secondary">Cargando clases...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Classes Table */}
              <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-default))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Clase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Fecha y Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Sala
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Capacidad
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
                      {classes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="w-12 h-12 text-tertiary" />
                              <p className="text-sm text-secondary">No se encontraron clases</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        classes.map((classData) => (
                          <tr
                            key={classData.id}
                            className="hover:bg-[hsl(var(--surface-1))] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium">{classData.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getDifficultyBadge(classData.difficultyLevel)}
                                  <span className="text-xs text-secondary">
                                    {classData.duration} min
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDateTime(classData.startTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {classData.instructor.user.firstName}{' '}
                              {classData.instructor.user.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {classData.room.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-tertiary" />
                                <span className="text-sm">
                                  {classData.currentCapacity}/{classData.maxCapacity}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(classData.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                                {classData.status === ClassStatus.SCHEDULED && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelClass(classData.id)}
                                    disabled={actionInProgress === classData.id}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancelar
                                  </Button>
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-secondary">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} clases
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-3">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-auto">
          <Card variant="elevated" className="w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nueva Clase</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetNewClass();
                }}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClass.title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                    placeholder="Ej: Power Ride"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dificultad <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <select
                    value={newClass.difficultyLevel}
                    onChange={(e) => setNewClass({ ...newClass, difficultyLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                    <option value="ALL_LEVELS">Todos los niveles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Descripción de la clase..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sala <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <select
                    value={newClass.roomId}
                    onChange={(e) => setNewClass({ ...newClass, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Seleccionar sala</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (Cap: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instructor <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <select
                    value={newClass.instructorId}
                    onChange={(e) => setNewClass({ ...newClass, instructorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Seleccionar instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.user.firstName} {instructor.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha y Hora <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newClass.startTime}
                    onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duración (min)</label>
                  <input
                    type="number"
                    value={newClass.duration}
                    onChange={(e) => setNewClass({ ...newClass, duration: parseInt(e.target.value) })}
                    min="30"
                    max="120"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacidad</label>
                  <input
                    type="number"
                    value={newClass.maxCapacity}
                    onChange={(e) => setNewClass({ ...newClass, maxCapacity: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tema Musical</label>
                <input
                  type="text"
                  value={newClass.musicTheme}
                  onChange={(e) => setNewClass({ ...newClass, musicTheme: e.target.value })}
                  placeholder="Ej: Rock, Pop, EDM..."
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateClass}
                  disabled={actionInProgress === 'create'}
                  className="flex-1"
                >
                  {actionInProgress === 'create' ? 'Creando...' : 'Crear Clase'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewClass();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Recurring Classes Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-auto">
          <Card variant="elevated" className="w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Clases Recurrentes</h2>
              <button
                onClick={() => {
                  setShowRecurringModal(false);
                  resetRecurringClass();
                }}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    type="text"
                    value={recurringClass.title}
                    onChange={(e) => setRecurringClass({ ...recurringClass, title: e.target.value })}
                    placeholder="Ej: Power Ride"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dificultad</label>
                  <select
                    value={recurringClass.difficultyLevel}
                    onChange={(e) => setRecurringClass({ ...recurringClass, difficultyLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                    <option value="ALL_LEVELS">Todos los niveles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={recurringClass.description}
                  onChange={(e) => setRecurringClass({ ...recurringClass, description: e.target.value })}
                  placeholder="Descripción de la clase..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sala <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <select
                    value={recurringClass.roomId}
                    onChange={(e) => setRecurringClass({ ...recurringClass, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Seleccionar sala</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instructor <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <select
                    value={recurringClass.instructorId}
                    onChange={(e) => setRecurringClass({ ...recurringClass, instructorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Seleccionar instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.user.firstName} {instructor.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha Inicio <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    value={recurringClass.startDate}
                    onChange={(e) => setRecurringClass({ ...recurringClass, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha Fin <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    type="date"
                    value={recurringClass.endDate}
                    onChange={(e) => setRecurringClass({ ...recurringClass, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Días de la Semana <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDayOfWeek(day)}
                      className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                        recurringClass.daysOfWeek.includes(day)
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-[hsl(var(--surface-1))] text-secondary hover:bg-[hsl(var(--surface-2))]'
                      }`}
                    >
                      {getDayName(day)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hora <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <TimePicker
                    value={recurringClass.startTime}
                    onChange={(time) => setRecurringClass({ ...recurringClass, startTime: time })}
                    placeholder="Seleccionar hora"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duración (min)</label>
                  <input
                    type="number"
                    value={recurringClass.duration}
                    onChange={(e) => setRecurringClass({ ...recurringClass, duration: parseInt(e.target.value) })}
                    min="30"
                    max="120"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacidad</label>
                  <input
                    type="number"
                    value={recurringClass.maxCapacity}
                    onChange={(e) => setRecurringClass({ ...recurringClass, maxCapacity: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tema Musical</label>
                <input
                  type="text"
                  value={recurringClass.musicTheme}
                  onChange={(e) => setRecurringClass({ ...recurringClass, musicTheme: e.target.value })}
                  placeholder="Ej: Rock, Pop, EDM..."
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateRecurring}
                  disabled={actionInProgress === 'recurring'}
                  className="flex-1"
                >
                  {actionInProgress === 'recurring' ? 'Creando...' : 'Crear Clases Recurrentes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRecurringModal(false);
                    resetRecurringClass();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
