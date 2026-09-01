import { Module } from '@nestjs/common';
import { AdminCrmController } from './admin-crm/admin-crm.controller';
import { CrmService } from './crm.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  controllers: [AdminCrmController, WhatsappController],
  providers: [CrmService, WhatsappService],
  exports: [WhatsappService]
})
export class CrmModule {}
