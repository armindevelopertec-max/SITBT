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
  estudianteId: number;

  @ApiProperty()
  @IsInt()
  conceptoId: number;

  @ApiProperty({ example: '2024' })
  @IsString()
  @MaxLength(10)
  gestion: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  monto: number;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  fechaPago: Date;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroRecibo?: string;

  @ApiProperty()
  @IsInt()
  recibidoPor: number;

  @ApiPropertyOptional({ enum: EstadoPago })
  @IsEnum(EstadoPago)
  @IsOptional()
  estado?: EstadoPago;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}