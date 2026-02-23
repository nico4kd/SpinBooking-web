import { z } from 'zod';

export const processRefundSchema = z.object({
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
});

export const paymentFiltersSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'REFUNDED']).optional(),
  method: z
    .enum(['ONLINE_MERCADOPAGO', 'IN_PERSON_CASH', 'IN_PERSON_CARD'])
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
