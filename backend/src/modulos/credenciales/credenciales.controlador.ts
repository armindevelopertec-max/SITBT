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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ServicioCredenciales } from './credenciales.servicio';
import { CrearCredencialDto } from './dto/crear-credencial.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoCredencial } from '../../entidades/credencial.entidad';

@ApiTags('Credenciales')
@Controller('credenciales')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria')
@ApiBearerAuth()
export class ControladorCredenciales {
  constructor(private readonly servicio: ServicioCredenciales) {}

  @Post()
  crear(@Body() dtoCreacion: CrearCredencialDto, @Req() peticion: Request) {
    const usuario = peticion.user as { id: number };
    dtoCreacion.emitidoPor = usuario.id;
    return this.servicio.crear(dtoCreacion);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('semestre') semestre?: string,
    @Query('estado') estado?: EstadoCredencial,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, gestion, semestre ? +semestre : undefined, estado);
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicio.buscarPorEstudiante(estudianteId);
  }

  @Get('estudiante/:estudianteId/gestion/:gestion')
  buscarPorEstudianteYGestion(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('gestion') gestion: string,
  ) {
    return this.servicio.buscarPorEstudianteYGestion(estudianteId, gestion);
  }

  @Get('estudiante/:estudianteId/activos')
  buscarActivosPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicio.buscarActivosPorEstudiante(estudianteId);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dtoActualizacion: ActualizarCredencialDto) {
    return this.servicio.actualizar(id, dtoActualizacion);
  }

  @Patch(':id/marcar-impreso')
  marcarComoImpreso(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.marcarComoImpreso(id);
  }

  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.anular(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }
}
