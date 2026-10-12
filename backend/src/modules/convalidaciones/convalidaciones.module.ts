import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvalidacionEstudiante } from '../../entities/convalidacion-estudiante.entity';
import { Equivalencia } from '../../entities/equivalencia.entity';
import { ServicioConvalidaciones } from './convalidaciones.service';
import { ControladorConvalidaciones } from './convalidaciones.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Materia } from '../../entities/materia.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConvalidacionEstudiante, Equivalencia, Estudiante, Materia, Usuario])],
  controllers: [ControladorConvalidaciones],
  providers: [ServicioConvalidaciones],
  exports: [ServicioConvalidaciones],
})
export class ModuloConvalidaciones {}