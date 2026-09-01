import { Module, forwardRef } from '@nestjs/common';
import { SupportService } from './support.service';
import { StoreSupportController } from './store-support.controller';
import { AdminSupportController } from './admin-support.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [PrismaModule, MailModule, forwardRef(() => CrmModule)],
  providers: [SupportService],
  controllers: [StoreSupportController, AdminSupportController],
})
export class SupportModule {}
