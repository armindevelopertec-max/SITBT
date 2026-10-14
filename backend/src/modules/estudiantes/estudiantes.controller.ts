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
import { ServicioEstudiantes } from './estudiantes.service';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoEstudiante } from '../../entities/estudiante.entity';

@ApiTags('Estudiantes')
@Controller('estudiantes')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorEstudiantes {
  constructor(private readonly studentsService: ServicioEstudiantes) {}

  @Post()
  create(@Body() crearEstudianteDto: CrearEstudianteDto) {
    return this.studentsService.create(crearEstudianteDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estado') status?: EstadoEstudiante,
    @Query('carreraId') careerId?: number,
  ) {
    return this.studentsService.findAll(+page, +limit, status, careerId ? +careerId : undefined);
  }

  @Get('estadisticas')
  getStats() {
    return this.studentsService.getStudentStats();
  }

  @Get('por-carrera/:carreraId')
  findByCareer(@Param('carreraId', ParseIntPipe) carreraId: number, @Query('gestion') gestion?: string) {
    return this.studentsService.findByCareer(carreraId, gestion);
  }

  @Get('activos')
  findActive() {
    return this.studentsService.findActive();
  }

  @Get('conteo-por-estado')
  countByStatus(@Query('carreraId') careerId?: number) {
    return this.studentsService.countByStatus(careerId ? +careerId : undefined);
  }

  @Get('inscripcion/:codigo')
  findByInscriptionCode(@Param('codigo') code: string) {
    return this.studentsService.findByInscriptionCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarEstudianteDto: ActualizarEstudianteDto) {
    return this.studentsService.update(id, actualizarEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}