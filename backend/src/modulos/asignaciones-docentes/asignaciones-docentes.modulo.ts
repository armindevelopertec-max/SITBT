import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { ServicioAsignacionesDocentes } from './asignaciones-docentes.servicio';
import { ControladorAsignacionesDocentes } from './asignaciones-docentes.controlador';
import { Personal } from '../../entidades/personal.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Grupo } from '../../entidades/grupo.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionDocente, Personal, Materia, Grupo])],
  controllers: [ControladorAsignacionesDocentes],
  providers: [ServicioAsignacionesDocentes],
  exports: [ServicioAsignacionesDocentes],
})
export class ModuloAsignacionesDocentes {}