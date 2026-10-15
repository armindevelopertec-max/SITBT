import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from '../../entidades/materia.entidad';
import { ServicioMaterias } from './materias.servicio';
import { ControladorMaterias } from './materias.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Materia])],
  controllers: [ControladorMaterias],
  providers: [ServicioMaterias],
  exports: [ServicioMaterias],
})
export class ModuloMaterias {}