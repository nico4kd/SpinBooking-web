import { z } from 'zod';
export declare const createBookingSchema: z.ZodObject<{
    classId: z.ZodString;
    bikeNumber: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const cancelBookingSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const bookingFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        CONFIRMED: "CONFIRMED";
        CANCELLED: "CANCELLED";
        NO_SHOW: "NO_SHOW";
        ATTENDED: "ATTENDED";
    }>>;
    upcoming: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    past: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
}, z.core.$strip>;
export declare const validateBookingRules: z.ZodObject<{
    classStartTime: z.ZodDate;
    classMaxCapacity: z.ZodNumber;
    classCurrentCapacity: z.ZodNumber;
    userHasTickets: z.ZodBoolean;
    userHasConflictingBooking: z.ZodBoolean;
    bikeNumber: z.ZodOptional<z.ZodNumber>;
    bikeIsAvailable: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const validateCancellationRules: z.ZodObject<{
    classStartTime: z.ZodDate;
    cancellationDeadlineHours: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=booking.schema.d.ts.map