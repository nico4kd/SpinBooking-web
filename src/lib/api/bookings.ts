import api from '../api-client';
import type { Booking, PaginatedResponse } from './types';

export interface BookingFilters {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  adminView?: boolean;
}

export const bookingsApi = {
  list: (params: BookingFilters = {}) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  create: (data: { classId: string; bikeNumber?: number | null; bikeSize?: string }) =>
    api.post<Booking>('/bookings', data).then((r) => r.data),

  cancel: (id: string) =>
    api.delete<{ message: string; ticketRestored: boolean; cancellationDeadline: string }>(
      `/bookings/${id}`,
    ).then((r) => r.data),

  /** Admin: get bookings for a specific class */
  getClassBookings: (classId: string) =>
    api.get<{ classId: string; totalBookings: number; capacity: number; bookings: Booking[] }>(
      `/bookings/class/${classId}`,
    ).then((r) => r.data),

  /** Admin: mark as attended or no-show */
  updateStatus: (id: string, status: 'ATTENDED' | 'NO_SHOW') =>
    api.patch(`/bookings/${id}/status`, { status }),
};
