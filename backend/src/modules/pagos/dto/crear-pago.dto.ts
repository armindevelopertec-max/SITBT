import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoPago, EstadoPago } from '../../../entities/pago.entity';

export class CrearPagoDto {
  @ApiProperty()
  @IsInt()
  student_id: number;

  @ApiProperty()
  @IsInt()
  concept_id: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  payment_date: string;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  payment_method: MetodoPago;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  receipt_number?: string;

  @ApiProperty()
  @IsInt()
  received_by: number;

  @ApiPropertyOptional({ enum: EstadoPago })
  @IsEnum(EstadoPago)
  @IsOptional()
  status?: EstadoPago;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}