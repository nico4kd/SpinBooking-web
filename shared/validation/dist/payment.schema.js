"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentFiltersSchema = exports.processRefundSchema = void 0;
const zod_1 = require("zod");
exports.processRefundSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
});
exports.paymentFiltersSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'REFUNDED']).optional(),
    method: zod_1.z
        .enum(['ONLINE_MERCADOPAGO', 'IN_PERSON_CASH', 'IN_PERSON_CARD'])
        .optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=payment.schema.js.map