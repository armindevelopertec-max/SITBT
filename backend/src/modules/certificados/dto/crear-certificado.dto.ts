import { IsInt, IsString, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCertificadoDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;

  @ApiProperty({ example: 'certificate_study' })
  @IsString()
  @MaxLength(50)
  tipo: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: 'CERT-2024-0001' })
  @IsString()
  @MaxLength(30)
  codigo: string;

  @ApiProperty()
  @IsInt()
  emitidoPor: number;
}