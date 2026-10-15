import { IsInt, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MateriaAInscribir } from './calcular-materias.dto';

export class CrearInscripcionLoteDto {
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

  @ApiProperty()
  @IsInt()
  grupoId: number;

  @ApiProperty({ type: [MateriaAInscribir] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MateriaAInscribir)
  materias: MateriaAInscribir[];
}

export class ResultadoCrearInscripcion {
  exito: boolean;
  inscripciones: {
    id: number;
    materiaNombre: string;
    nombreGrupo: string;
  }[];
  boletaId?: string;
  mensaje: string;
}
