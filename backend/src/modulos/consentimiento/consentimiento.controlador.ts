import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioConsentimiento } from './consentimiento.servicio';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { ActualizarConsentimientoDto } from './dto/actualizar-consentimiento.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { TipoConsentimiento } from '../../entidades/registro-consentimiento.entidad';

@ApiTags('Consentimiento')
@Controller('consentimiento')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConsentimiento {
  constructor(private readonly servicio: ServicioConsentimiento) {}

  @Post()
  crear(@Body() crearDto: CrearConsentimientoDto) {
    return this.servicio.crear(crearDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, estudianteId ? +estudianteId : undefined);
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.servicio.buscarPorEstudiante(+estudianteId);
  }

  @Get('estudiante/:estudianteId/ultimo')
  obtenerUltimoConsentimiento(@Param('estudianteId') estudianteId: string) {
    return this.servicio.obtenerUltimoConsentimiento(+estudianteId);
  }

  @Get('verificar/:estudianteId/:version')
  verificarConsentimientoValido(
    @Param('estudianteId') estudianteId: string,
    @Param('version') version: string,
  ) {
    return this.servicio.tieneConsentimientoValido(+estudianteId, version);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() actualizarDto: ActualizarConsentimientoDto) {
    return this.servicio.actualizar(id, actualizarDto);
  }

  @Post(':id/ejercer-derecho')
  @HttpCode(200)
  ejercerDerecho(
    @Param('id') id: string,
    @Body('derecho') derecho: TipoConsentimiento,
    @Body('registradoPor') registradoPor?: number,
  ) {
    return this.servicio.ejercerDerecho(id, derecho, registradoPor);
  }

  @Post(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
