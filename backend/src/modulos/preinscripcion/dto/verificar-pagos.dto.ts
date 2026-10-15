import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificarPagosDto {
  @ApiProperty()
  @IsInt()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  periodo?: string;
}

export class ResultadoVerificarPagos {
  puedeInscribir: boolean;
  pagosFaltantes: {
    tipo: string;
    concepto: string;
    monto: number;
  }[];
  pagosRealizados: {
    tipo: string;
    concepto: string;
    monto: number;
    fechaPago: Date;
  }[];
  esEstudianteNuevo: boolean;
}
