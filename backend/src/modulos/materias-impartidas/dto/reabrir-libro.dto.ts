import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReabrirLibroDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  motivo: string;
}
