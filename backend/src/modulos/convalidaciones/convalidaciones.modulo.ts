import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvalidacionEstudiante } from '../../entidades/convalidacion-estudiante.entidad';
import { Equivalencia } from '../../entidades/equivalencia.entidad';
import { ProcesoConvalidacion } from '../../entidades/proceso-convalidacion.entidad';
import { EquivalenciaPlan } from '../../entidades/equivalencia-plan.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { ServicioConvalidaciones } from './convalidaciones.servicio';
import { ControladorConvalidaciones } from './convalidaciones.controlador';
import { ServicioProcesosConvalidacion } from './procesos-convalidacion.servicio';
import { ControladorProcesosConvalidacion } from './procesos-convalidacion.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConvalidacionEstudiante,
      Equivalencia,
      ProcesoConvalidacion,
      EquivalenciaPlan,
      PlanEstudio,
      MateriaPlan,
      Estudiante,
      Materia,
      Usuario,
    ]),
  ],
  controllers: [ControladorConvalidaciones, ControladorProcesosConvalidacion],
  providers: [ServicioConvalidaciones, ServicioProcesosConvalidacion],
  exports: [ServicioConvalidaciones, ServicioProcesosConvalidacion],
})
export class ModuloConvalidaciones {}
