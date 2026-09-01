import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, StreamableFile, Res } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrdersService } from './orders.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(
    private orders: OrdersService,
    private payments: PaymentsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT, UserRole.SUPPORT)
  list(@Query() query: Record<string, unknown>) {
    return this.orders.listAll(query);
  }

  @Get('rentals')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT, UserRole.SUPPORT)
  listRentals(@Query() query: Record<string, unknown>) {
    return this.orders.getRentals(query);
  }

  @Get('promotions')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  listPromotions(@Query() query: Record<string, unknown>) {
    return this.orders.listPromotions(query);
  }

  @Post('promotions')
  @Roles(UserRole.ADMIN)
  createPromotion(@Body() body: { code: string; description?: string; discountPercentage?: number; discountCents?: number; minOrderValue?: number }) {
    return this.orders.createPromotion(body);
  }

  @Delete('promotions/:id')
  @Roles(UserRole.ADMIN)
  deletePromotion(@Param('id') id: string) {
    return this.orders.deletePromotion(id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT, UserRole.SUPPORT)
  getOne(@Param('id') id: string) {
    return this.orders.getById(id);
  }

  @Get(':id/invoice')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT, UserRole.SUPPORT)
  async getInvoice(@Param('id') id: string, @Res({ passthrough: true }) res: any) {
    const doc = await this.orders.generateInvoice(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    return new StreamableFile(doc);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT)
  updateStatus(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string; trackingNumber?: string; carrier?: string },
  ) {
    return this.orders.updateStatus(
      id,
      body.status,
      req.user.id,
      body.note,
      body.trackingNumber,
      body.carrier,
    );
  }

  @Patch(':id/delivery-date')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT)
  updateDeliveryDate(
    @Param('id') id: string,
    @Body() body: { deliveryDate: string | null },
  ) {
    return this.orders.updateDeliveryDate(id, body.deliveryDate ? new Date(body.deliveryDate) : null);
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN)
  refundOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.payments.refundPayment(id, body.reason);
  }

  @Post(':orderId/return-rental/:lineId')
  @Roles(UserRole.ADMIN, UserRole.FULFILLMENT)
  async returnRentalLine(
    @Param('orderId') orderId: string,
    @Param('lineId') lineId: string,
  ) {
    return this.orders.processRentalReturn(orderId, lineId, this.payments);
  }
}
