import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calificacion } from '../../entities/calificacion.entity';
import { AuditoriaCalificacion } from '../../entities/auditoria-calificacion.entity';
import { ServicioCalificaciones } from './calificaciones.service';
import { ControladorCalificaciones } from './calificaciones.controller';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { Personal } from '../../entities/personal.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calificacion, AuditoriaCalificacion, Inscripcion, Personal, Usuario])],
  controllers: [ControladorCalificaciones],
  providers: [ServicioCalificaciones],
  exports: [ServicioCalificaciones],
})
export class ModuloCalificaciones {}