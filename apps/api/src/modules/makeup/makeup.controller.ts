import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { MakeupService } from './makeup.service';
import { CreateMakeupSessionDto, UpdateMakeupSessionStatusDto, CreateMakeupPackageDto, UpdateMakeupPackageDto } from './makeup.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('store/makeup')
export class StoreMakeupController {
  constructor(private readonly makeupService: MakeupService) {}

  @Get('packages')
  async getPackages() {
    const packages = await this.makeupService.getPackages();
    return { data: packages };
  }

  @Get('packages/:slug')
  async getPackage(@Param('slug') slug: string) {
    const pkg = await this.makeupService.getPackageBySlug(slug);
    return { data: pkg };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSession(@Request() req: any, @Body() dto: CreateMakeupSessionDto) {
    const session = await this.makeupService.createSession(req.user.id, dto);
    return { data: session, message: 'Session booked successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMySessions(@Request() req: any) {
    const sessions = await this.makeupService.getMySessions(req.user.id);
    return { data: sessions };
  }
}

@Controller('admin/makeup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMakeupController {
  constructor(private readonly makeupService: MakeupService) {}

  @Get()
  async getAllSessions() {
    const sessions = await this.makeupService.getAllSessions();
    return { data: sessions };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateMakeupSessionStatusDto) {
    const session = await this.makeupService.updateStatus(id, dto);
    return { data: session, message: 'Status updated' };
  }

  @Get('packages')
  async getPackages() {
    const packages = await this.makeupService.getPackages();
    return { data: packages };
  }

  @Post('packages')
  async createPackage(@Body() dto: CreateMakeupPackageDto) {
    const pkg = await this.makeupService.createPackage(dto);
    return { data: pkg };
  }

  @Patch('packages/:id')
  async updatePackage(@Param('id') id: string, @Body() dto: UpdateMakeupPackageDto) {
    const pkg = await this.makeupService.updatePackage(id, dto);
    return { data: pkg };
  }

  @Delete('packages/:id')
  async deletePackage(@Param('id') id: string) {
    await this.makeupService.deletePackage(id);
    return { success: true };
  }
}
