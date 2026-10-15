import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ModuloAplicacion } from './app.module';
import { FiltroExcepcionesEspanol } from './common/filtro-excepciones-espanol';

async function iniciar() {
  const aplicacion = await NestFactory.create(ModuloAplicacion);

  const urlFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';

  aplicacion.enableCors({
    origin: [urlFrontend, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  aplicacion.setGlobalPrefix('api');

  aplicacion.useGlobalFilters(new FiltroExcepcionesEspanol());

  aplicacion.useGlobalPipes(
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

  const configuracion = new DocumentBuilder()
    .setTitle('API del SITBT')
    .setDescription('Sistema Académico Instituto Tecnológico Boliviana de Tecnología')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(aplicacion, configuracion);
  SwaggerModule.setup('api/documentacion', aplicacion, documento);

  const puerto = process.env.PORT || 4000;
  await aplicacion.listen(puerto);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${puerto}`);
  console.log(`📚 Documentación de la API en http://localhost:${puerto}/api/documentacion`);
}
iniciar();
