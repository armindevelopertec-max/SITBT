import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from '../../entities/turno.entity';
import { ServicioTurnos } from './turnos.service';
import { ControladorTurnos } from './turnos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Turno])],
  controllers: [ControladorTurnos],
  providers: [ServicioTurnos],
  exports: [ServicioTurnos],
})
export class ModuloTurnos {}