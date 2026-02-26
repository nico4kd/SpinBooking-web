import api from '../api-client';
import type { ClassWithAvailability, PaginatedResponse } from './types';

export interface ClassFilters {
  startDate?: string;
  endDate?: string;
  roomId?: string;
  instructorId?: string;
  difficultyLevel?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface BikeData {
  classId: string;
  maxCapacity: number;
  occupiedBikes: number[];
  availableBikes: number[];
  totalOccupied: number;
  totalAvailable: number;
  popularBikes?: number[];
}

export const classesApi = {
  list: (params: ClassFilters = {}) =>
    api.get<PaginatedResponse<ClassWithAvailability>>('/classes', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ClassWithAvailability>(`/classes/${id}`).then((r) => r.data),

  getBikeData: (classId: string) =>
    api.get<BikeData>(`/classes/${classId}/bikes`).then((r) => r.data),
};
