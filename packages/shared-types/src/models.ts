import type { OrderStatus, ProductStatus, UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: string;
  idVerificationStatus?: string | null;
  idDocumentUrl?: string | null;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  taxRatePercentage?: number | null;
  returnPolicy?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  categoryId: string;
  isRental: boolean;
  category?: Category;
  basePriceCents: number;
  rentPriceCents?: number | null;
  rentalDepositCents?: number | null;
  currency: string;
  material: string | null;
  purity: string | null;
  gemstone: string | null;
  weightGrams: number | null;
  composition: string | null;
  sizeAndFit: string | null;
  shippingAndReturns: string | null;
  careInstructions: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  rentPriceCents?: number | null;
  rentalDepositCents?: number | null;
  stockQuantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents?: number;
  depositCents?: number;
  totalCents: number;
  currency: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  lines: OrderLine[];
  user?: User & { addresses?: Address[] };
  createdAt: string;
  updatedAt: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  imageUrl?: string | null;
  productSlug?: string;
  isRental?: boolean;
  depositCents?: number;
  rentStartDate?: string | null;
  rentEndDate?: string | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  sku: string;
  imageUrl: string | null;
  unitPriceCents: number;
  lineTotalCents: number;
  currency: string;
  isRental?: boolean;
  depositCents?: number;
  rentStartDate?: string | null;
  rentEndDate?: string | null;
}

export interface Cart {
  id: string | null;
  sessionId: string | null;
  lines: CartLine[];
  subtotalCents: number;
  itemCount: number;
  currency: string;
  taxCents?: number;
  shippingCents?: number;
  cgstCents?: number;
  sgstCents?: number;
  igstCents?: number;
  depositCents?: number;
  totalCents?: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  basePriceCents: number;
  currency: string;
  imageUrl: string | null;
  createdAt: string;
}

