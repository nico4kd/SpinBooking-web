import { z } from 'zod';
export declare const createRoomSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    capacity: z.ZodNumber;
}, z.core.$strip>;
export declare const updateRoomSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    capacity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        MAINTENANCE: "MAINTENANCE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=room.schema.d.ts.map