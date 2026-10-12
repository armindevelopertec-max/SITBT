import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from '../../entities/materia.entity';
import { ServicioMaterias } from './materias.service';
import { ControladorMaterias } from './materias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Materia])],
  controllers: [ControladorMaterias],
  providers: [ServicioMaterias],
  exports: [ServicioMaterias],
})
export class ModuloMaterias {}