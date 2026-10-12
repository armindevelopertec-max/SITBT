import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { ServicioInscripciones } from './inscripciones.service';
import { ControladorInscripciones } from './inscripciones.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Estudiante, Materia, Grupo])],
  controllers: [ControladorInscripciones],
  providers: [ServicioInscripciones],
  exports: [ServicioInscripciones],
})
export class ModuloInscripciones {}