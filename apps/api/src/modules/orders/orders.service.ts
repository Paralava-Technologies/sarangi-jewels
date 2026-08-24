import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { paginationQuerySchema, placeOrderSchema } from '@noeve/validation';
import type { PlaceOrderInput } from '@noeve/validation';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';

const FULFILLMENT_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.PICKED, OrderStatus.CANCELLED],
  [OrderStatus.PICKED]: [OrderStatus.PACKED],
  [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
};

import * as path from 'path';
import * as fs from 'fs';
const PDFDocument = require('pdfkit');

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private mailService: MailService,
  ) {}

  async listForUser(userId: string, query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);
    const where = { userId };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { lines: true, payment: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    const productIds = Array.from(new Set(orders.flatMap((o) => o.lines.map((l) => l.productId))));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, slug: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedOrders = orders.map((order) => ({
      ...order,
      lines: order.lines.map((line) => {
        const product = productMap.get(line.productId);
        return {
          ...line,
          imageUrl: product?.images[0]?.url || null,
          productSlug: product?.slug || '',
        };
      }),
    }));

    return {
      data: enrichedOrders,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async listAll(query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);
    const status = query.status as OrderStatus | undefined;
    
    const paymentProvider = query.paymentProvider as string | undefined;
    const paymentStatus = query.paymentStatus as string | undefined;
    const deliveryDate = query.deliveryDate as string | undefined;
    const search = query.search as string | undefined;

    const where: any = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (paymentProvider || paymentStatus) {
      where.payment = {};
      if (paymentProvider) where.payment.provider = paymentProvider;
      if (paymentStatus) where.payment.status = paymentStatus;
    }

    if (deliveryDate) {
      const d = new Date(deliveryDate);
      if (!isNaN(d.getTime())) {
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        where.deliveryDate = {
          gte: d,
          lt: nextDay
        };
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          lines: true,
          payment: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              addresses: { where: { isDefault: true }, take: 1 },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getRentals(query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);
    const startDate = query.startDate as string | undefined;
    const endDate = query.endDate as string | undefined;
    const productName = query.productName as string | undefined;
    const category = query.category as string | undefined;

    const where: any = {
      isRental: true,
      order: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] }
      }
    };

    if (startDate || endDate) {
      where.order.createdAt = {};
      if (startDate) where.order.createdAt.gte = new Date(startDate);
      if (endDate) where.order.createdAt.lte = new Date(endDate);
    }
    
    if (productName) {
      where.productName = { contains: productName, mode: 'insensitive' };
    }
    
    // We cannot easily filter by category in orderLine unless we join with Product.
    // The OrderLine only has productId. So we need to fetch products by category first.
    if (category) {
      const productsInCategory = await this.prisma.product.findMany({
        where: { category: { name: { contains: category, mode: 'insensitive' } } },
        select: { id: true }
      });
      where.productId = { in: productsInCategory.map(p => p.id) };
    }

    const [rentalLines, total] = await Promise.all([
      this.prisma.orderLine.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rentStartDate: 'asc' },
      }),
      this.prisma.orderLine.count({
        where
      }),
    ]);

    return {
      data: rentalLines,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getById(id: string, userId?: string) {
    const order = await this.prisma.order.findFirst({
      where: userId ? { id, userId } : { id },
      include: { lines: true, payment: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return { data: order };
  }

  async generateInvoice(id: string, userId?: string): Promise<PDFKit.PDFDocument> {
    const order = await this.prisma.order.findFirst({
      where: userId ? { id, userId } : { id },
      include: { lines: true, user: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const settings = await this.prisma.storeSettings.findFirst();
    const supportEmail = settings?.supportEmail || 'hello@noeve.com';
    const supportPhone = settings?.supportPhone || '+91 98765 43210';
    const storeName = settings?.storeName || 'NOEVE';

    const doc = new PDFDocument({ margin: 50 });

    // Header
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 120 });
    } else {
      doc.fillColor('#8a3744').fontSize(24).font('Helvetica-Bold').text(storeName.toUpperCase(), 50, 50);
    }

    doc
      .fillColor('#444444')
      .fontSize(10)
      .font('Helvetica')
      .text(storeName, 200, 50, { align: 'right' })
      .text('123 Sarangi Jewels Street, Design District', 200, 65, { align: 'right' })
      .text('Kerala, India 682001', 200, 80, { align: 'right' })
      .text(`Email: ${supportEmail} | Phone: ${supportPhone}`, 200, 95, { align: 'right' })
      .text('GSTIN: 32AABCU9603R1ZM', 200, 110, { align: 'right' })
      .moveDown();

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 130).lineTo(550, 130).stroke();

    // Customer & Order Info
    doc
      .fillColor('#444444')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 145)
      .font('Helvetica')
      .text(`Invoice Number: ${order.orderNumber}`, 50, 160)
      .text(`Invoice Date: ${order.createdAt.toLocaleDateString()}`, 50, 175)
      .text(`Status: ${order.status}`, 50, 190);

    const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest';
    doc
      .font('Helvetica-Bold')
      .text('Billed To:', 300, 145)
      .font('Helvetica')
      .text(customerName, 300, 160);
    if (order.user?.email) {
      doc.text(order.user.email, 300, 175);
    }

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 215).lineTo(550, 215).stroke();

    // Items table header
    doc
      .fillColor('#444444')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Item', 50, 230)
      .text('SKU', 180, 230)
      .text('Qty', 260, 230)
      .text('Price', 300, 230)
      .text('CGST', 350, 230)
      .text('SGST', 400, 230)
      .text('IGST', 450, 230)
      .text('Total', 500, 230)
      .moveDown();

    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, 245).lineTo(550, 245).stroke();

    // Items
    let y = 260;
    for (const line of order.lines) {
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(line.productName, 50, y, { width: 120 })
        .text(line.sku, 180, y)
        .text(line.quantity.toString(), 260, y)
        .text((line.unitPriceCents / 100).toFixed(2), 300, y)
        .text((line.cgstCents / 100).toFixed(2), 350, y)
        .text((line.sgstCents / 100).toFixed(2), 400, y)
        .text((line.igstCents / 100).toFixed(2), 450, y)
        .text((line.lineTotalCents / 100).toFixed(2), 500, y);
      y += 20;
    }

    // Totals
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(350, y).lineTo(550, y).stroke();
    y += 10;
    doc.text('Subtotal:', 380, y).text((order.subtotalCents / 100).toFixed(2), 480, y);
    y += 15;
    doc.text('Tax:', 380, y).text((order.taxCents / 100).toFixed(2), 480, y);
    y += 15;
    doc.text('Shipping:', 380, y).text((order.shippingCents / 100).toFixed(2), 480, y);

    if (order.discountCents > 0) {
      y += 15;
      doc.text('Discount:', 380, y).text('-' + (order.discountCents / 100).toFixed(2), 480, y);
    }

    y += 20;
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(350, y - 5)
      .lineTo(550, y - 5)
      .stroke();
    doc
      .fontSize(12)
      .text('Total:', 380, y)
      .text(`${order.currency} ${(order.totalCents / 100).toFixed(2)}`, 480, y);

    // Footer
    const bottom = doc.page.height - 100;
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, bottom).lineTo(550, bottom).stroke();
    doc
      .fillColor('#888888')
      .fontSize(9)
      .font('Helvetica')
      .text(`Thank you for shopping with ${storeName}.`, 50, bottom + 20, { align: 'center' })
      .text(`Returns are accepted within 30 days of purchase with original packaging. For support, email ${supportEmail}.`, 50, bottom + 35, { align: 'center' });

    doc.end();
    return doc;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    actorId: string,
    note?: string,
    trackingNumber?: string,
    carrier?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true } }, payment: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowed = FULFILLMENT_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid status update: An order in '${order.status}' status cannot be directly changed to '${status}'. Please follow the correct fulfillment workflow.`
      );
    }

    if (status === OrderStatus.DELIVERED) {
      if (order.payment?.status !== 'SUCCESS') {
        throw new BadRequestException('Cannot mark order as DELIVERED unless payment is SUCCESS (collected or settled).');
      }
      if (!order.deliveryDate) {
        throw new BadRequestException('Final Delivery Date must be updated before marking the order as DELIVERED.');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          trackingNumber: trackingNumber ?? order.trackingNumber,
          carrier: carrier ?? order.carrier,
        },
        include: { lines: true, statusHistory: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note,
          createdBy: actorId,
        },
      });

      return result;
    });

    if (order.user?.email) {
      this.mailService
        .sendOrderStatusUpdate(
          order.user.email,
          updated.orderNumber,
          status,
          updated.trackingNumber || undefined,
          updated.carrier || undefined,
        )
        .catch(console.error);
    }

    return { data: updated };
  }

  async updateDeliveryDate(orderId: string, deliveryDate: Date | null) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryDate }
    });

    return { data: updated };
  }

  
  
  async createFromCart(userId: string, sessionId: string | undefined, input: PlaceOrderInput) {
    const { note } = placeOrderSchema.parse(input);
    if (sessionId) await this.cart.mergeSessionToUser(userId, sessionId);

    const cart = await this.cart.getCartForCheckout(userId);
    if (!cart) throw new BadRequestException('Cart is empty');

    for (const line of cart.lines) {
      if (line.variant && line.variant.stockQuantity < line.quantity) {
        throw new BadRequestException(`Insufficient stock for ${line.product.name}`);
      }
    }

    const storeSettings = await this.prisma.storeSettings.findFirst();
    const defaultTaxRate = storeSettings ? storeSettings.taxRatePercentage / 100 : 0.18;
    const storeState = storeSettings?.storeState || 'Kerala';

    const userWithAddress = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: { where: { isDefault: true }, take: 1 } }
    });
    const destState = userWithAddress?.addresses?.[0]?.state || storeState;
    const isInterState = destState.toLowerCase() !== storeState.toLowerCase();

    const hsnCodes = [...new Set(cart.lines.map(l => l.product.hsnCode).filter(Boolean) as string[])];
    const taxRules = await this.prisma.taxRule.findMany({ where: { hsnCode: { in: hsnCodes } } });
    const taxRuleMap = new Map(taxRules.map(tr => [tr.hsnCode, tr]));

    const retailLines = cart.lines.filter(l => !l.isRental);
    const rentalLines = cart.lines.filter(l => l.isRental);
    const splitLines = [
      { type: 'RETAIL', lines: retailLines },
      { type: 'RENTAL', lines: rentalLines }
    ].filter(s => s.lines.length > 0);

    const isCod = (input as any).paymentMethod === 'COD' && storeSettings?.codAllowed;
    const initialStatus = isCod ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT;
    const shippingThresholdCents = storeSettings ? storeSettings.shippingThresholdCents : 1500000;
    const shippingRateCentsFallback = storeSettings ? storeSettings.shippingRateCents : 100000;
    const maxDeposit = storeSettings?.maxRentalDepositCents ?? 500000;

    const ordersToCreate = splitLines.map((group, index) => {
      let taxCents = 0;
      let depositCents = 0;

      const orderLines = group.lines.map((line) => {
        const unitPriceCents = line.variant?.priceCents ?? line.product.basePriceCents;
        const lineTotalCents = unitPriceCents * line.quantity;
        let cgst = 0, sgst = 0, igst = 0;
        const rule = line.product.hsnCode ? taxRuleMap.get(line.product.hsnCode) : null;

        if (rule) {
          if (isInterState) {
            igst = Math.round(lineTotalCents * (rule.igstPercentage / 100));
            taxCents += igst;
          } else {
            cgst = Math.round(lineTotalCents * (rule.cgstPercentage / 100));
            sgst = Math.round(lineTotalCents * (rule.sgstPercentage / 100));
            taxCents += (cgst + sgst);
          }
        } else {
          const catTaxRate = line.product.category?.taxRatePercentage;
          const rateToUse = catTaxRate !== null && catTaxRate !== undefined ? catTaxRate / 100 : defaultTaxRate;
          const fallbackTax = Math.round(lineTotalCents * rateToUse);
          taxCents += fallbackTax;
          if (isInterState) igst = fallbackTax;
          else { cgst = Math.round(fallbackTax / 2); sgst = fallbackTax - cgst; }
        }
        
        let lDeposit = 0;
        if (line.isRental) {
          const itemDeposit = line.variant?.rentalDepositCents ?? line.product.rentalDepositCents ?? 0;
          lDeposit = itemDeposit * line.quantity;
          depositCents += lDeposit;
        }

        return {
          productId: line.productId,
          variantId: line.variantId,
          productName: line.product.name,
          sku: line.variant?.sku ?? line.product.slug,
          quantity: line.quantity,
          unitPriceCents,
          lineTotalCents,
          cgstCents: cgst,
          sgstCents: sgst,
          igstCents: igst,
          isRental: line.isRental || false,
          depositCents: lDeposit,
          rentStartDate: line.rentStartDate || null,
          rentEndDate: line.rentEndDate || null
        };
      });

      const subtotalCents = orderLines.reduce((sum, l) => sum + l.lineTotalCents, 0);
      let shippingCents = 0;
      
      const isRentalOrder = group.type === 'RENTAL';
      const orderDeliveryMethod = isRentalOrder 
        ? ((input as any).rentalDeliveryMethod || (input as any).deliveryMethod) 
        : ((input as any).retailDeliveryMethod || (input as any).deliveryMethod);
      
      const cartSubtotal = cart.lines.reduce((s, l) => s + ((l.variant?.priceCents ?? l.product.basePriceCents) * l.quantity), 0);
      
      // Calculate shipping. If this order is online delivery and no previous order was charged shipping, charge it here.
      if (orderDeliveryMethod !== 'STORE_PICKUP' && cartSubtotal < shippingThresholdCents) {
        // Find if any prior order was already charged shipping
        const priorShipping = index > 0 && splitLines.slice(0, index).some((_, i) => {
           const pRental = splitLines[i].type === 'RENTAL';
           const pMethod = pRental ? ((input as any).rentalDeliveryMethod || (input as any).deliveryMethod) : ((input as any).retailDeliveryMethod || (input as any).deliveryMethod);
           return pMethod !== 'STORE_PICKUP';
        });
        if (!priorShipping) {
          shippingCents = shippingRateCentsFallback;
        }
      }
      
      if (depositCents > maxDeposit) depositCents = maxDeposit;
      const discountCents = index === 0 ? ((input as any).discountCents || 0) : 0;
      const totalCents = Math.max(0, subtotalCents + shippingCents + taxCents + depositCents - discountCents);
      const orderNumber = `NV-${Date.now().toString(36).toUpperCase()}-${index + 1}`;

      return {
        orderNumber,
        userId,
        status: initialStatus,
        subtotalCents,
        shippingCents,
        taxCents,
        discountCents,
        depositCents,
        totalCents,
        isPickup: orderDeliveryMethod === 'STORE_PICKUP',
        currency: cart.lines[0]?.product.currency ?? 'INR',
        promotionCode: index === 0 ? (input as any).promotionCode : null,
        lines: { create: orderLines },
        statusHistory: {
          create: {
            status: initialStatus,
            note: note ?? (isCod ? 'Order placed with Cash on Delivery' : 'Order placed'),
            createdBy: userId,
          }
        }
      };
    });

    const totalPaymentCents = ordersToCreate.reduce((sum, o) => sum + o.totalCents, 0);
    const currency = ordersToCreate[0]?.currency ?? 'INR';

    const result = await this.prisma.$transaction(async (tx) => {
      const createdOrders = [];
      for (const oData of ordersToCreate) {
        createdOrders.push(await tx.order.create({ data: oData, include: { lines: true } }));
      }

      const payment = await tx.payment.create({
        data: {
          amountCents: totalPaymentCents,
          currency,
          status: 'PENDING',
          provider: isCod ? 'COD' : 'RAZORPAY',
          orders: { connect: createdOrders.map(o => ({ id: o.id })) }
        }
      });

      for (const line of cart.lines) {
        if (line.variantId) {
          await tx.productVariant.update({
            where: { id: line.variantId },
            data: { stockQuantity: { decrement: line.quantity } },
          });
        }
      }

      await tx.cartLine.deleteMany({ where: { cartId: cart.id } });
      return { orders: createdOrders, payment };
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    
    if (user?.email) {
      for (const order of result.orders) {
        const formattedTotal = (order.totalCents / 100).toLocaleString('en-IN', { style: 'currency', currency: order.currency, maximumFractionDigits: 0 });
        this.mailService.sendOrderConfirmation(user.email, order.orderNumber, formattedTotal).catch(console.error);
      }
    }

    return { data: { orders: result.orders, paymentId: result.payment.id } };
  }

  // --- PROMOTIONS ---
  async listPromotions(query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count(),
    ]);

    return {
      data: promotions,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async createPromotion(data: {
    code: string;
    description?: string;
    discountPercentage?: number;
    discountCents?: number;
    minOrderValue?: number;
  }) {
    const promo = await this.prisma.promotion.create({ data });
    return { data: promo };
  }

  async deletePromotion(id: string) {
    await this.prisma.promotion.delete({ where: { id } });
    return { success: true };
  }

  async validatePromotion(code: string, cartTotalCents: number) {
    const promotion = await this.prisma.promotion.findUnique({ where: { code } });
    if (!promotion || !promotion.isActive) throw new BadRequestException('Invalid or expired promotion code');
    if (promotion.expiresAt && new Date(promotion.expiresAt) < new Date()) throw new BadRequestException('Promotion has expired');
    if (promotion.minOrderValue && cartTotalCents < promotion.minOrderValue) {
      throw new BadRequestException(`Minimum order value of ${(promotion.minOrderValue / 100).toFixed(2)} required for this promotion`);
    }

    let discountCents = 0;
    if (promotion.discountCents) {
      discountCents = promotion.discountCents;
    } else if (promotion.discountPercentage) {
      discountCents = Math.round(cartTotalCents * (promotion.discountPercentage / 100));
    }

    return { discountCents, code: promotion.code };
  }

  async changeToCod(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order is not in a pending payment state');
    }

    const settings = await this.prisma.storeSettings.findFirst();
    if (!settings?.codAllowed) {
      throw new BadRequestException('Cash on Delivery is not allowed');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        statusHistory: {
          create: {
            status: OrderStatus.CONFIRMED,
            note: 'Payment method changed to Cash on Delivery',
            createdBy: userId,
          },
        },
      },
      include: { lines: true, statusHistory: true, payment: true },
    });

    if (updated.paymentId) {
      await this.prisma.payment.update({
        where: { id: updated.paymentId },
        data: {
          provider: 'COD',
          status: 'PENDING',
        }
      });
    }

    return updated;

    return updated;
  }
}
