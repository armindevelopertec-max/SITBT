import { PartialType } from '@nestjs/swagger';
import { CrearGrupoDto } from './crear-grupo.dto';

export class ActualizarGrupoDto extends PartialType(CrearGrupoDto) {}