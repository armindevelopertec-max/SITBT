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
import { ServicioPagos } from './pagos.servicio';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualizar-pago.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoPago } from '../../entidades/pago.entidad';

@ApiTags('Pagos')
@Controller('pagos')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'rector')
@ApiBearerAuth()
export class ControladorPagos {
  constructor(private readonly servicio: ServicioPagos) {}

  @Post()
  crear(@Body() crearPagoDto: CrearPagoDto) {
    return this.servicio.crear(crearPagoDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') estado?: EstadoPago,
    @Query('estudianteId') estudianteId?: number,
    @Query('conceptoId') conceptoId?: number,
    @Query('periodo') periodo?: string,
  ) {
    return this.servicio.obtenerTodos(
      +pagina,
      +limite,
      gestion,
      estado,
      estudianteId ? +estudianteId : undefined,
      conceptoId ? +conceptoId : undefined,
      periodo,
    );
  }

  @Get('estudiante/:estudianteId')
  buscarPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion?: string) {
    return this.servicio.buscarPorEstudiante(estudianteId, gestion);
  }

  @Get('estudiante/:estudianteId/deuda')
  obtenerDeudaEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion: string) {
    return this.servicio.obtenerDeudaEstudiante(estudianteId, gestion);
  }

  @Get('recaudacion-diaria')
  obtenerRecaudacionDiaria(@Query('fecha') fecha: string, @Query('gestion') gestion: string) {
    return this.servicio.obtenerRecaudacionDiaria(fecha, gestion);
  }

  @Get('resumen/:gestion')
  obtenerResumenRecaudacion(@Param('gestion') gestion: string) {
    return this.servicio.obtenerResumenRecaudacion(gestion);
  }

  @Get('rango-fechas')
  obtenerPagosPorRangoFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('gestion') gestion?: string,
  ) {
    return this.servicio.obtenerPagosPorRangoFechas(new Date(fechaInicio), new Date(fechaFin), gestion);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarPagoDto: ActualizarPagoDto) {
    return this.servicio.actualizar(id, actualizarPagoDto);
  }

  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.anular(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }
}
