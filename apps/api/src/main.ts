import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Legal DocFlow API')
    .setDescription(`
      API for legal document generation and management.
      
      ### Authentication (Mock/Dev)
      This API uses a mock authentication mechanism for rapid prototyping. 
      To test protected endpoints, provide a valid User ID in the \`x-user-id\` header.
      Typical IDs from seed data:
      - \`user-admin-1\` (Admin role)
      - \`user-lawyer-1\` (Lawyer role)
      - \`user-partner-1\` (Partner role)
    `)
    .setVersion('1.0')
    .addApiKey({ 
      type: 'apiKey', 
      name: 'x-user-id', 
      in: 'header',
      description: 'Mock User ID for RBAC simulation. Use an ID from the demo seed data.'
    }, 'x-user-id')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  // CORS Configuration
  const frontendUrls = process.env.FRONTEND_URLS?.split(',') || [];
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [...new Set([...frontendUrls, frontendUrl].filter(Boolean))];

  // Default to common dev origins if no origins provided
  if (allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-user-id',
      'X-Requested-With',
      'Accept',
    ],
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  const port = process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`API is running on: http://localhost:${port}`);
}

bootstrap();
