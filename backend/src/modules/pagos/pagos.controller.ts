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
import { ServicioPagos } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualizar-pago.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPago } from '../../entities/pago.entity';

@ApiTags('Pagos')
@Controller('pagos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorPagos {
  constructor(private readonly service: ServicioPagos) {}

  @Post()
  create(@Body() createDto: CrearPagoDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') status?: EstadoPago,
    @Query('estudianteId') studentId?: number,
    @Query('conceptoId') conceptId?: number,
  ) {
    return this.service.findAll(
      +page,
      +limit,
      gestion,
      status,
      studentId ? +studentId : undefined,
      conceptId ? +conceptId : undefined,
    );
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion?: string) {
    return this.service.findByStudent(studentId, gestion);
  }

  @Get('estudiante/:estudianteId/deuda')
  getStudentDebt(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion: string) {
    return this.service.getStudentDebt(studentId, gestion);
  }

  @Get('recaudacion-diaria')
  getDailyCollection(@Query('fecha') fecha: string, @Query('gestion') gestion: string) {
    return this.service.getDailyCollection(fecha, gestion);
  }

  @Get('resumen/:gestion')
  getCollectionSummary(@Param('gestion') gestion: string) {
    return this.service.getCollectionSummary(gestion);
  }

  @Get('rango-fechas')
  getPaymentsByDateRange(
    @Query('fechaInicio') startDate: string,
    @Query('fechaFin') endDate: string,
    @Query('gestion') gestion?: string,
  ) {
    return this.service.getPaymentsByDateRange(new Date(startDate), new Date(endDate), gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ActualizarPagoDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/anular')
  annul(@Param('id', ParseIntPipe) id: number) {
    return this.service.annul(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}