import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly twilioClient?: Twilio;
  private readonly logger = new Logger(SmsService.name);
  private readonly fromNumber: string;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER') || '';
    
    if (accountSid && authToken && this.fromNumber) {
      this.twilioClient = new Twilio(accountSid, authToken);
      this.isEnabled = true;
    } else {
      this.logger.warn('Twilio credentials not fully configured. SMS notifications are disabled.');
      this.isEnabled = false;
    }
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn(`Skipping SMS to ${to} (Twilio Disabled): ${body}`);
      return false;
    }

    try {
      const message = await this.twilioClient!.messages.create({
        body,
        from: this.fromNumber,
        to,
      });
      this.logger.log(`Sent SMS to ${to}. Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  async sendOrderConfirmationSms(to: string, orderId: string, amount: number) {
    const text = `Hi! Your order ${orderId} for Rs. ${amount} at Sarangi Jewels is confirmed. We will notify you once it ships.`;
    return this.sendSms(to, text);
  }

  async sendOrderShippedSms(to: string, orderId: string, trackingNumber: string, carrier: string) {
    const text = `Great news! Your order ${orderId} has been shipped via ${carrier}. Tracking: ${trackingNumber}.`;
    return this.sendSms(to, text);
  }
}
