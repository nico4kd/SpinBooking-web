'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { Badge, Button } from '../ui';
import {
  Zap,
  Users,
  Calendar,
  Package,
  Home,
  UserCog,
  MapPin,
  BarChart3,
  User,
  LogOut,
  CreditCard,
  CheckCircle2,
  Activity,
  Menu,
  X,
  Settings2,
  Bike,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  zone: 'live' | 'schedule' | 'studio' | 'analytics';
}

// Organized by operational zones (like bike console sections)
const navItems: NavItem[] = [
  // LIVE - Time-critical operations
  { href: '/admin/dashboard', label: 'Control', icon: Activity, zone: 'live' },
  { href: '/admin/bookings', label: 'Reservas', icon: CheckCircle2, zone: 'live' },

  // SCHEDULE - Class planning
  { href: '/admin/classes', label: 'Clases', icon: Calendar, zone: 'schedule' },
  { href: '/admin/users', label: 'Miembros', icon: Users, zone: 'schedule' },

  // STUDIO - Physical resources
  { href: '/admin/instructors', label: 'Instructores', icon: UserCog, zone: 'studio' },
  { href: '/admin/rooms', label: 'Salas', icon: MapPin, zone: 'studio' },
  { href: '/admin/rooms/bikes', label: 'Bicicletas', icon: Bike, zone: 'studio' },
  { href: '/admin/payments', label: 'Pagos', icon: CreditCard, zone: 'studio' },
  { href: '/admin/settings', label: 'Configuración', icon: Settings2, zone: 'studio' },

  // ANALYTICS - Performance data
  { href: '/admin/reports', label: 'Analytics', icon: BarChart3, zone: 'analytics' },
];

const zoneConfig = {
  live: { label: 'LIVE', color: 'hsl(var(--accent-hot))' },
  schedule: { label: 'SCHEDULE', color: 'hsl(var(--primary))' },
  studio: { label: 'STUDIO', color: '38 92% 50%' }, // amber
  analytics: { label: 'ANALYTICS', color: '142 71% 45%' }, // success green
};

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  // Group items by zone
  const groupedItems = {
    live: navItems.filter(item => item.zone === 'live'),
    schedule: navItems.filter(item => item.zone === 'schedule'),
    studio: navItems.filter(item => item.zone === 'studio'),
    analytics: navItems.filter(item => item.zone === 'analytics'),
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] hover:bg-[hsl(var(--surface-2))] transition-colors"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 border-r border-[hsl(var(--border-default))] flex flex-col bg-[hsl(var(--surface-0))]
          lg:static lg:translate-x-0
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Console Header - Studio branding */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-[hsl(var(--border-default))] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px)',
          }}
        />
        <Zap className="w-6 h-6 text-[hsl(var(--primary))]" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.5))' }} />
        <span className="text-lg font-bold tracking-tight">SpinBooking</span>
        <Badge variant="hot" className="ml-auto text-[9px] uppercase tracking-wider">
          Admin
        </Badge>

        {/* Close button (mobile only) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--surface-1))] transition-colors ml-2"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Console Navigation - Zone-based */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* LIVE Zone - High priority */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: zoneConfig.live.color, boxShadow: `0 0 8px hsl(${zoneConfig.live.color}/0.6)` }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.15em] font-bold"
              style={{ color: `hsl(${zoneConfig.live.color})` }}
            >
              {zoneConfig.live.label}
            </span>
          </div>
          <div className="space-y-1">
            {groupedItems.live.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2
                    rounded-[var(--radius-md)] text-sm
                    min-h-[44px]
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] text-primary font-semibold'
                        : 'hover:bg-[hsl(var(--surface-1))] text-secondary font-medium'
                    }
                  `}
                  style={active ? {
                    boxShadow: `0 0 16px hsl(${zoneConfig.live.color}/0.15)`,
                  } : {}}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SCHEDULE Zone */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-2">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: zoneConfig.schedule.color }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.15em] font-bold text-tertiary"
            >
              {zoneConfig.schedule.label}
            </span>
          </div>
          <div className="space-y-1">
            {groupedItems.schedule.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2
                    rounded-[var(--radius-md)] text-sm
                    min-h-[44px]
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] text-primary font-semibold'
                        : 'hover:bg-[hsl(var(--surface-1))] text-secondary font-medium'
                    }
                  `}
                  style={active ? {
                    boxShadow: '0 0 16px hsl(var(--primary)/0.15)',
                  } : {}}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* STUDIO Zone */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-2">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: `hsl(${zoneConfig.studio.color})` }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.15em] font-bold text-tertiary"
            >
              {zoneConfig.studio.label}
            </span>
          </div>
          <div className="space-y-1">
            {groupedItems.studio.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2
                    rounded-[var(--radius-md)] text-sm
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] text-primary font-semibold'
                        : 'hover:bg-[hsl(var(--surface-1))] text-secondary font-medium'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ANALYTICS Zone */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-2">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: `hsl(${zoneConfig.analytics.color})` }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.15em] font-bold text-tertiary"
            >
              {zoneConfig.analytics.label}
            </span>
          </div>
          <div className="space-y-1">
            {groupedItems.analytics.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2
                    rounded-[var(--radius-md)] text-sm
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] text-primary font-semibold'
                        : 'hover:bg-[hsl(var(--surface-1))] text-secondary font-medium'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[hsl(var(--border-subtle))]" />

        {/* User view link */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] hover:bg-[hsl(var(--surface-1))] text-secondary text-sm transition-colors font-medium min-h-[44px]"
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="tracking-tight">Vista Miembro</span>
        </Link>
      </nav>

      {/* User Profile Footer - Console style */}
      <div className="p-4 border-t border-[hsl(var(--border-default))] relative overflow-hidden">
        {/* Subtle scan line */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px)',
          }}
        />

        <div className="flex items-start gap-3 mb-3 relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
            style={{
              backgroundColor: 'hsl(var(--accent-hot)/0.15)',
              boxShadow: '0 0 16px hsl(var(--accent-hot)/0.3)',
            }}
          >
            <span className="text-sm font-bold text-[hsl(var(--accent-hot))]">
              {user?.firstName?.[0] || 'A'}
              {user?.lastName?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate tracking-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <Badge variant="hot" className="mt-1 text-[9px] uppercase tracking-wider">
              ADMIN
            </Badge>
          </div>
        </div>

        <Button onClick={logout} variant="outline" size="sm" className="w-full font-semibold">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
    </>
  );
}
