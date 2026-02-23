import { z } from 'zod';
export declare const createRoomSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    capacity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name?: string;
    location?: string;
    capacity?: number;
}, {
    name?: string;
    location?: string;
    capacity?: number;
}>;
export declare const updateRoomSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    capacity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "MAINTENANCE", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
    name?: string;
    location?: string;
    capacity?: number;
}, {
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
    name?: string;
    location?: string;
    capacity?: number;
}>;
//# sourceMappingURL=room.schema.d.ts.map