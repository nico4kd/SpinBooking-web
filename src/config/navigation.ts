import {
  TrendingUp,
  Calendar,
  Package,
  CheckCircle2,
  User,
  Users,
  Clock,
  BarChart3,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
  roles?: string[]; // If specified, only show for these roles
  comingSoon?: boolean;
}

export const memberNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    icon: TrendingUp,
    label: 'Dashboard',
  },
  {
    href: '/classes',
    icon: Calendar,
    label: 'Clases',
  },
  {
    href: '/progress',
    icon: BarChart3,
    label: 'Mi Progreso',
  },
  {
    href: '/packages',
    icon: Package,
    label: 'Mis Paquetes',
  },
  {
    href: '/bookings',
    icon: CheckCircle2,
    label: 'Mis Reservas',
  },
  {
    href: '/profile',
    icon: User,
    label: 'Mi Perfil',
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    href: '/admin/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
  },
  {
    href: '/admin/classes',
    icon: Calendar,
    label: 'Clases',
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'Usuarios',
  },
  {
    href: '/admin/instructors',
    icon: User,
    label: 'Instructores',
  },
  {
    href: '/admin/rooms',
    icon: Settings,
    label: 'Salas',
  },
  {
    href: '/admin/bookings',
    icon: CheckCircle2,
    label: 'Reservas',
  },
  {
    href: '/admin/payments',
    icon: CreditCard,
    label: 'Pagos',
  },
  {
    href: '/admin/reports',
    icon: BarChart3,
    label: 'Reportes',
  },
];

export const instructorNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    icon: TrendingUp,
    label: 'Dashboard',
  },
  {
    href: '/instructor/schedule',
    icon: Calendar,
    label: 'Mi Horario',
    comingSoon: true,
  },
  {
    href: '/instructor/classes',
    icon: Clock,
    label: 'Mis Clases',
    comingSoon: true,
  },
  {
    href: '/profile',
    icon: User,
    label: 'Mi Perfil',
  },
];

/**
 * Get navigation items based on user role
 */
export function getNavigationForRole(role?: string): NavigationItem[] {
  switch (role) {
    case 'ADMIN':
      return adminNavigation;
    case 'INSTRUCTOR':
      return instructorNavigation;
    case 'MEMBER':
    default:
      return memberNavigation;
  }
}
