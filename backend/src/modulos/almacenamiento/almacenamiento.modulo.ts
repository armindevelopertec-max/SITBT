import { Module } from '@nestjs/common';
import { ServicioAlmacenamiento } from './almacenamiento.servicio';
import { ServicioOptimizacionImagen } from './servicio-optimizacion-imagen';
import { ControladorAlmacenamiento } from './almacenamiento.controlador';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ControladorAlmacenamiento],
  providers: [ServicioAlmacenamiento, ServicioOptimizacionImagen, ConfigService],
  exports: [ServicioAlmacenamiento, ServicioOptimizacionImagen],
})
export class ModuloAlmacenamiento {}