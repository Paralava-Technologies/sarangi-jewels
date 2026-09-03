import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NewsletterController } from './newsletter.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from './users.service';
import { S3Service } from '../../common/services/s3.service';

@Module({
  controllers: [UsersController, NewsletterController, AdminNewsletterController, AdminUsersController],
  providers: [UsersService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
