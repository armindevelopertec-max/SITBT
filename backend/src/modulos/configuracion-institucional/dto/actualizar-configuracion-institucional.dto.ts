import { PartialType } from '@nestjs/swagger';
import { CrearConfiguracionInstitucionalDto } from './crear-configuracion-institucional.dto';

export class ActualizarConfiguracionInstitucionalDto extends PartialType(CrearConfiguracionInstitucionalDto) {}
