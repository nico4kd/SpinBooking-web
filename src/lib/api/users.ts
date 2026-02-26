import api from '../api-client';
import type { UserProfile, UserStats } from './types';

export const usersApi = {
  getProfile: () =>
    api.get<UserProfile>('/users/me').then((r) => r.data),

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch<UserProfile>('/users/me', data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),

  deleteAccount: () =>
    api.delete('/users/me'),

  getStats: () =>
    api.get<UserStats>('/users/me/stats').then((r) => r.data),
};
