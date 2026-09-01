import { Module } from '@nestjs/common';
import { CustomLogicController } from './custom-logic.controller';

@Module({
  controllers: [CustomLogicController],
})
export class CustomLogicModule {}
