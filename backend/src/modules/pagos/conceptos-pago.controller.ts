import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioPagos } from './pagos.service';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Conceptos de Pago')
@Controller('conceptos-pago')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConceptosPago {
  constructor(private readonly service: ServicioPagos) {}

  @Get('todos')
  findAll() {
    return this.service.listarConceptos();
  }
}
