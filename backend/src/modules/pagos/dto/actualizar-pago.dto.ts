import { PartialType } from '@nestjs/swagger';
import { CrearPagoDto } from './crear-pago.dto';

export class ActualizarPagoDto extends PartialType(CrearPagoDto) {}