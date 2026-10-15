import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { ServicioPlanesEstudio } from './planes-estudio.servicio';
import { ControladorPlanesEstudio } from './planes-estudio.controlador';
import { ControladorPlanesEstudioPublico } from './planes-estudio-publico.controlador';
import { Carrera } from '../../entidades/carrera.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEstudio, Carrera, MateriaPlan, Materia])],
  controllers: [ControladorPlanesEstudio, ControladorPlanesEstudioPublico],
  providers: [ServicioPlanesEstudio],
  exports: [ServicioPlanesEstudio],
})
export class ModuloPlanesEstudio {}