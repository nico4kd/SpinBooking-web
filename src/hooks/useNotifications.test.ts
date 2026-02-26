/**
 * Unit tests for useNotifications hook
 *
 * Task 5.9: Verify that the default pollingInterval is 60000 (was 30000).
 * There were no pre-existing tests hardcoding 30000 to update, so this file
 * establishes the baseline assertion for the 60 s default.
 *
 * Ref: [N-Polling-1] | Tasks: 5.9
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';

// ─── Mock the api-client module ───────────────────────────────────────────────

jest.mock('../lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '../lib/api-client';
const mockApi = api as jest.Mocked<typeof api>;

// ─── Test Setup ───────────────────────────────────────────────────────────────

const emptyResponse = {
  data: {
    data: [],
    unreadCount: 0,
  },
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  (mockApi.get as jest.Mock).mockResolvedValue(emptyResponse);
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// ─── Task 5.9: Default pollingInterval is 60 000 ms ──────────────────────────

describe('useNotifications — polling interval (task 5.9)', () => {
  it('uses 60 000 ms as the default polling interval (not 30 000)', async () => {
    const { result } = renderHook(() => useNotifications());

    // Wait for the initial fetch to complete
    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1));

    // Advance just under 60 s — should NOT trigger a second fetch
    act(() => {
      jest.advanceTimersByTime(59_999);
    });

    expect(mockApi.get).toHaveBeenCalledTimes(1);

    // Advance to exactly 60 s — should trigger the polling fetch
    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });

  it('does NOT poll at 30 000 ms (old default)', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1));

    // Advance to 30 s — should NOT trigger a second poll with the new 60 s default
    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });

  it('respects a custom pollingInterval when provided', async () => {
    const { result } = renderHook(() =>
      useNotifications({ pollingInterval: 10_000 }),
    );

    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1));

    act(() => {
      jest.advanceTimersByTime(9_999);
    });
    expect(mockApi.get).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });

  it('addNotification prepends to the list and increments unreadCount', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1));

    const newNotification = {
      id: 'n-new-1',
      type: 'PACKAGE_ACTIVATED',
      subject: 'Test',
      message: 'Test message',
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    act(() => {
      result.current.addNotification(newNotification);
    });

    expect(result.current.notifications[0]).toEqual(newNotification);
    expect(result.current.unreadCount).toBe(1);
  });
});
