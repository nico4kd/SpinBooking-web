import { z } from 'zod';
import { PackageType, PaymentMethod } from '@spinbooking/types';
export declare const purchasePackageSchema: z.ZodObject<{
    type: z.ZodEnum<typeof PackageType>;
    paymentMethod: z.ZodEnum<typeof PaymentMethod>;
}, z.core.$strip>;
export declare const createPackageSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<typeof PackageType>;
    paymentMethod: z.ZodEnum<typeof PaymentMethod>;
}, z.core.$strip>;
//# sourceMappingURL=package.schema.d.ts.map