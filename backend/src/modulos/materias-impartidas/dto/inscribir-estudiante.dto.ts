import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InscribirEstudianteDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;
}
