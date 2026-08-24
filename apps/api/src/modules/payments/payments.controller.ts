import { Body, Controller, Post, UseGuards, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  paymentId!: string;
}

class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}

@Controller('store/payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session')
  createSession(@Body() body: CreateSessionDto) {
    return this.payments.createPaymentSession(body.paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Body() body: VerifyPaymentDto) {
    return this.payments.verifyPayment(
      body.paymentId,
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );
  }

  @Post('webhook')
  webhook(@Headers('x-razorpay-signature') signature: string, @Body() body: any) {
    return this.payments.handleWebhook(signature, body);
  }
}
