import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioDocente } from './docente.servicio';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { RegistrarCalificacionDto } from '../materias-impartidas/dto/registrar-calificacion.dto';

/**
 * Interfaz del docente. Todas las rutas se resuelven con el usuario del
 * token: el docente únicamente puede consultar y calificar las materias en
 * las que tiene una asignación activa.
 */
@ApiTags('Docente')
@Controller('docente')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('docente')
@ApiBearerAuth()
export class ControladorDocente {
  constructor(private readonly servicio: ServicioDocente) {}

  /** Resumen del docente: materias, estudiantes, grupos y carga horaria. */
  @Get('resumen')
  resumen(@Request() peticion) {
    return this.servicio.resumen(peticion.user.id);
  }

  /** Materias impartidas por el docente autenticado. */
  @Get('materias')
  listarMisMaterias(@Request() peticion, @Query('gestion') gestion?: string) {
    return this.servicio.listarMisMaterias(peticion.user.id, gestion);
  }

  /** Detalle de una materia que dicta el docente autenticado. */
  @Get('materias/:id')
  obtenerMateria(
    @Request() peticion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.servicio.obtenerMateria(peticion.user.id, id);
  }

  /** Estudiantes inscritos en una de sus materias. */
  @Get('materias/:id/estudiantes')
  obtenerEstudiantes(
    @Request() peticion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.servicio.obtenerEstudiantes(peticion.user.id, id);
  }

  /** Libro de calificaciones de una de sus materias. */
  @Get('materias/:id/libro')
  obtenerLibro(
    @Request() peticion,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.servicio.obtenerLibro(peticion.user.id, id);
  }

  /** Registra o corrige una nota en una de sus materias. */
  @Post('materias/:id/calificaciones')
  registrarCalificacion(
    @Request() peticion,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarCalificacionDto,
  ) {
    return this.servicio.registrarCalificacion(
      peticion.user.id,
      id,
      dto,
    );
  }
}
