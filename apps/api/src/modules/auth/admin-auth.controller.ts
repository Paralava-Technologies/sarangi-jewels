import { Body, Controller, Post } from '@nestjs/common';
import type { LoginInput } from '@sarangi/validation';
import { AuthService } from './auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginInput) {
    return this.auth.loginAdmin(body);
  }
}
