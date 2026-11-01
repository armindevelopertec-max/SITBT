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
import { ServicioGrupos, FiltrosGrupo } from './grupos.servicio';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { ClonarGruposDto } from './dto/clonar-grupos.dto';
import { CambiarEstadoGrupoDto } from './dto/cambiar-estado-grupo.dto';
import { TrasladarGrupoDto } from './dto/trasladar-grupo.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoGrupo } from '../../entidades/grupo.entidad';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico', 'rector', 'docente')
@ApiBearerAuth()
export class ControladorGrupos {
  constructor(private readonly servicioGrupos: ServicioGrupos) {}

  @Post()
  crear(@Body() crearGrupoDto: CrearGrupoDto) {
    return this.servicioGrupos.crear(crearGrupoDto);
  }

  @Post('generar')
  generar(@Body() generarGruposDto: GenerarGruposDto) {
    return this.servicioGrupos.generarGrupos(generarGruposDto);
  }

  @Post('clonar')
  clonar(@Body() clonarGruposDto: ClonarGruposDto) {
    return this.servicioGrupos.clonar(clonarGruposDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('carreraId') carreraId?: number,
    @Query('semestre') semestre?: number,
    @Query('turnoId') turnoId?: number,
    @Query('paralelo') paralelo?: string,
    @Query('periodoId') periodoId?: number,
    @Query('estado') estado?: EstadoGrupo,
    @Query('busqueda') busqueda?: string,
  ) {
    const filtros: FiltrosGrupo = {
      gestion,
      carreraId: carreraId ? +carreraId : undefined,
      semestre: semestre ? +semestre : undefined,
      turnoId: turnoId ? +turnoId : undefined,
      paralelo,
      periodoId: periodoId ? +periodoId : undefined,
      estado,
      busqueda,
    };
    return this.servicioGrupos.obtenerTodos(+pagina, +limite, filtros);
  }

  // IMPORTANTE: declarar esta ruta antes de ':id' para que no sea capturada.
  @Get('por-carrera-turno')
  buscarPorCarreraYTurno(
    @Query('carreraId') carreraId: number,
    @Query('periodoId') periodoId: number,
    @Query('semestre') semestre: number,
    @Query('turnoId') turnoId: number,
  ) {
    return this.servicioGrupos.buscarPorCarreraYTurno(
      +carreraId,
      +periodoId,
      +semestre,
      +turnoId,
    );
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.obtenerUno(id);
  }

  @Get(':id/estudiantes')
  obtenerEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.obtenerEstudiantes(id);
  }

  @Get(':id/estadisticas')
  obtenerEstadisticasGrupo(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.obtenerEstadisticasGrupo(id);
  }

  @Get(':id/materias')
  obtenerMaterias(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.obtenerMaterias(id);
  }

  @Get(':id/historial')
  obtenerHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.obtenerHistorial(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarGrupoDto: ActualizarGrupoDto) {
    return this.servicioGrupos.actualizar(id, actualizarGrupoDto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoGrupoDto: CambiarEstadoGrupoDto,
  ) {
    return this.servicioGrupos.cambiarEstado(id, cambiarEstadoGrupoDto.estado);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.eliminar(id);
  }

  @Post(':id/estudiantes/:estudianteId')
  agregarEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
  ) {
    return this.servicioGrupos.agregarEstudiante(id, estudianteId);
  }

  @Delete(':id/estudiantes/:estudianteId')
  eliminarEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
  ) {
    return this.servicioGrupos.eliminarEstudiante(id, estudianteId);
  }

  @Post(':id/estudiantes/:estudianteId/trasladar')
  trasladarEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Body() trasladarGrupoDto: TrasladarGrupoDto,
  ) {
    return this.servicioGrupos.trasladarEstudiante(id, estudianteId, trasladarGrupoDto.grupoDestinoId);
  }
}
