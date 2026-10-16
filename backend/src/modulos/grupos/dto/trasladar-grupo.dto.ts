import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrasladarGrupoDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  grupoDestinoId: number;
}
