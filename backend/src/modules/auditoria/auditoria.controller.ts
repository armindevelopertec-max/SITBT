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
import { ServicioAuditoria } from './auditoria.service';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Auditoria')
@Controller('auditoria')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorAuditoria {
  constructor(private readonly service: ServicioAuditoria) {}

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 50,
    @Query('usuarioId') userId?: number,
    @Query('accion') action?: string,
    @Query('tabla') table?: string,
    @Query('fechaInicio') startDate?: string,
    @Query('fechaFin') endDate?: string,
  ) {
    return this.service.findAll(
      +page,
      +limit,
      userId ? +userId : undefined,
      action,
      table,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('usuario/:usuarioId')
  findByUser(@Param('usuarioId', ParseIntPipe) usuarioId: number, @Query('limite') limit = 50) {
    return this.service.findByUser(usuarioId, +limit);
  }

  @Get('tabla/:tabla')
  findByTable(@Param('tabla') tableName: string, @Query('limite') limit = 50) {
    return this.service.findByTable(tableName, +limit);
  }

  @Get('registro/:tabla/:registroId')
  findByRecord(@Param('tabla') tableName: string, @Param('registroId', ParseIntPipe) registroId: number) {
    return this.service.findByRecord(tableName, registroId);
  }

  @Get('recientes')
  getRecentActions(@Query('limite') limit = 20) {
    return this.service.getRecentActions(+limit);
  }

  @Get('estadisticas')
  getActionStats(@Query('fechaInicio') startDate?: string, @Query('fechaFin') endDate?: string) {
    return this.service.getActionStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}