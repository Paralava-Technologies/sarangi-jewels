import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards, StreamableFile, Res } from '@nestjs/common';
import type { PlaceOrderInput } from '@sarangi/validation';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('store/orders')
@UseGuards(JwtAuthGuard)
export class StoreOrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Headers('x-cart-session') session: string | undefined,
    @Body() body: PlaceOrderInput,
  ) {
    return this.orders.createFromCart(req.user.id, session, body);
  }

  @Get()
  list(@Req() req: { user: { id: string } }, @Query() query: Record<string, unknown>) {
    return this.orders.listForUser(req.user.id, query);
  }

  @Get(':id')
  getOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.orders.getById(id, req.user.id);
  }

  @Get(':id/invoice')
  async getInvoice(@Req() req: { user: { id: string } }, @Param('id') id: string, @Res({ passthrough: true }) res: any) {
    const doc = await this.orders.generateInvoice(id, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    return new StreamableFile(doc);
  }

  @Post('promotions/validate')
  validatePromotion(@Body() body: { code: string; cartTotalCents: number }) {
    return this.orders.validatePromotion(body.code, body.cartTotalCents);
  }

  @Post(':id/change-to-cod')
  changeToCod(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.orders.changeToCod(id, req.user.id);
  }
}
