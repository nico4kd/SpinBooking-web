import { z } from 'zod';
import { PackageType, PaymentMethod } from '@spinbooking/types';
export declare const purchasePackageSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof PackageType>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
}, "strip", z.ZodTypeAny, {
    type?: PackageType;
    paymentMethod?: PaymentMethod;
}, {
    type?: PackageType;
    paymentMethod?: PaymentMethod;
}>;
export declare const createPackageSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodNativeEnum<typeof PackageType>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
}, "strip", z.ZodTypeAny, {
    type?: PackageType;
    userId?: string;
    paymentMethod?: PaymentMethod;
}, {
    type?: PackageType;
    userId?: string;
    paymentMethod?: PaymentMethod;
}>;
//# sourceMappingURL=package.schema.d.ts.map