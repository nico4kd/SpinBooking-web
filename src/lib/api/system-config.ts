import api from '../api-client';

export const systemConfigApi = {
  getCancellationDeadline: () =>
    api
      .get<{ hours: number }>('/system-config/public/cancellation-deadline')
      .then((r) => r.data),
};
