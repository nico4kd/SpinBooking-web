import { z } from 'zod';
export declare const processRefundSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const paymentFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        REFUNDED: "REFUNDED";
    }>>;
    method: z.ZodOptional<z.ZodEnum<{
        ONLINE_MERCADOPAGO: "ONLINE_MERCADOPAGO";
        IN_PERSON_CASH: "IN_PERSON_CASH";
        IN_PERSON_CARD: "IN_PERSON_CARD";
    }>>;
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=payment.schema.d.ts.map