import { z } from 'zod';
export declare const joinWaitlistSchema: z.ZodObject<{
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    classId?: string;
}, {
    classId?: string;
}>;
export declare const acceptWaitlistSchema: z.ZodObject<{
    bikeNumber: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    bikeNumber?: number;
}, {
    bikeNumber?: number;
}>;
//# sourceMappingURL=waitlist.schema.d.ts.map