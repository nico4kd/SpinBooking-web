import api from '../api-client';
import type { NotificationsResponse } from './types';

export const notificationsApi = {
  list: (limit = 20) =>
    api.get<NotificationsResponse>(`/notifications?limit=${limit}`).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  dismiss: (id: string) =>
    api.delete(`/notifications/${id}`),
};
