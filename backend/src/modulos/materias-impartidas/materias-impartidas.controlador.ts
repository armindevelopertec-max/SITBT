import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ServicioMateriasImpartidas, FiltrosMateriaImpartida } from './materias-impartidas.servicio';
import { CrearMateriaImpartidaDto } from './dto/crear-materia-impartida.dto';
import { GenerarMateriasImpartidasDto } from './dto/generar-materias-impartidas.dto';
import { AsignarDocenteDto } from './dto/asignar-docente.dto';
import { RegistrarCalificacionDto } from './dto/registrar-calificacion.dto';
import { CerrarLibroDto } from './dto/cerrar-libro.dto';
import { ReabrirLibroDto } from './dto/reabrir-libro.dto';
import { InscribirEstudianteDto } from './dto/inscribir-estudiante.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoMateriaImpartida } from '../../entidades/materia-impartida.entidad';
import { EstadoLibro } from '../../entidades/libro-calificaciones.entidad';

@ApiTags('MateriasImpartidas')
@Controller('materias-impartidas')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorMateriasImpartidas {
  constructor(private readonly servicio: ServicioMateriasImpartidas) {}

  private usuarioId(peticion: Request): number | null {
    const usuario = peticion.user as { id?: number } | undefined;
    return usuario?.id ?? null;
  }

  @Post()
  crear(@Body() dto: CrearMateriaImpartidaDto) {
    return this.servicio.crear(dto);
  }

  @Post('generar')
  generar(@Body() dto: GenerarMateriasImpartidasDto) {
    return this.servicio.generar(dto);
  }

  @Get()
  listar(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('periodoId') periodoId?: number,
    @Query('carreraId') carreraId?: number,
    @Query('semestre') semestre?: number,
    @Query('paralelo') paralelo?: string,
    @Query('turnoId') turnoId?: number,
    @Query('docenteId') docenteId?: number,
    @Query('estadoMateria') estadoMateria?: EstadoMateriaImpartida,
    @Query('estadoNotas') estadoNotas?: EstadoLibro,
    @Query('busqueda') busqueda?: string,
  ) {
    const filtros: FiltrosMateriaImpartida = {
      gestion,
      periodoId: periodoId ? +periodoId : undefined,
      carreraId: carreraId ? +carreraId : undefined,
      semestre: semestre ? +semestre : undefined,
      paralelo,
      turnoId: turnoId ? +turnoId : undefined,
      docenteId: docenteId ? +docenteId : undefined,
      estadoMateria,
      estadoNotas,
      busqueda,
    };
    return this.servicio.listar(+pagina, +limite, filtros);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Get(':id/docentes')
  obtenerAsignaciones(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerAsignaciones(id);
  }

  @Post(':id/docentes')
  asignarDocente(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarDocenteDto) {
    return this.servicio.asignarDocente(id, dto);
  }

  @Patch(':id/docentes/:asignacionId/finalizar')
  finalizarAsignacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('asignacionId', ParseIntPipe) asignacionId: number,
  ) {
    return this.servicio.finalizarAsignacion(id, asignacionId);
  }

  @Get(':id/estudiantes')
  obtenerEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerEstudiantes(id);
  }

  @Post(':id/estudiantes')
  inscribirEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InscribirEstudianteDto,
  ) {
    return this.servicio.inscribirEstudiante(id, dto);
  }

  @Post(':id/estudiantes/sincronizar')
  sincronizarEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.sincronizarEstudiantesDeMateria(id);
  }

  @Delete(':id/estudiantes/:inscripcionMateriaId')
  retirarEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Param('inscripcionMateriaId', ParseIntPipe) inscripcionMateriaId: number,
  ) {
    return this.servicio.retirarEstudiante(id, inscripcionMateriaId);
  }

  @Get(':id/libro')
  obtenerLibro(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerLibro(id);
  }

  @Post(':id/calificaciones')
  registrarCalificacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarCalificacionDto,
    @Req() peticion: Request,
  ) {
    return this.servicio.registrarCalificacion(id, dto, this.usuarioId(peticion));
  }

  @Get(':id/calcular/:inscripcionMateriaId')
  calcular(
    @Param('id', ParseIntPipe) id: number,
    @Param('inscripcionMateriaId', ParseIntPipe) inscripcionMateriaId: number,
  ) {
    return this.servicio.calcularVista(id, inscripcionMateriaId);
  }

  @Get(':id/pendientes')
  obtenerPendientes(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerPendientes(id);
  }

  @Post(':id/cerrar')
  cerrarLibro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarLibroDto,
    @Req() peticion: Request,
  ) {
    return this.servicio.cerrarLibro(id, dto, this.usuarioId(peticion));
  }

  @Post(':id/reabrir')
  reabrirLibro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReabrirLibroDto,
    @Req() peticion: Request,
  ) {
    return this.servicio.reabrirLibro(id, dto, this.usuarioId(peticion));
  }

  @Get(':id/historial')
  obtenerHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerHistorial(id);
  }
}
