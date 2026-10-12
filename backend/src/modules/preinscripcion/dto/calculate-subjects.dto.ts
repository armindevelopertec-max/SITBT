import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateSubjectsDto {
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

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  shiftId?: number;
}

export class SubjectToEnroll {
  materiaPlanId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  semester: number;
  isFromFailed: boolean;
  failedPreviousGrade?: number;
  prerequisiteBlocked: boolean;
  prerequisiteName?: string;
}

export class CalculateSubjectsResult {
  canEnroll: boolean;
  currentSemester: number;
  subjects: SubjectToEnroll[];
  failedSubjects: {
    subjectId: number;
    subjectName: string;
    grade: number;
    previousGestion: string;
  }[];
  blockedSubjects: {
    subjectId: number;
    subjectName: string;
    reason: string;
  }[];
  totalReprobadas: number;
  message: string;
}
