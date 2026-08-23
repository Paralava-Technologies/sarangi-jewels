import { z } from 'zod';

export const placeOrderSchema = z.object({
  note: z.string().max(500, 'Note is too long (maximum 500 characters)').optional(),
  promotionCode: z.string().optional(),
  discountCents: z.number({ invalid_type_error: 'Discount must be a number' }).int('Discount must be an integer').min(0, 'Discount cannot be negative').optional(),
  paymentMethod: z.enum(['ONLINE', 'COD']).optional(),
  deliveryMethod: z.enum(['ONLINE_DELIVERY', 'STORE_PICKUP']).optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
