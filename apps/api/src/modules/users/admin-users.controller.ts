import { Controller, Get, Param, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  idVerificationStatus?: string;

  @IsString()
  @IsOptional()
  idDocumentUrl?: string;
}

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Query() query: any) {
    return this.usersService.listAllUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details and role' })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(id, body);
  }
}
