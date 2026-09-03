import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { S3Service } from '../../common/services/s3.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddressInput } from '@sarangi/validation';

@Controller('store/user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private s3Service: S3Service
  ) {}

  @Get('me')
  async getMe(@Request() req: any) {
    const data = await this.usersService.getUserById(req.user.id);
    return data;
  }

  @Post('me/id-document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadIdDocument(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No document uploaded');
    const url = await this.s3Service.uploadFile(file, 'id-documents');
    await this.usersService.updateUser(req.user.id, {
      idDocumentUrl: url,
      idVerificationStatus: 'PENDING'
    });
    return { data: { url, status: 'PENDING' } };
  }

  @Get('addresses')
  async getAddresses(@Request() req: any) {
    const data = await this.usersService.getAddresses(req.user.id);
    return { data };
  }

  @Post('addresses')
  async addAddress(@Request() req: any, @Body() body: AddressInput) {
    const data = await this.usersService.addAddress(req.user.id, body);
    return { data };
  }

  @Patch('addresses/:id')
  async updateAddress(@Request() req: any, @Param('id') id: string, @Body() body: AddressInput) {
    const data = await this.usersService.updateAddress(req.user.id, id, body);
    return { data };
  }

  @Delete('addresses/:id')
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    await this.usersService.deleteAddress(req.user.id, id);
    return { data: { success: true } };
  }
}
