import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AddToCartInput, UpdateCartLineInput } from '@sarangi/validation';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../../common/guards/jwt-optional-auth.guard';
import { CartService } from './cart.service';

@Controller('store/cart')
@UseGuards(JwtOptionalAuthGuard)
export class StoreCartController {
  constructor(private cart: CartService) {}

  private ctx(
    sessionHeader: string | undefined,
    user?: { id: string },
  ) {
    if (user?.id) {
      return { userId: user.id, sessionId: sessionHeader };
    }
    if (!sessionHeader) {
      return {};
    }
    return { sessionId: sessionHeader };
  }

  @Get('session')
  async createSession() {
    const sessionId = await this.cart.getOrCreateSession();
    return { data: { sessionId } };
  }

  @Get()
  getCart(
    @Headers('x-cart-session') session: string | undefined,
    @Req() req: { user?: { id: string } },
  ) {
    return this.cart.getCart(this.ctx(session, req.user));
  }

  @Post('items')
  addItem(
    @Headers('x-cart-session') session: string | undefined,
    @Req() req: { user?: { id: string } },
    @Body() body: AddToCartInput,
  ) {
    return this.cart.addItem(this.ctx(session, req.user), body);
  }

  @Patch('items/:lineId')
  updateLine(
    @Headers('x-cart-session') session: string | undefined,
    @Req() req: { user?: { id: string } },
    @Param('lineId') lineId: string,
    @Body() body: UpdateCartLineInput,
  ) {
    return this.cart.updateLine(this.ctx(session, req.user), lineId, body);
  }

  @Delete('items/:lineId')
  removeLine(
    @Headers('x-cart-session') session: string | undefined,
    @Req() req: { user?: { id: string } },
    @Param('lineId') lineId: string,
  ) {
    return this.cart.removeLine(this.ctx(session, req.user), lineId);
  }

  @Delete()
  clear(
    @Headers('x-cart-session') session: string | undefined,
    @Req() req: { user?: { id: string } },
  ) {
    return this.cart.clearCart(this.ctx(session, req.user));
  }

  /** Authenticated cart merges with session cart (future); for now uses user cart only */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyCart(@Req() req: { user: { id: string } }) {
    return this.cart.getCart({ userId: req.user.id });
  }
}
