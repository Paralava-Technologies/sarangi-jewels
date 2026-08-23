import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string({ required_error: 'SKU is required' }).min(1, 'SKU cannot be empty'),
  name: z.string({ required_error: 'Variant name is required' }).min(1, 'Variant name cannot be empty'),
  priceCents: z.number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' }).int('Price must be an integer').min(0, 'Price cannot be negative'),
  rentPriceCents: z.number({ invalid_type_error: 'Rent price must be a number' }).int('Rent price must be an integer').min(0, 'Rent price cannot be negative').optional().nullable(),
  stockQuantity: z.number({ invalid_type_error: 'Stock must be a number' }).int('Stock must be an integer').min(0, 'Stock cannot be negative').default(0),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string({ required_error: 'Image URL is required' }).url('Please enter a valid image URL'),
  alt: z.string().optional(),
  sortOrder: z.number({ invalid_type_error: 'Sort order must be a number' }).int('Sort order must be an integer').default(0),
});

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).min(1, 'Product name cannot be empty').max(200, 'Product name is too long'),
  slug: z.string({ required_error: 'Slug is required' }).min(1, 'Slug cannot be empty').max(200, 'Slug is too long').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(5000, 'Description is too long').optional(),
  categoryId: z.string({ required_error: 'Category is required' }).uuid('Please select a valid category'),
  basePriceCents: z.number({ required_error: 'Base price is required', invalid_type_error: 'Price must be a number' }).int('Price must be an integer').min(0, 'Price cannot be negative'),
  rentPriceCents: z.number({ invalid_type_error: 'Rent price must be a number' }).int('Rent price must be an integer').min(0, 'Rent price cannot be negative').optional().nullable(),
  currency: z.string().length(3, 'Currency must be exactly 3 characters').default('INR'),
  material: z.string().max(100, 'Material description is too long').optional(),
  purity: z.string().max(50, 'Purity description is too long').optional(),
  gemstone: z.string().max(100, 'Gemstone description is too long').optional(),
  weightGrams: z.number({ invalid_type_error: 'Weight must be a number' }).positive('Weight must be greater than zero').optional(),
  composition: z.string().max(2000, 'Composition description is too long').optional(),
  sizeAndFit: z.string().max(2000, 'Size and fit description is too long').optional(),
  shippingAndReturns: z.string().max(2000, 'Shipping and returns description is too long').optional(),
  careInstructions: z.string().max(2000, 'Care instructions are too long').optional(),
  hsnCode: z.string().max(20, 'HSN Code is too long').optional(),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(productImageSchema).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createCategorySchema = z.object({
  name: z.string({ required_error: 'Category name is required' }).min(1, 'Category name cannot be empty').max(200, 'Category name is too long'),
  slug: z.string({ required_error: 'Slug is required' }).min(1, 'Slug cannot be empty').max(200, 'Slug is too long').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(5000, 'Description is too long').optional(),
  imageUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  sortOrder: z.number({ invalid_type_error: 'Sort order must be a number' }).int('Sort order must be an integer').default(0),
  taxRatePercentage: z.number({ invalid_type_error: 'Tax rate must be a number' }).min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100').optional(),
  returnPolicy: z.string().max(5000, 'Return policy is too long').optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
