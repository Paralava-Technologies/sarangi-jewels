import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, ReviewStatus } from '@prisma/client';
import { createProductSchema, updateProductSchema, createCategorySchema, updateCategorySchema } from '@noeve/validation';
import type { CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput } from '@noeve/validation';
import { paginationQuerySchema } from '@noeve/validation';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listCategories(query: Record<string, unknown> = {}) {
    const { page, pageSize } = paginationQuerySchema.parse(query);
    
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.category.count(),
    ]);
    
    return { 
      data: categories,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createCategory(input: CreateCategoryInput) {
    const data = createCategorySchema.parse(input);
    const category = await this.prisma.category.create({ data: { ...data, imageUrl: data.imageUrl || null } });
    return { data: category };
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const data = updateCategorySchema.parse(input);
    const category = await this.prisma.category.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || null } });
    return { data: category };
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async listProducts(query: Record<string, unknown>, activeOnly = true) {
    const { page, pageSize } = paginationQuerySchema.parse(query);
    let where: any = activeOnly ? { status: ProductStatus.ACTIVE } : {};

    if (query.category) {
      where.category = { slug: query.category as string };
    }

    if (query.recommendationsFor) {
      const sourceProduct = await this.prisma.product.findUnique({
        where: { id: query.recommendationsFor as string },
      });
      if (sourceProduct) {
        where.categoryId = sourceProduct.categoryId;
        where.id = { not: sourceProduct.id };
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: true, reviews: { where: { status: ReviewStatus.APPROVED }, select: { rating: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: query.sort === 'popular' ? { viewCount: 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: true, reviews: { where: { status: ReviewStatus.APPROVED }, select: { rating: true } } },
    });
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }
    
    // Increment view count asynchronously
    this.prisma.product.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    return { data: product };
  }

  async createProduct(input: CreateProductInput) {
    const { images, variants, ...data } = createProductSchema.parse(input);
    const product = await this.prisma.product.create({
      data: {
        ...data,
        status: ProductStatus.ACTIVE,
        images: images?.length ? { create: images } : undefined,
        variants: variants?.length ? { create: variants } : undefined,
      },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    });
    return { data: product };
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const { images, variants, ...data } = updateProductSchema.parse(input);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        status: ProductStatus.ACTIVE,
        images: images ? { deleteMany: {}, create: images } : undefined,
        variants: variants ? {
          deleteMany: { id: { notIn: variants.map((v: any) => v.id).filter(Boolean) as string[] } },
          upsert: variants.map((v: any) => ({
            where: { id: v.id || 'new' },
            update: { sku: v.sku, name: v.name, priceCents: v.priceCents, rentPriceCents: v.rentPriceCents, rentalDepositCents: v.rentalDepositCents, stockQuantity: v.stockQuantity },
            create: { sku: v.sku, name: v.name, priceCents: v.priceCents, rentPriceCents: v.rentPriceCents, rentalDepositCents: v.rentalDepositCents, stockQuantity: v.stockQuantity },
          }))
        } : undefined,
      },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    });
    return { data: product };
  }

  async deleteProduct(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
