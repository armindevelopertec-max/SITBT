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
import { ServicioAsignacionesDocentes } from './asignaciones-docentes.service';
import { CrearAsignacionDocenteDto } from './dto/crear-asignacion-docente.dto';
import { ActualizarAsignacionDocenteDto } from './dto/actualizar-asignacion-docente.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoAsignacionDocente } from '../../entities/asignacion-docente.entity';

@ApiTags('AsignacionesDocentes')
@Controller('asignaciones-docentes')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorAsignacionesDocentes {
  constructor(private readonly service: ServicioAsignacionesDocentes) {}

  @Post()
  create(@Body() createDto: CrearAsignacionDocenteDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') status?: EstadoAsignacionDocente,
  ) {
    return this.service.findAll(+page, +limit, gestion, status);
  }

  @Get('activos')
  findActive(@Query('gestion') gestion: string) {
    return this.service.findActive(gestion);
  }

  @Get('docente/:docenteId')
  findByTeacher(@Param('docenteId', ParseIntPipe) docenteId: number, @Query('gestion') gestion?: string) {
    return this.service.findByTeacher(docenteId, gestion);
  }

  @Get('grupo/:grupoId')
  findByGroup(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.service.findByGroup(grupoId, gestion);
  }

  @Get('materia/:materiaId')
  findBySubject(@Param('materiaId', ParseIntPipe) materiaId: number, @Query('gestion') gestion: string) {
    return this.service.findBySubject(materiaId, gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ActualizarAsignacionDocenteDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}