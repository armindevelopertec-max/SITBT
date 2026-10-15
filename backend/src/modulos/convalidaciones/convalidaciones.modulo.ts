import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvalidacionEstudiante } from '../../entidades/convalidacion-estudiante.entidad';
import { Equivalencia } from '../../entidades/equivalencia.entidad';
import { ServicioConvalidaciones } from './convalidaciones.servicio';
import { ControladorConvalidaciones } from './convalidaciones.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([ConvalidacionEstudiante, Equivalencia, Estudiante, Materia, Usuario])],
  controllers: [ControladorConvalidaciones],
  providers: [ServicioConvalidaciones],
  exports: [ServicioConvalidaciones],
})
export class ModuloConvalidaciones {}