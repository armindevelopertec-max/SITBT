import { PartialType } from '@nestjs/swagger';
import { CrearRolDto } from './create-role.dto';

export class ActualizarRolDto extends PartialType(CrearRolDto) {}