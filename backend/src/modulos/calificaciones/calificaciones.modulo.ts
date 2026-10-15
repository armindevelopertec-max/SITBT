import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { AuditoriaCalificacion } from '../../entidades/auditoria-calificacion.entidad';
import { ServicioCalificaciones } from './calificaciones.servicio';
import { ControladorCalificaciones } from './calificaciones.controlador';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Calificacion, AuditoriaCalificacion, Inscripcion, Personal, Usuario])],
  controllers: [ControladorCalificaciones],
  providers: [ServicioCalificaciones],
  exports: [ServicioCalificaciones],
})
export class ModuloCalificaciones {}