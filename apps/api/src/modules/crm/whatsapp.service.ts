import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || 'sarangi_secret_token';
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Webhook verified.');
      return challenge;
    }
    return null;
  }

  async processIncomingMessage(body: any) {
    const settings = await this.prisma.storeSettings.findFirst();
    if (settings && !settings.whatsappServiceEnabled) {
      this.logger.warn('WhatsApp service is disabled in settings. Ignoring message.');
      return;
    }

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value && change.value.messages) {
            for (const message of change.value.messages) {
              const from = message.from;
              const text = message.text?.body;
              
              if (text && from) {
                await this.handleMessage(from, text);
              }
            }
          }
        }
      }
    }
  }

  private async handleMessage(phoneNumber: string, text: string) {
    this.logger.log(`Received WA message from ${phoneNumber}: ${text}`);
    
    let user = await this.prisma.user.findFirst({
      where: {
        addresses: {
          some: { phone: { contains: phoneNumber.replace('+', '') } }
        }
      }
    });

    if (!user) {
      this.logger.log(`No user found for phone ${phoneNumber}. Creating lead...`);
      user = await this.prisma.user.create({
        data: {
          email: `${phoneNumber}@whatsapp.lead`,
          firstName: 'WA',
          lastName: 'Lead',
          passwordHash: 'none',
        }
      });
    }

    let ticket = await this.prisma.supportTicket.findFirst({
      where: { userId: user.id, status: 'OPEN' }
    });

    if (!ticket) {
      ticket = await this.prisma.supportTicket.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          subject: `WhatsApp Chat with ${phoneNumber}`,
          message: text,
        }
      });
    } else {
      await this.prisma.supportTicketReply.create({
        data: {
          ticketId: ticket.id,
          message: text,
          isAdmin: false,
        }
      });
    }
  }

  async sendMessage(phoneNumber: string, text: string) {
    const settings = await this.prisma.storeSettings.findFirst();
    if (settings && !settings.whatsappServiceEnabled) {
      this.logger.warn('WhatsApp service is disabled in settings. Cannot send message.');
      return;
    }

    const token = this.configService.get<string>('WHATSAPP_TOKEN');
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    if (!token || !phoneNumberId) {
      this.logger.warn('WhatsApp API credentials not configured');
      return;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Failed to send WA message to ${phoneNumber}: ${errorData}`);
      } else {
        this.logger.log(`Sent WA message to ${phoneNumber}`);
      }
    } catch (error) {
      this.logger.error(`Error sending WA message to ${phoneNumber}:`, error);
    }
  }
}
