import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: Razorpay | null = null;
  private isMockMode = true;

  constructor(private prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.isMockMode = false;
      this.logger.log('Razorpay initialized in production/test mode with credentials.');
    } else {
      this.logger.warn('No Razorpay credentials found. Running in Payment MOCK/SANDBOX mode.');
    }
  }

  
  async createPaymentSession(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { orders: true }
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.SUCCESS) throw new BadRequestException('Payment already successful');

    let providerOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;

    if (!this.isMockMode && this.razorpay) {
      try {
        const rzpOrder = await this.razorpay.orders.create({
          amount: payment.amountCents,
          currency: payment.currency || 'INR',
          receipt: payment.id,
        });
        providerOrderId = rzpOrder.id;
      } catch (err: any) {
        this.logger.error('Failed to create Razorpay order', err);
        throw new BadRequestException(err?.message || 'Razorpay order creation failed');
      }
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PENDING,
        provider: 'RAZORPAY',
        providerOrderId,
      },
    });

    return {
      data: {
        paymentId: payment.id,
        providerOrderId,
        amount: payment.amountCents,
        currency: payment.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id',
        isMock: this.isMockMode,
      }
    };
  }
  
  async verifyPayment(
    paymentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { orders: true }
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    if (this.isMockMode || razorpayOrderId.startsWith('order_mock_')) {
      this.logger.log(`Verifying mock payment: ${paymentId}`);
    } else {
      if (!process.env.RAZORPAY_KEY_SECRET) throw new BadRequestException('Razorpay secret key not configured');
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(text).digest('hex');
      if (generatedSignature !== razorpaySignature) throw new BadRequestException('Payment signature verification failed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS, providerPaymentId: razorpayPaymentId },
      });

      for (const order of payment.orders) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CONFIRMED },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: OrderStatus.CONFIRMED,
            note: `Payment verified (${updatedPayment.providerPaymentId || 'MOCK'})`,
            createdBy: 'SYSTEM',
          },
        });
      }

      return { updatedPayment };
    });

    return {
      data: {
        success: true,
        paymentId: result.updatedPayment.id,
      }
    };
  }
  
  async handleWebhook(signature: string, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return { status: 'ignored' };

    const generatedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    if (generatedSignature !== signature) throw new BadRequestException('Webhook signature verification failed');

    if (body.event === 'payment.captured' || body.event === 'order.paid') {
      const entity = body.event === 'order.paid' ? body.payload.order.entity : body.payload.payment.entity;
      const providerOrderId = body.event === 'order.paid' ? entity.id : entity.order_id;

      if (providerOrderId) {
        const payment = await this.prisma.payment.findFirst({
          where: { providerOrderId },
          include: { orders: true }
        });

        if (payment && payment.status !== PaymentStatus.SUCCESS) {
          const razorpayPaymentId = body.event === 'payment.captured' ? entity.id : undefined;
          
          await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.SUCCESS,
                providerPaymentId: razorpayPaymentId || payment.providerPaymentId,
              },
            });

            for (const order of payment.orders) {
              await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CONFIRMED },
              });
              await tx.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  status: OrderStatus.CONFIRMED,
                  note: `Payment verified via webhook (${razorpayPaymentId || 'N/A'})`,
                  createdBy: 'SYSTEM',
                },
              });
            }
          });
        }
      }
    }
    return { status: 'ok' };
  }
  async refundPayment(orderId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orders: { some: { id: orderId } } },
      include: { orders: true }
    });
    
    if (!payment) {
      throw new NotFoundException('Payment record not found for this order');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (!this.isMockMode && this.razorpay && payment.providerPaymentId) {
      try {
        await this.razorpay.payments.refund(payment.providerPaymentId, {
          amount: payment.amountCents,
          notes: {
            reason: reason || 'Customer requested refund',
          }
        });
      } catch (err: any) {
        this.logger.error('Razorpay refund failed', err);
        throw new BadRequestException(err?.message || 'Refund failed at payment gateway');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      for (const order of payment.orders) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: order.status,
            note: `Payment refunded: ${reason || 'Admin action'}`,
            createdBy: 'SYSTEM',
          },
        });
      }
    });

    return { success: true };
  }

  async refundPartial(paymentId: string, amountCents: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { orders: true }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (!this.isMockMode && this.razorpay && payment.providerPaymentId) {
      try {
        await this.razorpay.payments.refund(payment.providerPaymentId, {
          amount: amountCents,
          notes: {
            reason: reason || 'Partial refund',
          }
        });
      } catch (err: any) {
        this.logger.error('Razorpay partial refund failed', err);
        throw new BadRequestException(err?.message || 'Refund failed at payment gateway');
      }
    }

    return { success: true };
  }
}
