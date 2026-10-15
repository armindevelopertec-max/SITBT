import { Module } from '@nestjs/common';
import { ServicioAlmacenamiento } from './almacenamiento.servicio';
import { ControladorAlmacenamiento } from './almacenamiento.controlador';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ControladorAlmacenamiento],
  providers: [ServicioAlmacenamiento, ConfigService],
  exports: [ServicioAlmacenamiento],
})
export class ModuloAlmacenamiento {}