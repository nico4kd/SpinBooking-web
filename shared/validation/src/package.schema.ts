import { z } from 'zod';
import { PackageType, PaymentMethod } from '@spinbooking/types';

export const purchasePackageSchema = z.object({
  type: z.nativeEnum(PackageType, {
    error: 'Tipo de paquete inválido',
  }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    error: 'Método de pago inválido',
  }),
});

export const createPackageSchema = z.object({
  userId: z.string().cuid('ID de usuario inválido'),
  type: z.nativeEnum(PackageType, {
    error: 'Tipo de paquete inválido',
  }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    error: 'Método de pago inválido',
  }),
});
