import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers via Helmet (XSS protection, Frameguard, No-Sniff, HSTS)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled per-route / Next.js
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Body Parser Limits (prevents memory DoS via oversized payloads)
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ limit: '15mb', extended: true }));

  // 3. Strict CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://healthcare-web-app-tau.vercel.app',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : []),
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or from whitelisted origins
      if (!origin) {
        return callback(null, true);
      }
      const isAllowed = allowedOrigins.some(allowed => 
        origin === allowed || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:')
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: Origin ${origin} is not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // 4. Global Validation and Input Sanitization Pipe (Strips malicious/unwhitelisted payload parameters)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`[Security Hardened] HealthConnect Backend active on port ${port}`);
}
bootstrap();
