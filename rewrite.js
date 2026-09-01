const fs = require('fs');
const filePath = 'apps/api/src/modules/orders/orders.service.ts';
let code = fs.readFileSync(filePath, 'utf8');

const startIdx = code.indexOf('async createFromCart(');
const endIdx = code.indexOf('// --- PROMOTIONS ---');

if (startIdx !== -1 && endIdx !== -1) {
  const newCreateFromCart = `
  async createFromCart(userId: string, sessionId: string | undefined, input: PlaceOrderInput) {
    const { note } = placeOrderSchema.parse(input);
    if (sessionId) await this.cart.mergeSessionToUser(userId, sessionId);

    const cart = await this.cart.getCartForCheckout(userId);
    if (!cart) throw new BadRequestException('Cart is empty');

    for (const line of cart.lines) {
      if (line.variant && line.variant.stockQuantity < line.quantity) {
        throw new BadRequestException(\`Insufficient stock for \${line.product.name}\`);
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
      
      const cartSubtotal = cart.lines.reduce((s, l) => s + ((l.variant?.priceCents ?? l.product.basePriceCents) * l.quantity), 0);
      if (index === 0 && cartSubtotal < shippingThresholdCents && input.deliveryMethod !== 'STORE_PICKUP') {
        shippingCents = shippingRateCentsFallback;
      }
      
      if (depositCents > maxDeposit) depositCents = maxDeposit;
      const discountCents = index === 0 ? ((input as any).discountCents || 0) : 0;
      const totalCents = Math.max(0, subtotalCents + shippingCents + taxCents + depositCents - discountCents);
      const orderNumber = \`NV-\${Date.now().toString(36).toUpperCase()}-\${index + 1}\`;

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

  `;

  const updatedCode = code.substring(0, startIdx) + newCreateFromCart + code.substring(endIdx);
  fs.writeFileSync(filePath, updatedCode);
  console.log('orders.service.ts updated.');
}
