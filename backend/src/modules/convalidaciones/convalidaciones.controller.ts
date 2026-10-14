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
import { ServicioConvalidaciones } from './convalidaciones.service';
import { CrearConvalidacionDto } from './dto/crear-convalidacion.dto';
import { ActualizarConvalidacionDto } from './dto/actualizar-convalidacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoConvalidacion, TipoConvalidacion } from '../../entities/convalidacion-estudiante.entity';

@ApiTags('Convalidaciones')
@Controller('convalidaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConvalidaciones {
  constructor(private readonly service: ServicioConvalidaciones) {}

  @Post()
  create(@Body() createDto: CrearConvalidacionDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estado') status?: EstadoConvalidacion,
    @Query('tipo') type?: TipoConvalidacion,
    @Query('estudianteId') studentId?: number,
  ) {
    return this.service.findAll(+page, +limit, status, type, studentId ? +studentId : undefined);
  }

  @Get('pendientes')
  getPending() {
    return this.service.getPending();
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findByStudent(studentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ActualizarConvalidacionDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/aprobar')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { aprobadoPor: number; numeroResolucion?: string; fechaResolucion?: string },
  ) {
    return this.service.approve(
      id,
      body.aprobadoPor,
      body.numeroResolucion,
      body.fechaResolucion ? new Date(body.fechaResolucion) : undefined,
    );
  }

  @Patch(':id/rechazar')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.service.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}