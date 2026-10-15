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
import { ServicioInscripciones } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoInscripcion } from '../../entities/inscripcion.entity';

@ApiTags('Inscripciones')
@Controller('inscripciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorInscripciones {
  constructor(private readonly servicioInscripciones: ServicioInscripciones) {}

  @Post()
  crear(@Body() crearInscripcionDto: CrearInscripcionDto) {
    return this.servicioInscripciones.crear(crearInscripcionDto);
  }

  @Post('lote')
  crearEnLote(@Body() crearInscripcionDtos: CrearInscripcionDto[]) {
    return this.servicioInscripciones.crearEnLote(crearInscripcionDtos);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') estado?: EstadoInscripcion,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.servicioInscripciones.obtenerTodos(
      +pagina,
      +limite,
      gestion,
      estado,
      estudianteId ? +estudianteId : undefined,
    );
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion?: string) {
    return this.servicioInscripciones.buscarPorEstudiante(estudianteId, gestion);
  }

  @Get('estudiante/:estudianteId/historial-academico')
  obtenerHistorialAcademico(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicioInscripciones.obtenerHistorialAcademicoEstudiante(estudianteId);
  }

  @Get('materia/:materiaId')
  buscarPorMateria(@Param('materiaId', ParseIntPipe) materiaId: number, @Query('gestion') gestion: string) {
    return this.servicioInscripciones.buscarPorMateria(materiaId, gestion);
  }

  @Get('grupo/:grupoId')
  buscarPorGrupo(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.servicioInscripciones.buscarPorGrupo(grupoId, gestion);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioInscripciones.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarInscripcionDto: ActualizarInscripcionDto) {
    return this.servicioInscripciones.actualizar(id, actualizarInscripcionDto);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: { estado: EstadoInscripcion; notaFinal?: number },
  ) {
    return this.servicioInscripciones.actualizarEstado(id, cuerpo.estado, cuerpo.notaFinal);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioInscripciones.eliminar(id);
  }
}
