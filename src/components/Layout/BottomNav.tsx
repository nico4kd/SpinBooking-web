'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Calendar,
  Package,
  CreditCard,
  User,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navigationItems: NavItem[] = [
  { href: '/dashboard', icon: TrendingUp, label: 'Inicio' },
  { href: '/classes', icon: Calendar, label: 'Clases' },
  { href: '/packages', icon: Package, label: 'Paquetes' },
  { href: '/bookings', icon: CreditCard, label: 'Reservas' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

/**
 * BottomNav - Mobile navigation bar
 *
 * Appears on screens < lg (1024px)
 * Provides quick access to main sections
 * Auto-highlights active route
 */
export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--surface-1))] border-t border-[hsl(var(--border-default))] safe-area-bottom"
    >
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                py-2 px-3
                min-w-[64px] min-h-[60px]
                touch-target-min
                transition-colors
                ${
                  active
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-secondary hover:text-primary'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span
                className={`text-xs font-medium ${
                  active ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[hsl(var(--primary))] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
