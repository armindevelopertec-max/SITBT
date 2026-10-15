import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServicioPlanesEstudio } from './planes-estudio.service';

/**
 * Endpoints públicos de planes de estudio para el sitio web.
 * No requieren autenticación porque la malla curricular es información pública.
 */
@ApiTags('PlanesEstudio')
@Controller('planes-estudio/publico')
export class ControladorPlanesEstudioPublico {
  constructor(private readonly servicioPlanesEstudio: ServicioPlanesEstudio) {}

  @Get('carrera/:carreraId')
  porCarrera(@Param('carreraId', ParseIntPipe) carreraId: number) {
    return this.servicioPlanesEstudio.buscarPublicoPorCarrera(carreraId);
  }
}
