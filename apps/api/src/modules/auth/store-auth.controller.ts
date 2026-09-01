import { Body, Controller, Post } from '@nestjs/common';
import type { LoginInput, RegisterInput } from '@sarangi/validation';
import { AuthService } from './auth.service';

@Controller('store/auth')
export class StoreAuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterInput) {
    return this.auth.registerStore(body);
  }

  @Post('login')
  login(@Body() body: LoginInput) {
    return this.auth.loginStore(body);
  }

  @Post('send-otp')
  sendOtp(@Body() body: import('@sarangi/validation').SendOtpInput) {
    return this.auth.sendOtp(body);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: import('@sarangi/validation').VerifyOtpInput) {
    return this.auth.verifyOtp(body);
  }
}
