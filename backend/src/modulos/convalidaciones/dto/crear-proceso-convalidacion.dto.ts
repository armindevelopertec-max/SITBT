import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Crea un proceso de convalidación entre un plan de origen y uno de destino. */
export class CrearProcesoConvalidacionDto {
  @ApiProperty()
  @IsInt()
  carreraId: number;

  @ApiProperty()
  @IsInt()
  planOrigenId: number;

  @ApiProperty()
  @IsInt()
  planDestinoId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notas?: string;
}
