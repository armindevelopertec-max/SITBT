import { PartialType } from '@nestjs/swagger';
import { CrearConvalidacionDto } from './crear-convalidacion.dto';

export class ActualizarConvalidacionDto extends PartialType(CrearConvalidacionDto) {}