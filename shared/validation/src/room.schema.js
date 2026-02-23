"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
exports.createRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    location: zod_1.z.string().optional(),
    capacity: zod_1.z
        .number()
        .int('La capacidad debe ser un número entero')
        .positive('La capacidad debe ser positiva')
        .min(1, 'La capacidad mínima es 1')
        .max(100, 'La capacidad máxima es 100'),
});
exports.updateRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    location: zod_1.z.string().optional(),
    capacity: zod_1.z
        .number()
        .int('La capacidad debe ser un número entero')
        .positive('La capacidad debe ser positiva')
        .min(1, 'La capacidad mínima es 1')
        .max(100, 'La capacidad máxima es 100')
        .optional(),
    status: zod_1.z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
});
//# sourceMappingURL=room.schema.js.map