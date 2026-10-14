import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FiltroExcepcionesEspanol } from './common/filtro-excepciones-espanol';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new FiltroExcepcionesEspanol());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errores) => {
        const campos = errores
          .map((e) => e.property)
          .filter(Boolean)
          .join(', ');
        return new BadRequestException(
          campos
            ? `Datos de entrada inválidos: ${campos}`
            : 'Datos de entrada inválidos',
        );
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API del SITBT')
    .setDescription('Sistema Académico Instituto Tecnológico Boliviana de Tecnología')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/documentacion', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📚 Documentación de la API en http://localhost:${port}/api/documentacion`);
}
bootstrap();
