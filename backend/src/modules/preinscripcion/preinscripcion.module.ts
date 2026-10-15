import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioPreinscripcion } from './preinscripcion.service';
import { ControladorPreinscripcion } from './preinscripcion.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Pago } from '../../entities/pago.entity';
import { ConceptoPago } from '../../entities/concepto-pago.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';
import { Turno } from '../../entities/turno.entity';
import { Periodo } from '../../entities/periodo.entity';
import { Gestion } from '../../entities/gestion.entity';
import { Calificacion } from '../../entities/calificacion.entity';
import { DocumentoEmitido } from '../../entities/emitted-document.entity';

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
