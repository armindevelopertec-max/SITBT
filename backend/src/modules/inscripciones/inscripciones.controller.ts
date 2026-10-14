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

  @Post('bulk')
  bulkCreate(@Body() crearInscripcionDtos: CrearInscripcionDto[]) {
    return this.enrollmentsService.bulkCreate(crearInscripcionDtos);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('status') status?: EstadoInscripcion,
    @Query('studentId') studentId?: number,
  ) {
    return this.enrollmentsService.findAll(
      +page,
      +limit,
      gestion,
      status,
      studentId ? +studentId : undefined,
    );
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion?: string) {
    return this.enrollmentsService.findByStudent(studentId, gestion);
  }

  @Get('student/:studentId/academic-record')
  getAcademicRecord(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentsService.getStudentAcademicRecord(studentId);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findBySubject(subjectId, gestion);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId', ParseIntPipe) groupId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findByGroup(groupId, gestion);
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