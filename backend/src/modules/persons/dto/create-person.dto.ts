import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, MaritalStatus, BloodType, PersonStatus } from '../../../entities/persona.entity';

export class CreatePersonDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString()
  @MaxLength(100)
  names: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @MaxLength(50)
  lastname_paternal: string;

  @ApiProperty({ example: 'Gomez' })
  @IsString()
  @MaxLength(50)
  lastname_maternal: string;

  @ApiProperty({ example: '1995-03-15' })
  @IsDateString()
  birthdate: string;

  @ApiPropertyOptional({ example: 'La Paz' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  birthplace?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  birthplace_other?: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  @IsOptional()
  marital_status?: MaritalStatus;

  @ApiPropertyOptional({ example: 'Boliviana' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nationality_other?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dual_nationality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  passport_number?: string;

  @ApiPropertyOptional({ enum: BloodType })
  @IsEnum(BloodType)
  @IsOptional()
  blood_type?: BloodType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  disability?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  military_book_number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  mother_tongue?: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo_url?: string;

  @ApiPropertyOptional({ enum: PersonStatus })
  @IsEnum(PersonStatus)
  @IsOptional()
  status?: PersonStatus;
}