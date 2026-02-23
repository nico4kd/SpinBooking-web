import { z } from 'zod';
export declare const processRefundSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
}, {
    reason?: string;
}>;
export declare const paymentFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PROCESSING", "APPROVED", "REJECTED", "REFUNDED"]>>;
    method: z.ZodOptional<z.ZodEnum<["ONLINE_MERCADOPAGO", "IN_PERSON_CASH", "IN_PERSON_CARD"]>>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "REFUNDED" | "PROCESSING" | "APPROVED" | "REJECTED";
    method?: "ONLINE_MERCADOPAGO" | "IN_PERSON_CASH" | "IN_PERSON_CARD";
    startDate?: Date;
    endDate?: Date;
}, {
    status?: "PENDING" | "REFUNDED" | "PROCESSING" | "APPROVED" | "REJECTED";
    method?: "ONLINE_MERCADOPAGO" | "IN_PERSON_CASH" | "IN_PERSON_CARD";
    startDate?: Date;
    endDate?: Date;
}>;
//# sourceMappingURL=payment.schema.d.ts.map