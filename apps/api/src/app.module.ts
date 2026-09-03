import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { MailModule } from './modules/mail/mail.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { StoreModule } from './modules/store/store.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SupportModule } from './modules/support/support.module';
import { ReportsModule } from './modules/reports/reports.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CrmModule } from './modules/crm/crm.module';
import { FulfillmentModule } from './modules/fulfillment/fulfillment.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { MakeupModule } from './modules/makeup/makeup.module';
import { CustomLogicModule } from './modules/custom-logic/custom-logic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.get('REDIS_PORT') || 6380,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get('REDIS_PORT') || 6380,
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    PrismaModule,
    MailModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    StoreModule,
    AdminModule,
    PaymentsModule,
    WishlistModule,
    SettingsModule,
    UsersModule,
    ReviewsModule,
    SupportModule,
    ReportsModule,
    InventoryModule,
    CrmModule,
    FulfillmentModule,
    BlogsModule,
    ShippingModule,
    ReconciliationModule,
    MakeupModule,
    CustomLogicModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
