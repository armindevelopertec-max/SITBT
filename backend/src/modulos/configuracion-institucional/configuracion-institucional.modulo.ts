import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionInstitucional } from '../../entidades/configuracion-institucional.entidad';
import { ServicioConfiguracionInstitucional } from './configuracion-institucional.servicio';
import { ControladorConfiguracionInstitucional } from './configuracion-institucional.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionInstitucional])],
  controllers: [ControladorConfiguracionInstitucional],
  providers: [ServicioConfiguracionInstitucional],
  exports: [ServicioConfiguracionInstitucional],
})
export class ModuloConfiguracionInstitucional {}
