import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { collectDefaultMetrics, register } from 'prom-client';
import { json, type Request, type Response, urlencoded } from 'express';
import { AppModule } from './app.module';

type MetricsRegistry = {
  contentType: string;
  metrics: () => Promise<string>;
};

type CollectDefaultMetrics = (config?: { prefix?: string }) => void;

type ExpressLike = {
  get: (
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>,
  ) => void;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: true, limit: '8mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const setupDefaultMetrics =
    collectDefaultMetrics as unknown as CollectDefaultMetrics;
  setupDefaultMetrics({ prefix: 'ecocheck_backend_' });

  const metricsRegistry: MetricsRegistry =
    register as unknown as MetricsRegistry;
  const expressApp = app
    .getHttpAdapter()
    .getInstance() as unknown as ExpressLike;
  expressApp.get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  });

  // Swagger API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EcoCheck API')
    .setDescription(
      'Backend API for the EcoCheck environmental signal reporting platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT ?? 3001}`, 'Local')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 EcoCheck API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
