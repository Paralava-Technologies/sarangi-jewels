import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// Trigger restart
import type { NextFunction, Request, Response } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ZodFilter } from './common/filters/zod.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';
  const forceHttps = process.env.FORCE_HTTPS === 'true' || isProd;

  if (forceHttps) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    expressApp.use((req: Request, res: Response, next: NextFunction) => {
      const proto = req.headers['x-forwarded-proto'];
      if (proto === 'http') {
        const host = req.headers.host;
        return res.redirect(301, `https://${host}${req.url}`);
      }
      next();
    });
  }

  const defaultOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? defaultOrigins;

  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Session'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ZodFilter());

  // Serve static files from /public
  const expressAppStatic = app.getHttpAdapter().getInstance();
  const path = require('path');
  expressAppStatic.use('/public', require('express').static(path.join(__dirname, '..', 'public')));

  const config = new DocumentBuilder()
    .setTitle('Sarangi Jewels API')
    .setDescription('The Sarangi Jewels E-commerce Core API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'customlogic',
      protoPath: path.join(__dirname, 'proto/custom-logic.proto'),
      url: 'localhost:50051',
    },
  });

  await app.startAllMicroservices();
  const port = process.env.API_PORT ?? 3001;
  const publicUrl = process.env.API_URL ?? `http://localhost:${port}`;
  await app.listen(port);
  console.log(`Sarangi Jewels API running at ${publicUrl}/v1`);
}

bootstrap();
