import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioPreinscripcion } from './preinscripcion.servicio';
import { VerificarPagosDto } from './dto/verificar-pagos.dto';
import { CalcularMateriasDto } from './dto/calcular-materias.dto';
import { CrearInscripcionLoteDto } from './dto/crear-lote-inscripcion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Preinscripcion')
@Controller('preinscripcion')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico')
@ApiBearerAuth()
export class ControladorPreinscripcion {
  constructor(private readonly servicio: ServicioPreinscripcion) {}

  @Post('verificar-pagos')
  verificarPagos(@Body() dto: VerificarPagosDto) {
    return this.servicio.verificarPagos(dto);
  }

  @Post('calcular-materias')
  calcularMaterias(@Body() dto: CalcularMateriasDto) {
    return this.servicio.calcularMaterias(dto);
  }

  @Post('inscribir-lote')
  crearInscripcionLote(@Body() dto: CrearInscripcionLoteDto) {
    return this.servicio.crearInscripcionLote(dto);
  }

  @Get('boleta')
  obtenerBoletaInscripcion(
    @Query('estudianteId') estudianteId: number,
    @Query('gestion') gestion: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.servicio.obtenerBoletaInscripcion(estudianteId, gestion, periodo);
  }

  @Get('inscritos')
  listarInscritos(
    @Query('gestion') gestion: string,
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('buscar') buscar?: string,
    @Query('carreraId') carreraId?: number,
  ) {
    return this.servicio.listarInscritos(
      gestion,
      Number(pagina),
      Number(limite),
      buscar,
      carreraId ? Number(carreraId) : undefined,
    );
  }

  @Get('estado-inscripcion')
  obtenerEstadoInscripcion(
    @Query('estudianteId') estudianteId: number,
    @Query('gestion') gestion: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.servicio.obtenerEstadoInscripcion(
      Number(estudianteId),
      gestion,
      periodo,
    );
  }

  @Get('grupos')
  obtenerGruposPorCarreraYSemestre(
    @Query('carreraId') carreraId: number,
    @Query('gestion') gestion: string,
    @Query('semestre') semestre?: number,
    @Query('turnoId') turnoId?: number,
    @Query('planEstudioId') planEstudioId?: number,
    @Query('semestres') semestres?: string,
  ) {
    return this.servicio.obtenerGruposPorCarreraYSemestre(
      carreraId,
      gestion,
      semestre ? +semestre : undefined,
      turnoId ? +turnoId : undefined,
      true,
      planEstudioId ? +planEstudioId : undefined,
      semestres
        ? semestres
            .split(',')
            .map((valor) => Number(valor.trim()))
            .filter((valor) => Number.isFinite(valor))
        : undefined,
    );
  }

  @Get('abrir-periodo')
  obtenerPeriodoAbierto(@Query('gestion') gestion: string) {
    return this.servicio.obtenerPeriodoAbierto(gestion);
  }
}
