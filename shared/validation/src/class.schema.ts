import { z } from 'zod';
import { DifficultyLevel } from '@spinbooking/types';

export const createClassSchema = z.object({
  roomId: z.string().cuid('ID de sala inválido'),
  instructorId: z.string().cuid('ID de instructor inválido'),
  startTime: z.coerce.date(),
  duration: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .min(30, 'La duración mínima es 30 minutos')
    .max(120, 'La duración máxima es 120 minutos'),
  title: z.string().max(100, 'El título no puede exceder 100 caracteres').optional(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  musicTheme: z.string().max(100, 'El tema musical no puede exceder 100 caracteres').optional(),
});

export const updateClassSchema = z.object({
  roomId: z.string().cuid('ID de sala inválido').optional(),
  instructorId: z.string().cuid('ID de instructor inválido').optional(),
  startTime: z.coerce.date().optional(),
  duration: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .min(30, 'La duración mínima es 30 minutos')
    .max(120, 'La duración máxima es 120 minutos')
    .optional(),
  title: z.string().max(100, 'El título no puede exceder 100 caracteres').optional(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  musicTheme: z.string().max(100, 'El tema musical no puede exceder 100 caracteres').optional(),
});

export const createRecurringClassSchema = createClassSchema.extend({
  recurrence: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY']),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .optional()
      .refine(
        (days) => {
          if (days) {
            return new Set(days).size === days.length;
          }
          return true;
        },
        { message: 'No se pueden repetir días de la semana' }
      ),
    endDate: z.coerce.date(),
  }),
});

export const classFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  roomId: z.string().cuid('ID de sala inválido').optional(),
  instructorId: z.string().cuid('ID de instructor inválido').optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});
