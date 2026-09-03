import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductStatus } from '@prisma/client';
import { addToCartSchema, updateCartLineSchema } from '@sarangi/validation';
import type { AddToCartInput, UpdateCartLineInput } from '@sarangi/validation';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';

export interface CartContext {
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  async getOrCreateSession(): Promise<string> {
    return randomUUID();
  }

  private async resolveCart(ctx: CartContext) {
    if (ctx.userId) {
      let cart = await this.prisma.cart.findUnique({ where: { userId: ctx.userId } });
      if (!cart) {
        cart = await this.prisma.cart.create({ data: { userId: ctx.userId } });
      }
      return cart;
    }

    if (!ctx.sessionId) {
      throw new BadRequestException('Cart session required');
    }

    let cart = await this.prisma.cart.findUnique({ where: { sessionId: ctx.sessionId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { sessionId: ctx.sessionId } });
    }
    return cart;
  }

  async getCart(ctx: CartContext) {
    if (!ctx.userId && !ctx.sessionId) {
      return {
        data: {
          id: null,
          sessionId: null,
          lines: [],
          subtotalCents: 0,
          itemCount: 0,
          currency: 'INR',
        },
      };
    }
    const cart = await this.resolveCart(ctx);
    return this.formatCart(cart.id);
  }

  async addItem(ctx: CartContext, input: AddToCartInput) {
    const data = addToCartSchema.parse(input);
    const cart = await this.resolveCart(ctx);

    const product = await this.prisma.product.findFirst({
      where: { id: data.productId, status: ProductStatus.ACTIVE },
      include: { variants: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let variantId: string | null = data.variantId ?? null;
    let variant: any = null;

    if (variantId) {
      variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        throw new NotFoundException('Variant not found');
      }
      if (variant.stockQuantity < data.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    } else if (product.variants.length === 1) {
      variant = product.variants[0];
      variantId = variant.id;
      if (variant.stockQuantity < data.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    } else if (product.variants.length > 1) {
      throw new BadRequestException('Please select a variant');
    }

    const isRental = data.isRental ?? false;
    const rentStartDate = data.rentStartDate ? new Date(data.rentStartDate) : null;
    const rentEndDate = data.rentEndDate ? new Date(data.rentEndDate) : null;

    if (isRental && rentStartDate && rentEndDate && variant) {
      // Calendar based inventory blocking
      const overlappingRentals = await this.prisma.orderLine.findMany({
        where: {
          variantId,
          isRental: true,
          order: {
            status: { notIn: ['CANCELLED', 'REFUNDED'] }
          },
          rentStartDate: { lte: rentEndDate },
          rentEndDate: { gte: rentStartDate }
        }
      });
      const rentedQuantity = overlappingRentals.reduce((sum, line) => sum + line.quantity, 0);
      
      if (variant.stockQuantity - rentedQuantity < data.quantity) {
        throw new BadRequestException(`Item is fully booked for these dates (Available: ${Math.max(0, variant.stockQuantity - rentedQuantity)})`);
      }
    }

    const existing = await this.prisma.cartLine.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId,
        isRental,
        rentStartDate,
        rentEndDate,
      },
    });

    if (existing) {
      if (variant && variant.stockQuantity < existing.quantity + data.quantity) {
        throw new BadRequestException('Insufficient stock to add more of this item');
      }
      await this.prisma.cartLine.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity },
      });
    } else {
      await this.prisma.cartLine.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId,
          quantity: data.quantity,
          isRental,
          rentStartDate,
          rentEndDate,
        },
      });
    }

    return this.formatCart(cart.id);
  }

  async updateLine(ctx: CartContext, lineId: string, input: UpdateCartLineInput) {
    const { quantity } = updateCartLineSchema.parse(input);
    const cart = await this.resolveCart(ctx);

    const line = await this.prisma.cartLine.findFirst({
      where: { id: lineId, cartId: cart.id },
      include: { variant: true },
    });
    if (!line) {
      throw new NotFoundException('Cart line not found');
    }

    if (line.variant && line.variant.stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock for requested quantity');
    }

    await this.prisma.cartLine.update({
      where: { id: lineId },
      data: { quantity },
    });

    return this.formatCart(cart.id);
  }

  async removeLine(ctx: CartContext, lineId: string) {
    const cart = await this.resolveCart(ctx);
    const line = await this.prisma.cartLine.findFirst({
      where: { id: lineId, cartId: cart.id },
    });
    if (!line) {
      throw new NotFoundException('Cart line not found');
    }
    await this.prisma.cartLine.delete({ where: { id: lineId } });
    return this.formatCart(cart.id);
  }

  async clearCart(ctx: CartContext) {
    const cart = await this.resolveCart(ctx);
    await this.prisma.cartLine.deleteMany({ where: { cartId: cart.id } });
    return this.formatCart(cart.id);
  }

  /** Merge guest session cart lines into the authenticated user's cart. */
  async mergeSessionToUser(userId: string, sessionId: string) {
    const sessionCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { lines: true },
    });
    if (!sessionCart || sessionCart.lines.length === 0) {
      return;
    }

    const userCart = await this.resolveCart({ userId });

    for (const line of sessionCart.lines) {
      const existing = await this.prisma.cartLine.findFirst({
        where: {
          cartId: userCart.id,
          productId: line.productId,
          variantId: line.variantId,
        },
      });

      if (existing) {
        await this.prisma.cartLine.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + line.quantity },
        });
      } else {
        await this.prisma.cartLine.create({
          data: {
            cartId: userCart.id,
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          },
        });
      }
    }

    await this.prisma.cartLine.deleteMany({ where: { cartId: sessionCart.id } });
    await this.prisma.cart.delete({ where: { id: sessionCart.id } });
  }

  async getCartForCheckout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        lines: {
          include: {
            product: {
              include: { category: true }
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.lines.length === 0) {
      return null;
    }

    return cart;
  }

  private async formatCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        lines: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
            },
            variant: true,
          },
          orderBy: { id: 'asc' },
        },
        user: {
          include: { addresses: { where: { isDefault: true }, take: 1 } }
        }
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const storeSettings = await this.prisma.storeSettings.findFirst();
    const defaultTaxRate = storeSettings ? storeSettings.taxRatePercentage / 100 : 0.18;
    const storeState = storeSettings?.storeState || 'Kerala';
    const destState = cart.user?.addresses?.[0]?.state || storeState;
    const isInterState = destState.toLowerCase() !== storeState.toLowerCase();

    const hsnCodes = [...new Set(cart.lines.map(l => l.product.hsnCode).filter(Boolean) as string[])];
    const taxRules = await this.prisma.taxRule.findMany({ where: { hsnCode: { in: hsnCodes } } });
    const taxRuleMap = new Map(taxRules.map(tr => [tr.hsnCode, tr]));

    let taxCents = 0;
    let cgstCents = 0, sgstCents = 0, igstCents = 0;
    let depositCents = 0;

    const lines = cart.lines.map((line) => {
      let unitPriceCents = line.variant?.priceCents ?? line.product.basePriceCents;
      let rentalDays = 0;
      if (line.isRental && line.rentStartDate && line.rentEndDate) {
        rentalDays = Math.ceil((line.rentEndDate.getTime() - line.rentStartDate.getTime()) / (1000 * 60 * 60 * 24));
        if (rentalDays < 1) rentalDays = 1;
        const dailyRentPriceCents = line.variant?.rentPriceCents ?? line.product.rentPriceCents ?? Math.round(unitPriceCents * 0.1);
        unitPriceCents = dailyRentPriceCents * rentalDays;
      }
      const lineTotalCents = unitPriceCents * line.quantity;

      let lCgst = 0, lSgst = 0, lIgst = 0;
      const rule = line.product.hsnCode ? taxRuleMap.get(line.product.hsnCode) : null;

      if (rule) {
        if (isInterState) {
          lIgst = Math.round(lineTotalCents * (rule.igstPercentage / 100));
          taxCents += lIgst;
          igstCents += lIgst;
        } else {
          lCgst = Math.round(lineTotalCents * (rule.cgstPercentage / 100));
          lSgst = Math.round(lineTotalCents * (rule.sgstPercentage / 100));
          taxCents += (lCgst + lSgst);
          cgstCents += lCgst;
          sgstCents += lSgst;
        }
      } else {
        const catTaxRate = line.product.category?.taxRatePercentage;
        const rateToUse = catTaxRate !== null && catTaxRate !== undefined ? catTaxRate / 100 : defaultTaxRate;
        const fallbackTax = Math.round(lineTotalCents * rateToUse);
        taxCents += fallbackTax;
        
        if (isInterState) {
          lIgst = fallbackTax;
          igstCents += lIgst;
        } else {
          lCgst = Math.round(fallbackTax / 2);
          lSgst = fallbackTax - lCgst;
          cgstCents += lCgst;
          sgstCents += lSgst;
        }
      }
      
      let lDeposit = 0;
      if (line.isRental) {
        const itemDeposit = line.variant?.rentalDepositCents ?? line.product.rentalDepositCents ?? 0;
        lDeposit = itemDeposit * line.quantity;
        depositCents += lDeposit;
      }

      return {
        id: line.id,
        quantity: line.quantity,
        productId: line.productId,
        variantId: line.variantId,
        productName: line.product.name,
        productSlug: line.product.slug,
        sku: line.variant?.sku ?? line.product.slug,
        imageUrl: line.product.images[0]?.url ?? null,
        unitPriceCents,
        lineTotalCents,
        currency: line.product.currency,
        cgstCents: lCgst,
        sgstCents: lSgst,
        igstCents: lIgst,
        isRental: line.isRental,
        depositCents: lDeposit,
        rentStartDate: line.rentStartDate?.toISOString() ?? null,
        rentEndDate: line.rentEndDate?.toISOString() ?? null,
        rentalDays: line.isRental ? rentalDays : undefined,
      };
    });

    const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

    const shippingThresholdCents = storeSettings ? storeSettings.shippingThresholdCents : 1500000;
    const shippingRateCentsFallback = storeSettings ? storeSettings.shippingRateCents : 100000;
    const shippingCents = (subtotalCents > 0 && subtotalCents < shippingThresholdCents) ? shippingRateCentsFallback : 0;
    
    const maxDeposit = storeSettings?.maxRentalDepositCents ?? 500000;
    if (depositCents > maxDeposit) {
      depositCents = maxDeposit;
    }
    
    const totalCents = subtotalCents + taxCents + shippingCents + depositCents;

    return {
      data: {
        id: cart.id,
        sessionId: cart.sessionId,
        lines,
        subtotalCents,
        taxCents,
        shippingCents,
        cgstCents,
        sgstCents,
        igstCents,
        depositCents,
        totalCents,
        itemCount,
        currency: lines[0]?.currency ?? 'INR',
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAbandonedCarts() {
    this.logger.log('Running abandoned cart recovery job...');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const abandonedCarts = await this.prisma.cart.findMany({
      where: {
        updatedAt: {
          lte: oneDayAgo,
          gt: twoDaysAgo,
        },
        userId: {
          not: null,
        },
      },
      include: {
        user: true,
        lines: true,
      },
    });

    if (abandonedCarts.length === 0) {
      this.logger.log('No abandoned carts found.');
      return;
    }

    this.logger.log(`Found ${abandonedCarts.length} abandoned carts. Sending recovery emails.`);

    for (const cart of abandonedCarts) {
      if (cart.lines.length === 0 || !cart.user?.email) continue;
      
      const cartUrl = `${process.env.STORE_URL || 'http://localhost:3000'}/cart`;
      await this.emailQueue.add('abandoned-cart', {
        email: cart.user.email,
        cartUrl,
      });
    }
  }
}
