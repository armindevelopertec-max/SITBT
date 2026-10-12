import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../../entities/grupo.entity';
import { GrupoEstudiante } from '../../entities/grupo-estudiante.entity';
import { ServicioGrupos } from './grupos.service';
import { ControladorGrupos } from './grupos.controller';
import { Carrera } from '../../entities/carrera.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Turno } from '../../entities/turno.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, GrupoEstudiante, Carrera, PlanEstudio, Turno, MateriaPlan, Materia])],
  controllers: [ControladorGrupos],
  providers: [ServicioGrupos],
  exports: [ServicioGrupos],
})
export class ModuloGrupos {}