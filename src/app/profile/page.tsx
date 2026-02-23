'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api-client';
import { Card, Button, Badge } from '../../components/ui';
import { AppLayout, PageHeader } from '../../components/Layout';
import { toast } from '../../lib/toast';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  X,
  Save,
  Trash2,
  Package,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

interface UserStats {
  totalBookings: number;
  attendedClasses: number;
  activePackages: number;
  totalCredits: number;
}

interface PackageSummary {
  id: string;
  type: string;
  status: string;
  totalTickets: number;
  remainingTickets: number;
  usedTickets: number;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
}

const PACKAGE_LABELS: Record<string, string> = {
  TRIAL: 'Trial',
  STARTER: 'Starter',
  REGULAR: 'Regular',
  PRO: 'Pro',
  UNLIMITED: 'Ilimitado',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading, updateUser } = useAuth();

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [profileRes, bookingsRes, packagesRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/bookings'),
        api.get('/packages'),
      ]);

      setProfile(profileRes.data);

      const bookings = bookingsRes.data.data || [];
      const allPackages: PackageSummary[] = packagesRes.data || [];

      setPackages(allPackages);

      const activePackages = allPackages.filter((p) => p.status === 'ACTIVE');
      setStats({
        totalBookings: bookings.length,
        attendedClasses: bookings.filter((b: any) => b.status === 'ATTENDED').length,
        activePackages: activePackages.length,
        totalCredits: activePackages.reduce((sum, pkg) => sum + pkg.remainingTickets, 0),
      });

      setEditForm({
        firstName: profileRes.data.firstName,
        lastName: profileRes.data.lastName,
        phone: profileRes.data.phone || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('No se pudo cargar el perfil. Por favor intenta nuevamente.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || null,
      });

      // Update AuthContext so sidebar reflects new name immediately
      updateUser({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      });

      toast.success('Perfil actualizado exitosamente');
      await loadProfileData();
      setIsEditing(false);
    } catch (err: any) {
      toast.error('Error al actualizar el perfil', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.warning('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success('Contraseña cambiada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      toast.error('Error al cambiar la contraseña', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.\n\nTus datos serán marcados como eliminados y no podrás recuperar tu cuenta.',
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Esta es tu última oportunidad. ¿Realmente quieres eliminar tu cuenta?',
    );
    if (!doubleConfirm) return;

    try {
      await api.delete('/users/me');
      toast.success('Cuenta eliminada', { description: 'Serás redirigido al inicio' });
      logout();
    } catch (err: any) {
      toast.error('Error al eliminar la cuenta', {
        description: err.response?.data?.message || 'Por favor intenta nuevamente',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="hot">Admin</Badge>;
      case 'INSTRUCTOR':
        return <Badge variant="primary">Instructor</Badge>;
      default:
        return <Badge variant="default">Miembro</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Activa</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">Suspendida</Badge>;
      case 'DELETED':
        return <Badge variant="default">Eliminada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPackageStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Activo</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'EXPIRED':
        return <Badge variant="default">Vencido</Badge>;
      case 'DEPLETED':
        return <Badge variant="default">Agotado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Loading state — show layout + spinner
  if (loading || loadingData) {
    return (
      <AppLayout>
        <PageHeader title="Mi Perfil" description="Gestiona tu información personal y preferencias" />
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3 text-secondary">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
            <p className="text-sm">Cargando perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !profile || !stats) {
    return (
      <AppLayout>
        <PageHeader title="Mi Perfil" description="Gestiona tu información personal y preferencias" />
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <AlertTriangle className="w-10 h-10 text-[hsl(var(--error))]" />
            <p className="text-secondary">{error || 'No se pudo cargar el perfil.'}</p>
            <Button variant="primary" onClick={loadProfileData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Mi Perfil"
        description="Gestiona tu información personal y preferencias"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <Card variant="elevated">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-[hsl(var(--primary))]">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-secondary text-sm mb-2">{profile.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {getRoleBadge(profile.role)}
                  {getStatusBadge(profile.status)}
                  {profile.emailVerified && (
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Email verificado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default">
            <div className="text-center p-1">
              <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">
                {stats.totalCredits}
              </p>
              <p className="text-xs sm:text-sm text-secondary mt-1">Créditos disponibles</p>
            </div>
          </Card>
          <Card variant="default">
            <div className="text-center p-1">
              <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--success))]">
                {stats.activePackages}
              </p>
              <p className="text-xs sm:text-sm text-secondary mt-1">Paquetes activos</p>
            </div>
          </Card>
          <Card variant="default">
            <div className="text-center p-1">
              <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--accent-hot))]">
                {stats.totalBookings}
              </p>
              <p className="text-xs sm:text-sm text-secondary mt-1">Total reservas</p>
            </div>
          </Card>
          <Card variant="default">
            <div className="text-center p-1">
              <p className="text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">
                {stats.attendedClasses}
              </p>
              <p className="text-xs sm:text-sm text-secondary mt-1">Clases asistidas</p>
            </div>
          </Card>
        </div>

        {/* Personal Information */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      phone: profile.phone || '',
                    });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="w-5 h-5 text-tertiary flex-shrink-0" />
                <div>
                  <p className="text-secondary">Nombre completo</p>
                  <p className="font-medium">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-tertiary flex-shrink-0" />
                <div>
                  <p className="text-secondary">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-tertiary flex-shrink-0" />
                <div>
                  <p className="text-secondary">Teléfono</p>
                  <p className="font-medium">{profile.phone || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-tertiary flex-shrink-0" />
                <div>
                  <p className="text-secondary">Miembro desde</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellido</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-2))] text-tertiary cursor-not-allowed"
                />
                <p className="text-xs text-tertiary mt-1">El email no se puede cambiar</p>
              </div>
            </div>
          )}
        </Card>

        {/* Package History */}
        <Card variant="default">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h3 className="text-lg font-semibold">Historial de Paquetes</h3>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tenés paquetes todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-[var(--radius-md)] bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {PACKAGE_LABELS[pkg.type] ?? pkg.type}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-secondary">
                          {pkg.remainingTickets}/{pkg.totalTickets} créditos
                        </span>
                        {pkg.expiresAt && (
                          <span className="text-xs text-tertiary flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(pkg.expiresAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {getPackageStatusBadge(pkg.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Password Change */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Seguridad</h3>
              <p className="text-sm text-secondary">
                Cambia tu contraseña regularmente para mantener tu cuenta segura
              </p>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Cambiar contraseña
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <div className="space-y-4 p-4 bg-[hsl(var(--surface-1))] rounded-[var(--radius-md)]">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                />
                <p className="text-xs text-tertiary mt-1">Mínimo 8 caracteres</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 min-h-[44px] rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar contraseña'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card variant="default" className="border-[hsl(var(--error)/0.3)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--error)/0.15)] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--error))]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[hsl(var(--error))] mb-1">Zona de peligro</h3>
              <p className="text-sm text-secondary mb-4">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor asegúrate de
                estar seguro.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-[hsl(var(--error))] border-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.1)]"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar mi cuenta
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
