import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearMateriaImpartidaDto {
  @ApiProperty()
  @IsInt()
  grupoId: number;

  @ApiProperty()
  @IsInt()
  materiaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  materiaPlanId?: number;
}
