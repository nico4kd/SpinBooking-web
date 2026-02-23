import { useState, useEffect, useCallback } from 'react';
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

export function useNotifications(pollingInterval = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: { limit: 20 },
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh: fetchNotifications,
  };
}
