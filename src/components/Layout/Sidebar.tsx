'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { Button, Badge } from '../ui';
import { getNavigationForRole } from '../../config/navigation';

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navigationItems = getNavigationForRole(user.role);

  const isActive = (href: string) => {
    // Exact match or starts with the href (for nested routes)
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'hot' as const;
      case 'INSTRUCTOR':
        return 'primary' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] hover:bg-[hsl(var(--surface-2))] transition-colors"
        aria-label="Open menu"
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
          w-64 border-r border-[hsl(var(--border-default))] flex flex-col
          bg-[hsl(var(--background))]
          lg:static lg:translate-x-0
          fixed inset-y-0 right-0 z-50 lg:right-auto lg:left-0
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--border-default))]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            <Zap className="w-6 h-6 text-[hsl(var(--primary))]" />
            <span className="text-lg font-bold">SpinBooking</span>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--surface-1))] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const disabled = item.comingSoon;

          return (
            <Link
              key={item.href}
              href={disabled ? '#' : item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors
                min-h-[44px]
                ${
                  active
                    ? 'bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-emphasis))] text-primary font-medium'
                    : 'hover:bg-[hsl(var(--surface-1))] text-secondary'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={(e) => {
                if (disabled) {
                  e.preventDefault();
                } else {
                  setMobileOpen(false);
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {disabled && (
                <span className="text-xs text-tertiary">Pronto</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[hsl(var(--border-default))]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[hsl(var(--primary))]">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>
        <Button onClick={logout} variant="outline" size="sm" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
    </>
  );
}
