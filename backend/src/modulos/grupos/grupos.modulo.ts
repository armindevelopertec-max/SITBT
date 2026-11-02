import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { GrupoHistorial } from '../../entidades/grupo-historial.entidad';
import { ServicioGrupos } from './grupos.servicio';
import { ControladorGrupos } from './grupos.controlador';
import { Carrera } from '../../entidades/carrera.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Turno } from '../../entidades/turno.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Periodo } from '../../entidades/periodo.entidad';
import { Gestion } from '../../entidades/gestion.entidad';
import { MateriaImpartida } from '../../entidades/materia-impartida.entidad';
import { LibroCalificaciones } from '../../entidades/libro-calificaciones.entidad';
import { ModuloMateriasImpartidas } from '../materias-impartidas/materias-impartidas.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grupo,
      GrupoEstudiante,
      Inscripcion,
      GrupoHistorial,
      Carrera,
      PlanEstudio,
      Turno,
      MateriaPlan,
      Materia,
      Estudiante,
      Periodo,
      Gestion,
      MateriaImpartida,
      LibroCalificaciones,
    ]),
    ModuloMateriasImpartidas,
  ],
  controllers: [ControladorGrupos],
  providers: [ServicioGrupos],
  exports: [ServicioGrupos],
})
export class ModuloGrupos {}
