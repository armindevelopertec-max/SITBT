import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaImpartida } from '../../entidades/materia-impartida.entidad';
import { InscripcionMateria } from '../../entidades/inscripcion-materia.entidad';
import { LibroCalificaciones } from '../../entidades/libro-calificaciones.entidad';
import { CierreAcademico } from '../../entidades/cierre-academico.entidad';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { AuditoriaCalificacion } from '../../entidades/auditoria-calificacion.entidad';
import { AsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { Grupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { Periodo } from '../../entidades/periodo.entidad';
import { ServicioCalculoAcademico } from './calculo-academico.servicio';
import { ServicioMateriasImpartidas } from './materias-impartidas.servicio';
import { ControladorMateriasImpartidas } from './materias-impartidas.controlador';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MateriaImpartida,
      InscripcionMateria,
      LibroCalificaciones,
      CierreAcademico,
      Calificacion,
      AuditoriaCalificacion,
      AsignacionDocente,
      Grupo,
      GrupoEstudiante,
      MateriaPlan,
      Materia,
      Estudiante,
      Personal,
      Periodo,
    ]),
  ],
  controllers: [ControladorMateriasImpartidas],
  providers: [ServicioCalculoAcademico, ServicioMateriasImpartidas],
  exports: [ServicioMateriasImpartidas, ServicioCalculoAcademico],
})
export class ModuloMateriasImpartidas {}
