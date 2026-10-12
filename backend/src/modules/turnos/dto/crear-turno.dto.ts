import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearTurnoDto {
  @ApiProperty({ example: 'M' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty({ example: 'Mañana' })
  @IsString()
  @MaxLength(20)
  name: string;

  @ApiProperty({ example: '07:30' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '12:30' })
  @IsString()
  end_time: string;
}