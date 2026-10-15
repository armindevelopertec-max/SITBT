import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMateriaDto {
  @ApiProperty({ example: 'INF' })
  @IsString()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Programación I' })
  @IsString()
  @MaxLength(150)
  nombre: string;
}
