'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api-client';
import { getRoomStatusBadge } from '../../../lib/utils/status-badges';
import { RoomStatus } from '@spinbooking/types';
import { Button, Badge, Card } from '../../../components/ui';
import { AdminLayout, AdminPageHeader, ConsoleMetric, ZoneBar } from '../../../components/admin';
import { SkeletonCard } from '../../../components/ui';
import {
  MapPin,
  Users,
  Calendar,
  Plus,
  Edit,
  Eye,
  Trash2,
  Building2,
  Wrench,
  Ban,
  CheckCircle,
  Activity,
  AlertCircle,
  Zap,
  Home,
  Package,
  UserCog,
  BarChart3,
  LogOut,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from '../../../lib/toast';

interface RoomData {
  id: string;
  name: string;
  location: string | null;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    classes: number;
  };
}

interface RoomsResponse {
  data?: RoomData[];
}

export default function AdminRoomsPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Data state
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 30,
    status: RoomStatus.ACTIVE as string,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      loadRooms();
    }
  }, [loading, isAuthenticated, user, router, statusFilter]);

  const loadRooms = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get<RoomsResponse>('/rooms', { params });

      // Handle both array and object responses
      let roomsData: RoomData[] = [];
      if (Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      }

      // Apply client-side search filter
      if (searchTerm) {
        roomsData = roomsData.filter((room) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            room.name.toLowerCase().includes(searchLower) ||
            (room.location && room.location.toLowerCase().includes(searchLower))
          );
        });
      }

      setRooms(roomsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar salas');
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearch = () => {
    loadRooms();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    loadRooms();
  };

  const handleCreateRoom = async () => {
    if (!formData.name.trim()) {
      toast.warning('Por favor ingresa el nombre de la sala');
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      toast.warning('La capacidad debe estar entre 1 y 100');
      return;
    }

    setActionInProgress('create');
    try {
      await api.post('/rooms', {
        name: formData.name,
        location: formData.location || null,
        capacity: formData.capacity,
        status: formData.status,
      });

      toast.success('Sala creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      await loadRooms();
    } catch (error: any) {
      toast.error(
        'Error al crear sala',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom) return;

    if (!formData.name.trim()) {
      toast.warning('Por favor ingresa el nombre de la sala');
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      toast.warning('La capacidad debe estar entre 1 y 100');
      return;
    }

    setActionInProgress('edit');
    try {
      await api.patch(`/rooms/${selectedRoom.id}`, {
        name: formData.name,
        location: formData.location || null,
        capacity: formData.capacity,
        status: formData.status,
      });

      toast.success('Sala actualizada exitosamente');
      setShowEditModal(false);
      setSelectedRoom(null);
      resetForm();
      await loadRooms();
    } catch (error: any) {
      toast.error(
        'Error al actualizar sala',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sala? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionInProgress(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success('Sala eliminada exitosamente');
      await loadRooms();
    } catch (error: any) {
      toast.error(
        'Error al eliminar sala',
        {
          description: error.response?.data?.message || 'Puede que tenga clases asignadas',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleChangeStatus = async (roomId: string, newStatus: string) => {
    setActionInProgress(roomId);
    try {
      await api.patch(`/rooms/${roomId}`, { status: newStatus });
      toast.success(`Estado cambiado a ${getStatusLabel(newStatus)}`);
      await loadRooms();
    } catch (error: any) {
      toast.error(
        'Error al cambiar estado',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (room: RoomData) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      location: room.location || '',
      capacity: room.capacity,
      status: room.status,
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (room: RoomData) => {
    setSelectedRoom(room);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      capacity: 30,
      status: RoomStatus.ACTIVE as string,
    });
  };

  const getStatusBadge = getRoomStatusBadge;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      [RoomStatus.ACTIVE]: 'Activa',
      [RoomStatus.MAINTENANCE]: 'Mantenimiento',
      [RoomStatus.INACTIVE]: 'Inactiva',
    };
    return labels[status] ?? status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case RoomStatus.ACTIVE:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case RoomStatus.MAINTENANCE:
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case RoomStatus.INACTIVE:
        return <Ban className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading || (isAuthenticated && user?.role !== 'ADMIN')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const activeRooms = rooms.filter((r) => r.status === RoomStatus.ACTIVE).length;

  return (
    <AdminLayout>
        <div className="pl-16 pr-4 pt-4 pb-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 truncate">Gestión de Salas</h1>
                <p className="mt-2 text-gray-600 truncate">
                  Administra las salas del estudio ({activeRooms} activas)
                </p>
              </div>
              <Button onClick={openCreateModal} className="flex items-center space-x-2 flex-shrink-0">
                <Plus className="h-5 w-5" />
                <span>Crear Sala</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 outline-none text-gray-900"
                />
              </div>
              <Button onClick={handleSearch} variant="outline" size="sm">
                Buscar
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Todos</option>
                      <option value="ACTIVE">Activa</option>
                      <option value="MAINTENANCE">Mantenimiento</option>
                      <option value="INACTIVE">Inactiva</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleClearFilters} variant="outline" size="sm">
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Loading State */}
          {loadingData && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando salas...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Rooms Grid */}
          {!loadingData && !error && rooms.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No se encontraron salas</p>
              <p className="text-gray-500 mt-2">
                {searchTerm || statusFilter
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primera sala para comenzar'}
              </p>
            </div>
          )}

          {!loadingData && !error && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                        {getStatusBadge(room.status)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{room.location || 'Sin ubicación especificada'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Capacidad: {room.capacity} bicis</span>
                    </div>
                    {room._count && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{room._count.classes} clases programadas</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => openDetailsModal(room)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => openEditModal(room)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={actionInProgress === room.id}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteRoom(room.id)}
                      variant="outline"
                      size="sm"
                      disabled={actionInProgress === room.id}
                      className="text-red-600 hover:bg-red-50"
                    >
                      {actionInProgress === room.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Status Change Buttons */}
                  {room.status !== RoomStatus.ACTIVE && (
                    <Button
                      onClick={() => handleChangeStatus(room.id, RoomStatus.ACTIVE)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-green-600 hover:bg-green-50"
                      disabled={actionInProgress === room.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activar
                    </Button>
                  )}
                  {room.status === RoomStatus.ACTIVE && (
                    <Button
                      onClick={() => handleChangeStatus(room.id, RoomStatus.MAINTENANCE)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-orange-600 hover:bg-orange-50"
                      disabled={actionInProgress === room.id}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Mantenimiento
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Crear Nueva Sala</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sala *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Sala Principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Piso 2, Zona Norte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (Número de Bicis) *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">Activa</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="INACTIVE">Inactiva</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                onClick={handleCreateRoom}
                disabled={actionInProgress === 'create'}
                className="flex-1"
              >
                {actionInProgress === 'create' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Sala'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                variant="outline"
                disabled={actionInProgress === 'create'}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Editar Sala</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sala *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (Número de Bicis) *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">Activa</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="INACTIVE">Inactiva</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                onClick={handleEditRoom}
                disabled={actionInProgress === 'edit'}
                className="flex-1"
              >
                {actionInProgress === 'edit' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRoom(null);
                  resetForm();
                }}
                variant="outline"
                disabled={actionInProgress === 'edit'}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                  {getStatusBadge(selectedRoom.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Información</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Ubicación</p>
                      <p className="text-sm">
                        {selectedRoom.location || 'No especificada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-900">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Capacidad</p>
                      <p className="text-sm">{selectedRoom.capacity} bicis</p>
                    </div>
                  </div>
                  {selectedRoom._count && (
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium">Clases Programadas</p>
                        <p className="text-sm">{selectedRoom._count.classes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Fechas</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    Creada:{' '}
                    {new Date(selectedRoom.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    Última actualización:{' '}
                    {new Date(selectedRoom.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button onClick={() => openEditModal(selectedRoom)} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRoom(null);
                }}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
