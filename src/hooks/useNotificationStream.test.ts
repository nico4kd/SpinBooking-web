/**
 * Unit tests for useNotificationStream hook
 *
 * These tests mock the global EventSource to avoid real network connections.
 *
 * Covers:
 * - 5.4 Exponential backoff — sseAvailable becomes false after 3 consecutive errors
 * - 5.5 onNewPackageActivated called only for PACKAGE_ACTIVATED type
 * - 5.6 Deduplication via seenIds
 *
 * Ref: [N-Backoff-2, UI-Credits-2, N-Dedup-1, UI-Bell-2] | Tasks: 5.4, 5.5, 5.6
 */

import { renderHook, act } from '@testing-library/react';
import { useNotificationStream } from './useNotificationStream';

// ─── EventSource Mock ────────────────────────────────────────────────────────

/**
 * Minimal EventSource mock that exposes handler references so tests can
 * trigger onopen / onmessage / onerror programmatically.
 */
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.CONNECTING;
  url: string;

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  // Track all instances created during a test
  static instances: MockEventSource[] = [];

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helpers for test code to simulate events
  simulateOpen() {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.(new Event('open'));
  }

  simulateMessage(data: object | string) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    this.onmessage?.(new MessageEvent('message', { data: serialized }));
  }

  simulateError() {
    this.readyState = MockEventSource.CLOSED;
    this.onerror?.(new Event('error'));
  }
}

// ─── Test Setup ──────────────────────────────────────────────────────────────

// Save real EventSource (may be undefined in jsdom)
const OriginalEventSource = (global as any).EventSource;

beforeEach(() => {
  jest.useFakeTimers();
  MockEventSource.instances = [];
  (global as any).EventSource = MockEventSource;

  // Provide a fake access token so the hook does not bail out
  Storage.prototype.getItem = jest.fn((key: string) =>
    key === 'accessToken' ? 'fake-token' : null,
  );

  // Ensure NEXT_PUBLIC_API_URL is set
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  (global as any).EventSource = OriginalEventSource;
  jest.restoreAllMocks();
});

// ─── Helper: get the latest EventSource instance ─────────────────────────────

function latestEs(): MockEventSource {
  const instances = MockEventSource.instances;
  expect(instances.length).toBeGreaterThan(0);
  return instances[instances.length - 1];
}

// ─── 5.4 Exponential backoff and fallback ─────────────────────────────────────

describe('useNotificationStream — exponential backoff (task 5.4)', () => {
  it('sseAvailable becomes false after 3 consecutive onerror events', async () => {
    const onNewNotification = jest.fn();

    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    // Initial state: sseAvailable is true
    expect(result.current.sseAvailable).toBe(true);

    // --- Error 1 (retryCount becomes 1, delay = 2^0 * 1000 = 1000 ms) ---
    act(() => {
      latestEs().simulateError();
    });

    // Advance past the 1 s retry delay — new EventSource is created
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.sseAvailable).toBe(true);
    expect(MockEventSource.instances).toHaveLength(2);

    // --- Error 2 (retryCount becomes 2, delay = 2^1 * 1000 = 2000 ms) ---
    act(() => {
      latestEs().simulateError();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.sseAvailable).toBe(true);
    expect(MockEventSource.instances).toHaveLength(3);

    // --- Error 3 (retryCount becomes 3, delay = 2^2 * 1000 = 4000 ms) ---
    act(() => {
      latestEs().simulateError();
    });

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.sseAvailable).toBe(true);
    expect(MockEventSource.instances).toHaveLength(4);

    // --- Error 4 (retryCount > 3 — no more reconnects, sseAvailable = false) ---
    act(() => {
      latestEs().simulateError();
    });

    // After the 4th error (3 retries exhausted), sseAvailable should be false
    expect(result.current.sseAvailable).toBe(false);
  });

  it('does NOT create a 5th EventSource after sseAvailable becomes false', async () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    // Exhaust 3 retries
    for (let i = 0; i < 3; i++) {
      act(() => { latestEs().simulateError(); });
      act(() => { jest.advanceTimersByTime(Math.pow(2, i) * 1000); });
    }

    // 4th error → sseAvailable = false
    act(() => { latestEs().simulateError(); });
    expect(result.current.sseAvailable).toBe(false);

    const countAfterExhaustion = MockEventSource.instances.length;

    // Advance timers significantly — no new connection should be created
    act(() => { jest.advanceTimersByTime(60000); });

    expect(MockEventSource.instances.length).toBe(countAfterExhaustion);
  });

  it('resets retryCount on a successful onopen, so subsequent errors start fresh', async () => {
    const { result } = renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    // Error 1 → retry
    act(() => { latestEs().simulateError(); });
    act(() => { jest.advanceTimersByTime(1000); });

    // Successful connect resets counter
    act(() => { latestEs().simulateOpen(); });

    expect(result.current.connected).toBe(true);
    expect(result.current.sseAvailable).toBe(true);

    // Now produce 3 fresh errors — sseAvailable should become false
    for (let i = 0; i < 3; i++) {
      act(() => { latestEs().simulateError(); });
      act(() => { jest.advanceTimersByTime(Math.pow(2, i) * 1000); });
    }

    act(() => { latestEs().simulateError(); });
    expect(result.current.sseAvailable).toBe(false);
  });
});

// ─── 5.5 onNewPackageActivated called only for PACKAGE_ACTIVATED ──────────────

describe('useNotificationStream — onNewPackageActivated filter (task 5.5)', () => {
  const makeNotification = (type: string, id: string) => ({
    id,
    type,
    subject: 'Test',
    message: 'Test message',
    createdAt: '2026-02-26T10:00:00Z',
    readAt: null,
  });

  it('calls onNewPackageActivated exactly once for a PACKAGE_ACTIVATED event', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestEs().simulateMessage(makeNotification('PACKAGE_ACTIVATED', 'n-1'));
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
      latestEs().simulateMessage(makeNotification('BOOKING_CONFIRMED', 'n-2'));
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
      latestEs().simulateMessage(makeNotification('WAITLIST_SPOT_AVAILABLE', 'n-3'));
    });

    expect(onNewPackageActivated).not.toHaveBeenCalled();
    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('dispatches PACKAGE_ACTIVATED, BOOKING_CONFIRMED, and WAITLIST_SPOT_AVAILABLE — onNewPackageActivated called once, onNewNotification called 3 times', () => {
    const onNewNotification = jest.fn();
    const onNewPackageActivated = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification, onNewPackageActivated }),
    );

    act(() => {
      latestEs().simulateMessage(makeNotification('PACKAGE_ACTIVATED', 'n-4'));
      latestEs().simulateMessage(makeNotification('BOOKING_CONFIRMED', 'n-5'));
      latestEs().simulateMessage(makeNotification('WAITLIST_SPOT_AVAILABLE', 'n-6'));
    });

    expect(onNewPackageActivated).toHaveBeenCalledTimes(1);
    expect(onNewNotification).toHaveBeenCalledTimes(3);
  });
});

// ─── 5.6 Deduplication via seenIds ───────────────────────────────────────────

describe('useNotificationStream — deduplication (task 5.6)', () => {
  const makeNotification = (id: string, type = 'PACKAGE_ACTIVATED') => ({
    id,
    type,
    subject: 'Subject',
    message: 'Message',
    createdAt: '2026-02-26T10:00:00Z',
    readAt: null,
  });

  it('calls onNewNotification exactly once when the same event id is dispatched twice', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    const payload = makeNotification('dedup-id-1');

    act(() => {
      latestEs().simulateMessage(payload);
      latestEs().simulateMessage(payload); // same id second time
    });

    expect(onNewNotification).toHaveBeenCalledTimes(1);
  });

  it('calls onNewNotification twice for two different event ids', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    act(() => {
      latestEs().simulateMessage(makeNotification('unique-id-1'));
      latestEs().simulateMessage(makeNotification('unique-id-2'));
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
      latestEs().simulateMessage(payload);
      latestEs().simulateMessage(payload); // duplicate
    });

    expect(onNewNotification).toHaveBeenCalledTimes(1);
    expect(onNewPackageActivated).toHaveBeenCalledTimes(1);
  });

  it('skips heartbeat ": ping" frames without calling onNewNotification', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    act(() => {
      latestEs().simulateMessage(': ping');
    });

    expect(onNewNotification).not.toHaveBeenCalled();
  });

  it('skips events with invalid JSON without calling onNewNotification', () => {
    const onNewNotification = jest.fn();

    renderHook(() =>
      useNotificationStream({ onNewNotification }),
    );

    act(() => {
      // simulateMessage with a raw string — not JSON
      latestEs().onmessage?.(new MessageEvent('message', { data: 'not-valid-json{' }));
    });

    expect(onNewNotification).not.toHaveBeenCalled();
  });
});

// ─── General: enabled flag ────────────────────────────────────────────────────

describe('useNotificationStream — enabled guard', () => {
  it('does not create an EventSource when enabled is false', () => {
    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn(), enabled: false }),
    );

    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('creates an EventSource when enabled is true (default)', () => {
    renderHook(() =>
      useNotificationStream({ onNewNotification: jest.fn() }),
    );

    expect(MockEventSource.instances).toHaveLength(1);
  });
});
