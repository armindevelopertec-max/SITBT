import { PartialType } from '@nestjs/swagger';
import { CrearEstudianteDto } from './crear-estudiante.dto';

export class ActualizarEstudianteDto extends PartialType(CrearEstudianteDto) {}