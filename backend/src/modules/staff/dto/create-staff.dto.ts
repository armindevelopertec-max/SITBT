import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffPosition, StaffStatus } from '../../../entities/personal.entity';

export class CreateStaffDto {
  @ApiProperty()
  @IsInt()
  person_id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  profession?: string;

  @ApiProperty({ enum: StaffPosition })
  @IsEnum(StaffPosition)
  position: StaffPosition;

  @ApiProperty({ example: '2020-02-01' })
  @IsDateString()
  hire_date: string;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}