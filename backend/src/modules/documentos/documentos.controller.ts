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
import { ServicioDocumentos } from './documentos.service';
import { CrearDocumentoEmitidoDto } from './dto/crear-documento-emitido.dto';
import { ActualizarDocumentoEmitidoDto } from './dto/actualizar-documento-emitido.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { TipoDocumento, EstadoDocumento } from '../../entities/emitted-document.entity';

@ApiTags('Documentos')
@Controller('documents')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorDocumentos {
  constructor(private readonly service: ServicioDocumentos) {}

  @Post()
  create(@Body() createDto: CrearDocumentoEmitidoDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('tipo') tipo?: TipoDocumento,
    @Query('gestion') gestion?: string,
    @Query('estudianteId') estudianteId?: number,
    @Query('estado') estado?: EstadoDocumento,
  ) {
    return this.service.findAll(
      +page,
      +limit,
      tipo,
      gestion,
      estudianteId ? +estudianteId : undefined,
      estado,
    );
  }

  @Get('statistics')
  getStatistics(@Query('gestion') gestion?: string) {
    return this.service.getDocumentStatistics(gestion);
  }

  @Get('student/:estudianteId')
  findByStudent(
    @Param('estudianteId') estudianteId: string,
    @Query('tipo') tipo?: TipoDocumento,
  ) {
    return this.service.findByStudent(+estudianteId, tipo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: ActualizarDocumentoEmitidoDto) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/print')
  @HttpCode(200)
  markAsPrinted(@Param('id') id: string, @Body('impresoPor') impresoPor: number) {
    return this.service.markAsPrinted(id, impresoPor);
  }

  @Post(':id/deliver')
  @HttpCode(200)
  markAsDelivered(@Param('id') id: string, @Body('entregadoA') entregadoA: string) {
    return this.service.markAsDelivered(id, entregadoA);
  }

  @Post(':id/annul')
  @HttpCode(200)
  annul(@Param('id') id: string, @Body('observaciones') observaciones?: string) {
    return this.service.annul(id, observaciones);
  }

  @Post('generate-boleta')
  @HttpCode(200)
  generateBoleta(
    @Body('estudianteId') estudianteId: number,
    @Body('gestion') gestion: string,
    @Body('gestionId') gestionId?: number,
  ) {
    return this.service.generateBoletaInscripcion(estudianteId, gestion, gestionId);
  }

  @Post('generate-recibo')
  @HttpCode(200)
  generateRecibo(
    @Body('estudianteId') estudianteId: number,
    @Body('gestion') gestion: string,
    @Body('paymentId') paymentId: number,
    @Body('gestionId') gestionId?: number,
  ) {
    return this.service.generateReciboPago(estudianteId, gestion, paymentId, gestionId);
  }

  @Post(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
