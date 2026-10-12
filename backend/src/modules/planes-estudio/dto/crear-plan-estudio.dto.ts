import { IsInt, IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPlanEstudio } from '../../../entities/plan-estudio.entity';

export class CrearPlanEstudioDto {
  @ApiProperty()
  @IsInt()
  career_id: number;

  @ApiProperty({ example: 'RM-1234/2020' })
  @IsString()
  @MaxLength(50)
  rm_number: string;

  @ApiProperty({ example: '2020-01-15' })
  @IsDateString()
  rm_date: string;

  @ApiPropertyOptional({ enum: EstadoPlanEstudio })
  @IsEnum(EstadoPlanEstudio)
  @IsOptional()
  status?: EstadoPlanEstudio;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}