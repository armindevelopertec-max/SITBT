import { PartialType } from '@nestjs/swagger';
import { CrearPersonaDto } from './crear-persona.dto';

export class ActualizarPersonaDto extends PartialType(CrearPersonaDto) {}