'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import { InstructorStatus } from '../../../lib/api';
import { getInstructorStatusBadge } from '../../../lib/utils/status-badges';
import { Card, Button, Badge } from '../../../components/ui';
import { AdminLayout, AdminPageHeader, ConsoleMetric } from '../../../components/admin';
import {
  UserCog,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  XCircle,
  AlertCircle,
  Eye,
  Star,
  Ban,
} from 'lucide-react';
import { toast } from '../../../lib/toast';

interface InstructorData {
  id: string;
  userId: string;
  bio: string | null;
  photoUrl: string | null;
  specialties: string[];
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
  };
  _count?: {
    classes: number;
  };
}

interface InstructorsResponse {
  data: InstructorData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminInstructorsPage() {
  const { user, isAuthenticated } = useAuth();

  // Data state
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Create/Edit form state
  const [formData, setFormData] = useState({
    userId: '',
    bio: '',
    photoUrl: '',
    specialties: '',
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadInstructors();
    }
  }, [isAuthenticated, user, statusFilter]);

  const loadInstructors = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: any = {};

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await api.get<InstructorsResponse>('/instructors', { params });
      const instructorsData = response.data.data || response.data;

      // Filter by search term if needed (client-side)
      const filteredInstructors = searchTerm
        ? instructorsData.filter((instructor: InstructorData) =>
            `${instructor.user.firstName} ${instructor.user.lastName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            instructor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : instructorsData;

      setInstructors(filteredInstructors);
    } catch (error: any) {
      console.error('Error loading instructors:', error);
      setError(error.response?.data?.message || 'Error al cargar instructores');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearch = () => {
    loadInstructors();
  };

  const handleViewDetails = async (instructorId: string) => {
    try {
      const response = await api.get<InstructorData>(`/instructors/${instructorId}`);
      setSelectedInstructor(response.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.error('Error loading instructor details:', error);
      toast.error(
        'Error al cargar detalles del instructor',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    }
  };

  const handleEdit = (instructor: InstructorData) => {
    setSelectedInstructor(instructor);
    setFormData({
      userId: instructor.userId,
      bio: instructor.bio || '',
      photoUrl: instructor.photoUrl || '',
      specialties: instructor.specialties.join(', '),
    });
    setShowEditModal(true);
  };

  const handleCreateInstructor = async () => {
    if (!formData.userId) {
      toast.warning('Por favor selecciona un usuario');
      return;
    }

    setActionInProgress('create');
    try {
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await api.post('/instructors', {
        userId: formData.userId,
        bio: formData.bio || null,
        photoUrl: formData.photoUrl || null,
        specialties: specialtiesArray,
      });

      toast.success('Instructor creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      await loadInstructors();
    } catch (error: any) {
      console.error('Error creating instructor:', error);
      toast.error(
        'Error al crear instructor',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateInstructor = async () => {
    if (!selectedInstructor) return;

    setActionInProgress('update');
    try {
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await api.patch(`/instructors/${selectedInstructor.id}`, {
        bio: formData.bio || null,
        photoUrl: formData.photoUrl || null,
        specialties: specialtiesArray,
      });

      toast.success('Instructor actualizado exitosamente');
      setShowEditModal(false);
      resetForm();
      await loadInstructors();
    } catch (error: any) {
      console.error('Error updating instructor:', error);
      toast.error(
        'Error al actualizar instructor',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeactivate = async (instructorId: string) => {
    if (!confirm('¿Estás seguro de desactivar este instructor? No podrá dar clases.')) {
      return;
    }

    setActionInProgress(instructorId);
    try {
      await api.delete(`/instructors/${instructorId}`);
      toast.success('Instructor desactivado exitosamente');
      await loadInstructors();
    } catch (error: any) {
      console.error('Error deactivating instructor:', error);
      toast.error(
        'Error al desactivar instructor',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bio: '',
      photoUrl: '',
      specialties: '',
    });
    setSelectedInstructor(null);
  };

  const getStatusBadge = getInstructorStatusBadge;

  return (
    <>
      <AdminLayout>
        <AdminPageHeader
          title="Gestión de Instructores"
          subtitle={`${instructors.length} instructores en total`}
        />

        {/* Header Actions */}
        <div className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-end pl-16 pr-4 sm:px-6 lg:px-8 bg-[hsl(var(--surface-0))]">
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Instructor
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>
              <Button variant="primary" size="sm" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border-default))]">
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>

                <div className="flex items-end md:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('');
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
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
                <p className="text-secondary">Cargando instructores...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Instructors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructors.length === 0 ? (
                  <Card variant="elevated" className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center">
                        <UserCog className="w-8 h-8 text-tertiary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">No hay instructores</h3>
                        <p className="text-sm text-secondary">
                          No se encontraron instructores con los filtros seleccionados
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  instructors.map((instructor) => (
                    <Card
                      key={instructor.id}
                      variant="elevated"
                      className="hover:border-[hsl(var(--border-emphasis))] transition-colors"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-[hsl(var(--primary))]">
                              {instructor.user.firstName[0]}
                              {instructor.user.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {instructor.user.firstName} {instructor.user.lastName}
                            </h3>
                            <p className="text-sm text-secondary truncate">
                              {instructor.user.email}
                            </p>
                            <div className="mt-2">
                              {getStatusBadge(instructor.status)}
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {instructor.bio && (
                          <p className="text-sm text-secondary line-clamp-2">
                            {instructor.bio}
                          </p>
                        )}

                        {/* Specialties */}
                        {instructor.specialties && instructor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {instructor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="default">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        {instructor._count && (
                          <div className="pt-4 border-t border-[hsl(var(--border-default))]">
                            <div className="flex items-center gap-2 text-sm text-secondary">
                              <Calendar className="w-4 h-4" />
                              <span>{instructor._count.classes} clases programadas</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(instructor.id)}
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(instructor)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          {instructor.status === InstructorStatus.ACTIVE && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(instructor.id)}
                              disabled={actionInProgress === instructor.id}
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </AdminLayout>

      {/* Create Instructor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nuevo Instructor</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Usuario <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="ID del usuario (debe tener rol INSTRUCTOR)"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
                <p className="text-xs text-secondary mt-1">
                  El usuario debe existir y tener rol INSTRUCTOR
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Breve biografía del instructor..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de Foto</label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Especialidades</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="HIIT, Endurance, Cycling (separadas por comas)"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateInstructor}
                  disabled={actionInProgress === 'create'}
                  className="flex-1"
                >
                  {actionInProgress === 'create' ? 'Creando...' : 'Crear Instructor'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {showEditModal && selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Editar Instructor</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Breve biografía del instructor..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de Foto</label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Especialidades</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="HIIT, Endurance, Cycling (separadas por comas)"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleUpdateInstructor}
                  disabled={actionInProgress === 'update'}
                  className="flex-1"
                >
                  {actionInProgress === 'update' ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalles del Instructor</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                    {selectedInstructor.user.firstName[0]}
                    {selectedInstructor.user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedInstructor.user.firstName} {selectedInstructor.user.lastName}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedInstructor.status)}
                    <Badge variant="primary">INSTRUCTOR</Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedInstructor.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Biografía</h4>
                  <p className="text-sm text-secondary">{selectedInstructor.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {selectedInstructor.specialties && selectedInstructor.specialties.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstructor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="primary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-2">Contacto</h4>
                <div className="space-y-2">
                  <p className="text-sm">{selectedInstructor.user.email}</p>
                  {selectedInstructor.user.phone && (
                    <p className="text-sm">{selectedInstructor.user.phone}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedInstructor);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Instructor
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
