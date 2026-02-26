import api from '../api-client';
import type { UserPackage, PackageConfig } from './types';

export const packagesApi = {
  getTypes: () =>
    api.get<PackageConfig[]>('/packages/types').then((r) => r.data),

  getUserPackages: () =>
    api.get<UserPackage[]>('/packages').then((r) => r.data),

  getById: (id: string) =>
    api.get<UserPackage>(`/packages/${id}`).then((r) => r.data),

  purchase: (data: { type: string; paymentMethod?: string }) =>
    api.post<{ package: UserPackage }>('/packages/purchase', data).then((r) => r.data),
};
