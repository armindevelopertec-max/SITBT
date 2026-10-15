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
import { ServicioAsignacionesDocentes } from './asignaciones-docentes.servicio';
import { CrearAsignacionDocenteDto } from './dto/crear-asignacion-docente.dto';
import { ActualizarAsignacionDocenteDto } from './dto/actualizar-asignacion-docente.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoAsignacionDocente } from '../../entidades/asignacion-docente.entidad';

@ApiTags('AsignacionesDocentes')
@Controller('asignaciones-docentes')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorAsignacionesDocentes {
  constructor(private readonly servicio: ServicioAsignacionesDocentes) {}

  @Post()
  crear(@Body() dtoCreacion: CrearAsignacionDocenteDto) {
    return this.servicio.crear(dtoCreacion);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') estado?: EstadoAsignacionDocente,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, gestion, estado);
  }

  @Get('activos')
  buscarActivos(@Query('gestion') gestion: string) {
    return this.servicio.buscarActivos(gestion);
  }

  @Get('docente/:docenteId')
  buscarPorDocente(@Param('docenteId', ParseIntPipe) docenteId: number, @Query('gestion') gestion?: string) {
    return this.servicio.buscarPorDocente(docenteId, gestion);
  }

  @Get('grupo/:grupoId')
  buscarPorGrupo(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.servicio.buscarPorGrupo(grupoId, gestion);
  }

  @Get('materia/:materiaId')
  buscarPorMateria(@Param('materiaId', ParseIntPipe) materiaId: number, @Query('gestion') gestion: string) {
    return this.servicio.buscarPorMateria(materiaId, gestion);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dtoActualizacion: ActualizarAsignacionDocenteDto) {
    return this.servicio.actualizar(id, dtoActualizacion);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }
}
