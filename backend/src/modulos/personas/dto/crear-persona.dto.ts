import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genero, EstadoCivil, TipoSangre, EstadoPersona } from '../../../entidades/persona.entidad';

export class CrearPersonaDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @MaxLength(50)
  apellidoPaterno: string;

  @ApiProperty({ example: 'Gomez' })
  @IsString()
  @MaxLength(50)
  apellidoMaterno: string;

  @ApiProperty({ example: '1995-03-15' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiPropertyOptional({ example: 'La Paz' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lugarNacimiento?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lugarNacimientoOtro?: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiPropertyOptional({ enum: EstadoCivil })
  @IsEnum(EstadoCivil)
  @IsOptional()
  estadoCivil?: EstadoCivil;

  @ApiPropertyOptional({ example: 'Boliviana' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nacionalidad?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nacionalidadOtra?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dobleNacionalidad?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroPasaporte?: string;

  @ApiPropertyOptional({ enum: TipoSangre })
  @IsEnum(TipoSangre)
  @IsOptional()
  tipoSangre?: TipoSangre;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  discapacidad?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroLibretaMilitar?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lenguaMaterna?: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  correo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fotoUrl?: string;

  @ApiPropertyOptional({ enum: EstadoPersona })
  @IsEnum(EstadoPersona)
  @IsOptional()
  estado?: EstadoPersona;
}
