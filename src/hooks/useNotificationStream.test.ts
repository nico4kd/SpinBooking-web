/**
 * Unit tests for useNotificationStream hook
 *
 * These tests mock socket.io-client to avoid real network connections.
 *
 * Covers:
 * - 7.3 Socket connection lifecycle (connect on mount, disconnect on unmount)
 * - 7.3 Notification event handling via socket.io-client
 * - 7.3 onNewPackageActivated called only for PACKAGE_ACTIVATED type
 * - 7.3 Deduplication via seenIds
 * - 7.3 wsAvailable becomes false after max connect_error events
 * - 7.3 enabled=false prevents connection
 *
 * Ref: [WS-Hook-1, WS-Hook-2, WS-Dedup-1, WS-Fallback-1] | Tasks: 7.3
 */

import { renderHook, act } from '@testing-library/react';
import { useNotificationStream } from './useNotificationStream';

// ─── socket.io-client Mock ──────────────────────────────────────────────────

type SocketEventHandler = (...args: any[]) => void;

interface MockSocket {
  on: jest.Mock;
  io: { on: jest.Mock };
  disconnect: jest.Mock;
  connected: boolean;
  auth: Record<string, any>;
  _handlers: Record<string, SocketEventHandler[]>;
  _ioHandlers: Record<string, SocketEventHandler[]>;
  simulateEvent: (event: string, ...args: any[]) => void;
  simulateIoEvent: (event: string, ...args: any[]) => void;
}

let mockSocketInstances: MockSocket[] = [];

function createMockSocket(): MockSocket {
  const handlers: Record<string, SocketEventHandler[]> = {};
  const ioHandlers: Record<string, SocketEventHandler[]> = {};

  const socket: MockSocket = {
    on: jest.fn((event: string, handler: SocketEventHandler) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
      return socket;
    }),
    io: {
      on: jest.fn((event: string, handler: SocketEventHandler) => {
        if (!ioHandlers[event]) ioHandlers[event] = [];
        ioHandlers[event].push(handler);
        return socket.io;
      }),
    },
    disconnect: jest.fn(),
    connected: false,
    auth: {},
    _handlers: handlers,
    _ioHandlers: ioHandlers,
    simulateEvent(event: string, ...args: any[]) {
      const fns = handlers[event] || [];
      fns.forEach((fn) => fn(...args));
    },
    simulateIoEvent(event: string, ...args: any[]) {
      const fns = ioHandlers[event] || [];
      fns.forEach((fn) => fn(...args));
    },
  };

  mockSocketInstances.push(socket);
  return socket;
}

// Mock the socket.io-client module
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => createMockSocket()),
}));

// Import the mocked io for assertions
import { io as mockIo } from 'socket.io-client';

// ─── Test Setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  mockSocketInstances = [];
  (mockIo as jest.Mock).mockClear();
  (mockIo as jest.Mock).mockImplementation(() => createMockSocket());

  // Provide a fake access token so the hook does not bail out
  Storage.prototype.getItem = jest.fn((key: string) =>
    key === 'accessToken' ? 'fake-jwt-token' : null,
  );

  // Ensure NEXT_PUBLIC_API_URL is set
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Helper ──────────────────────────────────────────────────────────────────

function latestSocket(): MockSocket {
  expect(mockSocketInstances.length).toBeGreaterThan(0);
  return mockSocketInstances[mockSocketInstances.length - 1];
}

// ─── Connection lifecycle ────────────────────────────────────────────────────

describe('useNotificationStream -- connection lifecycle (task 7.3)', () => {
  it('creates a socket.io connection on mount with auth token', () => {
    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    expect(mockIo).toHaveBeenCalledTimes(1);
    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:3000/notifications',
      expect.objectContaining({
        auth: { token: 'fake-jwt-token' },
        transports: ['websocket', 'polling'],
        reconnection: true,
      }),
    );
  });

  it('sets connected to true when the socket connects', () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    expect(result.current.connected).toBe(false);

    act(() => {
      latestSocket().simulateEvent('connect');
    });

    expect(result.current.connected).toBe(true);
  });

  it('sets connected to false when the socket disconnects', () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    act(() => {
      latestSocket().simulateEvent('connect');
    });
    expect(result.current.connected).toBe(true);

    act(() => {
      latestSocket().simulateEvent('disconnect');
    });
    expect(result.current.connected).toBe(false);
  });

  it('disconnects the socket on unmount', () => {
    const { unmount } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    const socket = latestSocket();
    unmount();

    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('does not create a socket when no access token is available', () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);

    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    expect(mockIo).not.toHaveBeenCalled();
  });
});

// ─── Notification event handling ─────────────────────────────────────────────

describe('useNotificationStream -- notification event handling (task 7.3)', () => {
  const makeNotification = (type: string, id: string, data?: any) => ({
    id,
    type,
    subject: 'Test',
    message: 'Test message',
    createdAt: '2026-02-26T10:00:00Z',
    readAt: null,
    data,
  });

  it('calls onNewNotification when a notification event is received', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    const notification = makeNotification('PACKAGE_ACTIVATED', 'n-1');

    act(() => {
      latestSocket().simulateEvent('notification', notification);
    });

    expect(onNewNotification).toHaveBeenCalledTimes(1);
    expect(onNewNotification).toHaveBeenCalledWith(notification);
  });
});

// ─── onNewPackageActivated filter ────────────────────────────────────────────

describe('useNotificationStream -- onNewPackageActivated filter (task 7.3)', () => {
  const makeNotification = (type: string, id: string, data?: any) => ({
    id,
    type,
    subject: 'Test',
    message: 'Test message',
    createdAt: '2026-02-26T10:00:00Z',
    readAt: null,
    data,
  });

  it('calls onNewPackageActivated exactly once for a PACKAGE_ACTIVATED event', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestSocket().simulateEvent('notification', makeNotification('PACKAGE_ACTIVATED', 'n-1'));
    });

    expect(onNewPackageActivated).toHaveBeenCalledTimes(1);
    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onNewPackageActivated for BOOKING_CONFIRMED type', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestSocket().simulateEvent('notification', makeNotification('BOOKING_CONFIRMED', 'n-2'));
    });

    expect(onNewPackageActivated).not.toHaveBeenCalled();
    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onNewPackageActivated for WAITLIST_SPOT_AVAILABLE type', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestSocket().simulateEvent('notification', makeNotification('WAITLIST_SPOT_AVAILABLE', 'n-3'));
    });

    expect(onNewPackageActivated).not.toHaveBeenCalled();
    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('dispatches CustomEvent with credits delta for PACKAGE_ACTIVATED with newCredits', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestSocket().simulateEvent(
        'notification',
        makeNotification('PACKAGE_ACTIVATED', 'n-credits', { newCredits: 10 }),
      );
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'spinbooking:credits-updated',
        detail: { delta: 10 },
      }),
    );

    dispatchEventSpy.mockRestore();
  });

  it('handles mixed notification types — onNewPackageActivated called once, onNewNotification called 3 times', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestSocket().simulateEvent('notification', makeNotification('PACKAGE_ACTIVATED', 'n-4'));
      latestSocket().simulateEvent('notification', makeNotification('BOOKING_CONFIRMED', 'n-5'));
      latestSocket().simulateEvent('notification', makeNotification('WAITLIST_SPOT_AVAILABLE', 'n-6'));
    });

    expect(onNewPackageActivated).toHaveBeenCalledTimes(1);
    expect(onNewNotification).toHaveBeenCalledTimes(3);
  });
});

// ─── Deduplication via seenIds ───────────────────────────────────────────────

describe('useNotificationStream -- deduplication (task 7.3)', () => {
  const makeNotification = (id: string, type = 'PACKAGE_ACTIVATED') => ({
    id,
    type,
    subject: 'Subject',
    message: 'Message',
    createdAt: '2026-02-26T10:00:00Z',
    readAt: null,
  });

  it('calls onNewNotification exactly once when the same event id is received twice', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    const payload = makeNotification('dedup-id-1');

    act(() => {
      latestSocket().simulateEvent('notification', payload);
      latestSocket().simulateEvent('notification', payload); // same id second time
    });

    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('calls onNewNotification twice for two different event ids', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    act(() => {
      latestSocket().simulateEvent('notification', makeNotification('unique-id-1'));
      latestSocket().simulateEvent('notification', makeNotification('unique-id-2'));
    });

    expect(onNewNotification).toHaveBeenCalledTimes(2);
  });

  it('does NOT call onNewPackageActivated for a duplicate PACKAGE_ACTIVATED event', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    const payload = makeNotification('dedup-pkg-1', 'PACKAGE_ACTIVATED');

    act(() => {
      latestSocket().simulateEvent('notification', payload);
      latestSocket().simulateEvent('notification', payload); // duplicate
    });

    expect(onNewNotification).toHaveBeenCalledTimes(1);
    expect(onNewPackageActivated).toHaveBeenCalledTimes(1);
  });
});

// ─── connect_error and wsAvailable fallback ──────────────────────────────────

describe('useNotificationStream -- connect_error fallback (task 7.3)', () => {
  it('wsAvailable becomes false after more than 3 consecutive connect_error events', () => {
    const onNewNotification = jest.fn();

    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    expect(result.current.wsAvailable).toBe(true);

    // Simulate 4 consecutive connect_error events (hook disconnects after > 3)
    act(() => {
      latestSocket().simulateEvent('connect_error');
    });
    expect(result.current.wsAvailable).toBe(true);

    act(() => {
      latestSocket().simulateEvent('connect_error');
    });
    expect(result.current.wsAvailable).toBe(true);

    act(() => {
      latestSocket().simulateEvent('connect_error');
    });
    expect(result.current.wsAvailable).toBe(true);

    // 4th error: failCount > 3 => wsAvailable = false
    act(() => {
      latestSocket().simulateEvent('connect_error');
    });
    expect(result.current.wsAvailable).toBe(false);
  });

  it('disconnects the socket after wsAvailable becomes false', () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    const socket = latestSocket();

    // Fire 4 connect_error events
    for (let i = 0; i < 4; i++) {
      act(() => {
        socket.simulateEvent('connect_error');
      });
    }

    expect(result.current.wsAvailable).toBe(false);
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('resets fail count on a successful connect, so subsequent errors start fresh', () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    // 2 errors
    act(() => {
      latestSocket().simulateEvent('connect_error');
      latestSocket().simulateEvent('connect_error');
    });

    // Successful connect resets counter
    act(() => {
      latestSocket().simulateEvent('connect');
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.wsAvailable).toBe(true);

    // 3 more errors (total after reset: 3)
    act(() => {
      latestSocket().simulateEvent('connect_error');
      latestSocket().simulateEvent('connect_error');
      latestSocket().simulateEvent('connect_error');
    });

    // Still true — need > 3
    expect(result.current.wsAvailable).toBe(true);

    // 4th error after reset
    act(() => {
      latestSocket().simulateEvent('connect_error');
    });
    expect(result.current.wsAvailable).toBe(false);
  });
});

// ─── enabled flag ────────────────────────────────────────────────────────────

describe('useNotificationStream -- enabled guard (task 7.3)', () => {
  it('does not create a socket when enabled is false', () => {
    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn(), enabled: false }),
    );

    expect(mockIo).not.toHaveBeenCalled();
  });

  it('creates a socket when enabled is true (default)', () => {
    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    expect(mockIo).toHaveBeenCalledTimes(1);
  });
});
