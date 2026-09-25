import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionDocente } from '../../entities/asignacion-docente.entity';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { TeachingAssignmentsController } from './teaching-assignments.controller';
import { Personal } from '../../entities/personal.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionDocente, Personal, Materia, Grupo])],
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService],
  exports: [TeachingAssignmentsService],
})
export class TeachingAssignmentsModule {}