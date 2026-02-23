import { z } from 'zod';
export declare const createBookingSchema: z.ZodObject<{
    classId: z.ZodString;
    bikeNumber: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    classId?: string;
    bikeNumber?: number;
}, {
    classId?: string;
    bikeNumber?: number;
}>;
export declare const cancelBookingSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string;
}, {
    reason?: string;
}>;
export declare const bookingFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["CONFIRMED", "CANCELLED", "NO_SHOW", "ATTENDED"]>>;
    upcoming: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    past: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    status?: "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "ATTENDED";
    upcoming?: boolean;
    past?: boolean;
}, {
    status?: "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "ATTENDED";
    upcoming?: string;
    past?: string;
}>;
export declare const validateBookingRules: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    classStartTime: z.ZodDate;
    classMaxCapacity: z.ZodNumber;
    classCurrentCapacity: z.ZodNumber;
    userHasTickets: z.ZodBoolean;
    userHasConflictingBooking: z.ZodBoolean;
    bikeNumber: z.ZodOptional<z.ZodNumber>;
    bikeIsAvailable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}, {
    bikeNumber?: number;
    classStartTime?: Date;
    classMaxCapacity?: number;
    classCurrentCapacity?: number;
    userHasTickets?: boolean;
    userHasConflictingBooking?: boolean;
    bikeIsAvailable?: boolean;
}>;
export declare const validateCancellationRules: z.ZodEffects<z.ZodObject<{
    classStartTime: z.ZodDate;
    cancellationDeadlineHours: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    classStartTime?: Date;
    cancellationDeadlineHours?: number;
}, {
    classStartTime?: Date;
    cancellationDeadlineHours?: number;
}>, {
    classStartTime?: Date;
    cancellationDeadlineHours?: number;
}, {
    classStartTime?: Date;
    cancellationDeadlineHours?: number;
}>;
//# sourceMappingURL=booking.schema.d.ts.map