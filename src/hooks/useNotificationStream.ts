import { useEffect, useRef, useState } from 'react';
import { Notification } from './useNotifications';

interface UseNotificationStreamOptions {
  onNewNotification: (notification: Notification) => void;
  onNewPackageActivated?: () => void;
  enabled?: boolean; // default true — set false during SSR or when unauthenticated
}

interface UseNotificationStreamResult {
  connected: boolean;    // true when EventSource.readyState === OPEN
  sseAvailable: boolean; // false after 3 consecutive failures (polling-only mode)
}

export function useNotificationStream(
  options: UseNotificationStreamOptions,
): UseNotificationStreamResult {
  const { onNewNotification, onNewPackageActivated, enabled = true } = options;

  const [connected, setConnected] = useState(false);
  const [sseAvailable, setSseAvailable] = useState(true);

  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  // Keep latest callbacks in a ref to avoid stale closures in EventSource handlers
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
    if (!sseAvailable) return;

    const connect = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`;

      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        retryCountRef.current = 0;
        setConnected(true);
        setSseAvailable(true);
      };

      es.onmessage = (event: MessageEvent) => {
        // Heartbeat comment frames arrive as empty data — skip them
        if (!event.data || event.data === ': ping') return;

        let parsed: Notification;
        try {
          parsed = JSON.parse(event.data) as Notification;
        } catch {
          return;
        }

        // Deduplication: drop if we've already processed this notification ID
        if (seenIds.current.has(parsed.id)) return;
        seenIds.current.add(parsed.id);

        onNewNotificationRef.current(parsed);

        if (parsed.type === 'PACKAGE_ACTIVATED') {
          onNewPackageActivatedRef.current?.();
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setConnected(false);

        retryCountRef.current += 1;

        if (retryCountRef.current <= 3) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          // After 3 consecutive failures, switch to polling-only mode
          setSseAvailable(false);
        }
      };
    };

    connect();

    return () => {
      // Cleanup on unmount or when enabled/sseAvailable changes
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sseAvailable]);

  return { connected, sseAvailable };
}
