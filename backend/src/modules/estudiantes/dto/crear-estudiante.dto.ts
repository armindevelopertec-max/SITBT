import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '../../../entities/estudiante.entity';

export class CrearEstudianteDto {
  @ApiProperty()
  @IsInt()
  person_id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  bachelor_title_number?: string;

  @ApiPropertyOptional({ example: '2020-06-15' })
  @IsDateString()
  @IsOptional()
  bachelor_title_date?: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  admission_gestion: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  folder_number?: string;

  @ApiPropertyOptional({ example: 'INS-2024-0001' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  inscription_code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  form01_code?: string;

  @ApiProperty()
  @IsInt()
  career_id: number;

  @ApiProperty()
  @IsInt()
  study_plan_id: number;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  admission_date: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}