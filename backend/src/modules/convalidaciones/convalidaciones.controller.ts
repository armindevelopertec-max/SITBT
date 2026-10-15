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
import { ServicioConvalidaciones } from './convalidaciones.service';
import { CrearConvalidacionDto } from './dto/crear-convalidacion.dto';
import { ActualizarConvalidacionDto } from './dto/actualizar-convalidacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoConvalidacion, TipoConvalidacion } from '../../entities/convalidacion-estudiante.entity';

@ApiTags('Convalidaciones')
@Controller('convalidaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConvalidaciones {
  constructor(private readonly servicio: ServicioConvalidaciones) {}

  @Post()
  crear(@Body() dtoCreacion: CrearConvalidacionDto) {
    return this.servicio.crear(dtoCreacion);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoConvalidacion,
    @Query('tipo') tipo?: TipoConvalidacion,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, estado, tipo, estudianteId ? +estudianteId : undefined);
  }

  @Get('pendientes')
  obtenerPendientes() {
    return this.servicio.obtenerPendientes();
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicio.buscarPorEstudiante(estudianteId);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dtoActualizacion: ActualizarConvalidacionDto) {
    return this.servicio.actualizar(id, dtoActualizacion);
  }

  @Patch(':id/aprobar')
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: { aprobadoPor: number; numeroResolucion?: string; fechaResolucion?: string },
  ) {
    return this.servicio.aprobar(
      id,
      cuerpo.aprobadoPor,
      cuerpo.numeroResolucion,
      cuerpo.fechaResolucion ? new Date(cuerpo.fechaResolucion) : undefined,
    );
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.rechazar(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }
}
