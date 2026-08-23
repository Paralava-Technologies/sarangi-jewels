export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  returnPolicy?: string | null;
  taxRatePercentage?: number | null;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  compareAtPriceCents?: number;
  stockQuantity?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePriceCents: number;
  compareAtPriceCents?: number;
  currency: string;
  material: string | null;
  purity: string | null;
  gemstone: string | null;
  weightGrams: number | null;
  composition?: string | null;
  sizeAndFit?: string | null;
  shippingAndReturns?: string | null;
  careInstructions: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
  reviews?: { rating: number }[];
}
