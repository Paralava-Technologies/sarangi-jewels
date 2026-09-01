import { Controller, Get, Patch, Body, UseGuards, Post, Delete, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('store/settings')
  async getStoreSettings() {
    const settings = await this.settingsService.getSettings();
    return { data: settings };
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async getAdminSettings() {
    const settings = await this.settingsService.getSettings();
    return { data: settings };
  }

  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async updateAdminSettings(
    @Body() body: {
      storeName?: string;
      supportEmail?: string;
      supportPhone?: string;
      whatsappNumber?: string;
      whatsappServiceEnabled?: boolean;
      facebookLink?: string;
      instagramLink?: string;
      codAllowed?: boolean;
      shippingThresholdCents?: number;
      shippingRateCents?: number;
      taxRatePercentage?: number;
      marqueeText?: string;
      storeState?: string;
      gstin?: string;
    },
    @Req() req: Request & { user?: { role: string } }
  ) {
    if (body.whatsappServiceEnabled !== undefined && req.user?.role !== 'SUPERADMIN') {
      delete body.whatsappServiceEnabled; // Only SUPERADMIN can update this
    }
    const settings = await this.settingsService.updateSettings(body);
    return { data: settings };
  }

  @Get('admin/tax-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async getTaxRules() {
    const rules = await this.settingsService.getTaxRules();
    return { data: rules };
  }

  @Post('admin/tax-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async createTaxRule(@Body() body: { hsnCode: string; description?: string; cgstPercentage: number; sgstPercentage: number; igstPercentage: number }) {
    const rule = await this.settingsService.createTaxRule(body);
    return { data: rule };
  }

  @Patch('admin/tax-rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async updateTaxRule(
    @Param('id') id: string,
    @Body() body: { hsnCode?: string; description?: string; cgstPercentage?: number; sgstPercentage?: number; igstPercentage?: number }
  ) {
    const rule = await this.settingsService.updateTaxRule(id, body);
    return { data: rule };
  }

  @Delete('admin/tax-rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async deleteTaxRule(@Param('id') id: string) {
    return this.settingsService.deleteTaxRule(id);
  }
}
