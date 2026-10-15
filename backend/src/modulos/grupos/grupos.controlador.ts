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
import { ServicioGrupos } from './grupos.servicio';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(GuardaJwt)
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

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('carreraId') carreraId?: number,
    @Query('semestre') semestre?: number,
  ) {
    return this.servicioGrupos.obtenerTodos(
      +pagina,
      +limite,
      gestion,
      carreraId ? +carreraId : undefined,
      semestre ? +semestre : undefined,
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

  @Get('por-carrera-turno')
  buscarPorCarreraYTurno(
    @Query('carreraId') carreraId: number,
    @Query('gestion') gestion: string,
    @Query('semestre') semestre: number,
    @Query('turnoId') turnoId: number,
  ) {
    return this.servicioGrupos.buscarPorCarreraYTurno(+carreraId, gestion, +semestre, +turnoId);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarGrupoDto: ActualizarGrupoDto) {
    return this.servicioGrupos.actualizar(id, actualizarGrupoDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGrupos.eliminar(id);
  }

  @Post(':id/estudiantes/:estudianteId')
  agregarEstudiante(@Param('id', ParseIntPipe) id: number, @Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicioGrupos.agregarEstudiante(id, estudianteId);
  }

  @Delete(':id/estudiantes/:estudianteId')
  eliminarEstudiante(@Param('id', ParseIntPipe) id: number, @Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicioGrupos.eliminarEstudiante(id, estudianteId);
  }
}
