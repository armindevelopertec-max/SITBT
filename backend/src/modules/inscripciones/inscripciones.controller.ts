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
import { ServicioInscripciones } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoInscripcion } from '../../entities/inscripcion.entity';

@ApiTags('Inscripciones')
@Controller('inscripciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorInscripciones {
  constructor(private readonly enrollmentsService: ServicioInscripciones) {}

  @Post()
  create(@Body() crearInscripcionDto: CrearInscripcionDto) {
    return this.enrollmentsService.create(crearInscripcionDto);
  }

  @Post('lote')
  bulkCreate(@Body() crearInscripcionDtos: CrearInscripcionDto[]) {
    return this.enrollmentsService.bulkCreate(crearInscripcionDtos);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('estado') status?: EstadoInscripcion,
    @Query('estudianteId') studentId?: number,
  ) {
    return this.enrollmentsService.findAll(
      +page,
      +limit,
      gestion,
      status,
      studentId ? +studentId : undefined,
    );
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('estudianteId', ParseIntPipe) estudianteId: number, @Query('gestion') gestion?: string) {
    return this.enrollmentsService.findByStudent(estudianteId, gestion);
  }

  @Get('estudiante/:estudianteId/historial-academico')
  getAcademicRecord(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.enrollmentsService.getStudentAcademicRecord(estudianteId);
  }

  @Get('materia/:materiaId')
  findBySubject(@Param('materiaId', ParseIntPipe) materiaId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findBySubject(materiaId, gestion);
  }

  @Get('grupo/:grupoId')
  findByGroup(@Param('grupoId', ParseIntPipe) grupoId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findByGroup(grupoId, gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarInscripcionDto: ActualizarInscripcionDto) {
    return this.enrollmentsService.update(id, actualizarInscripcionDto);
  }

  @Patch(':id/estado')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: EstadoInscripcion; notaFinal?: number },
  ) {
    return this.enrollmentsService.updateStatus(id, body.estado, body.notaFinal);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}