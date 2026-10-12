import { Module } from '@nestjs/common';
import { ServicioAlmacenamiento } from './almacenamiento.service';
import { ControladorAlmacenamiento } from './almacenamiento.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ControladorAlmacenamiento],
  providers: [ServicioAlmacenamiento, ConfigService],
  exports: [ServicioAlmacenamiento],
})
export class ModuloAlmacenamiento {}