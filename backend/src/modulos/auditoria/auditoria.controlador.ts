import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioAuditoria } from './auditoria.servicio';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Auditoria')
@Controller('auditoria')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador')
@ApiBearerAuth()
export class ControladorAuditoria {
  constructor(private readonly servicio: ServicioAuditoria) {}

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 50,
    @Query('usuarioId') usuarioId?: number,
    @Query('accion') accion?: string,
    @Query('tabla') tabla?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.servicio.obtenerTodos(
      +pagina,
      +limite,
      usuarioId ? +usuarioId : undefined,
      accion,
      tabla,
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }

  @Get('usuario/:usuarioId')
  buscarPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number, @Query('limite') limite = 50) {
    return this.servicio.buscarPorUsuario(usuarioId, +limite);
  }

  @Get('tabla/:tabla')
  buscarPorTabla(@Param('tabla') nombreTabla: string, @Query('limite') limite = 50) {
    return this.servicio.buscarPorTabla(nombreTabla, +limite);
  }

  @Get('registro/:tabla/:registroId')
  buscarPorRegistro(@Param('tabla') nombreTabla: string, @Param('registroId', ParseIntPipe) registroId: number) {
    return this.servicio.buscarPorRegistro(nombreTabla, registroId);
  }

  @Get('recientes')
  obtenerAccionesRecientes(@Query('limite') limite = 20) {
    return this.servicio.obtenerAccionesRecientes(+limite);
  }

  @Get('estadisticas')
  obtenerEstadisticasAcciones(@Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string) {
    return this.servicio.obtenerEstadisticasAcciones(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }
}
