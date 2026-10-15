import { PartialType } from '@nestjs/swagger';
import { CrearInscripcionDto } from './crear-inscripcion.dto';

export class ActualizarInscripcionDto extends PartialType(CrearInscripcionDto) {}