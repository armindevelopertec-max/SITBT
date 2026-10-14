import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { ServicioPlanesEstudio } from './planes-estudio.service';
import { ControladorPlanesEstudio } from './planes-estudio.controller';
import { ControladorPlanesEstudioPublico } from './planes-estudio-publico.controller';
import { Carrera } from '../../entities/carrera.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEstudio, Carrera, MateriaPlan, Materia])],
  controllers: [ControladorPlanesEstudio, ControladorPlanesEstudioPublico],
  providers: [ServicioPlanesEstudio],
  exports: [ServicioPlanesEstudio],
})
export class ModuloPlanesEstudio {}