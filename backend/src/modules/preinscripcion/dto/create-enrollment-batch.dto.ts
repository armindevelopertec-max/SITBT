import { IsInt, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubjectToEnroll } from './calculate-subjects.dto';

export class CreateEnrollmentBatchDto {
  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  periodo?: string;

  @ApiProperty()
  @IsInt()
  groupId: number;

  @ApiProperty({ type: [SubjectToEnroll] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectToEnroll)
  subjects: SubjectToEnroll[];
}

export class CreateEnrollmentResult {
  success: boolean;
  enrollments: {
    id: number;
    subjectName: string;
    groupName: string;
  }[];
  boletaId?: string;
  message: string;
}
