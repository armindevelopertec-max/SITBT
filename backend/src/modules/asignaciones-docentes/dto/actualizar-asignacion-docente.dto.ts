import { PartialType } from '@nestjs/swagger';
import { CrearAsignacionDocenteDto } from './crear-asignacion-docente.dto';

export class ActualizarAsignacionDocenteDto extends PartialType(CrearAsignacionDocenteDto) {}