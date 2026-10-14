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
import { ServicioCalificaciones } from './calificaciones.service';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoCalificacionDefinitivo } from '../../entities/calificacion.entity';

@ApiTags('Calificaciones')
@Controller('calificaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorCalificaciones {
  constructor(private readonly gradesService: ServicioCalificaciones) {}

  @Post()
  create(@Body() crearCalificacionDto: CrearCalificacionDto) {
    return this.gradesService.create(crearCalificacionDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('estadoDefinitivo') statusDefinitivo?: EstadoCalificacionDefinitivo,
  ) {
    return this.gradesService.findAll(+page, +limit, gestion, statusDefinitivo);
  }

  @Get('estudiante/:estudianteId')
  getGradesByStudent(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion?: string) {
    return this.gradesService.getGradesByStudent(estudianteId, gestion);
  }

  @Get('grupo/:grupoId')
  getGradesByGroup(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.gradesService.getGradesByGroup(grupoId, gestion);
  }

  @Get('inscripcion/:inscripcionId')
  findByEnrollment(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.gradesService.findByEnrollment(inscripcionId);
  }

  @Get('inscripcion/:inscripcionId/historial')
  getGradeHistory(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.gradesService.getGradeHistory(inscripcionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCalificacionDto: ActualizarCalificacionDto,
    @Body('registradoPor') registradoPor: number,
  ) {
    return this.gradesService.update(id, actualizarCalificacionDto, registradoPor);
  }

  @Patch(':id/parciales')
  updatePartialGrades(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { parcial1?: number; parcial2?: number; registradoPor?: number },
  ) {
    return this.gradesService.updatePartialGrades(id, body.parcial1, body.parcial2, body.registradoPor);
  }

  @Patch(':id/segundo-turno')
  applySecondTurn(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nota: number; registradoPor?: number },
  ) {
    return this.gradesService.applySecondTurn(id, body.nota, body.registradoPor);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.remove(id);
  }
}