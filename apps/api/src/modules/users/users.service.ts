import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { paginationQuerySchema } from '@sarangi/validation';
import type { AddressInput } from '@sarangi/validation';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async listAllUsers(query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        }
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true, orders: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
    if (!user) throw new NotFoundException('User not found');
    
    // omit passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  }

  async updateUser(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    
    const { passwordHash, ...userWithoutPassword } = updated;
    return { data: userWithoutPassword };
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAddress(userId: string, data: AddressInput) {
    const existing = await this.prisma.address.count({ where: { userId } });
    
    // If this is the first address, or isDefault is true, unset other defaults
    if (data.isDefault || existing === 0) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...data,
        isDefault: data.isDefault || existing === 0,
        userId,
      },
    });
  }

  async updateAddress(userId: string, id: string, data: AddressInput) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({
      where: { id },
    });

    if (address.isDefault) {
      const nextAddress = await this.prisma.address.findFirst({
        where: { userId },
      });
      if (nextAddress) {
        await this.prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async subscribeNewsletter(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });

    if (!existing) {
      // It's a brand new subscriber, send a welcome email
      await this.mailService.sendNewsletterWelcome(email);
    } else if (!existing.isActive) {
      // Was unsubscribed, now resubscribed. We can optionally send an email, but usually don't.
    }

    return subscriber;
  }

  // --- ADMIN METHODS FOR NEWSLETTER ---
  
  async listSubscribers(query: Record<string, unknown>) {
    const { page, pageSize } = paginationQuerySchema.parse(query);

    const [subscribers, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);

    return {
      data: subscribers,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async toggleSubscriber(id: string, isActive: boolean) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteSubscriber(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    return this.prisma.newsletterSubscriber.delete({
      where: { id },
    });
  }

  async sendMarketingCampaign(subject: string, html: string) {
    const activeSubscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    const inactiveSubscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: false },
      select: { email: true },
    });

    const users = await this.prisma.user.findMany({
      select: { email: true },
    });

    const inactiveEmails = new Set(inactiveSubscribers.map(s => s.email));

    const emailSet = new Set([
      ...activeSubscribers.map(s => s.email),
      ...users.map(u => u.email).filter(Boolean) as string[]
    ]);

    // Remove explicitly unsubscribed emails
    inactiveEmails.forEach(email => emailSet.delete(email));

    const emails = Array.from(emailSet);

    if (emails.length > 0) {
      await this.mailService.sendMarketingCampaign(emails, subject, html);
    }
    
    return { success: true, count: emails.length };
  }
}
