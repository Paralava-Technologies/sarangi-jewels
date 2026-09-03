import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CartService } from './cart.service';
import { StoreCartController } from './store-cart.controller';
import { MailModule } from '../mail/mail.module';
import { CartProcessor } from './cart.processor';

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [StoreCartController],
  providers: [CartService, CartProcessor],
  exports: [CartService],
})
export class CartModule {}
