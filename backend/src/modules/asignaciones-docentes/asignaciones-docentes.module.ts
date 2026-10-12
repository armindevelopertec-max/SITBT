import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionDocente } from '../../entities/asignacion-docente.entity';
import { ServicioAsignacionesDocentes } from './asignaciones-docentes.service';
import { ControladorAsignacionesDocentes } from './asignaciones-docentes.controller';
import { Personal } from '../../entities/personal.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionDocente, Personal, Materia, Grupo])],
  controllers: [ControladorAsignacionesDocentes],
  providers: [ServicioAsignacionesDocentes],
  exports: [ServicioAsignacionesDocentes],
})
export class ModuloAsignacionesDocentes {}