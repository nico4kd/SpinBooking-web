import { z } from 'zod';
import { DifficultyLevel } from '@spinbooking/types';
export declare const createClassSchema: z.ZodObject<{
    roomId: z.ZodString;
    instructorId: z.ZodString;
    startTime: z.ZodCoercedDate<unknown>;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodEnum<typeof DifficultyLevel>;
    musicTheme: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateClassSchema: z.ZodObject<{
    roomId: z.ZodOptional<z.ZodString>;
    instructorId: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    duration: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodOptional<z.ZodEnum<typeof DifficultyLevel>>;
    musicTheme: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createRecurringClassSchema: z.ZodObject<{
    roomId: z.ZodString;
    instructorId: z.ZodString;
    startTime: z.ZodCoercedDate<unknown>;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodEnum<typeof DifficultyLevel>;
    musicTheme: z.ZodOptional<z.ZodString>;
    recurrence: z.ZodObject<{
        frequency: z.ZodEnum<{
            DAILY: "DAILY";
            WEEKLY: "WEEKLY";
        }>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        endDate: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const classFiltersSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    roomId: z.ZodOptional<z.ZodString>;
    instructorId: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodOptional<z.ZodEnum<typeof DifficultyLevel>>;
    status: z.ZodOptional<z.ZodEnum<{
        CANCELLED: "CANCELLED";
        SCHEDULED: "SCHEDULED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=class.schema.d.ts.map