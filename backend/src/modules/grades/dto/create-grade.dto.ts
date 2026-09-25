import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  GradeStatusRegular,
  GradeStatus2T,
  GradeStatusDefinitivo,
} from '../../../entities/calificacion.entity';

export class CreateGradeDto {
  @ApiProperty()
  @IsInt()
  enrollment_id: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  partial_1?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  partial_2?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  final_average?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  observation?: string;

  @ApiPropertyOptional({ enum: GradeStatusRegular })
  @IsEnum(GradeStatusRegular)
  @IsOptional()
  status_regular?: GradeStatusRegular;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  second_turn_eligible?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  second_turn_score?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  second_turn_applied?: boolean;

  @ApiPropertyOptional({ enum: GradeStatus2T })
  @IsEnum(GradeStatus2T)
  @IsOptional()
  status_2t?: GradeStatus2T;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  definitive_grade?: number;

  @ApiPropertyOptional({ enum: GradeStatusDefinitivo })
  @IsEnum(GradeStatusDefinitivo)
  @IsOptional()
  status_definitivo?: GradeStatusDefinitivo;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  registered_by?: number;
}