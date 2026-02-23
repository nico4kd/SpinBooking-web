import { z } from 'zod';
export declare const createInstructorSchema: z.ZodObject<{
    userId: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    userId?: string;
    bio?: string;
    photoUrl?: string;
    specialties?: string[];
}, {
    userId?: string;
    bio?: string;
    photoUrl?: string;
    specialties?: string[];
}>;
export declare const updateInstructorSchema: z.ZodObject<{
    bio: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE";
    bio?: string;
    photoUrl?: string;
    specialties?: string[];
}, {
    status?: "ACTIVE" | "INACTIVE";
    bio?: string;
    photoUrl?: string;
    specialties?: string[];
}>;
//# sourceMappingURL=instructor.schema.d.ts.map