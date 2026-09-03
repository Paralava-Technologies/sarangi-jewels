import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor() {}

  async getLiveRates(postalCode: string, weightGrams: number) {
    this.logger.log(`Fetching live rates for postal code: ${postalCode}, weight: ${weightGrams}g`);
    // Implement actual fetch call to a logistics provider (e.g., Delhivery)
    try {
      const delhiveryToken = process.env.DELHIVERY_TOKEN;
      if (!delhiveryToken) {
        this.logger.warn('No DELHIVERY_TOKEN configured, falling back to mock rates');
        return this.getMockRates();
      }

      // Simplified API call for demonstration of live integration
      const response = await fetch(
        `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=${postalCode}&cgm=${weightGrams}`,
        {
          headers: {
            'Authorization': `Token ${delhiveryToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delhivery API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as any[];
      
      return {
        rates: [
          {
            carrier: 'Delhivery',
            serviceName: 'Express',
            rateCents: Math.round((data[0]?.total_amount || 150) * 100),
            currency: 'INR',
            estimatedDays: 2,
          }
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to fetch live rates: ${error}`);
      return this.getMockRates();
    }
  }

  private getMockRates() {
    return {
      rates: [
        {
          carrier: 'Delhivery',
          serviceName: 'Express',
          rateCents: 15000,
          currency: 'INR',
          estimatedDays: 2,
        },
        {
          carrier: 'Bluedart',
          serviceName: 'Standard',
          rateCents: 10000,
          currency: 'INR',
          estimatedDays: 4,
        },
      ],
    };
  }
}
