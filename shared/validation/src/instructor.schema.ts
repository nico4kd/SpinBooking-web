import { z } from 'zod';

export const createInstructorSchema = z.object({
  userId: z.string().cuid('ID de usuario inválido'),
  bio: z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional(),
  photoUrl: z.string().url('URL de foto inválida').optional(),
  specialties: z.array(z.string()).optional(),
});

export const updateInstructorSchema = z.object({
  bio: z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional(),
  photoUrl: z.string().url('URL de foto inválida').optional(),
  specialties: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
