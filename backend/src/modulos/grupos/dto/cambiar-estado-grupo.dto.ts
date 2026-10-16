import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoGrupo } from '../../../entidades/grupo.entidad';

export class CambiarEstadoGrupoDto {
  @ApiProperty({ enum: EstadoGrupo, example: EstadoGrupo.CERRADO })
  @IsEnum(EstadoGrupo)
  @IsNotEmpty()
  estado: EstadoGrupo;
}
