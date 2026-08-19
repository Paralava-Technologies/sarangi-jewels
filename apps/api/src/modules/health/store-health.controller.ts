import { Controller, Get } from '@nestjs/common';

@Controller('store/health')
export class StoreHealthController {
  @Get()
  check() {
    return { data: { status: 'ok', service: 'sarangijewels.com' } };
  }
}
