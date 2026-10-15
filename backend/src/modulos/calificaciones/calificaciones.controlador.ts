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
import { ServicioCalificaciones } from './calificaciones.servicio';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoCalificacionDefinitivo } from '../../entidades/calificacion.entidad';

@ApiTags('Calificaciones')
@Controller('calificaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorCalificaciones {
  constructor(private readonly servicioCalificaciones: ServicioCalificaciones) {}

  @Post()
  crear(@Body() crearCalificacionDto: CrearCalificacionDto) {
    return this.servicioCalificaciones.crear(crearCalificacionDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('estadoDefinitivo') estadoDefinitivo?: EstadoCalificacionDefinitivo,
  ) {
    return this.servicioCalificaciones.obtenerTodos(+pagina, +limite, gestion, estadoDefinitivo);
  }

  @Get('estudiante/:estudianteId')
  obtenerCalificacionesPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion?: string) {
    return this.servicioCalificaciones.obtenerCalificacionesPorEstudiante(estudianteId, gestion);
  }

  @Get('grupo/:grupoId')
  obtenerCalificacionesPorGrupo(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.servicioCalificaciones.obtenerCalificacionesPorGrupo(grupoId, gestion);
  }

  @Get('inscripcion/:inscripcionId')
  buscarPorInscripcion(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.servicioCalificaciones.buscarPorInscripcion(inscripcionId);
  }

  @Get('inscripcion/:inscripcionId/historial')
  obtenerHistorialCalificaciones(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.servicioCalificaciones.obtenerHistorialCalificaciones(inscripcionId);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCalificaciones.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCalificacionDto: ActualizarCalificacionDto,
    @Body('registradoPor') registradoPor: number,
  ) {
    return this.servicioCalificaciones.actualizar(id, actualizarCalificacionDto, registradoPor);
  }

  @Patch(':id/parciales')
  actualizarParciales(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: { parcial1?: number; parcial2?: number; registradoPor?: number },
  ) {
    return this.servicioCalificaciones.actualizarParciales(id, cuerpo.parcial1, cuerpo.parcial2, cuerpo.registradoPor);
  }

  @Patch(':id/segundo-turno')
  aplicarSegundaTurno(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: { nota: number; registradoPor?: number },
  ) {
    return this.servicioCalificaciones.aplicarSegundaTurno(id, cuerpo.nota, cuerpo.registradoPor);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCalificaciones.eliminar(id);
  }
}
