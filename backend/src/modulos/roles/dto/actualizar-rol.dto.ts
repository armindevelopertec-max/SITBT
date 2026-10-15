import { PartialType } from '@nestjs/swagger';
import { CrearRolDto } from './crear-rol.dto';

export class ActualizarRolDto extends PartialType(CrearRolDto) {}