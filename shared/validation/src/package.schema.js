"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackageSchema = exports.purchasePackageSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("@spinbooking/types");
exports.purchasePackageSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(types_1.PackageType, {
        errorMap: () => ({ message: 'Tipo de paquete inválido' }),
    }),
    paymentMethod: zod_1.z.nativeEnum(types_1.PaymentMethod, {
        errorMap: () => ({ message: 'Método de pago inválido' }),
    }),
});
exports.createPackageSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid('ID de usuario inválido'),
    type: zod_1.z.nativeEnum(types_1.PackageType, {
        errorMap: () => ({ message: 'Tipo de paquete inválido' }),
    }),
    paymentMethod: zod_1.z.nativeEnum(types_1.PaymentMethod, {
        errorMap: () => ({ message: 'Método de pago inválido' }),
    }),
});
//# sourceMappingURL=package.schema.js.map