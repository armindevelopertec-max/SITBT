import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty()
  @IsInt()
  career_id: number;

  @ApiProperty()
  @IsInt()
  study_plan_id: number;

  @ApiProperty()
  @IsInt()
  subject_id: number;

  @ApiProperty()
  @IsInt()
  semester: number;

  @ApiProperty()
  @IsInt()
  shift_id: number;

  @ApiProperty({ example: 'A' })
  @IsString()
  @MaxLength(5)
  parallel: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiProperty({ example: 'I' })
  @IsString()
  @MaxLength(2)
  periodo: string;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @IsOptional()
  capacity?: number;
}