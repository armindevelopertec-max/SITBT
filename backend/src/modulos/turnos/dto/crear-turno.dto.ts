import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearTurnoDto {
  @ApiProperty({ example: 'M' })
  @IsString()
  @MaxLength(10)
  codigo: string;

  @ApiProperty({ example: 'Mañana' })
  @IsString()
  @MaxLength(20)
  nombre: string;

  @ApiProperty({ example: '07:30' })
  @IsString()
  horaInicio: string;

  @ApiProperty({ example: '12:30' })
  @IsString()
  horaFin: string;
}
