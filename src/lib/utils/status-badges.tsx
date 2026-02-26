import { Badge } from '../../components/ui';
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  BookingStatus,
  ClassStatus,
  InstructorStatus,
  PackageStatus,
  RoomStatus,
  UserStatus,
  PaymentStatus,
} from '@spinbooking/types';

type BadgeVariant = 'success' | 'primary' | 'warning' | 'default' | 'hot' | 'destructive';

// ── Booking Status ──────────────────────────────────────────────────────

const BOOKING_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon?: React.ReactNode }> = {
  [BookingStatus.CONFIRMED]: { label: 'Confirmada', variant: 'success', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
  [BookingStatus.CANCELLED]: { label: 'Cancelada', variant: 'default', icon: <XCircle className="w-3 h-3 mr-1" /> },
  [BookingStatus.ATTENDED]: { label: 'Asistida', variant: 'primary', icon: <UserCheck className="w-3 h-3 mr-1" /> },
  [BookingStatus.NO_SHOW]: { label: 'No asistió', variant: 'warning', icon: <UserX className="w-3 h-3 mr-1" /> },
};

export function getBookingStatusBadge(status: string) {
  const config = BOOKING_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return (
    <Badge variant={config.variant}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_CONFIG[status]?.label ?? status;
}

// ── Package Status ──────────────────────────────────────────────────────

const PACKAGE_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [PackageStatus.ACTIVE]: { label: 'Activo', variant: 'success' },
  [PackageStatus.PENDING]: { label: 'Pendiente', variant: 'warning' },
  [PackageStatus.EXPIRED]: { label: 'Expirado', variant: 'default' },
  [PackageStatus.DEPLETED]: { label: 'Agotado', variant: 'default' },
  [PackageStatus.REFUNDED]: { label: 'Reembolsado', variant: 'default' },
  [PackageStatus.CANCELLED]: { label: 'Cancelado', variant: 'default' },
};

export function getPackageStatusBadge(status: string) {
  const config = PACKAGE_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function getPackageStatusLabel(status: string): string {
  return PACKAGE_STATUS_CONFIG[status]?.label ?? status;
}

// ── Class Status ────────────────────────────────────────────────────────

const CLASS_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [ClassStatus.SCHEDULED]: { label: 'Programada', variant: 'success' },
  [ClassStatus.IN_PROGRESS]: { label: 'En Curso', variant: 'primary' },
  [ClassStatus.COMPLETED]: { label: 'Completada', variant: 'default' },
  [ClassStatus.CANCELLED]: { label: 'Cancelada', variant: 'warning' },
};

export function getClassStatusBadge(status: string) {
  const config = CLASS_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function getClassStatusLabel(status: string): string {
  return CLASS_STATUS_CONFIG[status]?.label ?? status;
}

// ── User Status ─────────────────────────────────────────────────────────

const USER_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [UserStatus.ACTIVE]: { label: 'Activa', variant: 'success' },
  [UserStatus.SUSPENDED]: { label: 'Suspendida', variant: 'warning' },
  [UserStatus.DELETED]: { label: 'Eliminada', variant: 'default' },
};

export function getUserStatusBadge(status: string) {
  const config = USER_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ── Payment Status ──────────────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [PaymentStatus.PENDING]: { label: 'Pendiente', variant: 'warning' },
  [PaymentStatus.PROCESSING]: { label: 'Procesando', variant: 'primary' },
  [PaymentStatus.APPROVED]: { label: 'Aprobado', variant: 'success' },
  [PaymentStatus.REJECTED]: { label: 'Rechazado', variant: 'destructive' },
  [PaymentStatus.REFUNDED]: { label: 'Reembolsado', variant: 'default' },
};

export function getPaymentStatusBadge(status: string) {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function getPaymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_CONFIG[status]?.label ?? status;
}

// ── Instructor Status ───────────────────────────────────────────────────

const INSTRUCTOR_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [InstructorStatus.ACTIVE]: { label: 'Activo', variant: 'success' },
  [InstructorStatus.INACTIVE]: { label: 'Inactivo', variant: 'default' },
};

export function getInstructorStatusBadge(status: string) {
  const config = INSTRUCTOR_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ── Room Status ─────────────────────────────────────────────────────────

const ROOM_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  [RoomStatus.ACTIVE]: { label: 'Activa', variant: 'success' },
  [RoomStatus.MAINTENANCE]: { label: 'Mantenimiento', variant: 'warning' },
  [RoomStatus.INACTIVE]: { label: 'Inactiva', variant: 'default' },
};

export function getRoomStatusBadge(status: string) {
  const config = ROOM_STATUS_CONFIG[status];
  if (!config) return <Badge variant="default">{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
