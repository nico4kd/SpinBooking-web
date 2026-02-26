import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_NOTIFICATION_EVENT, WsNotificationPayload } from '@spinbooking/types';
import { Notification } from './useNotifications';

interface UseNotificationStreamOptions {
  onNewNotification: (notification: Notification) => void;
  onNewPackageActivated?: () => void;
  enabled?: boolean; // default true — set false during SSR or when unauthenticated
}

interface UseNotificationStreamResult {
  connected: boolean;    // true when Socket.IO connection is active
  wsAvailable: boolean;  // false after max consecutive failures (polling-only mode)
}

export function useNotificationStream(
  options: UseNotificationStreamOptions,
): UseNotificationStreamResult {
  const { onNewNotification, onNewPackageActivated, enabled = true } = options;

  const [connected, setConnected] = useState(false);
  const [wsAvailable, setWsAvailable] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const failCountRef = useRef(0);

  // Keep latest callbacks in a ref to avoid stale closures in Socket.IO handlers
  const onNewNotificationRef = useRef(onNewNotification);
  const onNewPackageActivatedRef = useRef(onNewPackageActivated);
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);
  useEffect(() => {
    onNewPackageActivatedRef.current = onNewPackageActivated;
  }, [onNewPackageActivated]);

  useEffect(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return;
    // Guard against disabled / unauthenticated
    if (!enabled) return;
    // Guard: don't reconnect if we've exhausted retries
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
      // Deduplication: drop if we've already processed this notification ID
      if (seenIds.current.has(data.id)) return;
      seenIds.current.add(data.id);

      onNewNotificationRef.current(data);

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

    // Refresh token on reconnection attempt in case the original JWT expired
    socket.io.on('reconnect_attempt', () => {
      const freshToken = localStorage.getItem('accessToken');
      if (freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    return () => {
      // Cleanup on unmount or when enabled/wsAvailable changes
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, wsAvailable]);

  return { connected, wsAvailable };
}
