'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useNotifications } from '../../hooks/useNotifications';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showDate?: boolean;
  showNotifications?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  showDate = false,
  showNotifications = true,
}: PageHeaderProps) {
  const { notifications, markAsRead, markAllAsRead, dismiss } = useNotifications();

  const formatDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Transform notifications to match NotificationCenter format
  const transformedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type as any,
    title: n.subject || 'Notificación',
    message: n.message,
    createdAt: n.createdAt,
    read: !!n.readAt,
    // Map notification types to actions if needed
    actionLabel: n.data?.actionLabel,
    onAction: n.data?.onAction,
  }));

  return (
    <header className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-between px-4 lg:px-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold truncate">{title}</h1>
        {description && <p className="text-sm text-secondary truncate">{description}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {actions}
        {showNotifications && (
          <NotificationCenter
            notifications={transformedNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
          />
        )}
        {showDate && (
          <div className="hidden md:flex items-center gap-2">
            <Clock className="w-4 h-4 text-tertiary" />
            <span className="text-sm text-secondary capitalize">
              {formatDate()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
