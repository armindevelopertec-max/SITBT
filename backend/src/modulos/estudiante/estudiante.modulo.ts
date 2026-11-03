import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { InscripcionMateria } from '../../entidades/inscripcion-materia.entidad';
import { LibroCalificaciones } from '../../entidades/libro-calificaciones.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { ControladorEstudiante } from './estudiante.controlador';
import { ServicioEstudiante } from './estudiante.servicio';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Estudiante,
      InscripcionMateria,
      MateriaPlan,
      Calificacion,
      AsignacionDocente,
      LibroCalificaciones,
    ]),
  ],
  controllers: [ControladorEstudiante],
  providers: [ServicioEstudiante],
  exports: [ServicioEstudiante],
})
export class ModuloEstudiante {}
