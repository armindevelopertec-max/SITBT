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

@ApiTags('Preinscripcion')
@Controller('preinscripcion')
@UseGuards(GuardaJwt)
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

  @Get('grupos')
  obtenerGruposPorCarreraYSemestre(
    @Query('carreraId') carreraId: number,
    @Query('gestion') gestion: string,
    @Query('semestre') semestre: number,
    @Query('turnoId') turnoId?: number,
  ) {
    return this.servicio.obtenerGruposPorCarreraYSemestre(carreraId, gestion, semestre, turnoId ? +turnoId : undefined);
  }

  @Get('abrir-periodo')
  obtenerPeriodoAbierto(@Query('gestion') gestion: string) {
    return this.servicio.obtenerPeriodoAbierto(gestion);
  }
}
