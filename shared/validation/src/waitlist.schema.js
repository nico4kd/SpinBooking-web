"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptWaitlistSchema = exports.joinWaitlistSchema = void 0;
const zod_1 = require("zod");
exports.joinWaitlistSchema = zod_1.z.object({
    classId: zod_1.z.string().cuid('ID de clase inválido'),
});
exports.acceptWaitlistSchema = zod_1.z.object({
    bikeNumber: zod_1.z
        .number()
        .int('El número de bici debe ser un entero')
        .positive('El número de bici debe ser positivo')
        .optional(),
});
//# sourceMappingURL=waitlist.schema.js.map