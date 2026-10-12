import { IsInt, IsString, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCertificadoDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

  @ApiProperty({ example: 'certificate_study' })
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'CERT-2024-0001' })
  @IsString()
  @MaxLength(30)
  code: string;

  @ApiProperty()
  @IsInt()
  issued_by: number;
}