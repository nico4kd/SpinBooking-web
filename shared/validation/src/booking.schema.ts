import { z } from 'zod';

export const createBookingSchema = z.object({
  classId: z.string().cuid('ID de clase inválido'),
  bikeNumber: z
    .number()
    .int('El número de bici debe ser un entero')
    .positive('El número de bici debe ser positivo')
    .optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, 'La razón no puede exceder 500 caracteres').optional(),
});

export const bookingFiltersSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'NO_SHOW', 'ATTENDED']).optional(),
  upcoming: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  past: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// Business rules validation
export const validateBookingRules = z
  .object({
    classStartTime: z.date(),
    classMaxCapacity: z.number(),
    classCurrentCapacity: z.number(),
    userHasTickets: z.boolean(),
    userHasConflictingBooking: z.boolean(),
    bikeNumber: z.number().optional(),
    bikeIsAvailable: z.boolean().optional(),
  })
  .refine((data) => new Date() < data.classStartTime, {
    message: 'No se puede reservar una clase que ya comenzó',
  })
  .refine((data) => data.classCurrentCapacity < data.classMaxCapacity, {
    message: 'La clase está llena',
  })
  .refine((data) => data.userHasTickets, {
    message: 'No tienes tickets disponibles',
  })
  .refine((data) => !data.userHasConflictingBooking, {
    message: 'Ya tienes otra reserva en este horario',
  })
  .refine(
    (data) => {
      if (data.bikeNumber !== undefined && data.bikeIsAvailable !== undefined) {
        return data.bikeIsAvailable;
      }
      return true;
    },
    {
      message: 'La bici seleccionada ya está ocupada',
    }
  );

export const validateCancellationRules = z
  .object({
    classStartTime: z.date(),
    cancellationDeadlineHours: z.number().default(2),
  })
  .refine(
    (data) => {
      const now = new Date();
      const deadline = new Date(data.classStartTime);
      deadline.setHours(deadline.getHours() - data.cancellationDeadlineHours);
      return now <= deadline;
    },
    {
      message: 'No se puede cancelar con menos de 2 horas de anticipación',
    }
  );
