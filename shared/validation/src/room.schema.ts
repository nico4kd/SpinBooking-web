import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  location: z.string().optional(),
  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser positiva')
    .min(1, 'La capacidad mínima es 1')
    .max(100, 'La capacidad máxima es 100'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  location: z.string().optional(),
  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser positiva')
    .min(1, 'La capacidad mínima es 1')
    .max(100, 'La capacidad máxima es 100')
    .optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
});
