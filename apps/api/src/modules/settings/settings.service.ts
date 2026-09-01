import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreSettings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<StoreSettings> {
    let settings = await this.prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.storeSettings.create({
        data: {
          shippingThresholdCents: 1500000,
          shippingRateCents: 100000,
          taxRatePercentage: 0,
        },
      });
    }
    return settings;
  }

  async updateSettings(data: {
    storeName?: string;
    supportEmail?: string;
    supportPhone?: string;
    whatsappNumber?: string;
    whatsappServiceEnabled?: boolean;
    facebookLink?: string;
    instagramLink?: string;
    codAllowed?: boolean;
    codReconciliationMode?: string;
    shippingThresholdCents?: number;
    shippingRateCents?: number;
    taxRatePercentage?: number;
    marqueeText?: string;
    storeState?: string;
    gstin?: string;
    rentalDeliveryAllowed?: boolean;
  }): Promise<StoreSettings> {
    const settings = await this.getSettings();
    return this.prisma.storeSettings.update({
      where: { id: settings.id },
      data,
    });
  }

  async getTaxRules() {
    return this.prisma.taxRule.findMany({ orderBy: { hsnCode: 'asc' } });
  }

  async createTaxRule(data: { hsnCode: string; description?: string; cgstPercentage: number; sgstPercentage: number; igstPercentage: number }) {
    return this.prisma.taxRule.create({ data });
  }

  async updateTaxRule(id: string, data: Partial<{ hsnCode: string; description?: string; cgstPercentage: number; sgstPercentage: number; igstPercentage: number }>) {
    return this.prisma.taxRule.update({ where: { id }, data });
  }

  async deleteTaxRule(id: string) {
    await this.prisma.taxRule.delete({ where: { id } });
    return { success: true };
  }
}
