import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../crm/whatsapp.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService
  ) {}

  async createTicket(data: { name: string; email: string; subject: string; message: string; userId?: string }) {
    let userId = data.userId;
    if (!userId) {
      const user = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (user) {
        userId = user.id;
      }
    }

    return this.prisma.supportTicket.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        userId: userId,
      },
    });
  }

  async listAdminTickets(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      }),
      this.prisma.supportTicket.count(),
    ]);
    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async addReply(id: string, message: string, isAdmin = true) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const reply = await this.prisma.supportTicketReply.create({
      data: { ticketId: id, message, isAdmin },
    });

    if (isAdmin && ticket.subject.startsWith('WhatsApp Chat with ')) {
      const phoneNumber = ticket.subject.replace('WhatsApp Chat with ', '').trim();
      await this.whatsappService.sendMessage(phoneNumber, message);
    }

    return reply;
  }

  async updateTicketStatus(id: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    
    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    if ((status === 'RESOLVED' || status === 'CLOSED') && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      await this.mailService.sendTicketClosedEmail(updatedTicket.email, updatedTicket.subject).catch(console.error);
    }

    return updatedTicket;
  }

  async listUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
  }
}

