import api from '../api-client';

export interface BikeRecord {
  id: string;
  roomId: string;
  number: number;
  size: 'S' | 'M' | 'L' | 'XL';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBikePayload {
  size?: 'S' | 'M' | 'L' | 'XL';
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface BulkUpdatePayload {
  updates: Array<{ bikeId: string; size: 'S' | 'M' | 'L' | 'XL' }>;
}

export const bikesApi = {
  /** Get all bikes for a room (admin only) */
  getByRoom: (roomId: string) =>
    api.get<BikeRecord[]>('/bikes', { params: { roomId } }).then((r) => r.data),

  /** Update a single bike's size and/or status (admin only) */
  update: (bikeId: string, data: UpdateBikePayload) =>
    api.patch<BikeRecord>(`/bikes/${bikeId}`, data).then((r) => r.data),

  /** Bulk update bike sizes for a room (admin only) */
  bulkUpdate: (roomId: string, payload: BulkUpdatePayload) =>
    api.patch<BikeRecord[]>(`/bikes/room/${roomId}/bulk`, payload).then((r) => r.data),
};
