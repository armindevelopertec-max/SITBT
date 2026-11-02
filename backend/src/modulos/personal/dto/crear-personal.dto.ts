import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPersonal } from '../../../entidades/personal.entidad';

export class CrearPersonalDto {
  @ApiProperty()
  @IsInt()
  personaId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  profesion?: string;

  /**
   * Cargo del personal. Debe coincidir con el `codigo` de un rol activo
   * (ver /roles). El servicio valida la existencia del rol y lo asigna
   * al usuario creado.
   */
  @ApiProperty({ example: 'docente', description: 'Código de un rol activo' })
  @IsString()
  @MaxLength(50)
  cargo: string;

  @ApiProperty({ example: '2020-02-01' })
  @IsDateString()
  fechaContrato: string;

  @ApiPropertyOptional({ enum: EstadoPersonal })
  @IsString()
  @IsOptional()
  estado?: EstadoPersonal;
}
