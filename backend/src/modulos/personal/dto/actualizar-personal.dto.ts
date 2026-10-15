import { PartialType } from '@nestjs/swagger';
import { CrearPersonalDto } from './crear-personal.dto';

export class ActualizarPersonalDto extends PartialType(CrearPersonalDto) {}