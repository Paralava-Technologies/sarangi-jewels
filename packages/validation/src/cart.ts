import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid Product ID format'),
  variantId: z.string().uuid('Invalid Variant ID format').optional(),
  quantity: z.coerce.number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' }).int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99').default(1),
  isRental: z.boolean().optional(),
  rentStartDate: z.string().optional(),
  rentEndDate: z.string().optional(),
});

export const updateCartLineSchema = z.object({
  quantity: z.coerce.number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' }).int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartLineInput = z.infer<typeof updateCartLineSchema>;
