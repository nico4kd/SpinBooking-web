"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classFiltersSchema = exports.createRecurringClassSchema = exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("@spinbooking/types");
exports.createClassSchema = zod_1.z.object({
    roomId: zod_1.z.string().cuid('ID de sala inválido'),
    instructorId: zod_1.z.string().cuid('ID de instructor inválido'),
    startTime: zod_1.z.coerce.date(),
    duration: zod_1.z
        .number()
        .int('La duración debe ser un número entero')
        .positive('La duración debe ser positiva')
        .min(30, 'La duración mínima es 30 minutos')
        .max(120, 'La duración máxima es 120 minutos'),
    title: zod_1.z.string().max(100, 'El título no puede exceder 100 caracteres').optional(),
    description: zod_1.z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    difficultyLevel: zod_1.z.nativeEnum(types_1.DifficultyLevel),
    musicTheme: zod_1.z.string().max(100, 'El tema musical no puede exceder 100 caracteres').optional(),
});
exports.updateClassSchema = zod_1.z.object({
    roomId: zod_1.z.string().cuid('ID de sala inválido').optional(),
    instructorId: zod_1.z.string().cuid('ID de instructor inválido').optional(),
    startTime: zod_1.z.coerce.date().optional(),
    duration: zod_1.z
        .number()
        .int('La duración debe ser un número entero')
        .positive('La duración debe ser positiva')
        .min(30, 'La duración mínima es 30 minutos')
        .max(120, 'La duración máxima es 120 minutos')
        .optional(),
    title: zod_1.z.string().max(100, 'El título no puede exceder 100 caracteres').optional(),
    description: zod_1.z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    difficultyLevel: zod_1.z.nativeEnum(types_1.DifficultyLevel).optional(),
    musicTheme: zod_1.z.string().max(100, 'El tema musical no puede exceder 100 caracteres').optional(),
});
exports.createRecurringClassSchema = exports.createClassSchema.extend({
    recurrence: zod_1.z.object({
        frequency: zod_1.z.enum(['DAILY', 'WEEKLY']),
        daysOfWeek: zod_1.z
            .array(zod_1.z.number().int().min(0).max(6))
            .optional()
            .refine((days) => {
            if (days) {
                return new Set(days).size === days.length;
            }
            return true;
        }, { message: 'No se pueden repetir días de la semana' }),
        endDate: zod_1.z.coerce.date(),
    }),
});
exports.classFiltersSchema = zod_1.z.object({
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    roomId: zod_1.z.string().cuid('ID de sala inválido').optional(),
    instructorId: zod_1.z.string().cuid('ID de instructor inválido').optional(),
    difficultyLevel: zod_1.z.nativeEnum(types_1.DifficultyLevel).optional(),
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});
//# sourceMappingURL=class.schema.js.map