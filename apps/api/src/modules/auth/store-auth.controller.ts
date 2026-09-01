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
}
