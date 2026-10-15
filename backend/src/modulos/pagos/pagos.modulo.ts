import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../../entidades/pago.entidad';
import { ServicioPagos } from './pagos.servicio';
import { ControladorPagos } from './pagos.controlador';
import { ControladorConceptosPago } from './conceptos-pago.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { ConceptoPago } from '../../entidades/concepto-pago.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Estudiante, ConceptoPago, Usuario])],
  controllers: [ControladorPagos, ControladorConceptosPago],
  providers: [ServicioPagos],
  exports: [ServicioPagos],
})
export class ModuloPagos {}