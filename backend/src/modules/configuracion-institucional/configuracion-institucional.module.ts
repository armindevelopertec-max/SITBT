import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionInstitucional } from '../../entities/institution-settings.entity';
import { ServicioConfiguracionInstitucional } from './configuracion-institucional.service';
import { ControladorConfiguracionInstitucional } from './configuracion-institucional.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionInstitucional])],
  controllers: [ControladorConfiguracionInstitucional],
  providers: [ServicioConfiguracionInstitucional],
  exports: [ServicioConfiguracionInstitucional],
})
export class ModuloConfiguracionInstitucional {}
