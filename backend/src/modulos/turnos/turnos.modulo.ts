import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from '../../entidades/turno.entidad';
import { ServicioTurnos } from './turnos.servicio';
import { ControladorTurnos } from './turnos.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Turno])],
  controllers: [ControladorTurnos],
  providers: [ServicioTurnos],
  exports: [ServicioTurnos],
})
export class ModuloTurnos {}