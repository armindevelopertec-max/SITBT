import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../../entities/grupo.entity';
import { GrupoEstudiante } from '../../entities/grupo-estudiante.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Carrera } from '../../entities/carrera.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Turno } from '../../entities/turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, GrupoEstudiante, Carrera, PlanEstudio, Turno])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}