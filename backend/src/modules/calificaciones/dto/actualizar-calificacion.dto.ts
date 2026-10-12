import { PartialType } from '@nestjs/swagger';
import { CrearCalificacionDto } from './crear-calificacion.dto';

export class ActualizarCalificacionDto extends PartialType(CrearCalificacionDto) {}