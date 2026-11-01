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
import { ServicioDocumentos } from './documentos.servicio';
import { CrearDocumentoEmitidoDto } from './dto/crear-documento-emitido.dto';
import { ActualizarDocumentoEmitidoDto } from './dto/actualizar-documento-emitido.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { TipoDocumento, EstadoDocumento } from '../../entidades/documento-emitido.entidad';

@ApiTags('Documentos')
@Controller('documentos')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria')
@ApiBearerAuth()
export class ControladorDocumentos {
  constructor(private readonly servicio: ServicioDocumentos) {}

  @Post()
  crear(@Body() crearDto: CrearDocumentoEmitidoDto) {
    return this.servicio.crear(crearDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('tipo') tipo?: TipoDocumento,
    @Query('gestion') gestion?: string,
    @Query('estudianteId') estudianteId?: number,
    @Query('estado') estado?: EstadoDocumento,
  ) {
    return this.servicio.obtenerTodos(
      +pagina,
      +limite,
      tipo,
      gestion,
      estudianteId ? +estudianteId : undefined,
      estado,
    );
  }

  @Get('estadisticas')
  obtenerEstadisticas(@Query('gestion') gestion?: string) {
    return this.servicio.obtenerEstadisticasDocumentos(gestion);
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Query('tipo') tipo?: TipoDocumento,
  ) {
    return this.servicio.buscarPorEstudiante(+estudianteId, tipo);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() actualizarDto: ActualizarDocumentoEmitidoDto) {
    return this.servicio.actualizar(id, actualizarDto);
  }

  @Post(':id/imprimir')
  @HttpCode(200)
  marcarComoImpreso(@Param('id') id: string, @Body('impresoPor') impresoPor: number) {
    return this.servicio.marcarComoImpreso(id, impresoPor);
  }

  @Post(':id/entregar')
  @HttpCode(200)
  marcarComoEntregado(@Param('id') id: string, @Body('entregadoA') entregadoA: string) {
    return this.servicio.marcarComoEntregado(id, entregadoA);
  }

  @Post(':id/anular')
  @HttpCode(200)
  anular(@Param('id') id: string, @Body('observaciones') observaciones?: string) {
    return this.servicio.anular(id, observaciones);
  }

  @Post('generar-boleta')
  @HttpCode(200)
  generarBoleta(
    @Body('estudianteId') estudianteId: number,
    @Body('gestion') gestion: string,
    @Body('gestionId') gestionId?: number,
  ) {
    return this.servicio.generarBoletaInscripcion(estudianteId, gestion, gestionId);
  }

  @Post('generar-recibo')
  @HttpCode(200)
  generarRecibo(
    @Body('estudianteId') estudianteId: number,
    @Body('gestion') gestion: string,
    @Body('paymentId') pagoId: number,
    @Body('gestionId') gestionId?: number,
  ) {
    return this.servicio.generarReciboPago(estudianteId, gestion, pagoId, gestionId);
  }

  @Post(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
