import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { ServicioInscripciones } from './inscripciones.servicio';
import { ControladorInscripciones } from './inscripciones.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Grupo } from '../../entidades/grupo.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Estudiante, Materia, Grupo])],
  controllers: [ControladorInscripciones],
  providers: [ServicioInscripciones],
  exports: [ServicioInscripciones],
})
export class ModuloInscripciones {}