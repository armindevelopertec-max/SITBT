import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { ServicioEstudiante } from './estudiante.servicio';

/**
 * Interfaz del estudiante. Todas las rutas se resuelven con el usuario del
 * token: el estudiante únicamente puede consultar sus propias materias y
 * calificaciones. Es una interfaz de solo lectura.
 */
@ApiTags('Estudiante')
@Controller('estudiante')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('estudiante')
@ApiBearerAuth()
export class ControladorEstudiante {
  constructor(private readonly servicio: ServicioEstudiante) {}

  /** Resumen del estudiante: materias en curso, notas y promedio general. */
  @Get('resumen')
  resumen(@Request() peticion) {
    return this.servicio.resumen(peticion.user.id);
  }

  /** Materias que el estudiante autenticado está cursando. */
  @Get('materias')
  listarMisMaterias(@Request() peticion, @Query('gestion') gestion?: string) {
    return this.servicio.listarMisMaterias(peticion.user.id, gestion);
  }

  /** Detalle de una materia propia junto con su calificación. */
  @Get('materias/:id')
  obtenerMateria(
    @Request() peticion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.servicio.obtenerMateria(peticion.user.id, id);
  }
}
