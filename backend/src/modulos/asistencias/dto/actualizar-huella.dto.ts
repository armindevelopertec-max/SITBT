import { PartialType } from '@nestjs/swagger';
import { CrearHuellaDto } from './crear-huella.dto';

export class ActualizarHuellaDto extends PartialType(CrearHuellaDto) {}
