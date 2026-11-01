import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioProcesosConvalidacion } from './procesos-convalidacion.servicio';
import { CrearProcesoConvalidacionDto } from './dto/crear-proceso-convalidacion.dto';
import { ActualizarProcesoConvalidacionDto } from './dto/actualizar-proceso-convalidacion.dto';
import { GuardarEquivalenciaPlanDto } from './dto/guardar-equivalencia-plan.dto';
import { AprobarProcesoConvalidacionDto } from './dto/aprobar-proceso-convalidacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoProcesoConvalidacion } from '../../entidades/proceso-convalidacion.entidad';

/**
 * Matriz general de convalidaciones entre planes de estudio (plan → plan).
 * La ruta raíz es distinta de `/convalidaciones` para no colisionar con el
 * controlador de convalidaciones de estudiantes.
 */
@ApiTags('Convalidaciones entre planes')
@Controller('convalidaciones-planes')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico')
@ApiBearerAuth()
export class ControladorProcesosConvalidacion {
  constructor(private readonly servicio: ServicioProcesosConvalidacion) {}

  @Post()
  crear(@Body() dto: CrearProcesoConvalidacionDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  listar(
    @Query('carreraId') carreraId?: number,
    @Query('estado') estado?: EstadoProcesoConvalidacion,
  ) {
    return this.servicio.listar(carreraId ? +carreraId : undefined, estado);
  }

  @Get(':id')
  comparar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.comparar(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarProcesoConvalidacionDto,
  ) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }

  @Post(':id/aprobar')
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprobarProcesoConvalidacionDto,
    @Request() peticion: any,
  ) {
    return this.servicio.aprobar(id, dto, peticion?.user?.id);
  }

  @Post(':id/equivalencias')
  guardarEquivalencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarEquivalenciaPlanDto,
  ) {
    return this.servicio.guardarEquivalencia(id, dto);
  }

  @Patch(':id/equivalencias/:equivalenciaId')
  actualizarEquivalencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('equivalenciaId', ParseIntPipe) equivalenciaId: number,
    @Body() dto: GuardarEquivalenciaPlanDto,
  ) {
    return this.servicio.actualizarEquivalencia(id, equivalenciaId, dto);
  }

  @Delete(':id/equivalencias/:equivalenciaId')
  eliminarEquivalencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('equivalenciaId', ParseIntPipe) equivalenciaId: number,
  ) {
    return this.servicio.eliminarEquivalencia(id, equivalenciaId);
  }
}
