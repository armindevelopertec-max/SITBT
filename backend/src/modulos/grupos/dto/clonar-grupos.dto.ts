import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClonarGruposDto {
  @ApiProperty({ example: 1, description: 'ID del periodo de origen' })
  @IsInt()
  @IsNotEmpty()
  periodoOrigenId: number;

  @ApiProperty({ example: 2, description: 'ID del periodo de destino' })
  @IsInt()
  @IsNotEmpty()
  periodoDestinoId: number;

  @ApiPropertyOptional({ example: 4, description: 'Opcional: clonar solo los grupos de una carrera' })
  @IsOptional()
  @IsInt()
  carreraId?: number;
}
