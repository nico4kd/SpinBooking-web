import { z } from 'zod';
import { DifficultyLevel } from '@spinbooking/types';
export declare const createClassSchema: z.ZodObject<{
    roomId: z.ZodString;
    instructorId: z.ZodString;
    startTime: z.ZodDate;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodNativeEnum<typeof DifficultyLevel>;
    musicTheme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
}, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
}>;
export declare const updateClassSchema: z.ZodObject<{
    roomId: z.ZodOptional<z.ZodString>;
    instructorId: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodDate>;
    duration: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodOptional<z.ZodNativeEnum<typeof DifficultyLevel>>;
    musicTheme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
}, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
}>;
export declare const createRecurringClassSchema: z.ZodObject<{
    roomId: z.ZodString;
    instructorId: z.ZodString;
    startTime: z.ZodDate;
    duration: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodNativeEnum<typeof DifficultyLevel>;
    musicTheme: z.ZodOptional<z.ZodString>;
} & {
    recurrence: z.ZodObject<{
        frequency: z.ZodEnum<["DAILY", "WEEKLY"]>;
        daysOfWeek: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>, number[], number[]>;
        endDate: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        endDate?: Date;
        frequency?: "DAILY" | "WEEKLY";
        daysOfWeek?: number[];
    }, {
        endDate?: Date;
        frequency?: "DAILY" | "WEEKLY";
        daysOfWeek?: number[];
    }>;
}, "strip", z.ZodTypeAny, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
    recurrence?: {
        endDate?: Date;
        frequency?: "DAILY" | "WEEKLY";
        daysOfWeek?: number[];
    };
}, {
    roomId?: string;
    instructorId?: string;
    startTime?: Date;
    duration?: number;
    title?: string;
    description?: string;
    difficultyLevel?: DifficultyLevel;
    musicTheme?: string;
    recurrence?: {
        endDate?: Date;
        frequency?: "DAILY" | "WEEKLY";
        daysOfWeek?: number[];
    };
}>;
export declare const classFiltersSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    roomId: z.ZodOptional<z.ZodString>;
    instructorId: z.ZodOptional<z.ZodString>;
    difficultyLevel: z.ZodOptional<z.ZodNativeEnum<typeof DifficultyLevel>>;
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
    startDate?: Date;
    endDate?: Date;
    roomId?: string;
    instructorId?: string;
    difficultyLevel?: DifficultyLevel;
}, {
    status?: "CANCELLED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
    startDate?: Date;
    endDate?: Date;
    roomId?: string;
    instructorId?: string;
    difficultyLevel?: DifficultyLevel;
}>;
//# sourceMappingURL=class.schema.d.ts.map