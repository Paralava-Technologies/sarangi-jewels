const fs = require('fs');
const filePath = 'apps/api/src/modules/payments/payments.service.ts';
let code = fs.readFileSync(filePath, 'utf8');

const createStart = code.indexOf('async createPaymentSession(');
const verifyStart = code.indexOf('async verifyPayment(');
const webhookStart = code.indexOf('async handleWebhook(');

if (createStart !== -1 && verifyStart !== -1) {
  const newCreate = `
  async createPaymentSession(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { orders: true }
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.SUCCESS) throw new BadRequestException('Payment already successful');

    let providerOrderId = \`order_mock_\${Math.random().toString(36).substring(2, 15)}\`;

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

    const updatedPayment = await this.prisma.payment.update({
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
  `;

  const newVerify = `
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
      this.logger.log(\`Verifying mock payment: \${paymentId}\`);
    } else {
      if (!process.env.RAZORPAY_KEY_SECRET) throw new BadRequestException('Razorpay secret key not configured');
      const text = \`\${razorpayOrderId}|\${razorpayPaymentId}\`;
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
            note: \`Payment verified (\${updatedPayment.providerPaymentId || 'MOCK'})\`,
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
  `;

  // Note: For webhook, we should also update it to support the new schema.
  const newWebhook = `
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
                  note: \`Payment verified via webhook (\${razorpayPaymentId || 'N/A'})\`,
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
  `;
  
  const refundStart = code.indexOf('async refundPayment(');

  const updatedCode = code.substring(0, createStart) + newCreate + newVerify + newWebhook + code.substring(refundStart);
  fs.writeFileSync(filePath, updatedCode);
  console.log('payments.service.ts updated.');
}
