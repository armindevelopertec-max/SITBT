import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioPreinscripcion } from './preinscripcion.servicio';
import { ControladorPreinscripcion } from './preinscripcion.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Pago } from '../../entidades/pago.entidad';
import { ConceptoPago } from '../../entidades/concepto-pago.entidad';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Grupo } from '../../entidades/grupo.entidad';
import { Turno } from '../../entidades/turno.entidad';
import { Periodo } from '../../entidades/periodo.entidad';
import { Gestion } from '../../entidades/gestion.entidad';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { DocumentoEmitido } from '../../entidades/documento-emitido.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Estudiante,
      Pago,
      ConceptoPago,
      Inscripcion,
      MateriaPlan,
      Materia,
      Grupo,
      Turno,
      Periodo,
      Gestion,
      Calificacion,
      DocumentoEmitido,
    ]),
  ],
  controllers: [ControladorPreinscripcion],
  providers: [ServicioPreinscripcion],
  exports: [ServicioPreinscripcion],
})
export class ModuloPreinscripcion {}
