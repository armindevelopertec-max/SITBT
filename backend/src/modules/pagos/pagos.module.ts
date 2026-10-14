import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../../entities/pago.entity';
import { ServicioPagos } from './pagos.service';
import { ControladorPagos } from './pagos.controller';
import { ControladorConceptosPago } from './conceptos-pago.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { ConceptoPago } from '../../entities/concepto-pago.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Estudiante, ConceptoPago, Usuario])],
  controllers: [ControladorPagos, ControladorConceptosPago],
  providers: [ServicioPagos],
  exports: [ServicioPagos],
})
export class ModuloPagos {}