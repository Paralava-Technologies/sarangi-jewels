import { Controller, Get } from '@nestjs/common';

@Controller('admin/health')
export class AdminHealthController {
  @Get()
  check() {
    return { data: { status: 'ok', service: 'sarangi-admin' } };
  }
}
