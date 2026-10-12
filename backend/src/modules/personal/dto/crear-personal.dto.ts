import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CargoPersonal, EstadoPersonal } from '../../../entities/personal.entity';

export class CrearPersonalDto {
  @ApiProperty()
  @IsInt()
  person_id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  profession?: string;

  @ApiProperty({ enum: CargoPersonal })
  @IsEnum(CargoPersonal)
  position: CargoPersonal;

  @ApiProperty({ example: '2020-02-01' })
  @IsDateString()
  hire_date: string;

  @ApiPropertyOptional({ enum: EstadoPersonal })
  @IsEnum(EstadoPersonal)
  @IsOptional()
  status?: EstadoPersonal;
}