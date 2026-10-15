import { PartialType } from '@nestjs/swagger';
import { CrearGestionDto } from './crear-gestion.dto';

export class ActualizarGestionDto extends PartialType(CrearGestionDto) {
  anio?: string;
  tipoPeriodo?: any;
  estado?: any;
  esActual?: boolean;
  notas?: string;
}
