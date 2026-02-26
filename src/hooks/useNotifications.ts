import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_NOTIFICATION_EVENT, WsNotificationPayload } from '@spinbooking/types';
import { notificationsApi } from '../lib/api';
import type { Notification } from '../lib/api';

export type { Notification };

interface UseNotificationsOptions {
  pollingInterval?: number;
  onNewPackageActivated?: () => void;
  /** Set false during SSR or when unauthenticated to skip WebSocket connection */
  wsEnabled?: boolean;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  /** Whether the WebSocket connection is active */
  connected: boolean;
  /** False after max consecutive WebSocket failures (polling-only mode) */
  wsAvailable: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const { pollingInterval = 60000, onNewPackageActivated, wsEnabled = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevTopIdRef = useRef<string | null>(null);

  // WebSocket state
  const [connected, setConnected] = useState(false);
  const [wsAvailable, setWsAvailable] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const failCountRef = useRef(0);

  // Keep callback ref fresh to avoid stale closures in Socket.IO handlers
  const onNewPackageActivatedRef = useRef(onNewPackageActivated);
  useEffect(() => {
    onNewPackageActivatedRef.current = onNewPackageActivated;
  }, [onNewPackageActivated]);

  // ── REST fetching ──

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.list(20);
      const incoming = response.data;

      // Detect new PACKAGE_ACTIVATED notifications since last poll
      if (prevTopIdRef.current !== null && incoming.length > 0) {
        const prevIndex = incoming.findIndex((n) => n.id === prevTopIdRef.current);
        const brandNewOnes = prevIndex === -1 ? incoming : incoming.slice(0, prevIndex);
        if (brandNewOnes.some((n) => n.type === 'PACKAGE_ACTIVATED')) {
          onNewPackageActivatedRef.current?.();
        }
      }

      if (incoming.length > 0) {
        prevTopIdRef.current = incoming[0].id;
      }

      setNotifications(incoming);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
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
      await notificationsApi.markAllAsRead();
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
      await notificationsApi.dismiss(id);
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        const filtered = prev.filter((n) => n.id !== id);
        if (notification && !notification.readAt) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return filtered;
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }, []);

  // ── Initial fetch + polling ──

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!pollingInterval) return;
    const interval = setInterval(fetchNotifications, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, fetchNotifications]);

  // ── WebSocket (Socket.IO) ──

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wsEnabled) return;
    if (!wsAvailable) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const socket = io(`${apiUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      failCountRef.current = 0;
      setConnected(true);
      setWsAvailable(true);
    });

    socket.on(WS_NOTIFICATION_EVENT, (data: WsNotificationPayload) => {
      // Deduplication
      if (seenIds.current.has(data.id)) return;
      seenIds.current.add(data.id);

      // Optimistically prepend to local state
      setNotifications((prev) => [data as unknown as Notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (data.type === 'PACKAGE_ACTIVATED') {
        onNewPackageActivatedRef.current?.();

        const newCredits = data.data?.newCredits;
        if (typeof newCredits === 'number') {
          window.dispatchEvent(
            new CustomEvent('spinbooking:credits-updated', { detail: { delta: newCredits } }),
          );
        }
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      failCountRef.current += 1;
      if (failCountRef.current > 3) {
        setWsAvailable(false);
        socket.disconnect();
      }
    });

    // Refresh token on reconnection attempt
    socket.io.on('reconnect_attempt', () => {
      const freshToken = localStorage.getItem('accessToken');
      if (freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEnabled, wsAvailable]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh: fetchNotifications,
    connected,
    wsAvailable,
  };
}
