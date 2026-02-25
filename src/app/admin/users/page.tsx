'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import api from '../../../lib/api-client';
import { Card, Button, Badge, SkeletonTable } from '../../../components/ui';
import { AdminLayout, AdminPageHeader } from '../../../components/admin';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { toast } from '../../../lib/toast';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nroDocumento: string;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  data: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();

  // Data state
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    nroDocumento: '',
    email: '',
    password: '',
    phone: '',
    role: 'MEMBER',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [isAuthenticated, user, page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 20,
      };

      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get<UsersResponse>('/admin/users', { params });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de suspender este usuario? No podrá acceder al sistema.')) {
      return;
    }

    setActionInProgress(userId);
    try {
      await api.post(`/admin/users/${userId}/suspend`);
      toast.success('Usuario suspendido exitosamente');
      await loadUsers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error(
        'Error al suspender usuario',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleActivateUser = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await api.post(`/admin/users/${userId}/activate`);
      toast.success('Usuario activado exitosamente');
      await loadUsers();
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast.error(
        'Error al activar usuario',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await api.get<UserData>(`/admin/users/${userId}`);
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (error: any) {
      console.error('Error loading user details:', error);
      toast.error(
        'Error al cargar detalles del usuario',
        {
          description: error.response?.data?.message || 'Por favor intenta nuevamente',
        }
      );
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      await api.post('/admin/users', createForm);
      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      setCreateForm({ firstName: '', lastName: '', nroDocumento: '', email: '', password: '', phone: '', role: 'MEMBER' });
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setCreateError(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setCreateLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="hot">Admin</Badge>;
      case 'INSTRUCTOR':
        return <Badge variant="primary">Instructor</Badge>;
      case 'MEMBER':
        return <Badge variant="default">Miembro</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Activo</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">Suspendido</Badge>;
      case 'DELETED':
        return <Badge variant="default">Eliminado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
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
      <AdminPageHeader
        title="Gestión de Usuarios"
        subtitle={`${pagination.total} usuarios en total`}
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        }
      />

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
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
                  >
                    <option value="">Todos los roles</option>
                    <option value="MEMBER">Miembro</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
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
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="DELETED">Eliminado</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRoleFilter('');
                      setStatusFilter('');
                      setSearchTerm('');
                      setPage(1);
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
          <SkeletonTable rows={10} />
        ) : (
            <>
              {/* Users Table */}
              <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-default))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          DNI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Registro
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border-default))]">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-12 h-12 text-tertiary" />
                              <p className="text-sm text-secondary">No se encontraron usuarios</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((userData) => (
                          <tr
                            key={userData.id}
                            className="hover:bg-[hsl(var(--surface-1))] transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold text-[hsl(var(--primary))]">
                                    {userData.firstName[0]}
                                    {userData.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {userData.firstName} {userData.lastName}
                                  </p>
                                  {userData.phone && (
                                    <p className="text-xs text-secondary flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {userData.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {userData.nroDocumento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-tertiary" />
                                <span className="text-sm">{userData.email}</span>
                                {userData.emailVerified && (
                                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(userData.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(userData.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {formatDate(userData.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewUser(userData.id)}
                                >
                                  <User className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                                {userData.status === 'ACTIVE' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuspendUser(userData.id)}
                                    disabled={actionInProgress === userData.id}
                                  >
                                    <Ban className="w-3 h-3 mr-1" />
                                    Suspender
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActivateUser(userData.id)}
                                    disabled={actionInProgress === userData.id}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Activar
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
                    {pagination.total} usuarios
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card variant="elevated" className="w-full max-w-lg m-4 max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nuevo Usuario</h2>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[hsl(var(--error)/0.08)] border border-[hsl(var(--error)/0.3)]">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--error))] flex-shrink-0" />
                  <p className="text-sm text-[hsl(var(--error))]">{createError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="create-firstName">
                    Nombre <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    id="create-firstName"
                    type="text"
                    name="firstName"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="create-lastName">
                    Apellido <span className="text-[hsl(var(--error))]">*</span>
                  </label>
                  <input
                    id="create-lastName"
                    type="text"
                    name="lastName"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="create-nroDocumento">
                  Nro. de Documento (DNI) <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <input
                  id="create-nroDocumento"
                  type="text"
                  name="nroDocumento"
                  required
                  placeholder="Ej: 35678901"
                  value={createForm.nroDocumento}
                  onChange={(e) => setCreateForm({ ...createForm, nroDocumento: e.target.value })}
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                />
                <p className="text-xs text-secondary mt-1">7 u 8 dígitos, solo números</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="create-email">
                  Email <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <input
                  id="create-email"
                  type="email"
                  name="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="create-phone">
                  Teléfono
                </label>
                <input
                  id="create-phone"
                  type="text"
                  name="phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="create-password">
                  Contraseña <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <input
                  id="create-password"
                  type="password"
                  name="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="create-role">
                  Rol <span className="text-[hsl(var(--error))]">*</span>
                </label>
                <select
                  id="create-role"
                  name="role"
                  required
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button type="submit" variant="primary" size="sm" className="flex-1" disabled={createLoading}>
                  {createLoading ? 'Creando...' : 'Crear Usuario'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card variant="elevated" className="w-full max-w-2xl m-4 max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border-default))] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalles del Usuario</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-1))] flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">{selectedUser.email}</span>
                    {selectedUser.emailVerified && (
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Teléfono
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-tertiary" />
                    <span className="text-sm">{selectedUser.phone || 'No especificado'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Nro. de Documento (DNI)
                  </label>
                  <p className="text-sm font-medium">{selectedUser.nroDocumento}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Fecha de Registro
                  </label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Última Actualización
                  </label>
                  <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[hsl(var(--border-default))] flex gap-3">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Usuario
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowUserModal(false)}>
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
