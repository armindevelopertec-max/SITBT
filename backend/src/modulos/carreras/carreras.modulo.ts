import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from '../../entidades/carrera.entidad';
import { ServicioCarreras } from './carreras.servicio';
import { ControladorCarreras } from './carreras.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera])],
  controllers: [ControladorCarreras],
  providers: [ServicioCarreras],
  exports: [ServicioCarreras],
})
export class ModuloCarreras {}