import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  getSalesSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesSummary(startDate, endDate);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.reportsService.getTopProducts(limit ? parseInt(limit, 10) : 10);
  }

  @Get('recent-transactions')
  getRecentTransactions(@Query('limit') limit?: string) {
    return this.reportsService.getRecentTransactions(limit ? parseInt(limit, 10) : 10);
  }

  @Get('daily-revenue')
  getDailyRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDailyRevenue(startDate, endDate);
  }

  @Get('daily-bookings')
  getDailyBookings(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDailyBookings(startDate, endDate);
  }

  @Get('orders-by-status')
  getOrdersByStatus() {
    return this.reportsService.getOrdersByStatus();
  }

  @Get('user-acquisition')
  getUserAcquisition() {
    return this.reportsService.getUserAcquisition();
  }

  @Get('top-customers')
  getTopCustomers(@Query('limit') limit?: string) {
    return this.reportsService.getTopCustomers(limit ? parseInt(limit, 10) : 5);
  }

  @Get('product-heatmap')
  getProductHeatmap(@Query() query: Record<string, string>) {
    return this.reportsService.getProductHeatmap(query);
  }

  @Get('product-orders')
  getProductOrders(@Query() query: Record<string, string>) {
    return this.reportsService.getProductOrders(query);
  }
}
