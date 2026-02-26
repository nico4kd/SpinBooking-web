'use client';

import React, { useState } from 'react';
import { Bell, X, Check, Clock, Package, AlertTriangle, Calendar, PackageCheck, ShoppingCart } from 'lucide-react';
import { Button, Badge } from '../ui';
import * as Popover from '@radix-ui/react-popover';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'class_reminder' | 'waitlist' | 'credits_expiring' | 'new_class' | 'booking_confirmed' | 'class_cancelled' | 'PACKAGE_ACTIVATED' | 'PACKAGE_PURCHASED';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  className?: string;
}

/**
 * NotificationCenter - In-app notification dropdown
 *
 * Bell icon with badge count, dropdown with notifications
 * Supports actions and mark as read
 *
 * @example
 * <NotificationCenter
 *   notifications={notifications}
 *   onMarkAsRead={handleMarkAsRead}
 *   onMarkAllAsRead={handleMarkAllAsRead}
 *   onDismiss={handleDismiss}
 * />
 */
export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'class_reminder':
        return Clock;
      case 'waitlist':
        return AlertTriangle;
      case 'credits_expiring':
        return Package;
      case 'new_class':
        return Calendar;
      case 'booking_confirmed':
        return Check;
      case 'class_cancelled':
        return X;
      case 'PACKAGE_ACTIVATED':
        return PackageCheck;
      case 'PACKAGE_PURCHASED':
        return ShoppingCart;
      default:
        return Bell;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'class_reminder':
        return 'primary';
      case 'waitlist':
        return 'warning';
      case 'credits_expiring':
        return 'warning';
      case 'new_class':
        return 'success';
      case 'booking_confirmed':
        return 'success';
      case 'class_cancelled':
        return 'destructive';
      case 'PACKAGE_ACTIVATED':
        return 'success';
      case 'PACKAGE_PURCHASED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={`
            relative
            w-10 h-10 rounded-lg
            flex items-center justify-center
            hover:bg-[hsl(var(--surface-1))]
            transition-colors
            ${className || ''}
          `}
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--destructive))] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="
            w-[90vw] max-w-md
            bg-[hsl(var(--surface-1))]
            border border-[hsl(var(--border-default))]
            rounded-[var(--radius-lg)]
            shadow-lg
            z-50
            max-h-[80vh]
            flex flex-col
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
          "
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border-default))]">
            <h3 className="text-title">Notificaciones</h3>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-12 h-12 text-tertiary mb-3 opacity-50" />
                <p className="text-sm text-secondary">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[hsl(var(--border-default))]">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    icon={getIcon(notification.type)}
                    color={getColor(notification.type)}
                    onMarkAsRead={onMarkAsRead}
                    onDismiss={onDismiss}
                  />
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * NotificationItem - Individual notification
 */
function NotificationItem({
  notification,
  icon: Icon,
  color,
  onMarkAsRead,
  onDismiss,
}: {
  notification: Notification;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const colorMap = {
    primary: 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]',
    success: 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]',
    destructive: 'bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]',
    default: 'bg-[hsl(var(--surface-2))] text-secondary',
  };

  return (
    <div
      className={`
        p-4 hover:bg-[hsl(var(--surface-2))] transition-colors
        ${!notification.read ? 'bg-[hsl(var(--primary)/0.03)]' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${colorMap[color as keyof typeof colorMap] || colorMap.default}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="text-sm text-secondary mb-2">{notification.message}</p>

          <div className="flex items-center justify-between gap-2">
            {/* Time */}
            <span className="text-xs text-tertiary">
              {formatDistanceToNow(new Date(notification.createdAt), {
                locale: es,
                addSuffix: true,
              })}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {notification.actionLabel && notification.onAction && (
                <button
                  onClick={notification.onAction}
                  className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  {notification.actionLabel}
                </button>
              )}

              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-secondary hover:text-primary"
                  title="Marcar como leída"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onDismiss(notification.id)}
                className="text-xs text-secondary hover:text-primary"
                title="Descartar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sample notifications for testing
 */
export const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'class_reminder',
    title: 'Clase en 2 horas',
    message: 'Tu clase "Power Ride" con María comienza a las 18:00',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    actionLabel: 'Ver clase',
    onAction: () => console.log('Navigate to class'),
  },
  {
    id: '2',
    type: 'credits_expiring',
    title: 'Créditos por vencer',
    message: 'Tienes 3 créditos que expiran en 7 días',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    actionLabel: 'Ver paquetes',
    onAction: () => console.log('Navigate to packages'),
  },
  {
    id: '3',
    type: 'booking_confirmed',
    title: 'Reserva confirmada',
    message: 'Tu reserva para "Intervals" el Lunes 18:00 está confirmada',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: '4',
    type: 'new_class',
    title: 'Nueva clase disponible',
    message: 'Se agregó una nueva clase de "Hip Hop Ride" para el Sábado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actionLabel: 'Ver clase',
    onAction: () => console.log('Navigate to new class'),
  },
];
