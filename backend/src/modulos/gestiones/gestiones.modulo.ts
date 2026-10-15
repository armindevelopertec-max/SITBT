import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioGestiones } from './gestiones.servicio';
import { ControladorGestiones } from './gestiones.controlador';
import { Gestion } from '../../entidades/gestion.entidad';
import { Periodo } from '../../entidades/periodo.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Gestion, Periodo])],
  controllers: [ControladorGestiones],
  providers: [ServicioGestiones],
  exports: [ServicioGestiones],
})
export class ModuloGestiones {}
