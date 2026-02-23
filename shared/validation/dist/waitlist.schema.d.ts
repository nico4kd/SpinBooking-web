import { z } from 'zod';
export declare const joinWaitlistSchema: z.ZodObject<{
    classId: z.ZodString;
}, z.core.$strip>;
export declare const acceptWaitlistSchema: z.ZodObject<{
    bikeNumber: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=waitlist.schema.d.ts.map