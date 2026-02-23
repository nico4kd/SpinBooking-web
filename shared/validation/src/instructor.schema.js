"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstructorSchema = exports.createInstructorSchema = void 0;
const zod_1 = require("zod");
exports.createInstructorSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid('ID de usuario inválido'),
    bio: zod_1.z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional(),
    photoUrl: zod_1.z.string().url('URL de foto inválida').optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateInstructorSchema = zod_1.z.object({
    bio: zod_1.z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional(),
    photoUrl: zod_1.z.string().url('URL de foto inválida').optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
//# sourceMappingURL=instructor.schema.js.map