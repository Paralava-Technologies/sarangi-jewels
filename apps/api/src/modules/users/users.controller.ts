import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddressInput } from '@sarangi/validation';

@Controller('store/user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    const data = await this.usersService.getUserById(req.user.id);
    return data;
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
