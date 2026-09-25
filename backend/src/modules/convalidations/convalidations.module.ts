import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvalidacionEstudiante } from '../../entities/convalidacion-estudiante.entity';
import { Equivalencia } from '../../entities/equivalencia.entity';
import { ConvalidationsService } from './convalidations.service';
import { ConvalidationsController } from './convalidations.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Materia } from '../../entities/materia.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConvalidacionEstudiante, Equivalencia, Estudiante, Materia, Usuario])],
  controllers: [ConvalidationsController],
  providers: [ConvalidationsService],
  exports: [ConvalidationsService],
})
export class ConvalidationsModule {}