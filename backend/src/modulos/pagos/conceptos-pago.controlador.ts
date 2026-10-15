import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioPagos } from './pagos.servicio';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Conceptos de Pago')
@Controller('conceptos-pago')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConceptosPago {
  constructor(private readonly servicio: ServicioPagos) {}

  @Get('todos')
  obtenerTodos() {
    return this.servicio.listarConceptos();
  }
}
