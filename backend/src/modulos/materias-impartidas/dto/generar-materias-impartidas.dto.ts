import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerarMateriasImpartidasDto {
  @ApiProperty()
  @IsInt()
  periodoId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  carreraId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  grupoId?: number;
}
