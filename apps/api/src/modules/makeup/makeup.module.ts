import { Module } from '@nestjs/common';
import { MakeupService } from './makeup.service';
import { StoreMakeupController, AdminMakeupController } from './makeup.controller';

@Module({
  providers: [MakeupService],
  controllers: [StoreMakeupController, AdminMakeupController],
})
export class MakeupModule {}
