/**
 * Unit tests for useNotifications hook
 *
 * Covers:
 * - Default pollingInterval is 60000 ms
 * - Custom pollingInterval is respected
 * - Does NOT poll at 30000 ms (old default)
 *
 * Ref: [N-Polling-1] | Tasks: 5.9
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';

// ─── Mock the centralized notifications API ─────────────────────────────────

const mockList = jest.fn();

jest.mock('../lib/api', () => ({
  notificationsApi: {
    list: (...args: any[]) => mockList(...args),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    markAllAsRead: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock socket.io-client to prevent real connections
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    io: { on: jest.fn() },
    disconnect: jest.fn(),
    auth: {},
  })),
}));

// ─── Test Setup ───────────────────────────────────────────────────────────────

const emptyResponse = {
  data: [],
  unreadCount: 0,
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockList.mockResolvedValue(emptyResponse);

  // Provide a fake access token so the hook doesn't bail out
  Storage.prototype.getItem = jest.fn((key: string) =>
    key === 'accessToken' ? 'fake-jwt-token' : null,
  );
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ─── Polling interval tests ─────────────────────────────────────────────────

describe('useNotifications — polling interval', () => {
  it('uses 60 000 ms as the default polling interval (not 30 000)', async () => {
    renderHook(() => useNotifications());

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    // Advance just under 60 s — should NOT trigger a second fetch
    act(() => {
      jest.advanceTimersByTime(59_999);
    });

    expect(mockList).toHaveBeenCalledTimes(1);

    // Advance to exactly 60 s — should trigger the polling fetch
    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it('does NOT poll at 30 000 ms (old default)', async () => {
    renderHook(() => useNotifications());

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it('respects a custom pollingInterval when provided', async () => {
    renderHook(() =>
      useNotifications({ pollingInterval: 10_000 }),
    );

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    act(() => {
      jest.advanceTimersByTime(9_999);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});
