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
import { DocumentsService } from './documents.service';
import { CreateEmittedDocumentDto } from './dto/create-emitted-document.dto';
import { UpdateEmittedDocumentDto } from './dto/update-emitted-document.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { DocumentType, DocumentStatus } from '../../entities/emitted-document.entity';

@ApiTags('Documentos')
@Controller('documents')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  create(@Body() createDto: CreateEmittedDocumentDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('tipo') tipo?: DocumentType,
    @Query('gestion') gestion?: string,
    @Query('estudianteId') estudianteId?: number,
    @Query('estado') estado?: DocumentStatus,
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
    @Query('tipo') tipo?: DocumentType,
  ) {
    return this.service.findByStudent(+estudianteId, tipo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEmittedDocumentDto) {
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
