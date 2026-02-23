import { z } from 'zod';

export const joinWaitlistSchema = z.object({
  classId: z.string().cuid('ID de clase inválido'),
});

export const acceptWaitlistSchema = z.object({
  bikeNumber: z
    .number()
    .int('El número de bici debe ser un entero')
    .positive('El número de bici debe ser positivo')
    .optional(),
});
