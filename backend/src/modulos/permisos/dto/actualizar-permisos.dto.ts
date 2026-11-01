import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AccionPermiso } from '../../../entidades/permiso.entidad';

export class PermisoItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  modulo: string;

  @IsEnum(AccionPermiso)
  accion: AccionPermiso;
}

export class ActualizarPermisosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermisoItemDto)
  permisos: PermisoItemDto[];
}
