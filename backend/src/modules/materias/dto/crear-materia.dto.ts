import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMateriaDto {
  @ApiProperty({ example: 'INF' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Programación I' })
  @IsString()
  @MaxLength(150)
  name: string;
}