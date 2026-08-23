import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMakeupSessionDto, UpdateMakeupSessionStatusDto } from './makeup.dto';

@Injectable()
export class MakeupService {
  constructor(private prisma: PrismaService) {}

  async createSession(userId: string | undefined, dto: CreateMakeupSessionDto) {
    return this.prisma.makeupSession.create({
      data: {
        userId,
        serviceName: dto.serviceName,
        location: dto.location,
        date: new Date(dto.date),
        time: dto.time,
        address: dto.address,
      },
    });
  }

  async getAllSessions() {
    return this.prisma.makeupSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async getMySessions(userId: string) {
    return this.prisma.makeupSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateMakeupSessionStatusDto) {
    const session = await this.prisma.makeupSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');

    return this.prisma.makeupSession.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // --- Makeup Packages ---
  async getPackages() {
    return this.prisma.makeupPackage.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPackageBySlug(slug: string) {
    const pkg = await this.prisma.makeupPackage.findUnique({ where: { slug } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async createPackage(data: any) {
    return this.prisma.makeupPackage.create({ data });
  }

  async updatePackage(id: string, data: any) {
    return this.prisma.makeupPackage.update({
      where: { id },
      data
    });
  }

  async deletePackage(id: string) {
    return this.prisma.makeupPackage.delete({ where: { id } });
  }
}
