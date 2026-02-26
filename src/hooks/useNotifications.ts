import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api-client';

export interface Notification {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  createdAt: string;
  readAt: string | null;
  data?: any;
}

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

interface UseNotificationsOptions {
  pollingInterval?: number;
  onNewPackageActivated?: () => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { pollingInterval = 60000, onNewPackageActivated } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevTopIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: { limit: 20 },
      });
      const incoming = response.data.data;

      if (prevTopIdRef.current !== null && incoming.length > 0) {
        const prevIndex = incoming.findIndex((n) => n.id === prevTopIdRef.current);
        const brandNewOnes = prevIndex === -1 ? incoming : incoming.slice(0, prevIndex);
        if (brandNewOnes.some((n) => n.type === 'PACKAGE_ACTIVATED')) {
          onNewPackageActivated?.();
        }
      }

      if (incoming.length > 0) {
        prevTopIdRef.current = incoming[0].id;
      }

      setNotifications(incoming);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [onNewPackageActivated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');

      // Update local state
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: now }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);

      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        const filtered = prev.filter((n) => n.id !== id);

        // If notification was unread, decrement count
        if (notification && !notification.readAt) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }

        return filtered;
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling
  useEffect(() => {
    if (!pollingInterval) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, fetchNotifications]);

  // Optimistically prepend a real-time notification to local state.
  // Called by useNotificationStream via the onNewNotification callback.
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh: fetchNotifications,
    addNotification,
  };
}
