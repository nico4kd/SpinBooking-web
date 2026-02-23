"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCancellationRules = exports.validateBookingRules = exports.bookingFiltersSchema = exports.cancelBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    classId: zod_1.z.string().cuid('ID de clase inválido'),
    bikeNumber: zod_1.z
        .number()
        .int('El número de bici debe ser un entero')
        .positive('El número de bici debe ser positivo')
        .optional(),
});
exports.cancelBookingSchema = zod_1.z.object({
    reason: zod_1.z.string().max(500, 'La razón no puede exceder 500 caracteres').optional(),
});
exports.bookingFiltersSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED', 'CANCELLED', 'NO_SHOW', 'ATTENDED']).optional(),
    upcoming: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    past: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional(),
});
exports.validateBookingRules = zod_1.z
    .object({
    classStartTime: zod_1.z.date(),
    classMaxCapacity: zod_1.z.number(),
    classCurrentCapacity: zod_1.z.number(),
    userHasTickets: zod_1.z.boolean(),
    userHasConflictingBooking: zod_1.z.boolean(),
    bikeNumber: zod_1.z.number().optional(),
    bikeIsAvailable: zod_1.z.boolean().optional(),
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
    .refine((data) => {
    if (data.bikeNumber !== undefined && data.bikeIsAvailable !== undefined) {
        return data.bikeIsAvailable;
    }
    return true;
}, {
    message: 'La bici seleccionada ya está ocupada',
});
exports.validateCancellationRules = zod_1.z
    .object({
    classStartTime: zod_1.z.date(),
    cancellationDeadlineHours: zod_1.z.number().default(2),
})
    .refine((data) => {
    const now = new Date();
    const deadline = new Date(data.classStartTime);
    deadline.setHours(deadline.getHours() - data.cancellationDeadlineHours);
    return now <= deadline;
}, {
    message: 'No se puede cancelar con menos de 2 horas de anticipación',
});
//# sourceMappingURL=booking.schema.js.map