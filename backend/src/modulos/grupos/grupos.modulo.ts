import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { ServicioGrupos } from './grupos.servicio';
import { ControladorGrupos } from './grupos.controlador';
import { Carrera } from '../../entidades/carrera.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Turno } from '../../entidades/turno.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, GrupoEstudiante, Carrera, PlanEstudio, Turno, MateriaPlan, Materia])],
  controllers: [ControladorGrupos],
  providers: [ServicioGrupos],
  exports: [ServicioGrupos],
})
export class ModuloGrupos {}