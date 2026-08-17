import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeOasYaml } from './oas-exporter';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Tech Solutions API')
    .setDescription(
      'Backend del sistema de gestión de proyectos Tech Solutions. Desarrollado con NestJS, MySQL y Prisma.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Registro e inicio de sesión de usuarios')
    .addTag('proyectos', 'CRUD de proyectos (protegido por JWT)')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  writeOasYaml(document);
}