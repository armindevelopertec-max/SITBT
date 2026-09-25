import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CredentialStatus } from '../../../entities/credencial.entity';

export class CreateCredentialDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiProperty({ example: 'CRED-2024-0001' })
  @IsString()
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  issued_date: string;

  @ApiProperty({ example: '2025-02-01' })
  @IsDateString()
  valid_until: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo_url?: string;

  @ApiPropertyOptional({ enum: CredentialStatus })
  @IsEnum(CredentialStatus)
  @IsOptional()
  status?: CredentialStatus;

  @ApiProperty()
  @IsInt()
  issued_by: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  printed?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}