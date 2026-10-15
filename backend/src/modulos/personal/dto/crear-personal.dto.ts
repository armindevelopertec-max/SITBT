import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CargoPersonal, EstadoPersonal } from '../../../entidades/personal.entidad';

export class CrearPersonalDto {
  @ApiProperty()
  @IsInt()
  personaId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  profesion?: string;

  @ApiProperty({ enum: CargoPersonal })
  @IsEnum(CargoPersonal)
  cargo: CargoPersonal;

  @ApiProperty({ example: '2020-02-01' })
  @IsDateString()
  fechaContrato: string;

  @ApiPropertyOptional({ enum: EstadoPersonal })
  @IsEnum(EstadoPersonal)
  @IsOptional()
  estado?: EstadoPersonal;
}